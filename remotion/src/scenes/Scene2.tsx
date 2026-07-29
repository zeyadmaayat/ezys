import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, body, display } from "../theme";
import { Card, Eyebrow, Rise, Title } from "../components/Ui";

const steps = ["Created", "Picked up", "In transit", "Out for delivery", "Delivered"];

export const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = interpolate(frame, [24, 100], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ padding: "110px 140px", justifyContent: "center" }}>
      <Rise><Eyebrow>Operations</Eyebrow></Rise>
      <Rise delay={8} style={{ marginTop: 26 }}>
        <Title size={86}>Track every shipment,<br />end to end</Title>
      </Rise>

      <Rise delay={18} style={{ marginTop: 60 }}>
        <Card style={{ padding: 44 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
            <div style={{ position: "absolute", left: 20, right: 20, top: 26, height: 4, background: "rgba(255,255,255,0.08)", borderRadius: 4 }} />
            <div
              style={{
                position: "absolute", left: 20, top: 26, height: 4, borderRadius: 4,
                width: `calc((100% - 40px) * ${progress})`,
                background: `linear-gradient(90deg, ${C.primary}, ${C.teal})`,
              }}
            />
            {steps.map((s, i) => {
              const active = progress >= i / (steps.length - 1) - 0.02;
              const pop = spring({ frame: frame - 24 - i * 16, fps, config: { damping: 12, stiffness: 180 } });
              return (
                <div key={s} style={{ position: "relative", width: 240, textAlign: "center" }}>
                  <div
                    style={{
                      width: 56, height: 56, borderRadius: "50%", margin: "0 auto",
                      background: active ? (i === steps.length - 1 ? C.teal : C.primary) : "rgba(255,255,255,0.07)",
                      border: `2px solid ${active ? "transparent" : C.line}`,
                      transform: `scale(${0.8 + pop * 0.2})`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: display, fontWeight: 800, fontSize: 22, color: active ? "#06101F" : C.dim,
                      boxShadow: active ? `0 0 40px ${C.primary}55` : "none",
                    }}
                  >
                    {i + 1}
                  </div>
                  <p style={{ fontFamily: body, fontWeight: 600, fontSize: 22, color: active ? C.text : C.dim, marginTop: 16 }}>{s}</p>
                </div>
              );
            })}
          </div>
        </Card>
      </Rise>

      <div style={{ display: "flex", gap: 24, marginTop: 34 }}>
        {[
          { k: "Active shipments", v: "38", c: C.orange },
          { k: "On-time rate", v: "98.5%", c: C.teal },
          { k: "Avg. processing", v: "12m", c: C.primary },
        ].map((s, i) => (
          <Rise key={s.k} delay={60 + i * 10} style={{ flex: 1 }}>
            <Card>
              <p style={{ fontFamily: body, fontSize: 20, color: C.dim, textTransform: "uppercase", letterSpacing: 2, margin: 0 }}>{s.k}</p>
              <p style={{ fontFamily: display, fontWeight: 800, fontSize: 54, color: s.c, margin: "10px 0 0" }}>{s.v}</p>
            </Card>
          </Rise>
        ))}
      </div>
    </AbsoluteFill>
  );
};
