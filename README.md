# LeakyByte

Three tools that stop AI apps from leaking data, sharing one detection engine:

- **Veil**: a proxy that swaps secrets and personal data for placeholders before a request reaches the Claude API, and restores them in the reply (JSON and streaming).
- **Canary**: mint fake keys that look real (Anthropic- and AWS-style), then verify them if they ever appear in text. Needs `LEAKYBYTE_CANARY_KEY` in the CLI; the web demo keeps its key in localStorage.
- **Plug**: scans model output for exfiltration (data in URLs, hidden characters, secrets) and sanitizes it.

CLI: `npm run lb redact | plug [--allow hosts] | canary mint <tag> [anthropic|aws] | canary check` (text on stdin).

```
npm install
npm run proxy        # http://127.0.0.1:8787, forwards to https://api.anthropic.com
npm test             # redaction + proxy tests against a mock Claude server
npm run dev          # the website (includes a browser demo)
```

Point the SDK at it: `new Anthropic({ baseURL: "http://127.0.0.1:8787" })`.

Env: `PORT`, `LEAKYBYTE_UPSTREAM`, `LEAKYBYTE_AUDIT` (JSONL, kinds and counts only).

Status: Plug and Canary are libraries, CLI and web demos only (not yet wired into the proxy). Veil is tested against a mock upstream; not yet validated at scale against the live API. Detection is regex-based (keys, JWTs, emails, phones, Luhn cards, SSNs, IPv4).
