import { useState, useEffect } from 'react';
import { useShipmentTasks, TaskStatus } from '@/hooks/useShipmentTasks';
import { ShipmentDocument } from '@/hooks/useShipmentDocuments';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckSquare, Plus, Trash2, Calendar, AlertCircle } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';

interface TasksSectionProps {
  shipmentId: string;
  documents: ShipmentDocument[];
  onTaskCountChange?: (count: number) => void;
}

export function TasksSection({ shipmentId, documents, onTaskCountChange }: TasksSectionProps) {
  const { language } = useLanguage();
  const { 
    tasks, 
    loading, 
    openTasksCount, 
    addTask, 
    toggleTaskStatus, 
    deleteTask, 
    createDefaultTasks,
    updateTaskFromDocuments 
  } = useShipmentTasks(shipmentId);
  
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAddTask, setShowAddTask] = useState(false);

  // Sync document status with tasks
  useEffect(() => {
    if (documents.length > 0 && tasks.length > 0) {
      updateTaskFromDocuments(documents);
    }
  }, [documents]);

  // Notify parent of task count changes
  useEffect(() => {
    onTaskCountChange?.(openTasksCount);
  }, [openTasksCount, onTaskCountChange]);

  const t = {
    tasks: language === 'ar' ? 'المهام' : 'Tasks',
    addTask: language === 'ar' ? 'إضافة مهمة' : 'Add Task',
    taskTitle: language === 'ar' ? 'عنوان المهمة' : 'Task title',
    dueDate: language === 'ar' ? 'تاريخ الاستحقاق' : 'Due date',
    add: language === 'ar' ? 'إضافة' : 'Add',
    cancel: language === 'ar' ? 'إلغاء' : 'Cancel',
    noTasks: language === 'ar' ? 'لا توجد مهام' : 'No tasks yet',
    createDefaults: language === 'ar' ? 'إنشاء المهام الافتراضية' : 'Create Default Tasks',
    overdue: language === 'ar' ? 'متأخر' : 'Overdue',
    pending: language === 'ar' ? 'قيد الانتظار' : 'Pending',
    done: language === 'ar' ? 'مكتمل' : 'Done',
  };

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return;
    await addTask(newTaskTitle, newTaskDueDate || undefined);
    setNewTaskTitle('');
    setNewTaskDueDate('');
    setShowAddTask(false);
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return isBefore(new Date(dueDate), new Date());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {t.tasks}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            {t.tasks}
            {openTasksCount > 0 && (
              <Badge variant="secondary">{openTasksCount} {t.pending}</Badge>
            )}
          </div>
          <Button size="sm" variant="outline" onClick={() => setShowAddTask(!showAddTask)}>
            <Plus className="h-4 w-4 mr-1" />
            {t.addTask}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Task Form */}
        {showAddTask && (
          <div className="flex gap-2 mb-4 p-3 bg-muted/50 rounded-lg">
            <Input
              placeholder={t.taskTitle}
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              className="flex-1"
            />
            <Input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="w-40"
            />
            <Button size="sm" onClick={handleAddTask}>
              {t.add}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowAddTask(false)}>
              {t.cancel}
            </Button>
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground mb-4">{t.noTasks}</p>
            <Button variant="outline" onClick={createDefaultTasks}>
              {t.createDefaults}
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.map(task => {
              const overdue = task.status === 'Pending' && isOverdue(task.due_date);
              return (
                <div
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    task.status === 'Done' 
                      ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900' 
                      : overdue 
                        ? 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900'
                        : 'bg-muted/30 border-transparent'
                  }`}
                >
                  <Checkbox
                    checked={task.status === 'Done'}
                    onCheckedChange={() => toggleTaskStatus(task.id)}
                  />
                  <span className={`flex-1 ${task.status === 'Done' ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </span>
                  {overdue && (
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {t.overdue}
                    </Badge>
                  )}
                  {task.due_date && !overdue && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(task.due_date), 'MMM d')}
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteTask(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
