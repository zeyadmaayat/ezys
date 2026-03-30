import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';
import { SalesSidebar } from './SalesSidebar';

interface SalesLayoutProps {
  children: ReactNode;
}

export function SalesLayout({ children }: SalesLayoutProps) {
  return (
    <MainLayout>
      <div className="flex">
        <SalesSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
