import type { ReactNode } from "react";

export const P = ({ children }: { children: ReactNode }) => (
  <p className="mt-3 max-w-[68ch] leading-relaxed text-muted">{children}</p>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="mt-10 font-display text-xl font-semibold">{children}</h3>
);

export function Callout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <aside className="mt-6 max-w-[68ch] rounded-r-lg border-l-2 border-lit bg-raise p-5">
      <p className="font-display font-semibold">{title}</p>
      <div className="mt-1 leading-relaxed text-muted">{children}</div>
    </aside>
  );
}

export function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto rounded-lg border border-edge">
      <table className="w-full text-left text-sm">
        <thead className="bg-raise text-muted">
          <tr>{head.map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t border-edge align-top">
              {r.map((c, j) => <td key={j} className={`px-4 py-3 ${j === 0 ? "font-mono" : "text-muted"}`}>{c}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Steps({ items }: { items: [string, ReactNode][] }) {
  return (
    <ol className="mt-5 space-y-5">
      {items.map(([t, d], i) => (
        <li key={t} className="flex gap-4">
          <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full border border-edge font-mono text-xs text-lit">{i + 1}</span>
          <div>
            <p className="font-display font-semibold">{t}</p>
            <div className="mt-1 max-w-[62ch] leading-relaxed text-muted">{d}</div>
          </div>
        </li>
      ))}
    </ol>
  );
}

export const Mono = ({ children }: { children: ReactNode }) => (
  <code className="rounded bg-raise px-1.5 py-0.5 font-mono text-[0.9em] text-paper">{children}</code>
);
