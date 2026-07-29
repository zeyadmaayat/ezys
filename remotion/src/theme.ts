import { loadFont as loadSora } from "@remotion/google-fonts/Sora";
import { loadFont as loadManrope } from "@remotion/google-fonts/Manrope";

export const display = loadSora("normal", { weights: ["600", "800"], subsets: ["latin"] }).fontFamily;
export const body = loadManrope("normal", { weights: ["400", "600", "700"], subsets: ["latin"] }).fontFamily;

export const C = {
  bg: "#0A1020",
  bg2: "#111B33",
  navy: "#0E1730",
  line: "rgba(255,255,255,0.09)",
  text: "#EAF0FF",
  dim: "rgba(234,240,255,0.58)",
  primary: "#3E8BFF",
  teal: "#2FD3B5",
  orange: "#F97316",
};
