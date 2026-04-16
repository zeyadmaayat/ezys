import { ReactNode, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search, Filter, ChevronDown, List, LayoutGrid, FileSpreadsheet,
  Calendar as CalendarIcon, FormInput, Star, X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export type ViewMode = 'list' | 'kanban' | 'form' | 'pivot' | 'calendar';

interface FilterOption {
  label: string;
  value: string;
}

interface GroupByOption {
  label: string;
  value: string;
}

interface OdooControlPanelProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: { label: string; href?: string }[];
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  filters?: FilterOption[];
  activeFilters?: string[];
  onFilterChange?: (filters: string[]) => void;
  groupByOptions?: GroupByOption[];
  activeGroupBy?: string;
  onGroupByChange?: (groupBy: string) => void;
  viewModes?: ViewMode[];
  activeView?: ViewMode;
  onViewChange?: (view: ViewMode) => void;
  totalCount?: number;
  actions?: ReactNode;
  favorites?: boolean;
  children?: ReactNode;
}

const viewIcons: Record<ViewMode, typeof List> = {
  list: List,
  kanban: LayoutGrid,
  form: FormInput,
  pivot: FileSpreadsheet,
  calendar: CalendarIcon,
};

export function OdooControlPanel({
  title,
  subtitle,
  breadcrumbs,
  searchValue = '',
  onSearchChange,
  filters,
  activeFilters = [],
  onFilterChange,
  groupByOptions,
  activeGroupBy,
  onGroupByChange,
  viewModes = ['list'],
  activeView = 'list',
  onViewChange,
  totalCount,
  actions,
  children,
}: OdooControlPanelProps) {
  const { language } = useLanguage();
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="bg-card border-b border-border">
      {/* Top Row: Breadcrumbs + Actions */}
      <div className="px-4 lg:px-6 py-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              {breadcrumbs.map((bc, i) => (
                <span key={i} className="flex items-center gap-1">
                  {i > 0 && <span className="text-border">/</span>}
                  {bc.href ? (
                    <a href={bc.href} className="hover:text-foreground transition-colors">{bc.label}</a>
                  ) : (
                    <span className="text-foreground font-semibold">{bc.label}</span>
                  )}
                </span>
              ))}
            </div>
          )}
          {!breadcrumbs && (
            <div>
              <h1 className="text-lg font-bold text-foreground leading-tight">{title}</h1>
              {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {totalCount !== undefined && (
            <Badge variant="secondary" className="text-xs font-medium px-2 py-0.5 rounded-full">
              {totalCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {actions}
        </div>
      </div>

      {/* Bottom Row: Search + Filters + Group By + View Switcher */}
      <div className="px-4 lg:px-6 pb-3 flex flex-wrap items-center gap-2">
        {/* Search */}
        {onSearchChange && (
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={language === 'ar' ? 'بحث...' : 'Search...'}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 h-9 text-sm bg-background"
            />
          </div>
        )}

        {/* Filters Dropdown */}
        {filters && filters.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                <Filter className="w-3.5 h-3.5" />
                {language === 'ar' ? 'فلترة' : 'Filters'}
                {activeFilters.length > 0 && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">
                    {activeFilters.length}
                  </Badge>
                )}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {filters.map((f) => (
                <DropdownMenuItem
                  key={f.value}
                  onClick={() => {
                    if (!onFilterChange) return;
                    const newFilters = activeFilters.includes(f.value)
                      ? activeFilters.filter((af) => af !== f.value)
                      : [...activeFilters, f.value];
                    onFilterChange(newFilters);
                  }}
                  className={cn(activeFilters.includes(f.value) && 'bg-primary/10 text-primary')}
                >
                  {f.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Group By Dropdown */}
        {groupByOptions && groupByOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-1.5 text-sm">
                {language === 'ar' ? 'تجميع' : 'Group By'}
                {activeGroupBy && (
                  <Badge className="h-5 px-1.5 text-[10px] bg-primary text-primary-foreground">1</Badge>
                )}
                <ChevronDown className="w-3 h-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {groupByOptions.map((g) => (
                <DropdownMenuItem
                  key={g.value}
                  onClick={() => onGroupByChange?.(g.value === activeGroupBy ? '' : g.value)}
                  className={cn(activeGroupBy === g.value && 'bg-primary/10 text-primary')}
                >
                  {g.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Active Filter Tags */}
        {activeFilters.length > 0 && (
          <div className="flex items-center gap-1">
            {activeFilters.map((f) => {
              const filter = filters?.find((fi) => fi.value === f);
              return (
                <Badge key={f} variant="secondary" className="gap-1 text-xs pr-1">
                  {filter?.label || f}
                  <button
                    onClick={() => onFilterChange?.(activeFilters.filter((af) => af !== f))}
                    className="hover:bg-muted rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* View Switcher */}
        {viewModes.length > 1 && (
          <div className="flex items-center bg-muted/50 rounded-lg p-0.5 border border-border/50">
            {viewModes.map((mode) => {
              const Icon = viewIcons[mode];
              return (
                <button
                  key={mode}
                  onClick={() => onViewChange?.(mode)}
                  className={cn(
                    'p-1.5 rounded-md transition-all',
                    activeView === mode
                      ? 'bg-card text-primary shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                  title={mode.charAt(0).toUpperCase() + mode.slice(1)}
                >
                  <Icon className="w-4 h-4" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}
