import { ViewName } from '../App';
import { useAuth } from '../auth/AuthContext';

export function DashboardPage({ onNavigate }: { onNavigate: (view: ViewName) => void }) {
  const { hasRole } = useAuth();

  return (
    <main className="page">
      <section className="dashboard-hero">
        <div>
          <p className="eyebrow">Panel del negocio</p>
          <h1>Gestión de eventos y cotizaciones</h1>
          <p>
            Organiza clientes, propuestas, paquetes y fechas de Chichi Está de Fiesta desde un solo lugar. El administrador también puede gestionar el personal del negocio.
          </p>
        </div>
        <div className="dashboard-pill">Fiestas · Paquetes · Agenda</div>
      </section>

      <section className="cards-grid">
        <button className="summary-card" onClick={() => onNavigate('clients')}>
          <span>01</span>
          <strong>Clientes</strong>
          <p>Buscar, registrar, ver detalles y mantener actualizados los datos de cada cliente.</p>
        </button>
        <button className="summary-card" onClick={() => onNavigate('quotes')}>
          <span>02</span>
          <strong>Cotizaciones</strong>
          <p>Preparar propuestas para eventos, revisar montos y cambiar el estado comercial.</p>
        </button>
        <button className="summary-card" onClick={() => onNavigate('calendar')}>
          <span>03</span>
          <strong>Calendario</strong>
          <p>Consultar fechas separadas para eventos confirmados y mantener organizada la agenda.</p>
        </button>
        {hasRole('Admin') && (
          <button className="summary-card" onClick={() => onNavigate('employees')}>
            <span>04</span>
            <strong>Empleados</strong>
            <p>Registrar personal, actualizar información, asignar roles y desactivar cuentas.</p>
          </button>
        )}
      </section>

      <section className="dashboard-panel">
        <div>
          <p className="eyebrow">Acceso interno</p>
          <h2>Vistas disponibles por rol</h2>
        </div>
        <div className="access-grid">
          <article><strong>Administrador</strong><p>Puede gestionar clientes, cotizaciones, calendario, empleados y roles.</p></article>
          <article><strong>Empleado</strong><p>Puede trabajar con clientes, cotizaciones y calendario sin administrar personal.</p></article>
        </div>
      </section>
    </main>
  );
}
