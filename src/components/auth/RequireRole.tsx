import { ReactNode } from 'react';
import { useCurrentUserRoles } from '@/hooks/useCurrentUserRoles';
import type { AppRole } from '@/types/erp';
import { Shield, Lock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RequireRoleProps {
  /** Single role or array of roles to check */
  roles: AppRole | AppRole[];
  /** If true, user must have ALL roles. If false (default), user needs ANY of the roles */
  requireAll?: boolean;
  /** Content to show when user has permission */
  children: ReactNode;
  /** Content to show when user lacks permission (optional) */
  fallback?: ReactNode;
  /** If true, hides the element entirely when no permission. If false, shows fallback or disabled state */
  hideWhenForbidden?: boolean;
}

/**
 * Component to conditionally render content based on user roles.
 * 
 * @example
 * // Show button only for admin or operations
 * <RequireRole roles={['admin', 'operations']}>
 *   <Button>Create Shipment</Button>
 * </RequireRole>
 * 
 * @example
 * // Show disabled state for finance-only features
 * <RequireRole 
 *   roles="finance" 
 *   fallback={<Button disabled>Finance Only</Button>}
 * >
 *   <Button>Record Payment</Button>
 * </RequireRole>
 */
export function RequireRole({ 
  roles, 
  requireAll = false, 
  children, 
  fallback = null,
  hideWhenForbidden = true,
}: RequireRoleProps) {
  const { hasAnyRole, hasAllRoles, loading } = useCurrentUserRoles();

  if (loading) {
    return null; // Don't show anything while loading roles
  }

  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const hasPermission = requireAll 
    ? hasAllRoles(rolesArray) 
    : hasAnyRole(rolesArray);

  if (hasPermission) {
    return <>{children}</>;
  }

  if (hideWhenForbidden) {
    return null;
  }

  return <>{fallback}</>;
}

/**
 * A badge component that shows required roles for a feature
 */
interface RoleBadgeProps {
  roles: AppRole | AppRole[];
  className?: string;
}

export function RoleBadge({ roles, className }: RoleBadgeProps) {
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  
  const roleLabels: Record<AppRole, string> = {
    admin: 'Admin',
    operations: 'Operations',
    warehouse: 'Warehouse',
    finance: 'Finance',
    viewer: 'Viewer',
    user: 'User',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className={className}>
            <Shield className="w-3 h-3 mr-1" />
            {rolesArray.map(r => roleLabels[r]).join(' / ')}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Requires {rolesArray.map(r => roleLabels[r]).join(' or ')} role</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * A wrapper that disables its child button when user lacks permission
 */
interface PermissionButtonWrapperProps {
  roles: AppRole | AppRole[];
  children: ReactNode;
  tooltip?: string;
}

export function PermissionButtonWrapper({ 
  roles, 
  children, 
  tooltip = 'You do not have permission for this action' 
}: PermissionButtonWrapperProps) {
  const { hasAnyRole, loading } = useCurrentUserRoles();
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const hasPermission = hasAnyRole(rolesArray);

  if (loading || hasPermission) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex">
            <div className="opacity-50 cursor-not-allowed pointer-events-none">
              {children}
            </div>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="flex items-center gap-2">
            <Lock className="w-3 h-3" />
            <p>{tooltip}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
