// LeakyByte proxy: a drop-in base URL for the Claude Messages API.
// Redacts requests on the way out, restores placeholders in replies (JSON and SSE streams).
import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { appendFileSync } from "node:fs";
import { createVault, redactWith, restore, type Vault } from "../lib/redact.ts";

const PLACEHOLDER_MAX = 40; // longest placeholder we might have to hold back mid-stream
const SKIP = new Set(["type", "role", "id", "tool_use_id", "name", "media_type", "data"]);
const HOP = new Set(["host", "content-length", "connection", "accept-encoding", "transfer-encoding"]);

// Walk a JSON value, applying fn to every string except structural fields.
function walk(x: unknown, fn: (s: string) => string, key = ""): unknown {
  if (typeof x === "string") return SKIP.has(key) ? x : fn(x);
  if (Array.isArray(x)) return x.map((v) => walk(v, fn));
  if (x && typeof x === "object") return Object.fromEntries(Object.entries(x).map(([k, v]) => [k, walk(v, fn, k)]));
  return x;
}

export function redactRequest(body: Record<string, unknown>, v: Vault) {
  const f = (s: string) => redactWith(v, s).text;
  return { ...body, system: walk(body.system, f), messages: walk(body.messages, f) };
}

// Streaming: a placeholder can be split across deltas, so hold back an unfinished tail.
function splitHeld(buf: string): [string, string] {
  const i = buf.lastIndexOf("‹");
  return i >= 0 && !buf.includes("›", i) && buf.length - i <= PLACEHOLDER_MAX ? [buf.slice(0, i), buf.slice(i)] : [buf, ""];
}

async function relayStream(up: Response, res: ServerResponse, vault: Map<string, string>) {
  const held = new Map<number, { tail: string; type: string }>(); // content block index -> held tail
  const dec = new TextDecoder();
  const send = (event: string, data: unknown) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  const delta = (index: number, d: { type: string }, text: string) =>
    ({ type: "content_block_delta", index, delta: { ...d, [d.type === "text_delta" ? "text" : "partial_json"]: text } });
  let pending = "";
  for await (const chunk of up.body as unknown as AsyncIterable<Uint8Array>) {
    pending += dec.decode(chunk, { stream: true });
    let end;
    while ((end = pending.indexOf("\n\n")) >= 0) {
      const raw = pending.slice(0, end);
      pending = pending.slice(end + 2);
      const event = raw.match(/^event: (.*)$/m)?.[1] ?? "message";
      const data = raw.match(/^data: (.*)$/m)?.[1];
      let j: any;
      try { j = data ? JSON.parse(data) : null; } catch { j = null; }
      if (j?.type === "content_block_delta" && (j.delta?.type === "text_delta" || j.delta?.type === "input_json_delta")) {
        const field = j.delta.type === "text_delta" ? "text" : "partial_json";
        const [ready, tail] = splitHeld((held.get(j.index)?.tail ?? "") + j.delta[field]);
        held.set(j.index, { tail, type: j.delta.type });
        send(event, delta(j.index, j.delta, restore(ready, vault)));
      } else if (j?.type === "content_block_stop" && held.get(j.index)?.tail) {
        const h = held.get(j.index)!; // flush an unfinished tail before the block closes
        send("content_block_delta", delta(j.index, { type: h.type }, restore(h.tail, vault)));
        held.delete(j.index);
        send(event, j);
      } else res.write(raw + "\n\n");
    }
  }
  res.end();
}

const readBody = async (req: IncomingMessage) => {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return Buffer.concat(chunks);
};

export function createProxy(upstream = process.env.LEAKYBYTE_UPSTREAM ?? "https://api.anthropic.com", auditPath = process.env.LEAKYBYTE_AUDIT ?? "leakybyte-audit.jsonl") {
  return createServer(async (req, res) => {
    try {
      if (req.url === "/healthz") return void res.writeHead(200).end("ok");
      const raw = await readBody(req);
      const headers = Object.fromEntries(Object.entries(req.headers).filter(([k]) => !HOP.has(k)) as [string, string][]);
      const vault = createVault();
      let body: BodyInit | undefined = raw.length ? new Uint8Array(raw) : undefined;
      let stream = false;
      let model: unknown;

      const isMessages = req.method === "POST" && req.url?.split("?")[0] === "/v1/messages";
      if (isMessages) {
        let json: Record<string, unknown>;
        try { json = JSON.parse(raw.toString()); } catch { return void res.writeHead(400).end('{"error":"invalid JSON"}'); }
        stream = json.stream === true;
        model = json.model;
        body = JSON.stringify(redactRequest(json, vault));
        const counts = Object.fromEntries(Object.entries(vault.counts));
        // Audit log records kinds and counts only, never values.
        appendFileSync(auditPath, JSON.stringify({ ts: new Date().toISOString(), model, stream, redacted: counts }) + "\n");
      }

      const up = await fetch(upstream + req.url, { method: req.method, headers, body });
      const out: Record<string, string> = {};
      up.headers.forEach((v, k) => { if (!HOP.has(k) && k !== "content-encoding") out[k] = v; });
      out["x-leakybyte-redacted"] = String(vault.vault.size);

      if (isMessages && stream && up.ok && up.body) {
        res.writeHead(up.status, out);
        return void (await relayStream(up, res, vault.vault));
      }
      let text = await up.text();
      if (isMessages && up.ok) {
        try { text = JSON.stringify(walk(JSON.parse(text), (s) => restore(s, vault.vault))); } catch { /* not JSON: pass through */ }
      }
      res.writeHead(up.status, out).end(text);
    } catch (e) {
      res.writeHead(502).end(JSON.stringify({ error: "upstream unreachable", detail: String(e) }));
    }
  });
}

if (process.argv[1]?.endsWith("server.ts")) {
  const port = Number(process.env.PORT ?? 8787);
  createProxy().listen(port, "127.0.0.1", () => console.log(`LeakyByte proxy on http://127.0.0.1:${port}`));
}
