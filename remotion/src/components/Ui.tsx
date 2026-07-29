import { useCurrentFrame, useVideoConfig, interpolate, spring } from "remotion";
import { C, body, display } from "../theme";

export const Rise: React.FC<{ delay?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({
  delay = 0, children, style,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping: 200 } });
  return (
    <div
      style={{
        opacity: s,
        transform: `translateY(${interpolate(s, [0, 1], [34, 0])}px)`,
        filter: `blur(${interpolate(s, [0, 1], [10, 0])}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    style={{
      fontFamily: body, fontWeight: 700, fontSize: 20, letterSpacing: 6,
      textTransform: "uppercase", color: C.teal,
      border: `1px solid ${C.teal}44`, background: `${C.teal}12`,
      padding: "8px 18px", borderRadius: 999,
    }}
  >
    {children}
  </span>
);

export const Title: React.FC<{ children: React.ReactNode; size?: number }> = ({ children, size = 96 }) => (
  <h1 style={{ fontFamily: display, fontWeight: 800, fontSize: size, lineHeight: 1.05, color: C.text, margin: 0, letterSpacing: -2 }}>
    {children}
  </h1>
);

export const Sub: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p style={{ fontFamily: body, fontSize: 30, color: C.dim, margin: 0, lineHeight: 1.5, maxWidth: 760 }}>{children}</p>
);

export const Card: React.FC<{ children: React.ReactNode; style?: React.CSSProperties }> = ({ children, style }) => (
  <div
    style={{
      background: "rgba(255,255,255,0.045)",
      border: `1px solid ${C.line}`,
      borderRadius: 26,
      padding: 28,
      boxShadow: "0 30px 80px -40px rgba(0,0,0,0.9)",
      ...style,
    }}
  >
    {children}
  </div>
);
