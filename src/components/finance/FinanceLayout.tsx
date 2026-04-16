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
        <div className="hidden md:block">
          <FinanceSidebar />
        </div>
        <main className="flex-1 min-h-[calc(100vh-3rem)] overflow-x-hidden">
          {children}
        </main>
      </div>
    </MainLayout>
  );
}
