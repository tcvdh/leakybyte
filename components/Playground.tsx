"use client";

import { useState, type ReactNode } from "react";
import CanaryDemo from "./CanaryDemo";
import Demo from "./Demo";
import PlugDemo from "./PlugDemo";

const TABS: { id: string; name: string; line: string; view: ReactNode }[] = [
  { id: "veil", name: "Veil", line: "Swap secrets for placeholders before a prompt leaves.", view: <Demo /> },
  { id: "canary", name: "Canary", line: "Plant fake keys and find out when one leaks.", view: <CanaryDemo /> },
  { id: "plug", name: "Plug", line: "Stop model output from carrying data out.", view: <PlugDemo /> },
];

export default function Playground() {
  const [i, setI] = useState(0);
  const t = TABS[i];
  return (
    <div>
      <div role="tablist" aria-label="Products" className="flex gap-2">
        {TABS.map((x, n) => (
          <button key={x.id} role="tab" id={`tab-${x.id}`} aria-selected={n === i} aria-controls={`panel-${x.id}`}
            onClick={() => setI(n)}
            className={`rounded px-4 py-2 font-display text-lg font-semibold ${n === i ? "bg-paper text-ink" : "text-muted hover:text-paper"}`}>
            {x.name}
          </button>
        ))}
      </div>
      <p className="mb-4 mt-3 text-muted">{t.line}</p>
      <div role="tabpanel" id={`panel-${t.id}`} aria-labelledby={`tab-${t.id}`}>{t.view}</div>
    </div>
  );
}
