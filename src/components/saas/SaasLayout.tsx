import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';
import { SaasSidebar } from './SaasSidebar';

interface SaasLayoutProps {
  children: ReactNode;
}

export function SaasLayout({ children }: SaasLayoutProps) {
  return (
    <MainLayout>
      <div className="flex">
        <div className="hidden md:block">
          <SaasSidebar />
        </div>
        <main className="flex-1 min-h-[calc(100vh-3rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
