import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';
import { ErpSidebar } from './ErpSidebar';

interface ErpLayoutProps {
  children: ReactNode;
}

export function ErpLayout({ children }: ErpLayoutProps) {
  return (
    <MainLayout>
      <div className="flex">
        <ErpSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
