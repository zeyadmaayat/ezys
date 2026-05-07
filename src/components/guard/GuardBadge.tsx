import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock, ListChecks } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import type { GuardCheck } from '@/hooks/useActionGuard';

interface Props {
  checks: GuardCheck[];
  className?: string;
}

/**
 * Compact inline badge that summarizes failing GuardChecks next to an action button.
 * Hidden when nothing is missing. Click on the action still opens the GuardDialog.
 */
export function GuardBadge({ checks, className }: Props) {
  const { language } = useLanguage();
  const ar = language === 'ar';
  const failed = checks.filter(c => c.condition);
  if (failed.length === 0) return null;

  const hasPermission = failed.some(f => f.kind === 'permission');
  const hasPrereq = failed.some(f => f.kind === 'prerequisite');
  const Icon = hasPermission ? Lock : hasPrereq ? ListChecks : AlertTriangle;
  const variantClass = hasPermission
    ? 'bg-destructive/10 text-destructive border-destructive/30 hover:bg-destructive/15'
    : 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:text-amber-400 hover:bg-amber-500/15';

  // Short label
  const label = hasPermission
    ? (ar ? 'غير مخوّل' : 'No access')
    : failed.length === 1
      ? (ar ? failed[0].messageAr : failed[0].messageEn)
      : (ar ? `${failed.length} متطلبات ناقصة` : `${failed.length} missing`);

  // Truncate long labels
  const display = label.length > 32 ? label.slice(0, 30) + '…' : label;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className={`gap-1 cursor-help font-normal text-[11px] py-0.5 ${variantClass} ${className || ''}`}
          >
            <Icon className="w-3 h-3 shrink-0" />
            <span className="max-w-[180px] truncate">{display}</span>
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <ul className="space-y-1 text-xs">
            {failed.map((f, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <span className="text-muted-foreground">•</span>
                <span>{ar ? f.messageAr : f.messageEn}</span>
              </li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
