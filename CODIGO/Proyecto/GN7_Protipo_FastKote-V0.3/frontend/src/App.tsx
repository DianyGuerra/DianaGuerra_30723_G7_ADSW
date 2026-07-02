import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { LoginScreen } from './components/layout/LoginScreen';
import { ConstructionPage } from './components/public/ConstructionPage';
import { LandingPage } from './components/public/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { QuotesPage } from './pages/QuotesPage';
import { CalendarPage } from './pages/CalendarPage';
import { InventoryPage } from './pages/InventoryPage';
import { PackagesPage } from './pages/PackagesPage';
import { PromotionsPage } from './pages/PromotionsPage';
import { ServicesPage } from './pages/ServicesPage';

export type ViewName = 'dashboard' | 'clients' | 'employees' | 'quotes' | 'calendar' | 'inventory' | 'packages' | 'services' | 'promotions';
type PublicView = 'landing' | 'login' | 'construction';

function Shell() {
  const { isLoggedIn, hasRole } = useAuth();
  const [view, setView] = useState<ViewName>('dashboard');
  const [publicView, setPublicView] = useState<PublicView>('landing');

  useEffect(() => {
    if (isLoggedIn && view === 'employees' && !hasRole('Admin')) setView('dashboard');
  }, [hasRole, isLoggedIn, view]);

  if (!isLoggedIn) {
    if (publicView === 'login') {
      return <LoginScreen onBack={() => setPublicView('landing')} onRegister={() => setPublicView('construction')} />;
    }

    if (publicView === 'construction') {
      return <ConstructionPage onBack={() => setPublicView('landing')} onLogin={() => setPublicView('login')} />;
    }

    return <LandingPage onLogin={() => setPublicView('login')} onRegister={() => setPublicView('construction')} />;
  }

  const safeView = view === 'employees' && !hasRole('Admin') ? 'dashboard' : view;

  return (
    <AppLayout active={safeView} onNavigate={setView}>
      {safeView === 'dashboard' && <DashboardPage onNavigate={setView} />}
      {safeView === 'clients' && <ClientsPage />}
      {safeView === 'employees' && <EmployeesPage />}
      {safeView === 'quotes' && <QuotesPage />}
      {safeView === 'calendar' && <CalendarPage />}
      {safeView === 'inventory' && <InventoryPage />}
      {safeView === 'packages' && <PackagesPage />}
      {safeView === 'services' && <ServicesPage />}
      {safeView === 'promotions' && <PromotionsPage />}
    </AppLayout>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
