import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { EMAIL } from "@/lib/site";

export const metadata: Metadata = { title: "Cookies and storage | LeakyByte", description: "LeakyByte does not use cookies. This page lists the one item stored in your browser." };

export default function Page() {
  return (
    <LegalPage
      title="Cookies and storage"
      intro="leakybyte.xyz does not set cookies, and it has no analytics, advertising or tracking scripts. That is why you do not see a cookie banner."
      sections={[
        {
          title: "What is stored in your browser",
          body: (<>
            <p>Only one item, and only if you use the Canary demo:</p>
            <ul>
              <li><strong>lb-canary-key</strong> in local storage. A random key generated on your device the first time you mint a canary. It lets the demo recognise the tokens you minted. It is never sent to us or anyone else, and it stays until you clear your browser data.</li>
            </ul>
            <p>You asked for the feature that needs it by using the demo, so it counts as strictly necessary and does not need consent. You can delete it at any time in your browser settings.</p>
          </>),
        },
        {
          title: "Fonts and other resources",
          body: (<p>Fonts are bundled with the website and served from leakybyte.xyz. The page does not load fonts, scripts or images from other companies, so your browser makes no third-party requests when you visit.</p>),
        },
        {
          title: "Server logs",
          body: (<p>Like any website, the hosting provider logs requests. This is covered in the <Link href="/privacy">privacy policy</Link>.</p>),
        },
        {
          title: "If this changes",
          body: (<p>If we add analytics or anything else that stores data in your browser, we will update this page and ask for your consent first where the law requires it. Questions: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>.</p>),
        },
      ]}
    />
  );
}
