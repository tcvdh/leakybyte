import { test } from "node:test";
import assert from "node:assert/strict";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { createProxy } from "../proxy/server.ts";

const listen = (s: Server) => new Promise<string>((r) => s.listen(0, "127.0.0.1", () => r(`http://127.0.0.1:${(s.address() as AddressInfo).port}`)));
const EMAIL = "dana.reyes@northwind.example";
const KEY = "sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A";
const req = (stream: boolean) => JSON.stringify({
  model: "claude-sonnet-5-5", max_tokens: 64, stream,
  messages: [{ role: "user", content: [{ type: "text", text: `Email ${EMAIL}; our key ${KEY} leaked.` }] }],
});

// Fake Claude: records what it was sent and echoes the first placeholder back, split mid-token when streaming.
let seen = "";
const upstream = createServer((rq, rs) => {
  let b = ""; rq.on("data", (c) => (b += c)).on("end", () => {
    seen = b;
    const ph = b.match(/‹EMAIL_1›/)![0];
    if (!JSON.parse(b).stream) {
      return void rs.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ content: [{ type: "text", text: `Will email ${ph}.` }] }));
    }
    rs.writeHead(200, { "content-type": "text/event-stream" });
    const ev = (e: string, d: object) => rs.write(`event: ${e}\ndata: ${JSON.stringify(d)}\n\n`);
    ev("message_start", { type: "message_start" });
    for (const t of ["Will email ‹EM", "AIL_1› now."]) ev("content_block_delta", { type: "content_block_delta", index: 0, delta: { type: "text_delta", text: t } });
    ev("content_block_stop", { type: "content_block_stop", index: 0 });
    rs.end();
  });
});

const upUrl = listen(upstream);
async function setup() {
  const up = await upUrl;
  const proxy = createProxy(up, "/dev/null");
  return { base: await listen(proxy), close: () => proxy.close() };
}

test("non-streaming: upstream sees placeholders, client gets real values", async () => {
  const { base, close } = await setup();
  const r = await fetch(base + "/v1/messages", { method: "POST", body: req(false), headers: { "x-api-key": "k" } });
  const j = await r.json();
  assert.ok(!seen.includes(EMAIL) && !seen.includes(KEY));
  assert.equal(j.content[0].text, `Will email ${EMAIL}.`);
  assert.equal(r.headers.get("x-leakybyte-redacted"), "2");
  close();
});

test("streaming: placeholder split across deltas is restored", async () => {
  const { base, close } = await setup();
  const r = await fetch(base + "/v1/messages", { method: "POST", body: req(true), headers: { "x-api-key": "k" } });
  const text = [...(await r.text()).matchAll(/"text":"([^"]*)"/g)].map((m) => m[1]).join("");
  assert.ok(!seen.includes(EMAIL));
  assert.equal(text, `Will email ${EMAIL} now.`);
  close();
});

test.after(() => upstream.close());
