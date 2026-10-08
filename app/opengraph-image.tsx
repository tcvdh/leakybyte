import { ImageResponse } from "next/og";

export const alt = "LeakyByte: stop your AI app from leaking data";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  const bar = (w: number) => <div style={{ width: w, height: 40, borderRadius: 12, background: "#e8ebf3", display: "flex" }} />;
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", background: "#0a1224", color: "#e8ebf3", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 80 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>{bar(150)}{bar(150)}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: 150 }}>
              {bar(80)}
              <div style={{ width: 34, height: 34, background: "#6fd3ff", borderRadius: "0 50% 50% 50%", transform: "rotate(45deg)", marginRight: 10, marginTop: 10 }} />
            </div></div>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800 }}>Leaky<span style={{ background: "#e8ebf3", color: "#0a1224", padding: "0 14px", marginLeft: 6, borderRadius: 8 }}>Byte</span></div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 76, fontWeight: 800, lineHeight: 1.05, maxWidth: 950 }}>Stop your AI app from leaking data.</div>
          <div style={{ fontSize: 34, color: "#8f9ab4", marginTop: 24 }}>Veil, Canary and Plug. Open source.</div>
        </div>
      </div>
    ),
    size,
  );
}
