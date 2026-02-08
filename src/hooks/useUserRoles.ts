import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import type { AppRole } from '@/types/erp';

interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
}

interface UserWithRole {
  id: string;
  email: string;
  display_name: string | null;
  roles: AppRole[];
}

export function useUserRoles() {
  const { user, isAdmin } = useAuth();
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!user || !isAdmin) {
      setLoading(false);
      return;
    }
    
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, display_name');

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Combine
      const usersWithRoles: UserWithRole[] = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || '',
        display_name: profile.display_name,
        roles: (roles || [])
          .filter(r => r.user_id === profile.id)
          .map(r => r.role as AppRole),
      }));

      setUsers(usersWithRoles);
    } catch (error: unknown) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [user, isAdmin]);

  const assignRole = async (userId: string, role: AppRole): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role });

      if (error) {
        if (error.code === '23505') {
          toast.error('User already has this role');
          return false;
        }
        throw error;
      }

      // Log audit event for role assignment
      await supabase.rpc('log_audit_event', {
        p_action: 'ROLE_ASSIGN',
        p_entity_type: 'user_role',
        p_entity_id: userId,
        p_new_values: { user_id: userId, role },
      });
      
      toast.success('Role assigned');
      await fetchUsers();
      return true;
    } catch (error: unknown) {
      console.error('Error assigning role:', error);
      toast.error('Failed to assign role');
      return false;
    }
  };

  const removeRole = async (userId: string, role: AppRole): Promise<boolean> => {
    if (!isAdmin) {
      toast.error('Admin access required');
      return false;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;

      // Log audit event for role removal
      await supabase.rpc('log_audit_event', {
        p_action: 'ROLE_REMOVE',
        p_entity_type: 'user_role',
        p_entity_id: userId,
        p_old_values: { user_id: userId, role },
      });
      
      toast.success('Role removed');
      await fetchUsers();
      return true;
    } catch (error: unknown) {
      console.error('Error removing role:', error);
      toast.error('Failed to remove role');
      return false;
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    assignRole,
    removeRole,
    refetch: fetchUsers,
  };
}

// Hook to check if current user has a specific role
export function useHasRole(role: AppRole): boolean {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState(false);

  useEffect(() => {
    async function checkRole() {
      if (!user) {
        setHasRole(false);
        return;
      }

      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', role)
        .maybeSingle();

      setHasRole(!!data);
    }

    checkRole();
  }, [user, role]);

  return hasRole;
}
