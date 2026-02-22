import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from './LanguageContext';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isApproved: boolean;
  hasCompany: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isApproved, setIsApproved] = useState(false);
  const [hasCompany, setHasCompany] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useLanguage();

  const checkAdminRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();

      if (error) {
        console.error('Error checking admin role:', error);
        return false;
      }
      return !!data;
    } catch {
      return false;
    }
  };

  const checkApprovalAndCompany = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_approved, company_id')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error checking approval:', error);
        return { approved: false, hasCompany: false };
      }
      return { 
        approved: data?.is_approved ?? false, 
        hasCompany: !!data?.company_id 
      };
    } catch {
      return { approved: false, hasCompany: false };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer admin/approval check with setTimeout
        if (session?.user) {
          setTimeout(() => {
            checkAdminRole(session.user.id).then(setIsAdmin);
            checkApprovalAndCompany(session.user.id).then(r => {
              setIsApproved(r.approved);
              setHasCompany(r.hasCompany);
            });
          }, 0);
        } else {
          setIsAdmin(false);
          setIsApproved(false);
          setHasCompany(false);
        }
        
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminRole(session.user.id).then(setIsAdmin);
        checkApprovalAndCompany(session.user.id).then(r => {
          setIsApproved(r.approved);
          setHasCompany(r.hasCompany);
        });
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { error: t('invalidCredentials') };
        }
        return { error: error.message };
      }
      
      toast({ title: t('signInSuccess') });
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signUp = async (email: string, password: string, displayName?: string): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            display_name: displayName || email.split('@')[0],
          },
        },
      });
      
      if (error) {
        if (error.message.includes('already registered')) {
          return { error: t('emailAlreadyUsed') };
        }
        return { error: error.message };
      }
      
      toast({ title: t('signUpSuccess') });
      return { error: null };
    } catch (err) {
      return { error: 'An unexpected error occurred' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({ title: t('signOutSuccess') });
  };

  const refreshAuth = async () => {
    if (user) {
      const [admin, approvalResult] = await Promise.all([
        checkAdminRole(user.id),
        checkApprovalAndCompany(user.id),
      ]);
      setIsAdmin(admin);
      setIsApproved(approvalResult.approved);
      setHasCompany(approvalResult.hasCompany);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isAdmin, isApproved, hasCompany, loading, signIn, signUp, signOut, refreshAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
