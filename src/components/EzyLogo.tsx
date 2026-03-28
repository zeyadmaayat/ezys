import { cn } from "@/lib/utils";

interface EzyLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon" | "stacked";
  className?: string;
}

const sizeMap = {
  sm: { icon: "w-8 h-8", ezy: "text-xl", hub: "text-[9px]", gap: "gap-2" },
  md: { icon: "w-10 h-10", ezy: "text-2xl", hub: "text-[10px]", gap: "gap-2.5" },
  lg: { icon: "w-12 h-12", ezy: "text-3xl", hub: "text-xs", gap: "gap-3" },
  xl: { icon: "w-16 h-16", ezy: "text-5xl", hub: "text-sm", gap: "gap-4" },
};

const EzyLogo = ({ size = "md", variant = "full", className }: EzyLogoProps) => {
  const s = sizeMap[size];

  const iconElement = (
    <div className={cn(
      s.icon,
      "relative rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md overflow-hidden"
    )}>
      {/* Abstract route lines */}
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full p-1.5">
        {/* Stylized "E" path that doubles as a route/road */}
        <path
          d="M10 8h20M10 20h16M10 32h20"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M10 8v24"
          stroke="white"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Small dot accent */}
        <circle cx="30" cy="20" r="2.5" fill="hsl(var(--orange))" />
      </svg>
    </div>
  );

  if (variant === "icon") return <div className={className}>{iconElement}</div>;

  if (variant === "stacked") {
    return (
      <div className={cn("flex flex-col items-center", className)}>
        {iconElement}
        <div className="mt-2 text-center">
          <div className={cn(s.ezy, "font-extrabold tracking-tight leading-none")}>
            <span className="text-foreground">E</span>
            <span className="text-foreground">Z</span>
            <span className="text-primary">Y</span>
          </div>
          <div className={cn(s.hub, "font-semibold tracking-[0.25em] uppercase text-muted-foreground mt-0.5")}>
            Logistic Hub
          </div>
        </div>
      </div>
    );
  }

  // Full horizontal
  return (
    <div className={cn("flex items-center", s.gap, className)}>
      {iconElement}
      <div className="flex flex-col justify-center leading-none">
        <div className={cn(s.ezy, "font-extrabold tracking-tight leading-none")}>
          <span className="text-foreground">E</span>
          <span className="text-foreground">Z</span>
          <span className="text-primary">Y</span>
        </div>
        <div className={cn(s.hub, "font-semibold tracking-[0.2em] uppercase text-muted-foreground -mt-0.5")}>
          Logistic Hub
        </div>
      </div>
    </div>
  );
};

export default EzyLogo;
