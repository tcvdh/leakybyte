# LeakyByte

A privacy layer for Claude apps. A local proxy that swaps secrets and personal data for placeholders before a request reaches the Claude API, and restores them in the reply (JSON and streaming).

```
npm install
npm run proxy        # http://127.0.0.1:8787, forwards to https://api.anthropic.com
npm test             # redaction + proxy tests against a mock Claude server
npm run dev          # the website (includes a browser demo)
```

Point the SDK at it: `new Anthropic({ baseURL: "http://127.0.0.1:8787" })`.

Env: `PORT`, `LEAKYBYTE_UPSTREAM`, `LEAKYBYTE_AUDIT` (JSONL, kinds and counts only).

Status: tested against a mock upstream; not yet validated at scale against the live API. Detection is regex-based (keys, JWTs, emails, phones, Luhn cards, SSNs, IPv4).
