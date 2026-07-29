import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, body, display } from "../theme";
import { Card, Eyebrow, Rise, Title } from "../components/Ui";

const flow = ["Requisition", "Purchase order", "Goods receipt", "3-way match", "Invoice"];
const bars = [42, 68, 55, 84, 72, 95, 61];

export const Scene4: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  return (
    <AbsoluteFill style={{ padding: "110px 140px", justifyContent: "center" }}>
      <Rise><Eyebrow>Procurement & Finance</Eyebrow></Rise>
      <Rise delay={8} style={{ marginTop: 26 }}>
        <Title size={84}>From request to <span style={{ color: C.orange }}>paid invoice</span></Title>
      </Rise>

      <div style={{ display: "flex", gap: 18, marginTop: 54, alignItems: "stretch" }}>
        {flow.map((f, i) => {
          const s = spring({ frame: frame - 20 - i * 9, fps, config: { damping: 18, stiffness: 160 } });
          return (
            <div key={f} style={{ flex: 1, display: "flex", alignItems: "center", gap: 18 }}>
              <div
                style={{
                  flex: 1, opacity: s,
                  transform: `translateX(${interpolate(s, [0, 1], [-30, 0])}px)`,
                  background: "rgba(255,255,255,0.05)", border: `1px solid ${C.line}`,
                  borderRadius: 18, padding: "26px 18px", textAlign: "center",
                }}
              >
                <p style={{ fontFamily: body, fontWeight: 700, fontSize: 22, color: C.text, margin: 0 }}>{f}</p>
                <p style={{ fontFamily: body, fontSize: 18, color: C.dim, margin: "8px 0 0" }}>
                  {["REQ-", "PO-", "GRN-", "MATCH", "INV-"][i]}
                </p>
              </div>
              {i < flow.length - 1 && (
                <span style={{ color: C.primary, fontSize: 28, opacity: s, fontFamily: display }}>›</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: 26, marginTop: 44 }}>
        <Rise delay={64} style={{ flex: 1.3 }}>
          <Card>
            <p style={{ fontFamily: body, fontSize: 20, color: C.dim, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>Monthly spend — JOD</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 16, height: 170, marginTop: 22 }}>
              {bars.map((b, i) => {
                const g = spring({ frame: frame - 68 - i * 5, fps, config: { damping: 20, stiffness: 140 } });
                return (
                  <div
                    key={i}
                    style={{
                      flex: 1, height: b * g * 1.7, borderRadius: 10,
                      background: i === 5 ? `linear-gradient(180deg, ${C.orange}, ${C.orange}55)` : `linear-gradient(180deg, ${C.primary}, ${C.primary}33)`,
                    }}
                  />
                );
              })}
            </div>
          </Card>
        </Rise>
        {[
          { k: "Matched POs", v: "96%" },
          { k: "Open expenses", v: "JOD 8.4K" },
        ].map((s, i) => (
          <Rise key={s.k} delay={74 + i * 10} style={{ flex: 1 }}>
            <Card style={{ height: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
              <p style={{ fontFamily: body, fontSize: 20, color: C.dim, margin: 0, letterSpacing: 2, textTransform: "uppercase" }}>{s.k}</p>
              <p style={{ fontFamily: display, fontWeight: 800, fontSize: 56, color: C.text, margin: "10px 0 0" }}>{s.v}</p>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};
