import { Sparkles } from "lucide-react";

/**
 * Permanent "by ZEYAD" ownership badge.
 * Appears on every page (fixed bottom-left) and is intentionally
 * non-removable — credits the site creator, ZEYAD.
 */
const LumieroBadge = () => {
  return (
    <div
      className="fixed bottom-3 left-3 z-[60] pointer-events-none select-none"
      data-owner="ZEYAD"
      aria-label="Built by ZEYAD"
    >
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-primary/40 backdrop-blur-md shadow-md ring-1 ring-primary/10">
        <Sparkles className="w-3.5 h-3.5 text-primary" />
        <span className="text-[11px] font-semibold text-primary tracking-wider">
          by ZEYAD
        </span>
      </div>
    </div>
  );
};

export default LumieroBadge;
