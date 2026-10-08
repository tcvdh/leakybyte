import type { Metadata } from "next";
import CanaryDemo from "@/components/CanaryDemo";
import Code from "@/components/Code";
import ProductPage from "@/components/ProductPage";
import { Callout, H3, Mono, P, Steps, Table } from "@/components/doc";
import { REPO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Canary: fake keys that prove where data leaked | LeakyByte",
  description: "Canary mints fake API keys that look real. If one turns up in a log, an output or a file, you know something leaked.",
};

const setup = `git clone ${REPO}.git
cd leakybyte
npm install

# a long secret that only you know. Keep it in your secret manager.
export LEAKYBYTE_CANARY_KEY="paste-a-long-random-string-here"`;

const mint = `$ npm run lb canary mint prod anthropic
sk-ant-api03-PRODQ43CBT4QZDICOPT4A3QC34AIRD

$ npm run lb canary mint ci aws
AKIACIXXA6YXAAR3PRFT`;

const check = `$ cat app.log | npm run lb canary check
LEAK: anthropic canary "PROD" at char 412
$ echo $?
2`;

const ci = `name: canary-check
on: [push]
jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci
      # exits with code 2, and fails the job, if a canary appears in the output
      - run: cat model-output.txt | npm run lb canary check
        env:
          LEAKYBYTE_CANARY_KEY: \${{ secrets.LEAKYBYTE_CANARY_KEY }}`;

const env = `# staging.env : a decoy that real code never reads
ANTHROPIC_API_KEY=sk-ant-api03-PRODQ43CBT4QZDICOPT4A3QC34AIRD`;

export default function Page() {
  return (
    <ProductPage
      slug="canary"
      tagline="Plant a fake key. If it ever shows up, you know where it leaked."
      intro="Canary mints keys that look real to anyone who finds them but are recognisable only to you. Scan any text, such as logs, model output or a file, and Canary tells you if one of yours appears."
      sections={[
        {
          id: "try", title: "Try it",
          body: (<><P>Mint a key, then check the sample log that appears. The key that verifies tokens is created and kept in this browser only. Nothing is sent anywhere.</P><div className="mt-6"><CanaryDemo /></div></>),
        },
        {
          id: "why", title: "Why use it",
          body: (<>
            <P>Most leaks are found late, if at all. Data goes into a model prompt, a log line or a shared document, and months later nobody can say which path it took. A real secret that leaks is also a real risk, so you cannot safely use one as bait.</P>
            <P>A canary is bait that is safe to lose. It is a credential-shaped string that does nothing, planted somewhere that only a leak would carry it. When it appears where it should not, you have proof, and the tag tells you where it started.</P>
            <H3>Good places to plant one</H3>
            <ul className="mt-3 max-w-[68ch] list-disc space-y-3 pl-5 leading-relaxed text-muted">
              <li>A documents folder that an AI assistant can read but must never quote. Scan its replies for the canary.</li>
              <li>A staging config or a private repo, to see whether it ends up in logs or in a public paste.</li>
              <li>A system prompt, to test whether your app can be tricked into revealing it.</li>
              <li>A seeded record in a test database that you export to a vendor.</li>
            </ul>
          </>),
        },
        {
          id: "how", title: "How it works",
          body: (<>
            <Steps items={[
              ["You pick a tag and a secret", <>The tag is four letters that say where you plant it, such as <Mono>PROD</Mono>. The secret key is a string only you know.</>],
              ["Canary builds a token", <>The token has the right shape for the style you chose, with your tag, random characters, and a short check code computed from your secret key.</>],
              ["You plant it", <>Put it in a file, a document or a prompt. Canary stores nothing, so keep a note of which tag went where.</>],
              ["You scan text later", <>Run any text through the checker. It finds token-shaped strings and recomputes the check code. If it matches your key, it is yours, and the tag is read back out.</>],
            ]} />
            <Callout title="No database and no phone-home">Verification needs only your secret key. Canary does not contact anything and does not alert you by itself. It tells you, when you scan, that a token is yours. Your scan is what turns it into an alert.</Callout>
          </>),
        },
        {
          id: "setup", title: "Set it up",
          body: (<>
            <P>You need Node 22.18 or newer.</P>
            <Code label="terminal">{setup}</Code>
            <H3>Mint</H3>
            <P>The arguments are a tag, then a style: <Mono>anthropic</Mono> or <Mono>aws</Mono>. Real output:</P>
            <Code label="terminal">{mint}</Code>
            <H3>Check</H3>
            <P>Text goes in on stdin. Exit code 0 means no canaries, and 2 means at least one was found, so it works as a gate in scripts and CI.</P>
            <Code label="terminal">{check}</Code>
            <Callout title="Keep the key safe, and keep it stable">Anyone with your key could mint tokens that verify as yours. If you change the key, canaries minted before the change stop verifying.</Callout>
          </>),
        },
        {
          id: "example", title: "Examples",
          body: (<>
            <H3>A decoy in a staging file</H3>
            <Code label="staging.env">{env}</Code>
            <P>No real code reads this file. If the token shows up in a log, an error report or a pasted snippet, something read the file that should not have.</P>
            <H3>A gate in CI</H3>
            <P>Run your assistant against a test prompt that tries to extract the planted token, then scan what it wrote.</P>
            <Code label=".github/workflows/canary.yml">{ci}</Code>
          </>),
        },
        {
          id: "formats", title: "Token formats",
          body: (<>
            <Table head={["Style", "Shape", "Layout"]} rows={[
              ["anthropic", "sk-ant-api03- plus 30 characters", "4 tag + 22 random + 4 check"],
              ["aws", "AKIA plus 16 characters", "4 tag + 8 random + 4 check"],
            ]} />
            <P>Characters are uppercase A to Z and 2 to 7. A tag is cleaned the same way: uppercased, anything else dropped, and padded with X to four letters, so ci becomes CIXX.</P>
            <Callout title="Do not use them as real credentials">They are not valid keys and cannot authenticate anywhere. Because they look like keys, secret scanners may flag them, and so will Veil, which would redact a canary before it reaches Claude. To test a leak through Claude, leave Veil out of that test.</Callout>
          </>),
        },
        {
          id: "limits", title: "Limits to know about",
          body: (
            <ul className="mt-4 max-w-[68ch] list-disc space-y-3 pl-5 leading-relaxed text-muted">
              <li>The check code is 4 characters, about 20 bits. It prevents accidental matches. It does not stop a determined person who knows your format from forging a token that looks verified.</li>
              <li>Canary finds a token only if it appears in text you scan. It does not watch the network.</li>
              <li>Two styles exist today. More formats are on the list.</li>
              <li>The CLI reads the key from an environment variable. The browser demo keeps its own key in local storage.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
