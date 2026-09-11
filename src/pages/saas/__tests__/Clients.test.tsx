import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

const clientsState = await vi.hoisted(async () => ({
  clients: [
    { id: 'c1', name: 'Aramex Jordan', type: 'CLIENT', email: null, phone: null, is_active: true },
    { id: 'v1', name: 'Amman Fuel', type: 'VENDOR', email: null, phone: null, is_active: true },
  ] as Record<string, unknown>[],
  loading: false,
}));

vi.mock('@/components/saas/SaasLayout', () => ({
  SaasLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('@/hooks/useClients', () => ({
  useClients: () => ({
    clients: clientsState.clients,
    loading: clientsState.loading,
    createClient: vi.fn(),
    updateClient: vi.fn(),
    deleteClient: vi.fn(),
    getClientsByType: (type: string) =>
      clientsState.clients.filter((c) => c.type === type),
  }),
}));

vi.mock('@/hooks/useCurrentUserRoles', () => ({
  useCurrentUserRoles: () => ({ canManageClients: true, roles: ['admin'], loading: false }),
}));

vi.mock('@/components/auth/RequireRole', () => ({
  RequireRole: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  RoleBadge: () => <span>admin</span>,
  PermissionButtonWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

import ClientsPage from '@/pages/saas/Clients';

const renderPage = () =>
  render(
    <MemoryRouter>
      <ClientsPage />
    </MemoryRouter>,
  );

describe('/saas/clients page', () => {
  it('renders the clients loaded for the company', () => {
    renderPage();
    expect(screen.getByText('Aramex Jordan')).toBeInTheDocument();
  });

  it('shows a loading spinner while data is fetching', () => {
    clientsState.loading = true;
    const { container } = renderPage();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
    clientsState.loading = false;
  });
});
