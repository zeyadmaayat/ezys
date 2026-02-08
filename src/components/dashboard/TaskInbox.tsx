import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLanguage } from '@/contexts/LanguageContext';
import { ClipboardList, Clock, AlertTriangle, FileText, DollarSign } from 'lucide-react';
import { format, isBefore } from 'date-fns';

export interface TaskItem {
  id: string;
  title: string;
  type: 'Approval' | 'Exception' | 'Inventory' | 'Billing' | 'Document';
  priority: 'High' | 'Medium' | 'Low';
  dueDate: string | null;
  shipmentId?: string;
  shipmentTitle?: string;
}

interface TaskInboxProps {
  tasks: TaskItem[];
  loading?: boolean;
}

const TYPE_ICONS: Record<TaskItem['type'], React.ComponentType<{ className?: string }>> = {
  Approval: Clock,
  Exception: AlertTriangle,
  Inventory: ClipboardList,
  Billing: DollarSign,
  Document: FileText,
};

const PRIORITY_COLORS: Record<TaskItem['priority'], string> = {
  High: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  Medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  Low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
};

export default function TaskInbox({ tasks, loading }: TaskInboxProps) {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const t = {
    title: language === 'ar' ? 'صندوق المهام' : 'Task Inbox',
    noTasks: language === 'ar' ? 'لا توجد مهام معلقة' : 'No pending tasks',
    overdue: language === 'ar' ? 'متأخر' : 'Overdue',
  };

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" />
            {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <ClipboardList className="h-4 w-4" />
          {t.title}
          {tasks.length > 0 && (
            <Badge variant="secondary" className="ml-auto">
              {tasks.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-6 text-sm">
            {t.noTasks}
          </p>
        ) : (
          <div className="space-y-2 max-h-[320px] overflow-y-auto">
            {tasks.map(task => {
              const Icon = TYPE_ICONS[task.type] || ClipboardList;
              const isOverdue = task.dueDate && isBefore(new Date(task.dueDate), new Date());
              
              return (
                <div
                  key={task.id}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors hover:bg-muted/50 ${
                    isOverdue ? 'border-red-200 bg-red-50/50 dark:bg-red-950/20 dark:border-red-900' : ''
                  }`}
                  onClick={() => task.shipmentId && navigate(`/shipments/${task.shipmentId}`)}
                >
                  <div className="p-1.5 rounded-md bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{task.title}</p>
                    {task.shipmentTitle && (
                      <p className="text-xs text-muted-foreground truncate">
                        {task.shipmentTitle}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                      {task.priority}
                    </Badge>
                    {task.dueDate && (
                      <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                        {isOverdue ? t.overdue : format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
