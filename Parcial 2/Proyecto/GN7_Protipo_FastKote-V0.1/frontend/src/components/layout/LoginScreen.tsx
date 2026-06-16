import { FormEvent, useState } from 'react';
import { useAuth } from '../../auth/AuthContext';

export function LoginScreen({ onBack, onRegister }: { onBack: () => void; onRegister: () => void }) {
  const { loginUser } = useAuth();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('Admin123*');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await loginUser(username, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo iniciar sesión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page sober-login">
      <header className="public-header compact">
        <div className="public-brand">
          <div className="brand-mark">FK</div>
          <div>
            <strong>FastKote</strong>
            <span>Chichi Está de Fiesta</span>
          </div>
        </div>
        <div className="public-actions">
          <button className="btn btn-ghost" onClick={onBack}>Volver</button>
          <button className="btn btn-secondary" onClick={onRegister}>Registrarse</button>
        </div>
      </header>

      <form className="login-card" onSubmit={handleSubmit}>
        <div className="brand-mark large">FK</div>
        <p className="eyebrow">Acceso interno</p>
        <h1>Iniciar sesión</h1>
        <p>Ingresa como Administrador o Empleado para acceder a los módulos autorizados.</p>

        <label>
          Usuario
          <div className="input-icon">
            <span>✉</span>
            <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Usuario" />
          </div>
        </label>

        <label>
          Contraseña
          <div className="input-icon">
            <span>🔒</span>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Contraseña" />
          </div>
        </label>

        {error && <div className="alert error">{error}</div>}
        <button className="btn btn-primary full" disabled={loading}>{loading ? 'Validando...' : 'Ingresar'}</button>

        <small className="login-help">Usuarios de prueba: admin/Admin123* · empleado/Empleado123*</small>
      </form>
    </main>
  );
}
