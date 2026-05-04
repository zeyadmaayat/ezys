import { useState, useCallback } from 'react';
import { toast } from 'sonner';
import type { GuardReason } from '@/components/guard/GuardDialog';
import { useLanguage } from '@/contexts/LanguageContext';

/**
 * Unified action guard. Collects reasons; if any exist, opens a dialog
 * (for prerequisite/permission with action) or shows a toast for quick info.
 *
 * Usage:
 *   const { guard, dialogProps } = useActionGuard();
 *   <GuardDialog {...dialogProps} />
 *   <Button onClick={() => guard([
 *     { kind:'permission', condition: !canManage, ... },
 *     { kind:'prerequisite', condition: customers.length===0, ..., actionTo:'/erp/customers' }
 *   ], () => doWork())} />
 */

export interface GuardCheck extends Omit<GuardReason, 'kind'> {
  kind: GuardReason['kind'];
  /** When true => block the action and surface this reason. */
  condition: boolean;
}

export function useActionGuard() {
  const [open, setOpen] = useState(false);
  const [reasons, setReasons] = useState<GuardReason[]>([]);
  const { language } = useLanguage();

  const guard = useCallback((checks: GuardCheck[], onPass: () => void | Promise<void>) => {
    const failed = checks.filter(c => c.condition).map<GuardReason>(c => ({
      kind: c.kind,
      titleAr: c.titleAr, titleEn: c.titleEn,
      messageAr: c.messageAr, messageEn: c.messageEn,
      actionLabelAr: c.actionLabelAr, actionLabelEn: c.actionLabelEn,
      actionTo: c.actionTo,
    }));

    if (failed.length === 0) {
      return Promise.resolve(onPass());
    }

    // For a single reason that's a quick workflow info with no action, use a toast
    if (failed.length === 1 && failed[0].kind === 'workflow' && !failed[0].actionTo) {
      toast.error(language === 'ar' ? failed[0].messageAr : failed[0].messageEn);
      return;
    }

    // Otherwise show the dialog (better for prerequisites + permission)
    setReasons(failed);
    setOpen(true);
  }, [language]);

  return {
    guard,
    dialogProps: { open, onOpenChange: setOpen, reasons },
  };
}
