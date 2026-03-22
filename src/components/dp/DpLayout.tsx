import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';
import { DpSidebar } from './DpSidebar';

interface DpLayoutProps {
  children: ReactNode;
}

export function DpLayout({ children }: DpLayoutProps) {
  return (
    <MainLayout>
      <div className="flex">
        <DpSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
