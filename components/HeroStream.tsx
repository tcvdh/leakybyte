import { redact } from "@/lib/redact";

// Pure CSS loop (no client JS): each value shows as found, then flips to its placeholder bar.
const LINES = [
  "Customer dana.reyes@northwind.example says checkout fails",
  "Retrying with key sk-ant-api03-Zk3vQ9xT2mLp8RwYc5HnJd7A from 10.4.2.19",
  "Card 4242 4242 4242 4242 declined for +1 415-555-0134",
  "Deploy token ghp_a1B2c3D4e5F6g7H8i9J0k1L2m3N4o5P6q7R8 pushed to main",
];

export default function HeroStream() {
  const { parts } = redact(LINES.join("\n"));
  let n = 0;
  return (
    <div className="overflow-hidden rounded-xl border border-edge bg-raise shadow-2xl shadow-black/40" aria-label="Animated example of values being replaced by placeholders" role="img">
      <div className="flex items-center gap-2 border-b border-edge px-4 py-3 text-xs text-muted">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff6b6b]" /> <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]" /> <span className="h-2.5 w-2.5 rounded-full bg-lit" />
        <span className="ml-2 font-mono">request to Claude</span>
        <span className="ml-auto flex items-center gap-1.5"><span className="pulse h-1.5 w-1.5 rounded-full bg-lit" />Veil on</span>
      </div>
      <p className="whitespace-pre-wrap p-5 font-mono text-[13px] leading-8 sm:text-sm">
        {parts.map((p, i) => {
          if (!p.token) return <span key={i}>{p.text}</span>;
          const d = `${(n++) * 0.45}s`;
          return (
            <span key={i} className="rv">
              <span className="raw secret" style={{ animationDelay: d }}>{p.text}</span>
              <span className="tok bar" style={{ animationDelay: d }}>{p.token}</span>
            </span>
          );
        })}
      </p>
    </div>
  );
}
