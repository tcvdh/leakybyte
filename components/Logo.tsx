// Mark: three redacted lines of text, the last one leaking a drop.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect x="3" y="4" width="26" height="6" rx="2" fill="#e8ebf3" />
      <rect x="3" y="13" width="26" height="6" rx="2" fill="#e8ebf3" />
      <rect x="3" y="22" width="14" height="6" rx="2" fill="#e8ebf3" />
      <path d="M24 21.4c2.3 3.1 3.5 4.8 3.5 6.5a3.5 3.5 0 1 1-7 0c0-1.7 1.2-3.4 3.5-6.5z" fill="#6fd3ff" />
    </svg>
  );
}

export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-display text-xl font-bold tracking-tight">
      <LogoMark size={size} />
      <span aria-label="LeakyByte">Leaky<span className="bar font-display">Byte</span></span>
    </span>
  );
}
