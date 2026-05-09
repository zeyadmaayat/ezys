import { Sparkles } from "lucide-react";

/**
 * Floating LUMIERO brand badge — appears on every page.
 * Fixed bottom-left, subtle but readable in the dark theme.
 */
const LumieroBadge = () => {
  return (
    <div
      className="fixed bottom-3 left-3 z-40 pointer-events-none select-none"
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-card/70 border border-border/60 backdrop-blur-md shadow-sm">
        <Sparkles className="w-3 h-3 text-primary" />
        <span className="text-[10px] font-bold tracking-[0.18em] text-foreground/85">
          LUMIERO
        </span>
        <span className="text-[9px] text-muted-foreground/80 tracking-wider">
          by ZEYAD
        </span>
      </div>
    </div>
  );
};

export default LumieroBadge;
