import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { EMAIL, LEGAL } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy policy | LeakyByte", description: "What personal data LeakyByte collects (very little), why, and your rights." };

export default function Page() {
  return (
    <LegalPage
      title="Privacy policy"
      intro="LeakyByte builds tools that keep data from leaking out of AI apps, so we try to collect as little as we can. This page explains what we do collect, why, and what you can ask us to do."
      sections={[
        {
          title: "Who is responsible",
          body: (<>
            <p>The controller of your personal data on this website is {LEGAL.name}, {LEGAL.address} (&ldquo;LeakyByte&rdquo;, &ldquo;we&rdquo;).</p>
            <p>Contact for any privacy question: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>
          </>),
        },
        {
          title: "What we collect",
          body: (<ul>
            <li><strong>Server logs.</strong> When you visit leakybyte.xyz, our hosting provider records technical data needed to deliver and secure the site: your IP address, the time, the page requested, the browser and device type, and the referring page.</li>
            <li><strong>Emails you send us.</strong> If you email us, we receive your email address, your name if it is in your address or message, and what you write.</li>
            <li><strong>Nothing else on the website.</strong> There are no accounts, forms, advertising or analytics tools on this site, and no tracking cookies.</li>
          </ul>),
        },
        {
          title: "The in-browser demos",
          body: (<>
            <p>The demos for Veil, Canary and Plug run entirely in your browser. The text you type into them is processed on your device and is not sent to us or to anyone else.</p>
            <p>The Canary demo saves a random verification key in your browser&apos;s local storage so that tokens you mint can be checked later. It stays on your device. See <Link href="/cookies">Cookies and storage</Link>.</p>
          </>),
        },
        {
          title: "The software you download",
          body: (<p>The LeakyByte proxy and command line tools run on your own machine. We do not receive the requests you send through them, the data they redact, your Anthropic API key, or their audit logs. When you use the proxy, your requests go to the upstream you configure, by default the Claude API, and that provider&apos;s own privacy terms apply to that data.</p>),
        },
        {
          title: "Why we use your data, and our legal basis",
          body: (<ul>
            <li>To deliver, secure and fix the website (server logs). Basis: our legitimate interest in running a safe, working site (GDPR Art. 6(1)(f)).</li>
            <li>To reply to your emails and discuss early access. Basis: taking steps at your request before a possible agreement, and our legitimate interest in answering enquiries (Art. 6(1)(b) and (f)).</li>
          </ul>),
        },
        {
          title: "Who we share it with",
          body: (<>
            <p>We do not sell your personal data and we do not share it for advertising.</p>
            <p>We use service providers to run the site: Vercel Inc. for hosting, GitHub for hosting the source code, and our email provider for receiving your messages. They process data on our behalf and under their own terms. Some are based in the United States, so your data may be transferred outside the EU or UK. Where that happens we rely on an adequacy decision, such as the EU-US Data Privacy Framework, or on standard contractual clauses.</p>
          </>),
        },
        {
          title: "How long we keep it",
          body: (<ul>
            <li>Server logs: kept by the hosting provider for a short period, set by that provider.</li>
            <li>Emails: kept while we are talking to you and for a reasonable time afterward, then deleted, unless we must keep them for legal reasons.</li>
          </ul>),
        },
        {
          title: "Your rights",
          body: (<>
            <p>Depending on where you live, you can ask us to access, correct, delete, restrict or export your personal data, and you can object to our processing based on legitimate interests. To use any of these rights, email <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We will answer within one month.</p>
            <p>You can also complain to your data protection authority. If you live in California, you have similar rights under the CCPA, and we do not sell or share personal information as those terms are defined there.</p>
          </>),
        },
        {
          title: "Children",
          body: (<p>This website is meant for developers and businesses. It is not directed at children, and we do not knowingly collect data from them.</p>),
        },
        {
          title: "Changes",
          body: (<p>If we change this policy, we will update the date at the top. If we start using analytics or any new kind of data collection, we will update this page first.</p>),
        },
      ]}
    />
  );
}
