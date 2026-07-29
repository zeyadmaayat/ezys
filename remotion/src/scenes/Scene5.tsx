import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, body, display } from "../theme";
import { Eyebrow, Rise } from "../components/Ui";

export const Scene5: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const line = spring({ frame: frame - 30, fps, config: { damping: 200 } });
  const breathe = Math.sin(frame / 26) * 6;

  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: 120 }}>
      <Rise><Eyebrow>Ready when you are</Eyebrow></Rise>
      <Rise delay={10} style={{ marginTop: 34, textAlign: "center" }}>
        <h1
          style={{
            fontFamily: display, fontWeight: 800, fontSize: 118, color: C.text, margin: 0,
            letterSpacing: -3, transform: `translateY(${breathe * 0.3}px)`,
          }}
        >
          One platform.<br />
          <span style={{ background: `linear-gradient(90deg, ${C.primary}, ${C.teal})`, WebkitBackgroundClip: "text", color: "transparent" }}>
            Every operation.
          </span>
        </h1>
      </Rise>

      <div
        style={{
          width: interpolate(line, [0, 1], [0, 560]), height: 2, marginTop: 46,
          background: `linear-gradient(90deg, transparent, ${C.primary}, transparent)`,
        }}
      />

      <Rise delay={52} style={{ marginTop: 46, display: "flex", gap: 16 }}>
        {["Shipments", "Inventory", "Procurement", "Sales", "Finance"].map((x) => (
          <span key={x} style={{ fontFamily: body, fontWeight: 600, fontSize: 24, color: C.dim, padding: "14px 24px", borderRadius: 14, border: `1px solid ${C.line}`, background: "rgba(255,255,255,0.04)" }}>
            {x}
          </span>
        ))}
      </Rise>

      <Rise delay={66} style={{ marginTop: 56, textAlign: "center" }}>
        <p style={{ fontFamily: display, fontWeight: 600, fontSize: 40, color: C.text, margin: 0 }}>ezys.lovable.app</p>
        <p style={{ fontFamily: body, fontSize: 24, color: C.dim, margin: "12px 0 0", letterSpacing: 6, textTransform: "uppercase" }}>
          ezy Logistic HUB · by ZEYAD
        </p>
      </Rise>
    </AbsoluteFill>
  );
};
