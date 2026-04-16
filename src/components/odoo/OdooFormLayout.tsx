import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { OdooStatusBar } from './OdooStatusBar';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface StatusStep {
  key: string;
  label: string;
}

interface OdooFormLayoutProps {
  title: string;
  statusSteps?: StatusStep[];
  currentStatus?: string;
  onStatusChange?: (status: string) => void;
  onBack?: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  currentIndex?: number;
  totalCount?: number;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function OdooFormLayout({
  title,
  statusSteps,
  currentStatus,
  onStatusChange,
  onBack,
  onPrev,
  onNext,
  currentIndex,
  totalCount,
  actions,
  children,
  className,
}: OdooFormLayoutProps) {
  const { language } = useLanguage();

  return (
    <div className={cn('', className)}>
      {/* Form Header */}
      <div className="bg-card border-b border-border px-4 lg:px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {onBack && (
              <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0 h-8 w-8">
                <ChevronLeft className="w-4 h-4" />
              </Button>
            )}
            <h1 className="text-lg font-bold text-foreground truncate">{title}</h1>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            {/* Status Bar */}
            {statusSteps && currentStatus && (
              <OdooStatusBar
                steps={statusSteps}
                currentStep={currentStatus}
                onStepClick={onStatusChange}
              />
            )}

            {/* Record Navigation */}
            {currentIndex !== undefined && totalCount !== undefined && totalCount > 1 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onPrev} disabled={currentIndex <= 0}>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </Button>
                <span className="font-medium">{currentIndex + 1}/{totalCount}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onNext} disabled={currentIndex >= totalCount - 1}>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}

            {actions}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="p-4 lg:p-6">
        {children}
      </div>
    </div>
  );
}
