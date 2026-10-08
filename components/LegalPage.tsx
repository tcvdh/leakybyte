import type { ReactNode } from "react";
import { legalDraft, UPDATED } from "@/lib/site";

export type LegalSection = { title: string; body: ReactNode };

export default function LegalPage({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
  return (
    <main className="mx-auto max-w-3xl px-6 pb-24 pt-10 md:pt-16">
      {legalDraft && (
        <p role="note" className="mb-8 rounded-lg border border-[#ff6b6b] bg-raise p-4 text-sm">
          Draft: the details of who runs LeakyByte are not filled in yet. Complete them in lib/site.ts before launch.
        </p>
      )}
      <h1 className="font-display text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-muted">Last updated {UPDATED}</p>
      <p className="mt-6 text-lg leading-relaxed text-muted">{intro}</p>
      <div className="mt-10 space-y-10">
        {sections.map((s, i) => (
          <section key={s.title}>
            <h2 className="font-display text-xl font-semibold">{i + 1}. {s.title}</h2>
            <div className="mt-3 space-y-3 leading-relaxed text-muted [&_a]:text-paper [&_a]:underline [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-paper">{s.body}</div>
          </section>
        ))}
      </div>
    </main>
  );
}
