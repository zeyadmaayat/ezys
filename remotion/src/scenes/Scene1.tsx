import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Sequence } from "remotion";
import { C, body, display } from "../theme";
import { Eyebrow, Rise, Sub, Title } from "../components/Ui";

export const Scene1: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = interpolate(frame, [0, 110], [1.06, 1]);
  const ring = spring({ frame: frame - 6, fps, config: { damping: 14, stiffness: 90 } });

  return (
    <AbsoluteFill style={{ transform: `scale(${zoom})` }}>
      <div
        style={{
          position: "absolute", left: 1180, top: 240, width: 620, height: 620, borderRadius: "50%",
          border: `1px solid ${C.primary}55`, transform: `scale(${ring})`, opacity: 0.7,
        }}
      />
      <div
        style={{
          position: "absolute", left: 1290, top: 350, width: 400, height: 400, borderRadius: "50%",
          border: `1px dashed ${C.teal}44`, transform: `rotate(${frame * 0.4}deg)`,
        }}
      />
      <AbsoluteFill style={{ padding: "0 140px", justifyContent: "center", alignItems: "flex-start" }}>
        <span
          style={{
            position: "absolute", left: 130, top: 150, fontFamily: display, fontWeight: 800,
            fontSize: 220, color: "rgba(255,255,255,0.035)", letterSpacing: -8,
          }}
        >
          LOGISTICS
        </span>
        <Rise delay={0}><Eyebrow>by ZEYAD</Eyebrow></Rise>
        <Rise delay={10} style={{ marginTop: 34 }}>
          <Title size={124}>
            ezy Logistic <span style={{ color: C.primary }}>HUB</span>
          </Title>
        </Rise>
        <Rise delay={22} style={{ marginTop: 28 }}>
          <Sub>Shipments, inventory, procurement, sales and finance — one connected workspace.</Sub>
        </Rise>
        <Sequence from={40}>
          <Rise style={{ marginTop: 44, display: "flex", gap: 14 }}>
            {["Multi-tenant", "Arabic / English", "AI assistant"].map((x, i) => (
              <span
                key={x}
                style={{
                  fontFamily: body, fontWeight: 600, fontSize: 22, color: C.text,
                  padding: "12px 22px", borderRadius: 14,
                  background: i === 1 ? `${C.orange}1f` : "rgba(255,255,255,0.05)",
                  border: `1px solid ${i === 1 ? C.orange + "55" : C.line}`,
                }}
              >
                {x}
              </span>
            ))}
          </Rise>
        </Sequence>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
