import { ViewName } from '../../App';
import { useAuth } from '../../auth/AuthContext';

const options: Array<{ id: ViewName; label: string; icon: string; adminOnly?: boolean }> = [
  { id: 'dashboard', label: 'Panel Principal', icon: '▦' },
  { id: 'clients', label: 'Clientes', icon: '👥' },
  { id: 'quotes', label: 'Cotizaciones', icon: '📄' },
  { id: 'calendar', label: 'Calendario', icon: '📅' },
  { id: 'inventory', label: 'Insumos', icon: '🧾' },
  { id: 'packages', label: 'Paquetes', icon: '🎁' },
  { id: 'services', label: 'Servicios', icon: '🧰' },
  { id: 'promotions', label: 'Promociones', icon: '🏷️' },
  { id: 'employees', label: 'Empleados y roles', icon: '🧑‍💼', adminOnly: true },
];

export function AppLayout({ active, onNavigate, children }: { active: ViewName; onNavigate: (view: ViewName) => void; children: React.ReactNode }) {
  const { user, logout, hasRole } = useAuth();
  const visibleOptions = options.filter((option) => !option.adminOnly || hasRole('Admin'));

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="brand-mark">FK</div>
          <div>
            <strong>FastKote</strong>
            <span>Chichi Está de Fiesta</span>
          </div>
        </div>

        <div className="role-panel">
          <small>Rol activo</small>
          <strong>{hasRole('Admin') ? 'Administrador' : 'Empleado'}</strong>
        </div>

        <nav>
          {visibleOptions.map((option) => (
            <button key={option.id} className={active === option.id ? 'active' : ''} onClick={() => onNavigate(option.id)}>
              <span>{option.icon}</span>{option.label}
            </button>
          ))}
        </nav>
      </aside>

      <section className="content-area">
        <header className="topbar">
          <div>
            <strong>{user?.fullName}</strong>
            <span>{user?.roles.join(' · ')}</span>
          </div>
          <button className="btn btn-ghost" onClick={logout}>Cerrar sesión</button>
        </header>
        {children}
      </section>
    </div>
  );
}
