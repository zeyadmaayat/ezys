import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, startOfWeek, endOfWeek } from 'date-fns';
import type { InventoryLedgerEntry } from '@/types/erp';

interface Props {
  entries: InventoryLedgerEntry[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function InventoryCalendar({ entries, currentMonth, onMonthChange }: Props) {
  const { language } = useLanguage();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const entriesByDay = useMemo(() => {
    const map: Record<string, InventoryLedgerEntry[]> = {};
    entries.forEach((e) => {
      const key = format(new Date(e.created_at), 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(e);
    });
    return map;
  }, [entries]);

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted/40 text-muted-foreground"
        >
          ←
        </button>
        <h3 className="font-semibold text-foreground">{format(currentMonth, 'MMMM yyyy')}</h3>
        <button
          onClick={() => onMonthChange(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="px-3 py-1.5 text-sm rounded-lg hover:bg-muted/40 text-muted-foreground"
        >
          →
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
        {weekDays.map((d) => (
          <div key={d} className="bg-muted/30 text-center text-[11px] font-semibold text-muted-foreground py-2">
            {d}
          </div>
        ))}
        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd');
          const dayEntries = entriesByDay[key] || [];
          const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
          const isToday = isSameDay(day, new Date());
          const inbound = dayEntries.filter((e) => e.quantity > 0).length;
          const outbound = dayEntries.filter((e) => e.quantity < 0).length;

          return (
            <div
              key={key}
              className={`bg-card min-h-[80px] p-1.5 ${
                !isCurrentMonth ? 'opacity-30' : ''
              } ${isToday ? 'ring-2 ring-primary/30 ring-inset' : ''}`}
            >
              <span className={`text-xs font-medium ${isToday ? 'text-primary font-bold' : 'text-muted-foreground'}`}>
                {format(day, 'd')}
              </span>
              {dayEntries.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {inbound > 0 && (
                    <Badge variant="default" className="text-[9px] h-4 px-1 w-full justify-center bg-emerald-500/15 text-emerald-700 border-0">
                      +{inbound} in
                    </Badge>
                  )}
                  {outbound > 0 && (
                    <Badge variant="destructive" className="text-[9px] h-4 px-1 w-full justify-center bg-destructive/10 text-destructive border-0">
                      {outbound} out
                    </Badge>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
