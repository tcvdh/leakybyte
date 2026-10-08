import Link from "next/link";
import { EMAIL, PRODUCTS, REPO } from "@/lib/site";

const legal = [["Privacy policy", "/privacy"], ["Terms of use", "/terms"], ["Cookies and storage", "/cookies"], ["Security", "/security"], ["Legal notice", "/legal"]];

export default function SiteFooter() {
  const h = "font-display text-sm font-semibold text-paper";
  const a = "hover:text-paper";
  return (
    <footer className="border-t border-edge">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-12 text-sm text-muted md:grid-cols-[1.5fr_1fr_1fr_1fr]">
        <div>
          <p className="font-display text-xl font-bold tracking-tight text-paper">Leaky<span className="bar font-display">Byte</span></p>
          <p className="mt-3 max-w-xs leading-relaxed">Tools that stop AI apps from leaking data. Early-stage and built in the open.</p>
        </div>
        <nav aria-label="Products">
          <p className={h}>Products</p>
          <ul className="mt-3 space-y-2">{PRODUCTS.map((p) => <li key={p.slug}><Link className={a} href={`/${p.slug}`}>{p.name}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Legal">
          <p className={h}>Legal</p>
          <ul className="mt-3 space-y-2">{legal.map(([n, href]) => <li key={href}><Link className={a} href={href}>{n}</Link></li>)}</ul>
        </nav>
        <nav aria-label="Contact">
          <p className={h}>Contact</p>
          <ul className="mt-3 space-y-2">
            <li><a className={a} href={`mailto:${EMAIL}`}>{EMAIL}</a></li>
            <li><a className={a} href={REPO}>GitHub</a></li>
          </ul>
        </nav>
      </div>
      <div className="mx-auto max-w-6xl border-t border-edge px-6 py-6 text-xs leading-relaxed text-muted">
        © 2026 LeakyByte. LeakyByte is an independent project and is not affiliated with, endorsed by or sponsored by Anthropic. Claude is a trademark of Anthropic, PBC. Other names belong to their owners.
      </div>
    </footer>
  );
}
