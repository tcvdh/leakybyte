"use client";

import { useState } from "react";

export default function Code({ children, label }: { children: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-edge bg-raise">
      <div className="flex items-center justify-between border-b border-edge px-4 py-2 text-xs text-muted">
        <span>{label ?? ""}</span>
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(children);
            setDone(true);
            setTimeout(() => setDone(false), 1500);
          }}
          className="rounded px-2 py-1 hover:text-paper"
        >
          {done ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-sm leading-relaxed"><code>{children}</code></pre>
    </div>
  );
}
