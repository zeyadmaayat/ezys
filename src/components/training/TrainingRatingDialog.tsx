import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface TrainingRatingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  planTitle: string;
  completedSteps: number;
  totalSteps: number;
}

const TrainingRatingDialog = ({
  open,
  onOpenChange,
  planId,
  planTitle,
  completedSteps,
  totalSteps,
}: TrainingRatingDialogProps) => {
  const { language } = useLanguage();
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('training_ratings' as any).insert({
        user_id: user.id,
        plan_id: planId,
        plan_title: planTitle,
        rating,
        feedback: feedback.trim() || null,
        completed_steps: completedSteps,
        total_steps: totalSteps,
      } as any);

      if (error) throw error;

      toast.success(
        language === 'ar' ? 'شكراً لتقييمك!' : 'Thanks for your rating!'
      );
      onOpenChange(false);
      setRating(0);
      setFeedback('');
    } catch (error: any) {
      console.error('Rating save error:', error);
      toast.error(
        language === 'ar' ? 'فشل حفظ التقييم' : 'Failed to save rating'
      );
    } finally {
      setSaving(false);
    }
  };

  const displayRating = hoveredRating || rating;

  const ratingLabels = {
    1: language === 'ar' ? 'ضعيف' : 'Poor',
    2: language === 'ar' ? 'مقبول' : 'Fair',
    3: language === 'ar' ? 'جيد' : 'Good',
    4: language === 'ar' ? 'جيد جداً' : 'Very Good',
    5: language === 'ar' ? 'ممتاز' : 'Excellent',
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl">
            {language === 'ar' ? '🎉 أحسنت! قيّم تجربتك' : '🎉 Well Done! Rate Your Experience'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {language === 'ar'
              ? `أكملت ${completedSteps} من ${totalSteps} خطوة في هذا السيناريو`
              : `You completed ${completedSteps} of ${totalSteps} steps in this scenario`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Stars */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary rounded"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      star <= displayRating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                </button>
              ))}
            </div>
            {displayRating > 0 && (
              <span className="text-sm font-medium text-muted-foreground animate-in fade-in">
                {ratingLabels[displayRating as keyof typeof ratingLabels]}
              </span>
            )}
          </div>

          {/* Feedback */}
          <div>
            <Textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                language === 'ar'
                  ? 'شاركنا ملاحظاتك عن السيناريو (اختياري)...'
                  : 'Share your feedback about this scenario (optional)...'
              }
              rows={3}
              dir={language === 'ar' ? 'rtl' : 'ltr'}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {language === 'ar' ? 'تخطي' : 'Skip'}
          </Button>
          <Button onClick={handleSubmit} disabled={saving || rating === 0}>
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {language === 'ar' ? 'إرسال التقييم' : 'Submit Rating'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TrainingRatingDialog;
