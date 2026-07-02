export function ConstructionPage({ onBack, onLogin }: { onBack: () => void; onLogin: () => void }) {
  return (
    <main className="construction-page">
      <section className="construction-card">
        <div className="brand-mark large">FK</div>
        <p className="eyebrow">Página en construcción</p>
        <h1>Registro de clientes todavía no habilitado.</h1>
        <p>
          Por ahora el prototipo mantiene únicamente las vistas internas de Administrador y Empleado. El registro público queda preparado como acceso futuro.
        </p>
        <div className="hero-buttons centered">
          <button className="btn btn-primary" onClick={onLogin}>Ir al login</button>
          <button className="btn btn-secondary" onClick={onBack}>Volver al inicio</button>
        </div>
      </section>
    </main>
  );
}
