import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { EMAIL, LEGAL, REPO } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of use | LeakyByte", description: "The terms for using the LeakyByte website and tools." };

export default function Page() {
  return (
    <LegalPage
      title="Terms of use"
      intro="These terms apply to the LeakyByte website and to the early-stage tools we publish: Veil, Canary and Plug. By using them you agree to these terms."
      sections={[
        {
          title: "Who we are",
          body: (<p>LeakyByte is run by {LEGAL.name}, {LEGAL.address}. Contact: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>),
        },
        {
          title: "Early-stage software",
          body: (<p>Our tools are early-stage. They are published at <a href={REPO}>{REPO}</a> and may change, break or be removed without notice. Do not rely on them as your only protection for sensitive data. The software is provided under the licence in the repository; if a file conflicts with these terms about the software itself, that licence controls.</p>),
        },
        {
          title: "No guarantee of protection",
          body: (<>
            <p>The tools find sensitive data and unsafe output using pattern matching and heuristics. They will miss some data, such as names and addresses, and they can also change text that was harmless. They reduce risk. They do not remove it, and they do not make you compliant with any law or standard.</p>
            <p>You are responsible for testing the tools in your own setup, for deciding what data you send to any service, and for your own security and legal obligations.</p>
          </>),
        },
        {
          title: "Acceptable use",
          body: (<>
            <p>You agree not to:</p>
            <ul>
              <li>use the website or tools to break the law or someone else&apos;s rights;</li>
              <li>attack, overload or probe the website, other than under our <Link href="/security">security policy</Link>;</li>
              <li>claim that LeakyByte endorses you, or that we are connected to Anthropic.</li>
            </ul>
          </>),
        },
        {
          title: "Third-party services and trademarks",
          body: (<p>LeakyByte is independent. It is not affiliated with, endorsed by or sponsored by Anthropic, PBC. Claude is a trademark of Anthropic. When you send requests to the Claude API or any other service, that service&apos;s own terms and privacy policy apply, and you need your own account and key.</p>),
        },
        {
          title: "Intellectual property",
          body: (<p>The LeakyByte name, logo and website design belong to us. The source code is available under the licence published in the repository. Content you type into the demos stays yours and stays on your device.</p>),
        },
        {
          title: "No warranty",
          body: (<p>The website and tools are provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo;, without warranties of any kind, express or implied, including fitness for a particular purpose, accuracy, and non-infringement, to the extent the law allows.</p>),
        },
        {
          title: "Limit of liability",
          body: (<p>To the extent the law allows, we are not liable for indirect or consequential loss, lost profits, lost data or business interruption arising from your use of the website or tools. Nothing in these terms limits liability that cannot be limited by law, such as liability for intent, gross negligence, injury to life, body or health, or fraud.</p>),
        },
        {
          title: "Changes and ending",
          body: (<p>We may update these terms, and the date at the top will change when we do. You can stop using the website and tools at any time. We may suspend access to the website if needed to protect it.</p>),
        },
        {
          title: "Governing law",
          body: (<p>These terms are governed by the law of {LEGAL.jurisdiction}, without regard to its conflict-of-laws rules. If you are a consumer, you keep the protection of the mandatory laws of the country where you live.</p>),
        },
      ]}
    />
  );
}
