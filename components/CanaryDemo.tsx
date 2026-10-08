"use client";

import { useState } from "react";
import { check, cleanTag, mint, newKey, type CanaryKind, type Hit } from "@/lib/canary";

// The verification key lives only in this browser.
const getKey = () => localStorage.getItem("lb-canary-key") ?? (localStorage.setItem("lb-canary-key", newKey()), localStorage.getItem("lb-canary-key")!);

export default function CanaryDemo() {
  const [tag, setTag] = useState("prod");
  const [kind, setKind] = useState<CanaryKind>("anthropic");
  const [token, setToken] = useState("");
  const [text, setText] = useState("");
  const [hits, setHits] = useState<Hit[] | null>(null);

  async function onMint() {
    const t = await mint(getKey(), tag, kind);
    setToken(t);
    setHits(null);
    setText(`[2026-03-02 09:14:07] ERROR config dump\n  DB_HOST=db.internal\n  ${kind === "aws" ? "AWS_ACCESS_KEY_ID" : "ANTHROPIC_API_KEY"}=${t}\n  RETRIES=3`);
  }

  return (
    <div className="grid gap-px overflow-hidden rounded-lg border border-edge bg-edge lg:grid-cols-2">
      <section className="bg-raise p-5">
        <h3 className="font-display text-base font-semibold">1. Mint a fake key</h3>
        <p className="mt-1 text-sm text-muted">It looks real to anyone who finds it, but only you can recognise it.</p>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <label className="text-xs text-muted">
            Where you plant it (4 letters)
            <input value={tag} maxLength={4} onChange={(e) => setTag(e.target.value)}
              className="mt-1 block w-32 rounded border border-edge bg-ink px-3 py-2 font-mono text-sm text-paper" />
          </label>
          <label className="text-xs text-muted">
            Style
            <select value={kind} onChange={(e) => setKind(e.target.value as CanaryKind)}
              className="mt-1 block rounded border border-edge bg-ink px-3 py-2 text-sm text-paper">
              <option value="anthropic">Anthropic-style key</option>
              <option value="aws">AWS-style key</option>
            </select>
          </label>
          <button onClick={onMint} className="rounded bg-paper px-4 py-2 text-sm font-medium text-ink">Mint canary</button>
        </div>
        {token && (
          <p className="mt-5 break-all rounded border border-edge bg-ink p-3 font-mono text-sm">
            {token}
            <span className="mt-2 block font-sans text-xs text-muted">Tagged {cleanTag(tag)}. Plant it in a .env, a doc or a prompt.</span>
          </p>
        )}
      </section>

      <section className="bg-raise p-5">
        <h3 className="font-display text-base font-semibold">2. Check text for leaks</h3>
        <p className="mt-1 text-sm text-muted">Paste logs, model output or a repo file. We look for canaries you minted.</p>
        <textarea aria-label="Text to check" value={text} onChange={(e) => { setText(e.target.value); setHits(null); }}
          placeholder="Mint a canary first and a sample log appears here."
          className="mt-4 h-36 w-full resize-none rounded border border-edge bg-ink p-3 font-mono text-sm outline-none" spellCheck={false} />
        <button onClick={async () => setHits(await check(getKey(), text))} disabled={!text}
          className="mt-3 rounded bg-paper px-4 py-2 text-sm font-medium text-ink disabled:opacity-40">Check for leaks</button>
        {hits && (
          <p role="status" className={`mt-4 text-sm ${hits.length ? "text-[#ff8f8f]" : "text-muted"}`}>
            {hits.length
              ? hits.map((h) => `Leak: your ${h.kind === "aws" ? "AWS-style" : "Anthropic-style"} canary "${h.tag}" appears at character ${h.index}.`).join(" ")
              : "No canaries found in this text."}
          </p>
        )}
      </section>
    </div>
  );
}
