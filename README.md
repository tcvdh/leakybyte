# LeakyByte

Three tools that stop AI apps from leaking data, sharing one detection engine. Website: https://leakybyte.xyz

| Tool | Where it works | What it does |
|---|---|---|
| **Veil** | Before the model | A local proxy for the Claude API. Swaps secrets and personal data for placeholders (`‹EMAIL_1›`) and restores them in the reply, including streaming and tool calls. |
| **Canary** | In your data | Mints fake Anthropic- and AWS-style keys, then verifies them if they appear in logs, outputs or files. |
| **Plug** | After the model | Scans model output for data-theft channels (image/link URLs that carry data, hidden characters, secrets) and sanitizes it. |

## Get started

Requires Node 22.18 or newer.

```bash
git clone https://github.com/tcvdh/leakybyte.git
cd leakybyte
npm install
npm run proxy        # http://127.0.0.1:8787
```

Point your SDK at it. Nothing else changes:

```ts
const client = new Anthropic({ baseURL: "http://127.0.0.1:8787" });
```
```python
client = anthropic.Anthropic(base_url="http://127.0.0.1:8787")
```

Your Anthropic key is forwarded and never stored. Responses carry an `x-leakybyte-redacted: <count>` header.

### Settings (environment variables)

| Variable | Default | |
|---|---|---|
| `PORT` | `8787` | Listens on 127.0.0.1 only |
| `LEAKYBYTE_UPSTREAM` | `https://api.anthropic.com` | Where redacted requests go |
| `LEAKYBYTE_AUDIT` | `leakybyte-audit.jsonl` | One JSON line per request: time, model, counts per kind. Never values. |
| `LEAKYBYTE_CANARY_KEY` | none | Secret for the Canary CLI |

### CLI

Text goes in on stdin.

```bash
echo "mail ana@acme.io" | npm run lb redact
export LEAKYBYTE_CANARY_KEY="something only you know"
npm run lb canary mint prod aws                 # prints a fake key tagged PROD
cat app.log | npm run lb canary check           # exit code 2 if a canary leaked
echo "$MODEL_REPLY" | npm run lb -- plug --allow cdn.example.com
```

### Website and tests

```bash
npm run dev      # the site, with in-browser demos of all three tools
npm test         # engines + proxy against a mock Claude server
```

## What it does not do

- Detection is pattern-based: keys, JWTs, emails, phone numbers, Luhn-checked cards, US SSNs, IPv4. It does not find names or addresses, or secrets split across separate text blocks.
- The proxy only handles `POST /v1/messages` (and `count_tokens`). Other POST routes, such as batches, are blocked rather than forwarded unredacted.
- Plug and Canary are not wired into the proxy yet. Plug is a heuristic filter: use it as one layer, with a strict content security policy where you render model output.
- Tested against a mock Claude server; not yet validated at scale against the live API.
- Early software, local only. No hosted version or dashboard yet.

## Layout

```
lib/       redact.ts  canary.ts  plug.ts   the engines (no dependencies)
proxy/     server.ts                        the Veil proxy
cli/       leakybyte.ts                     the command line
app/ components/                            the website (Next.js)
test/                                       node:test suites
```
