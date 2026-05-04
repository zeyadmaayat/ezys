import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ShieldAlert, ListChecks, Lock, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

export type GuardReasonKind = 'permission' | 'prerequisite' | 'workflow';

export interface GuardReason {
  kind: GuardReasonKind;
  /** Title in Arabic / English */
  titleAr?: string;
  titleEn?: string;
  /** Detail message */
  messageAr: string;
  messageEn: string;
  /** Optional fix action */
  actionLabelAr?: string;
  actionLabelEn?: string;
  /** Navigate to this route when the action button is clicked */
  actionTo?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reasons: GuardReason[];
}

const iconFor = (k: GuardReasonKind) => {
  if (k === 'permission') return Lock;
  if (k === 'prerequisite') return ListChecks;
  return AlertTriangle;
};

const colorFor = (k: GuardReasonKind) => {
  if (k === 'permission') return 'text-destructive bg-destructive/10 border-destructive/30';
  if (k === 'prerequisite') return 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/30';
  return 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/30';
};

export function GuardDialog({ open, onOpenChange, reasons }: Props) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const ar = language === 'ar';

  const headerIcon = reasons.some(r => r.kind === 'permission') ? Lock
    : reasons.some(r => r.kind === 'prerequisite') ? ListChecks
    : ShieldAlert;
  const HeaderIcon = headerIcon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HeaderIcon className="w-5 h-5 text-primary" />
            {ar ? 'لا يمكن إكمال هذا الإجراء' : 'Cannot complete this action'}
          </DialogTitle>
          <DialogDescription>
            {ar
              ? 'يجب معالجة المتطلبات التالية قبل المتابعة:'
              : 'Please address the following requirements before continuing:'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2 py-1">
          {reasons.map((r, idx) => {
            const Icon = iconFor(r.kind);
            return (
              <div key={idx} className={`rounded-lg border p-3 ${colorFor(r.kind)}`}>
                <div className="flex items-start gap-2">
                  <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    {(r.titleAr || r.titleEn) && (
                      <p className="font-semibold text-sm mb-0.5">
                        {ar ? (r.titleAr || r.titleEn) : (r.titleEn || r.titleAr)}
                      </p>
                    )}
                    <p className="text-sm leading-snug">
                      {ar ? r.messageAr : r.messageEn}
                    </p>
                    {r.actionTo && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-2 h-7 text-xs"
                        onClick={() => {
                          onOpenChange(false);
                          navigate(r.actionTo!);
                        }}
                      >
                        {ar ? (r.actionLabelAr || 'انتقل الآن') : (r.actionLabelEn || 'Go now')}
                        <ArrowRight className="w-3 h-3 ms-1 rtl:rotate-180" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4 mr-1" />{ar ? 'إغلاق' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
