import Link from "next/link";
import type { ReactNode } from "react";
import { EMAIL, PRODUCTS, REPO } from "@/lib/site";

export type Section = { id: string; title: string; body: ReactNode };

export default function ProductPage({ slug, tagline, intro, sections }: {
  slug: string; tagline: string; intro: string; sections: Section[];
}) {
  const me = PRODUCTS.find((p) => p.slug === slug)!;
  const others = PRODUCTS.filter((p) => p.slug !== slug);
  return (
    <main>
      <section className="mx-auto max-w-6xl px-6 pb-12 pt-10 md:pt-16">
        <p className="text-sm text-lit">{me.where}</p>
        <h1 className="mt-3 font-display text-6xl font-extrabold tracking-tight md:text-8xl">
          <span className="bar font-display">{me.name}</span>
        </h1>
        <p className="mt-8 max-w-3xl font-display text-2xl font-semibold leading-snug md:text-3xl">{tagline}</p>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">{intro}</p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a href="#try" className="rounded bg-paper px-5 py-3 font-medium text-ink">Try it in your browser</a>
          <a href="#setup" className="rounded border border-edge px-5 py-3 font-medium hover:bg-raise">Set it up</a>
          <span className="ml-1 text-sm text-muted">Early stage. Works locally today.</span>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 pb-24 lg:grid-cols-[13rem_1fr]">
        <nav aria-label="On this page" className="hidden lg:block">
          <ul className="sticky top-8 space-y-2 border-l border-edge text-sm">
            {sections.map((s) => (
              <li key={s.id}><a href={`#${s.id}`} className="-ml-px block border-l border-transparent py-1 pl-4 text-muted hover:border-lit hover:text-paper">{s.title}</a></li>
            ))}
          </ul>
        </nav>
        <div className="min-w-0">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-8 border-t border-edge py-12 first:border-t-0 first:pt-0">
              <h2 className="font-display text-3xl font-bold tracking-tight">{s.title}</h2>
              {s.body}
            </section>
          ))}

          <section className="mt-4 rounded-lg bg-paper p-8 text-ink md:p-10">
            <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">Using {me.name} on a real project?</h2>
            <p className="mt-3 max-w-xl leading-relaxed">Tell us what you are building and what is missing. We read and reply to every message.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href={`mailto:${EMAIL}?subject=${me.name}%20feedback`} className="rounded bg-ink px-5 py-3 font-medium text-paper">Email {EMAIL}</a>
              <a href={REPO} className="rounded border border-ink/30 px-5 py-3 font-medium">View the source</a>
            </div>
          </section>

          <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-edge bg-edge sm:grid-cols-2">
            {others.map((o) => (
              <Link key={o.slug} href={`/${o.slug}`} className="bg-raise p-6 hover:bg-ink">
                <p className="text-sm text-lit">{o.where}</p>
                <p className="mt-1 font-display text-xl font-bold">{o.name}</p>
                <p className="mt-1 text-sm text-muted">{o.blurb}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
