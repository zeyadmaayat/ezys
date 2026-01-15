import { useLanguage } from '@/contexts/LanguageContext';
import { ActionPlan } from '@/types/action-plan';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Trash2, 
  Clock, 
  FolderOpen,
  CalendarDays
} from 'lucide-react';
import { format } from 'date-fns';

interface SavedPlansListProps {
  plans: ActionPlan[];
  loading: boolean;
  onSelect: (plan: ActionPlan) => void;
  onDelete: (id: string) => void;
}

const DIFFICULTY_COLORS: Record<ActionPlan['difficulty'], string> = {
  'beginner': 'bg-green-500',
  'intermediate': 'bg-yellow-500',
  'advanced': 'bg-red-500'
};

const SavedPlansList = ({ plans, loading, onSelect, onDelete }: SavedPlansListProps) => {
  const { language } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <FolderOpen className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            {language === 'ar' 
              ? 'لا توجد خطط عمل محفوظة بعد' 
              : 'No saved action plans yet'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {language === 'ar'
              ? 'احفظ سيناريو تدريب لرؤيته هنا'
              : 'Save a training scenario to see it here'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {plans.map((plan) => (
        <Card key={plan.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-base">
                  {language === 'ar' ? plan.title_ar : plan.title_en}
                </CardTitle>
                <CardDescription className="text-sm mt-1 line-clamp-2">
                  {language === 'ar' ? plan.description_ar : plan.description_en}
                </CardDescription>
              </div>
              <Badge className={DIFFICULTY_COLORS[plan.difficulty]}>
                {plan.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {language === 'ar' ? plan.estimatedTime_ar : plan.estimatedTime_en}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="w-3 h-3" />
                  {format(new Date(plan.updatedAt), 'MMM d, yyyy')}
                </span>
                <span className="text-xs">
                  {plan.actions.length} {language === 'ar' ? 'خطوة' : 'steps'}
                </span>
              </div>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onDelete(plan.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => onSelect(plan)}
                >
                  <Play className="w-4 h-4 mr-1" />
                  {language === 'ar' ? 'بدء' : 'Start'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SavedPlansList;
