import { useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SavedShipmentPlan } from '@/hooks/useShipmentPlans';
import { ShipmentState } from '@/hooks/useShipmentState';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Trash2, FileText, Clock, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface SavedPlansDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plans: SavedShipmentPlan[];
  isLoading: boolean;
  onLoad: (state: ShipmentState, plan: string | null, planId: string) => void;
  onDelete: (planId: string) => void;
  onFetch: () => void;
}

export function SavedPlansDialog({
  open,
  onOpenChange,
  plans,
  isLoading,
  onLoad,
  onDelete,
  onFetch,
}: SavedPlansDialogProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  useEffect(() => {
    if (open) {
      onFetch();
    }
  }, [open, onFetch]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            {isRTL ? 'الخطط المحفوظة' : 'Saved Plans'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? 'حدد خطة للمتابعة من حيث توقفت'
              : 'Select a plan to continue where you left off'}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] mt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>{isRTL ? 'لا توجد خطط محفوظة' : 'No saved plans yet'}</p>
              <p className="text-sm mt-1">
                {isRTL 
                  ? 'ابدأ بإنشاء خطة شحن جديدة'
                  : 'Start by creating a new shipment plan'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium truncate">{plan.title}</h4>
                        <Badge 
                          variant={plan.status === 'completed' ? 'default' : 'secondary'}
                          className="flex-shrink-0"
                        >
                          {plan.status === 'completed' ? (
                            <>
                              <CheckCircle2 className="h-3 w-3 me-1" />
                              {isRTL ? 'مكتملة' : 'Completed'}
                            </>
                          ) : (
                            <>
                              <Clock className="h-3 w-3 me-1" />
                              {isRTL ? 'مسودة' : 'Draft'}
                            </>
                          )}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {plan.shipment_state.origin_country && plan.shipment_state.destination_country
                          ? `${plan.shipment_state.origin_country} → ${plan.shipment_state.destination_country}`
                          : isRTL ? 'لم يتم تحديد المسار' : 'Route not set'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isRTL ? 'آخر تحديث: ' : 'Updated '}
                        {formatDistanceToNow(new Date(plan.updated_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          onLoad(plan.shipment_state, plan.generated_plan, plan.id);
                          onOpenChange(false);
                        }}
                      >
                        {isRTL ? 'تحميل' : 'Load'}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => onDelete(plan.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
