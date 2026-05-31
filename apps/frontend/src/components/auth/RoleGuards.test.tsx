import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { StoreAdminRoute, SuperAdminRoute } from './RoleGuards';
import { useAuthStore } from '@/stores/auth.store';

function renderWithRoutes(element: JSX.Element) {
  return render(
    <MemoryRouter initialEntries={['/secure']}>
      <Routes>
        <Route path="/secure" element={element} />
        <Route path="/pos" element={<div>POS PAGE</div>} />
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('Role guards', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      subscription: null,
      isAuthenticated: true,
      sessionChecked: true,
    } as any);
  });

  it('bloquea StoreAdminRoute para cashier', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'c@test.com', firstName: 'C', lastName: 'A', role: 'cashier', storeId: 's1' },
    } as any);

    renderWithRoutes(
      <StoreAdminRoute>
        <div>ADMIN ONLY</div>
      </StoreAdminRoute>,
    );

    expect(screen.getByText('POS PAGE')).toBeInTheDocument();
  });

  it('permite SuperAdminRoute para super_admin', () => {
    useAuthStore.setState({
      user: { id: 'u1', email: 'sa@test.com', firstName: 'S', lastName: 'A', role: 'super_admin', storeId: '' },
    } as any);

    renderWithRoutes(
      <SuperAdminRoute>
        <div>CONTROL CENTER</div>
      </SuperAdminRoute>,
    );

    expect(screen.getByText('CONTROL CENTER')).toBeInTheDocument();
  });
});
