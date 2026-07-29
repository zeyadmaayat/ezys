import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, body, display } from "../theme";
import { Card, Eyebrow, Rise, Sub, Title } from "../components/Ui";

export const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const scan = interpolate(frame % 60, [0, 60], [0, 1]);
  const reveal = spring({ frame: frame - 46, fps, config: { damping: 200 } });

  return (
    <AbsoluteFill style={{ padding: "110px 140px", flexDirection: "row", alignItems: "center", gap: 80 }}>
      <div style={{ flex: 1 }}>
        <Rise><Eyebrow>Inventory + AI Vision</Eyebrow></Rise>
        <Rise delay={8} style={{ marginTop: 26 }}>
          <Title size={80}>Point the camera.<br />The stock updates itself.</Title>
        </Rise>
        <Rise delay={20} style={{ marginTop: 28 }}>
          <Sub>Capture an invoice, a label or a product — the assistant reads it, matches the item, and suggests where it belongs on the shelf.</Sub>
        </Rise>
        <Rise delay={34} style={{ marginTop: 36, display: "flex", gap: 14 }}>
          {["Batch & expiry", "Reorder rules", "Cycle counts"].map((x) => (
            <span key={x} style={{ fontFamily: body, fontWeight: 600, fontSize: 22, color: C.dim, padding: "12px 20px", borderRadius: 14, border: `1px solid ${C.line}` }}>
              {x}
            </span>
          ))}
        </Rise>
      </div>

      <Rise delay={16} style={{ width: 660 }}>
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ position: "relative", height: 340, background: `linear-gradient(160deg, ${C.navy}, #060A15)` }}>
            {/* corners */}
            {[[40, 40, "0 0"], [0, 40, "0 0"]].map(() => null)}
            <div style={{ position: "absolute", inset: 40, border: `2px solid ${C.teal}66`, borderRadius: 18 }} />
            <div
              style={{
                position: "absolute", left: 40, right: 40, height: 3,
                top: 40 + scan * 260,
                background: `linear-gradient(90deg, transparent, ${C.teal}, transparent)`,
                boxShadow: `0 0 30px ${C.teal}`,
              }}
            />
            <div style={{ position: "absolute", left: 90, top: 110, width: 200, height: 130, borderRadius: 10, background: "rgba(255,255,255,0.07)", border: `1px solid ${C.line}` }} />
            <div style={{ position: "absolute", left: 330, top: 130, width: 240, height: 90, borderRadius: 10, background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}` }} />
            <span style={{ position: "absolute", left: 56, bottom: 56, fontFamily: body, fontWeight: 700, fontSize: 20, color: C.teal, letterSpacing: 3 }}>
              SCANNING…
            </span>
          </div>
          <div style={{ padding: 30, opacity: reveal, transform: `translateY(${interpolate(reveal, [0, 1], [20, 0])}px)` }}>
            <p style={{ fontFamily: body, fontSize: 20, color: C.dim, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>Recognised</p>
            <p style={{ fontFamily: display, fontWeight: 800, fontSize: 40, color: C.text, margin: "8px 0 18px" }}>Carton — 24 units</p>
            <div style={{ display: "flex", gap: 12 }}>
              {[["Add to stock", C.teal], ["Put on shelf A-12", C.primary], ["Avoid duplicate", C.orange]].map(([label, col]) => (
                <span key={label as string} style={{ fontFamily: body, fontWeight: 700, fontSize: 20, color: col as string, padding: "12px 18px", borderRadius: 12, background: `${col}18`, border: `1px solid ${col}44` }}>
                  {label as string}
                </span>
              ))}
            </div>
          </div>
        </Card>
      </Rise>
    </AbsoluteFill>
  );
};
