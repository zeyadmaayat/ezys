import { cn } from "@/lib/utils";
import ezyLogo from "@/assets/ezy-logo.svg";

interface EzyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "stacked";
  className?: string;
  light?: boolean;
}

const sizeMap = {
  sm: { logo: "h-8", icon: "w-8 h-8" },
  md: { logo: "h-10", icon: "w-10 h-10" },
  lg: { logo: "h-14", icon: "w-12 h-12" },
  xl: { logo: "h-20", icon: "w-16 h-16" },
};

const EzyLogo = ({ size = "md", variant = "full", className, light }: EzyLogoProps) => {
  const s = sizeMap[size];

  if (variant === "icon") {
    return (
      <div className={cn(s.icon, "relative rounded-xl bg-[rgb(77,142,255)] flex items-center justify-center shadow-md overflow-hidden", className)}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full p-2">
          <rect x="20" y="18" width="60" height="12" rx="2" fill="rgb(13, 17, 23)" />
          <rect x="20" y="44" width="44" height="12" rx="2" fill="rgb(13, 17, 23)" />
          <rect x="20" y="70" width="60" height="12" rx="2" fill="rgb(13, 17, 23)" />
          <rect x="20" y="18" width="12" height="64" rx="2" fill="rgb(13, 17, 23)" />
        </svg>
      </div>
    );
  }

  // Full and stacked both use the full SVG logo
  return (
    <div className={cn("flex items-center", className)}>
      <img
        src={ezyLogo}
        alt="EzySuite"
        className={cn(s.logo, "w-auto object-contain")}
      />
    </div>
  );
};

export default EzyLogo;
