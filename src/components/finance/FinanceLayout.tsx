import { ReactNode } from 'react';
import MainLayout from '@/components/MainLayout';
import { FinanceSidebar } from './FinanceSidebar';

interface FinanceLayoutProps {
  children: ReactNode;
}

export function FinanceLayout({ children }: FinanceLayoutProps) {
  return (
    <MainLayout>
      <div className="flex">
        <FinanceSidebar />
        <main className="flex-1 min-h-[calc(100vh-4rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
