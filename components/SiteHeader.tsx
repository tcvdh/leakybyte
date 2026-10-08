"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PRODUCTS, REPO } from "@/lib/site";

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const path = usePathname();

  useEffect(() => {
    const away = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", esc); };
  }, []);

  const link = "hover:text-paper";
  return (
    <header className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-y-3 px-6 py-6">
      <Link href="/" className="font-display text-xl font-bold tracking-tight">
        Leaky<span className="bar font-display">Byte</span>
      </Link>
      <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
        <div ref={box} className="relative">
          <button aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}
            className={`flex items-center gap-1 ${link} ${PRODUCTS.some((p) => path === `/${p.slug}`) ? "text-paper" : ""}`}>
            Products <span aria-hidden className={`text-xs transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
          </button>
          {open && (
            <ul className="absolute left-0 top-full z-20 mt-3 w-80 overflow-hidden rounded-lg border border-edge bg-raise shadow-2xl shadow-black/40">
              {PRODUCTS.map((p) => (
                <li key={p.slug} className="border-b border-edge last:border-0">
                  <Link href={`/${p.slug}`} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-ink">
                    <span className="flex items-baseline justify-between">
                      <span className="font-display text-base font-semibold text-paper">{p.name}</span>
                      <span className="text-xs text-lit">{p.where}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug">{p.blurb}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <Link className={link} href="/#try">Try it</Link>
        <Link className={link} href="/#start">Get started</Link>
        <a className={link} href={REPO}>GitHub</a>
        <Link className="rounded bg-paper px-3 py-1.5 font-medium text-ink" href="/#access">Early access</Link>
      </nav>
    </header>
  );
}
