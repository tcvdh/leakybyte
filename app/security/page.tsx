import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { EMAIL, REPO } from "@/lib/site";

export const metadata: Metadata = { title: "Security and responsible disclosure | LeakyByte", description: "How to report a security problem in LeakyByte, and what to expect." };

export default function Page() {
  return (
    <LegalPage
      title="Security and responsible disclosure"
      intro="We build security tools, so we want to hear about problems in them. If you find a vulnerability, please tell us privately first."
      sections={[
        {
          title: "How to report",
          body: (<>
            <p>Email <a href={`mailto:${EMAIL}?subject=Security%20report`}>{EMAIL}</a> with the subject Security report. Include what you found, the steps to reproduce it, the version or commit, and the impact you see. A short proof of concept is ideal.</p>
            <p>Please do not open a public issue for a vulnerability before we have had a chance to fix it. Our contact details are also published in <a href="/.well-known/security.txt">security.txt</a>.</p>
          </>),
        },
        {
          title: "What is in scope",
          body: (<ul>
            <li>The code at <a href={REPO}>{REPO}</a>, including the detection engines, the Veil proxy, the command line tool and Plug.</li>
            <li>The website at leakybyte.xyz.</li>
            <li>Especially welcome: a way to make Veil send a value it should have redacted, to make Plug let a data-stealing link or hidden text through, or to forge or evade a Canary check.</li>
          </ul>),
        },
        {
          title: "What we ask of you",
          body: (<ul>
            <li>Test only against your own setup and data, or the public website without disrupting it.</li>
            <li>Do not access, change or keep other people&apos;s data, and do not run denial-of-service or social-engineering attacks.</li>
            <li>Give us a reasonable time to fix the issue before you publish details.</li>
          </ul>),
        },
        {
          title: "What you can expect from us",
          body: (<ul>
            <li>We aim to acknowledge your report within 7 days and to keep you updated until it is fixed.</li>
            <li>We will not take legal action against research done in good faith under this policy.</li>
            <li>We will credit you in the fix notes if you want us to.</li>
            <li>We are a very small project and cannot offer a paid bounty at this time.</li>
          </ul>),
        },
        {
          title: "Known limits",
          body: (<p>Our tools are heuristic by design. Veil cannot see names or addresses, and Plug is one layer of defence rather than a guarantee. Those limits are documented on each product page and are not vulnerabilities, but reports of ways around the documented checks are welcome.</p>),
        },
      ]}
    />
  );
}
