import type { ReactNode } from 'react';
import { Lock } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFieldPermissions } from '@/hooks/useFieldPermissions';
import { getFieldPolicy, maskFieldValue } from '@/lib/field-permissions';
import { cn } from '@/lib/utils';

interface BaseProps {
  entity: string;
  field: string;
}

/**
 * Renders children only when the user can read (or write) the field.
 * Otherwise renders a locked placeholder explaining why.
 */
export function FieldGate({
  entity,
  field,
  access = 'read',
  children,
  fallback,
  silent = false,
}: BaseProps & {
  access?: 'read' | 'write';
  children: ReactNode;
  fallback?: ReactNode;
  /** When true, render nothing instead of a lock placeholder. */
  silent?: boolean;
}) {
  const { language } = useLanguage();
  const { canRead, canWrite } = useFieldPermissions(entity);
  const allowed = access === 'write' ? canWrite(field) : canRead(field);

  if (allowed) return <>{children}</>;
  if (fallback !== undefined) return <>{fallback}</>;
  if (silent) return null;

  const policy = getFieldPolicy(entity, field);
  const label = policy ? (language === 'ar' ? policy.labelAr : policy.labelEn) : field;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center gap-1 text-muted-foreground text-sm">
            <Lock className="h-3 w-3" />
            <span>{maskFieldValue(null, policy)}</span>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          {language === 'ar'
            ? `لا تملك صلاحية على «${label}»`
            : `You don't have permission for "${label}"`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Renders a single value with automatic masking when the field is restricted.
 */
export function SecureValue({
  entity,
  field,
  value,
  format,
  className,
}: BaseProps & {
  value: unknown;
  format?: (v: unknown) => string;
  className?: string;
}) {
  const { language } = useLanguage();
  const { canRead, display } = useFieldPermissions(entity);
  const readable = canRead(field);
  const policy = getFieldPolicy(entity, field);
  const label = policy ? (language === 'ar' ? policy.labelAr : policy.labelEn) : field;
  const text = display(field, value, format);

  if (readable) return <span className={className}>{text}</span>;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn('text-muted-foreground cursor-help', className)}>{text}</span>
        </TooltipTrigger>
        <TooltipContent>
          {language === 'ar' ? `مخفي: ${label}` : `Restricted: ${label}`}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Wraps an input/select. When the user cannot write the field, the control is
 * disabled and a lock hint is shown next to the label.
 */
export function SecureField({
  entity,
  field,
  children,
  className,
}: BaseProps & { children: ReactNode; className?: string }) {
  const { language } = useLanguage();
  const { canWrite } = useFieldPermissions(entity);
  const editable = canWrite(field);

  if (editable) return <div className={className}>{children}</div>;

  return (
    <div className={cn('relative', className)}>
      <div className="pointer-events-none opacity-60">{children}</div>
      <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        {language === 'ar' ? 'للقراءة فقط بحسب صلاحياتك' : 'Read-only for your role'}
      </p>
    </div>
  );
}
