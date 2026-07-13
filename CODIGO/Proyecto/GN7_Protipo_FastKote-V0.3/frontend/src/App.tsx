import { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext';
import { listCalendar } from './api/quotes';
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
  const [toasts, setToasts] = useState<{ id: string; message: string }[]>([]);

  useEffect(() => {
    if (isLoggedIn && view === 'employees' && !hasRole('Admin')) setView('dashboard');
  }, [hasRole, isLoggedIn, view]);

  useEffect(() => {
    if (isLoggedIn) {
      listCalendar().then((entries) => {
        const todayStr = new Date().toLocaleDateString('sv'); // 'YYYY-MM-DD'
        const todayEntries = entries.filter((entry: any) => {
          return entry.status === 'BLOCKED' && String(entry.eventDate).slice(0, 10) === todayStr;
        });

        todayEntries.forEach((entry: any) => {
          const clientName = entry.quote?.client?.fullName || 'Cliente';
          const eventType = entry.quote?.eventType || 'Evento';
          const code = entry.quote?.code || '';
          
          setToasts((current) => {
            if (current.some(x => x.id === entry.id)) return current;
            return [
              ...current,
              {
                id: entry.id,
                message: `🎉 ¡Evento programado para hoy! "${eventType}" para ${clientName} (${code}).`,
              },
            ];
          });
        });
      }).catch(err => {
        console.error('Error fetching calendar notifications:', err);
      });
    }
  }, [isLoggedIn]);

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
    <>
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

      {toasts.length > 0 && (
        <div style={{ position: 'fixed', bottom: '24px', right: '24px', display: 'flex', flexDirection: 'column', gap: '12px', zIndex: 9999 }}>
          {toasts.map((t) => (
            <div key={t.id} className="alert success" style={{ minWidth: '320px', boxShadow: '0 8px 30px rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: 0, padding: '14px 18px', borderLeft: '5px solid #2ecc71', borderRadius: '8px', background: 'var(--success-bg)', color: 'var(--success)' }}>
              <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{t.message}</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '20px', marginLeft: '12px', color: 'inherit', fontWeight: 'bold' }} onClick={() => setToasts(current => current.filter(x => x.id !== t.id))}>×</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export function App() {
  return (
    <AuthProvider>
      <Shell />
    </AuthProvider>
  );
}
