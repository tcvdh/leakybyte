import type { Metadata } from "next";
import Demo from "@/components/Demo";
import Code from "@/components/Code";
import ProductPage from "@/components/ProductPage";
import { Callout, H3, Mono, P, Steps, Table } from "@/components/doc";
import { REPO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Veil: redact secrets before they reach Claude | LeakyByte",
  description: "Veil is a proxy for the Claude API. It swaps API keys and personal data for placeholders before a prompt leaves, and restores them in the reply.",
};

const install = `git clone ${REPO}.git
cd leakybyte
npm install
npm run proxy
# LeakyByte proxy on http://127.0.0.1:8787`;

const ts = `import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  baseURL: "http://127.0.0.1:8787", // the only change
});

const msg = await client.messages.create({
  model: "claude-sonnet-5-5",
  max_tokens: 300,
  messages: [{ role: "user", content: "Why did the deploy for dana@acme.io fail?" }],
});`;

const py = `import anthropic

client = anthropic.Anthropic(base_url="http://127.0.0.1:8787")`;

const curl = `curl -i http://127.0.0.1:8787/v1/messages \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -H "content-type: application/json" \\
  -d '{"model":"claude-sonnet-5-5","max_tokens":200,
       "messages":[{"role":"user","content":"Email dana@acme.io about the outage"}]}'`;

const before = `Customer dana.reyes@northwind.example called from +1 415-555-0134.
Card 4242 4242 4242 4242, server 10.4.2.19.`;
const after = `Customer ‹EMAIL_1› called from ‹PHONE_1›.
Card ‹CARD_1›, server ‹IP_1›.`;

const audit = `{"ts":"2026-03-02T09:14:07.512Z","model":"claude-sonnet-5-5","stream":false,"redacted":{"EMAIL":1,"PHONE":1}}`;

export default function Page() {
  return (
    <ProductPage
      slug="veil"
      tagline="Claude can help with a support ticket without ever seeing the customer."
      intro="Veil is a proxy that sits between your app and the Claude API. It swaps secrets and personal data for placeholders on the way out, and puts the real values back in the reply."
      sections={[
        {
          id: "try", title: "Try it",
          body: (<><P>Edit the text on the left. Detection and swapping run in your browser and nothing is sent anywhere. The reply in step 3 is simulated, to show how restoring works.</P><div className="mt-6"><Demo /></div></>),
        },
        {
          id: "why", title: "Why use it",
          body: (<>
            <P>Prompts collect sensitive data without anyone deciding to send it. A stack trace includes an API key. A support ticket includes a phone number and a card. A retrieved document includes an email address. Each of these goes to a third-party service in plain text.</P>
            <P>You can clean every code path by hand, but each team ends up rewriting the same fragile pattern matching, and one missed path is enough. Veil does it in one place, for every request, with no change to your application logic.</P>
            <H3>Why placeholders instead of deleting</H3>
            <P>Veil replaces a value with a stable name, so Claude can still reason about it. The same email is always <Mono>‹EMAIL_1›</Mono> within a request, so a question like who reported this and when did they last write in still makes sense. When Claude mentions <Mono>‹EMAIL_1›</Mono> in its answer, Veil puts the real address back before your app sees it.</P>
          </>),
        },
        {
          id: "how", title: "How it works",
          body: (<Steps items={[
            ["Your app calls Veil", <>Your SDK sends a normal Messages API request to Veil on your own machine, using your own Anthropic key.</>],
            ["Veil scans the request", <>Every string in the request body is scanned, including the system prompt, messages, tool definitions, tool results and tool inputs. Structural fields such as roles, ids and the model name are left alone.</>],
            ["Values become placeholders", <>Each detected value is replaced with a placeholder such as <Mono>‹EMAIL_1›</Mono>. The mapping lives in memory for the length of that one request and is then discarded.</>],
            ["Veil forwards the clean request", <>The redacted request goes to the Claude API with your headers. Your key is passed through and never stored.</>],
            ["Veil restores the reply", <>Placeholders in the reply from Claude, in normal responses and in streams, are replaced with the original values. A placeholder split across two stream chunks is held back until it is complete.</>],
            ["Veil writes an audit line", <>One line per request records the time, model and how many values of each kind were swapped. It never records the values.</>],
          ]} />),
        },
        {
          id: "setup", title: "Set it up",
          body: (<>
            <P>You need Node 22.18 or newer. The proxy has no runtime dependencies and no build step.</P>
            <H3>1. Run the proxy</H3>
            <Code label="terminal">{install}</Code>
            <H3>2. Point your SDK at it</H3>
            <P>Change the base URL. Nothing else in your code changes.</P>
            <Code label="TypeScript">{ts}</Code>
            <Code label="Python">{py}</Code>
            <H3>Or test with curl</H3>
            <Code label="terminal">{curl}</Code>
            <P>The response includes a header, <Mono>x-leakybyte-redacted: 1</Mono>, with the number of distinct values that were swapped, and the reply contains the real address.</P>
            <Callout title="The proxy listens on localhost only">It binds to 127.0.0.1 and has no login or TLS of its own. Run it next to your app, not on a public interface.</Callout>
          </>),
        },
        {
          id: "example", title: "Example",
          body: (<>
            <P>This is real output from the command line tool, using the same engine as the proxy.</P>
            <div className="grid gap-4 md:grid-cols-2">
              <Code label="What your app sends">{before}</Code>
              <Code label="What Claude receives">{after}</Code>
            </div>
            <P>The audit log gets one line like this for the request:</P>
            <Code label="leakybyte-audit.jsonl">{audit}</Code>
          </>),
        },
        {
          id: "detects", title: "What it detects",
          body: (<Table head={["Placeholder", "Finds", "Notes"]} rows={[
            ["‹ANTHROPIC_KEY_n›", "sk-ant-… keys", ""],
            ["‹AWS_KEY_n›", "AKIA… and ASIA… access key ids", ""],
            ["‹GITHUB_TOKEN_n›", "ghp_, gho_, ghu_, ghs_, ghr_ tokens", ""],
            ["‹API_KEY_n›", "Other sk-… keys", "Generic pattern"],
            ["‹JWT_n›", "JSON Web Tokens", ""],
            ["‹EMAIL_n›", "Email addresses", ""],
            ["‹CARD_n›", "Card numbers, 13 to 19 digits", "Must pass the Luhn check, so random digit strings are left alone"],
            ["‹SSN_n›", "US social security numbers", "Format 123-45-6789"],
            ["‹PHONE_n›", "Phone numbers", "Common international and US formats"],
            ["‹IP_n›", "IPv4 addresses", ""],
          ]} />),
        },
        {
          id: "reference", title: "Reference",
          body: (<>
            <H3>Settings</H3>
            <Table head={["Variable", "Default", "What it does"]} rows={[
              ["PORT", "8787", "Port to listen on"],
              ["LEAKYBYTE_UPSTREAM", "https://api.anthropic.com", "Where redacted requests are sent"],
              ["LEAKYBYTE_AUDIT", "leakybyte-audit.jsonl", "Path of the audit log, one JSON object per line"],
            ]} />
            <H3>Routes</H3>
            <Table head={["Request", "What happens"]} rows={[
              ["POST /v1/messages", "Redacted, forwarded, and restored. Normal and streaming responses."],
              ["POST /v1/messages/count_tokens", "Redacted and forwarded."],
              ["Any other POST", "Blocked with status 501, so nothing leaves unredacted."],
              ["GET and other methods", "Forwarded as they are."],
            ]} />
            <H3>Errors</H3>
            <Table head={["Status", "Meaning", "What to do"]} rows={[
              ["400", "The request body was not valid JSON", "Check the body your client sends"],
              ["501", "A POST route Veil cannot redact", "Use /v1/messages, or call the API directly for that route"],
              ["502", "Veil could not reach the upstream", "Check LEAKYBYTE_UPSTREAM and your network"],
            ]} />
          </>),
        },
        {
          id: "limits", title: "Limits to know about",
          body: (<>
            <ul className="mt-4 max-w-[68ch] list-disc space-y-3 pl-5 leading-relaxed text-muted">
              <li>Detection is pattern-based. It does not find names, street addresses or other free-text personal details.</li>
              <li>A secret split across two separate text blocks is not matched.</li>
              <li>Error responses from the upstream are passed through as they are.</li>
              <li>Tested against a mock Claude server, including streaming and tool calls. Not yet validated at scale against the live API.</li>
              <li>If Claude writes a placeholder it was never given, it stays as written.</li>
            </ul>
            <Callout title="Where your data goes">Veil runs on your machine. The only party that receives your request is the upstream you configure, which is the Claude API by default. There is no LeakyByte server in the path.</Callout>
          </>),
        },
      ]}
    />
  );
}
