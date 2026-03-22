import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface ErpBreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function ErpBreadcrumb({ items, className }: ErpBreadcrumbProps) {
  const navigate = useNavigate();

  return (
    <nav className={cn('flex items-center gap-1 text-sm text-muted-foreground', className)}>
      <button
        onClick={() => navigate('/')}
        className="hover:text-foreground transition-colors"
      >
        <Home className="w-3.5 h-3.5" />
      </button>
      {items.map((item, index) => (
        <span key={index} className="flex items-center gap-1">
          <ChevronRight className="w-3 h-3 text-muted-foreground/50" />
          {item.path && index < items.length - 1 ? (
            <button
              onClick={() => navigate(item.path!)}
              className="hover:text-foreground transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className={cn(index === items.length - 1 && 'text-foreground font-medium')}>
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
