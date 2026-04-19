import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AiAssistantChat } from './AiAssistantChat';
import { supabase } from '@/integrations/supabase/client';

export function AiAssistantFloating() {
  const [open, setOpen] = useState(false);
  const [authed, setAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setAuthed(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setAuthed(!!s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Hide on auth pages, landing, and the dedicated /ai page
  const hidden = ['/auth', '/login', '/signup', '/reset-password', '/', '/ai'].includes(location.pathname);
  if (hidden || !authed) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          'fixed bottom-5 right-5 z-40 w-14 h-14 rounded-full shadow-lg',
          'bg-gradient-to-br from-primary to-primary/80 text-primary-foreground',
          'flex items-center justify-center hover:scale-105 transition-transform',
          open && 'hidden'
        )}
        aria-label="Open AI Assistant"
      >
        <Sparkles className="w-6 h-6" />
      </button>

      {/* Slide-over panel */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] lg:w-[640px] z-50 bg-background shadow-2xl border-l border-border animate-in slide-in-from-right duration-200">
            <AiAssistantChat variant="panel" onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
