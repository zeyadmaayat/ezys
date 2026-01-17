import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save } from 'lucide-react';

interface SavePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (title: string) => void;
  isLoading: boolean;
  defaultTitle?: string;
}

export function SavePlanDialog({
  open,
  onOpenChange,
  onSave,
  isLoading,
  defaultTitle = '',
}: SavePlanDialogProps) {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const [title, setTitle] = useState(defaultTitle);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave(title.trim());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" dir={isRTL ? 'rtl' : 'ltr'}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-primary" />
            {isRTL ? 'حفظ الخطة' : 'Save Plan'}
          </DialogTitle>
          <DialogDescription>
            {isRTL 
              ? 'أدخل اسمًا لهذه الخطة لتتمكن من استئنافها لاحقًا'
              : 'Enter a name for this plan so you can resume it later'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <Label htmlFor="plan-title">
              {isRTL ? 'اسم الخطة' : 'Plan Name'}
            </Label>
            <Input
              id="plan-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isRTL ? 'مثال: شحنة إلى دبي' : 'e.g., Shipment to Dubai'}
              className="mt-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSave();
                }
              }}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isRTL ? 'إلغاء' : 'Cancel'}
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || isLoading}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin me-2" />
            ) : (
              <Save className="h-4 w-4 me-2" />
            )}
            {isRTL ? 'حفظ' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
