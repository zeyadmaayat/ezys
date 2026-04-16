import { cn } from '@/lib/utils';

interface StatusStep {
  key: string;
  label: string;
  color?: string;
}

interface OdooStatusBarProps {
  steps: StatusStep[];
  currentStep: string;
  onStepClick?: (step: string) => void;
  className?: string;
}

export function OdooStatusBar({ steps, currentStep, onStepClick, className }: OdooStatusBarProps) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className={cn('flex items-center gap-0', className)}>
      {steps.map((step, i) => {
        const isActive = step.key === currentStep;
        const isPast = i < currentIndex;
        const isClickable = !!onStepClick;

        return (
          <button
            key={step.key}
            onClick={() => isClickable && onStepClick?.(step.key)}
            disabled={!isClickable}
            className={cn(
              'relative px-4 py-1.5 text-xs font-semibold transition-all border',
              'first:rounded-l-full last:rounded-r-full',
              isActive && 'bg-primary text-primary-foreground border-primary z-10',
              isPast && !isActive && 'bg-primary/15 text-primary border-primary/30',
              !isActive && !isPast && 'bg-muted/50 text-muted-foreground border-border',
              isClickable && !isActive && 'hover:bg-muted cursor-pointer',
              !isClickable && 'cursor-default'
            )}
          >
            {step.label}
          </button>
        );
      })}
    </div>
  );
}
