import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { C } from "../theme";

export const Backdrop: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const t = frame / durationInFrames;
  const drift = interpolate(t, [0, 1], [0, -140]);
  const drift2 = interpolate(t, [0, 1], [0, 180]);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(120% 90% at 15% 0%, ${C.bg2} 0%, ${C.bg} 55%, #060A15 100%)` }}>
      <div
        style={{
          position: "absolute", top: -300 + drift, left: -200, width: 900, height: 900,
          borderRadius: "50%", background: `${C.primary}22`, filter: "blur(120px)",
        }}
      />
      <div
        style={{
          position: "absolute", bottom: -350, right: -250 + drift2 * 0.4, width: 1000, height: 1000,
          borderRadius: "50%", background: `${C.teal}14`, filter: "blur(140px)",
        }}
      />
      {/* grid */}
      <AbsoluteFill
        style={{
          backgroundImage:
            `linear-gradient(${C.line} 1px, transparent 1px), linear-gradient(90deg, ${C.line} 1px, transparent 1px)`,
          backgroundSize: "96px 96px",
          transform: `translateY(${(frame * 0.25) % 96}px)`,
          opacity: 0.5,
          maskImage: "radial-gradient(70% 70% at 50% 45%, black 30%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
