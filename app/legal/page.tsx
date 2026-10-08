import type { Metadata } from "next";
import Link from "next/link";
import LegalPage from "@/components/LegalPage";
import { EMAIL, LEGAL } from "@/lib/site";

export const metadata: Metadata = { title: "Legal notice | LeakyByte", description: "Who operates leakybyte.xyz and how to contact us." };

export default function Page() {
  return (
    <LegalPage
      title="Legal notice"
      intro="Information about the operator of leakybyte.xyz."
      sections={[
        {
          title: "Operator",
          body: (<>
            <p><strong>{LEGAL.name}</strong></p>
            <p>{LEGAL.address}</p>
            {LEGAL.registration && <p>Registration number: {LEGAL.registration}</p>}
            {LEGAL.vat && <p>VAT ID: {LEGAL.vat}</p>}
          </>),
        },
        {
          title: "Contact",
          body: (<p>Email: <a href={`mailto:${EMAIL}`}>{EMAIL}</a>. We answer by email.</p>),
        },
        {
          title: "Responsibility for content",
          body: (<p>We take care to keep the information on this website accurate, but it describes early-stage software that changes often. Links to other websites are provided for convenience, and we are not responsible for their content.</p>),
        },
        {
          title: "More information",
          body: (<p>See our <Link href="/privacy">privacy policy</Link>, <Link href="/terms">terms of use</Link>, <Link href="/cookies">cookies and storage</Link> page and <Link href="/security">security policy</Link>. LeakyByte is not affiliated with Anthropic, PBC.</p>),
        },
      ]}
    />
  );
}
