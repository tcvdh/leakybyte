// Canary: mint fake keys that look real, then recognise them (statelessly) if they ever turn up in text.
// A token carries a 4-letter tag and an HMAC tag made with YOUR key, so only you can verify it.

export type CanaryKind = "anthropic" | "aws";
const A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
const FORMATS: Record<CanaryKind, { prefix: string; rand: number; re: RegExp }> = {
  anthropic: { prefix: "sk-ant-api03-", rand: 22, re: /sk-ant-api03-[A-Z2-7]{30}/g },
  aws: { prefix: "AKIA", rand: 8, re: /AKIA[A-Z2-7]{16}/g },
};

const enc = new TextEncoder();
async function mac(key: string, s: string) {
  const k = await crypto.subtle.importKey("raw", enc.encode(key), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", k, enc.encode(s)));
  return Array.from(sig.slice(0, 4), (b) => A[b % 32]).join("");
}

export const cleanTag = (t: string) => (t.toUpperCase().replace(/[^A-Z2-7]/g, "").padEnd(4, "X")).slice(0, 4);

export async function mint(key: string, tag: string, kind: CanaryKind = "anthropic") {
  const f = FORMATS[kind];
  const rand = Array.from(crypto.getRandomValues(new Uint8Array(f.rand)), (b) => A[b % 32]).join("");
  const body = cleanTag(tag) + rand;
  return f.prefix + body + (await mac(key, kind + body));
}

export type Hit = { kind: CanaryKind; tag: string; token: string; index: number };

export async function check(key: string, text: string) {
  const hits: Hit[] = [];
  for (const [kind, f] of Object.entries(FORMATS) as [CanaryKind, (typeof FORMATS)[CanaryKind]][]) {
    for (const m of text.matchAll(f.re)) {
      const body = m[0].slice(f.prefix.length, -4);
      if ((await mac(key, kind + body)) === m[0].slice(-4)) hits.push({ kind, tag: body.slice(0, 4), token: m[0], index: m.index! });
    }
  }
  return hits.sort((a, b) => a.index - b.index);
}

export const newKey = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, "0")).join("");
