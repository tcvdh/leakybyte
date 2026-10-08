"use client";

import { useMemo, useState } from "react";
import { redact, restore } from "@/lib/redact";

const SAMPLE = `Customer Dana Reyes (dana.reyes@northwind.example, +1 415-555-0134) says checkout fails.
Card on file: 4242 4242 4242 4242. Server 10.4.2.19 logs show our key sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A leaking in the stack trace.`;

export default function Demo() {
  const [input, setInput] = useState(SAMPLE);
  const r = useMemo(() => redact(input), [input]);
  const tokens = [...r.vault.keys()];
  // Stand-in for the model: it only ever sees placeholders, and we restore them in its answer.
  const reply = tokens.length
    ? `Thanks. I'll email ${tokens.find((t) => t.includes("EMAIL")) ?? "the customer"} and rotate ${tokens.find((t) => t.includes("KEY")) ?? "any exposed key"} right away.`
    : "Nothing sensitive found. This prompt passes through unchanged.";

  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge lg:grid-cols-3">
      <Pane title="1. Your app sends" note="Edit this text">
        <textarea
          aria-label="Prompt text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          className="h-full min-h-56 w-full resize-none bg-transparent font-mono text-sm leading-relaxed outline-none"
        />
        <p className="mt-3 text-xs text-muted">
          {r.vault.size} sensitive {r.vault.size === 1 ? "value" : "values"} found
        </p>
      </Pane>
      <Pane title="2. Claude receives" note="Placeholders only">
        <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {r.parts.map((p, i) =>
            p.token ? <span key={i} className="bar" title={p.kind}>{p.token}</span> : <span key={i}>{p.text}</span>,
          )}
        </p>
      </Pane>
      <Pane title="3. Your app gets back" note="Simulated reply, restored">
        <p className="text-sm leading-relaxed">
          <span className="unbar">{restore(reply, r.vault)}</span>
        </p>
        <p className="mt-4 font-mono text-xs leading-relaxed text-muted">Model saw: {reply}</p>
      </Pane>
    </div>
  );
}

function Pane({ title, note, children }: { title: string; note: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col bg-raise p-5">
      <header className="mb-4 flex items-baseline justify-between gap-3">
        <h3 className="font-display text-base font-semibold">{title}</h3>
        <span className="text-xs text-muted">{note}</span>
      </header>
      {children}
    </section>
  );
}
