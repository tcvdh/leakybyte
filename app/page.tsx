import Demo from "@/components/Demo";

const EMAIL = "hello@leakybyte.xyz";

const steps = [
  ["Intercept", "Point your Claude SDK at the LeakyByte proxy. Prompts, tool results and attached text pass through it."],
  ["Swap", "Secrets and personal data are replaced with stable placeholders. The same value always gets the same placeholder, so Claude can still reason about it."],
  ["Restore", "Placeholders in Claude's reply are swapped back before your app sees it. Every swap is written to an audit log."],
];

const detects = [
  ["API keys", "Anthropic, AWS, GitHub, generic sk- keys"],
  ["Tokens", "JWTs"],
  ["Contact details", "Emails, phone numbers"],
  ["Financial", "Card numbers (Luhn-checked)"],
  ["Identity and network", "US SSNs, IPv4 addresses"],
];

const snippet = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://127.0.0.1:8787", // LeakyByte proxy
});

// Everything else stays the same.
const msg = await client.messages.create({ ... });`;

const run = `$ npm install
$ npm run proxy
LeakyByte proxy on http://127.0.0.1:8787

$ npm test
✔ non-streaming: upstream sees placeholders, client gets real values
✔ streaming: placeholder split across deltas is restored
✔ redacts, reuses placeholders, skips invalid cards, restores
ℹ pass 3   ℹ fail 0`;

const flow = [
  ["Your app", "Email dana.reyes@northwind.example about key sk-ant-api03-Zk3v…", false],
  ["LeakyByte proxy", "Email ‹EMAIL_1› about key ‹ANTHROPIC_KEY_1›", true],
  ["Claude API", "Will email ‹EMAIL_1›.", true],
] as const;

export default function Home() {
  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <a href="#" className="font-display text-xl font-bold tracking-tight">
          Leaky<span className="bar font-display">Byte</span>
        </a>
        <nav className="flex items-center gap-6 text-sm text-muted">
          <a className="hover:text-paper" href="#how">How it works</a>
          <a className="hover:text-paper" href="#build">Use it</a>
          <a className="rounded bg-paper px-3 py-1.5 font-medium text-ink" href="#access">Early access</a>
        </nav>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <h1 className="max-w-4xl font-display text-5xl font-extrabold leading-[1.02] tracking-tight md:text-7xl">
            Keep secrets out of your prompts.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            LeakyByte sits between your app and the Claude API. It swaps API keys and personal data for placeholders on the
            way out, and puts them back in the reply. Try it below. This runs in your browser; nothing is sent anywhere.
          </p>
          <div className="mt-12"><Demo /></div>
        </section>

        <section id="how" className="mx-auto max-w-6xl scroll-mt-8 px-6 py-20">
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Three steps, no app rewrite</h2>
          <ol className="mt-10 grid gap-10 md:grid-cols-3">
            {steps.map(([t, d], i) => (
              <li key={t} className="border-t border-edge pt-5">
                <span className="font-mono text-sm text-lit">Step {i + 1}</span>
                <h3 className="mt-2 font-display text-xl font-semibold">{t}</h3>
                <p className="mt-2 max-w-sm leading-relaxed text-muted">{d}</p>
              </li>
            ))}
          </ol>
          <div className="mt-14 grid gap-px overflow-hidden rounded-lg border border-edge bg-edge md:grid-cols-3">
            {flow.map(([who, text, masked]) => (
              <div key={who} className="bg-raise p-5">
                <p className="font-display text-sm font-semibold text-muted">{who}</p>
                <p className="mt-3 font-mono text-sm leading-relaxed">
                  {masked ? <span className="bar whitespace-normal">{text}</span> : text}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">The reply travels back the same way: placeholders in, real values out.</p>
        </section>

        <section id="build" className="mx-auto grid max-w-6xl scroll-mt-8 gap-12 px-6 py-20 md:grid-cols-2">
          <div>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">One line to adopt</h2>
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
              LeakyByte is early. The proxy runs locally today: it redacts requests, restores replies in both normal and
              streaming responses, and writes an audit log. The test suite runs it against a mock Claude server. Still to
              come: a hosted version, a dashboard for the audit log, custom detectors, and wider checks against the live API.
              We build with Claude Code.
            </p>
          </div>
          <pre className="self-start overflow-x-auto rounded-lg border border-edge bg-raise p-5 font-mono text-sm leading-relaxed">
            <code>{run}</code>
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
