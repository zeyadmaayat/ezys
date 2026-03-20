import { List, LayoutGrid, FileText, Calendar as CalendarIcon, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export type ViewMode = 'list' | 'kanban' | 'form' | 'calendar' | 'pivot';

interface ViewSwitcherProps {
  current: ViewMode;
  onChange: (mode: ViewMode) => void;
  available?: ViewMode[];
}

const viewIcons: Record<ViewMode, typeof List> = {
  list: List,
  kanban: LayoutGrid,
  form: FileText,
  calendar: CalendarIcon,
  pivot: BarChart3,
};

const viewLabels: Record<ViewMode, string> = {
  list: 'List',
  kanban: 'Kanban',
  form: 'Form',
  calendar: 'Calendar',
  pivot: 'Pivot',
};

export function ViewSwitcher({ current, onChange, available = ['list', 'kanban'] }: ViewSwitcherProps) {
  return (
    <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
      {available.map((mode) => {
        const Icon = viewIcons[mode];
        return (
          <Button
            key={mode}
            variant="ghost"
            size="sm"
            onClick={() => onChange(mode)}
            className={cn(
              'h-8 px-2.5 rounded-md transition-all duration-150',
              current === mode
                ? 'bg-card shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline ml-1.5 text-xs font-medium">{viewLabels[mode]}</span>
          </Button>
        );
      })}
    </div>
  );
}
