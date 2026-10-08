// Reversible redaction: swap sensitive values for stable placeholders, restore them later.

export type Kind = "ANTHROPIC_KEY" | "AWS_KEY" | "GITHUB_TOKEN" | "API_KEY" | "JWT" | "EMAIL" | "CARD" | "SSN" | "PHONE" | "IP";

const luhn = (s: string) => {
  const d = s.replace(/\D/g, "");
  if (d.length < 13 || d.length > 19) return false;
  let sum = 0;
  for (let i = 0; i < d.length; i++) {
    let n = +d[d.length - 1 - i];
    if (i % 2) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
  }
  return sum % 10 === 0;
};

// Order matters: specific patterns first so a generic one never claims their text.
const detectors: { kind: Kind; re: RegExp; ok?: (m: string) => boolean }[] = [
  { kind: "ANTHROPIC_KEY", re: /\bsk-ant-[A-Za-z0-9_-]{20,}/g },
  { kind: "AWS_KEY", re: /\b(?:AKIA|ASIA)[0-9A-Z]{16}\b/g },
  { kind: "GITHUB_TOKEN", re: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/g },
  { kind: "API_KEY", re: /\bsk-[A-Za-z0-9]{20,}\b/g },
  { kind: "JWT", re: /\beyJ[\w-]+\.eyJ[\w-]+\.[\w-]+/g },
  { kind: "EMAIL", re: /\b[\w.+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+\b/g },
  { kind: "CARD", re: /\b(?:\d[ -]?){12,18}\d\b/g, ok: luhn },
  { kind: "SSN", re: /\b\d{3}-\d{2}-\d{4}\b/g },
  { kind: "PHONE", re: /(?<![\w.])(?:(?:\+\d{1,3}[ .-]?)?(?:\(\d{3}\)|\d{3})[ .-]\d{3}[ .-]\d{4}|\+\d{1,3}[ .-]\d{1,4}[ .-]\d{3,4}[ .-]\d{3,4})\b/g },
  { kind: "IP", re: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g },
];

export type Span = { start: number; end: number; kind: Kind; value: string };

export function detect(text: string): Span[] {
  const taken: Span[] = [];
  for (const { kind, re, ok } of detectors) {
    for (const m of text.matchAll(re)) {
      const start = m.index!, end = start + m[0].length;
      if (ok && !ok(m[0])) continue;
      if (taken.some((t) => start < t.end && end > t.start)) continue;
      taken.push({ start, end, kind, value: m[0] });
    }
  }
  return taken.sort((a, b) => a.start - b.start);
}

export function redact(text: string) {
  const vault = new Map<string, string>(); // placeholder -> original
  const seen = new Map<string, string>(); // original -> placeholder (same value, same token)
  const counts: Partial<Record<Kind, number>> = {};
  let out = "", last = 0;
  const parts: { text: string; token?: string; kind?: Kind }[] = [];
  for (const s of detect(text)) {
    let token = seen.get(s.value);
    if (!token) {
      counts[s.kind] = (counts[s.kind] ?? 0) + 1;
      token = `‹${s.kind}_${counts[s.kind]}›`;
      seen.set(s.value, token);
      vault.set(token, s.value);
    }
    parts.push({ text: text.slice(last, s.start) }, { text: s.value, token, kind: s.kind });
    out += text.slice(last, s.start) + token;
    last = s.end;
  }
  parts.push({ text: text.slice(last) });
  out += text.slice(last);
  return { text: out, vault, parts };
}

export function restore(text: string, vault: Map<string, string>) {
  return text.replace(/‹[A-Z_]+_\d+›/g, (t) => vault.get(t) ?? t);
}

// Run: npx tsx lib/redact.ts
if (typeof process !== "undefined" && process.argv[1]?.endsWith("redact.ts")) {
  const assert = require("node:assert") as typeof import("node:assert");
  const input = "Mail ana@acme.io, again ana@acme.io. key sk-ant-api03-abcdefghijklmnopqrstuvwx card 4242 4242 4242 4242 not 4242 4242 4242 4243 ip 10.0.0.12";
  const r = redact(input);
  assert.equal(r.text, "Mail ‹EMAIL_1›, again ‹EMAIL_1›. key ‹ANTHROPIC_KEY_1› card ‹CARD_1› not 4242 4242 4242 4243 ip ‹IP_1›");
  assert.equal(restore(r.text, r.vault), input);
  console.log("redact ok");
}
