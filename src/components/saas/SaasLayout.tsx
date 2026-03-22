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
        <SaasSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
