import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/components/saas/SaasLayout', () => ({
  SaasLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useCompany', () => ({
  useCompany: () => ({
    company: { id: 'company-aaa-111', name: 'Ezy Test Co' },
    loading: false,
    hasCompany: true,
  }),
}));

vi.mock('@/hooks/useDashboardStats', () => ({
  useDashboardStats: () => ({
    loading: false,
    stats: {
      totalShipments: 7,
      createdCount: 2,
      inTransitCount: 3,
      deliveredCount: 2,
      pendingInvoices: 1,
      paidInvoices: 4,
      totalRevenue: 1250,
    },
  }),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { functions: { invoke: vi.fn() } },
}));

vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

import SaaSDashboard from '@/pages/saas/Dashboard';

describe('/saas dashboard page', () => {
  it('renders KPI values from the stats hook', () => {
    render(
      <MemoryRouter>
        <SaaSDashboard />
      </MemoryRouter>,
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getAllByText(/Ezy Test Co/i).length).toBeGreaterThan(0);
  });
});
