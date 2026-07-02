export function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  return (
    <main className="public-page">
      <header className="public-header">
        <div className="public-brand">
          <div className="brand-mark">FK</div>
          <div>
            <strong>FastKote</strong>
            <span>Chichi Está de Fiesta</span>
          </div>
        </div>

        <nav className="public-nav" aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#paquetes">Paquetes</a>
          <a href="#experiencias">Experiencias</a>
          <a href="#contacto">Contacto</a>
        </nav>

        <div className="public-actions">
          <button className="btn btn-ghost" onClick={onLogin}>Iniciar sesión</button>
          <button className="btn btn-primary" onClick={onRegister}>Registrarse</button>
        </div>
      </header>

      <section id="inicio" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">Fiestas infantiles y eventos familiares</p>
          <h1>Creamos celebraciones bonitas, dulces y sin complicaciones.</h1>
          <p className="hero-text">
            En Chichi Está de Fiesta armamos paquetes para cumpleaños, reuniones y momentos especiales con decoración temática, bocaditos, estaciones dulces y detalles personalizados.
          </p>
          <div className="hero-buttons">
            <button className="btn btn-primary" onClick={onLogin}>Iniciar sesión</button>
            <button className="btn btn-secondary" onClick={onRegister}>Solicitar cotización</button>
          </div>
        </div>

        <section className="hero-carousel" aria-label="Carrusel de fiestas y servicios">
          <div className="carousel-track">
            <figure>
              <img src="/assets/hero-fiesta-1.svg" alt="Decoración temática para fiesta infantil" />
              <figcaption>Decoración temática</figcaption>
            </figure>
            <figure>
              <img src="/assets/hero-fiesta-2.svg" alt="Mesa dulce y snacks para eventos" />
              <figcaption>Mesa dulce y snacks</figcaption>
            </figure>
            <figure>
              <img src="/assets/hero-fiesta-3.svg" alt="Organización de eventos familiares" />
              <figcaption>Eventos organizados</figcaption>
            </figure>
          </div>
        </section>
      </section>

      <section className="landing-dashboard" aria-label="Resumen de servicios del negocio">
        <article>
          <span>11</span>
          <strong>Paquetes para celebrar</strong>
          <p>Opciones listas para cumpleaños y eventos familiares.</p>
        </article>
        <article>
          <span>32</span>
          <strong>Servicios y productos</strong>
          <p>Decoración, bocaditos, montaje y complementos.</p>
        </article>
        <article>
          <span>15 días</span>
          <strong>Validez de precios</strong>
          <p>Tiempo estimado para confirmar la propuesta recibida.</p>
        </article>
        <article>
          <span>1 fecha</span>
          <strong>Reserva por evento</strong>
          <p>La fecha se separa cuando se confirma la celebración.</p>
        </article>
      </section>

      <section id="paquetes" className="public-section split-section">
        <div>
          <p className="eyebrow">Paquetes y detalles</p>
          <h2>Todo lo necesario para que la fiesta se vea especial.</h2>
          <p>
            Elige una base según el tipo de celebración y personalízala con colores, temática, productos adicionales y servicios que se adapten al presupuesto del cliente.
          </p>
        </div>
        <div className="feature-list">
          <div><strong>Decoración temática</strong><span>Arcos, fondos, mesas y detalles visuales.</span></div>
          <div><strong>Snacks y mesa dulce</strong><span>Bocaditos, dulces, bebidas y complementos.</span></div>
          <div><strong>Paquetes personalizados</strong><span>Propuestas adaptadas a cada evento.</span></div>
        </div>
      </section>

      <section id="experiencias" className="public-section process-section">
        <p className="eyebrow">Cómo se arma la celebración</p>
        <h2>Del sueño de la fiesta a una propuesta clara.</h2>
        <div className="process-grid">
          <article><span>01</span><strong>Cuéntanos la idea</strong><p>Se define el tipo de evento, número de invitados, temática y fecha tentativa.</p></article>
          <article><span>02</span><strong>Elige un paquete</strong><p>Se toma una opción base y se agregan detalles según lo que necesita la celebración.</p></article>
          <article><span>03</span><strong>Personaliza detalles</strong><p>Se ajustan productos, cantidades, decoración y servicios adicionales.</p></article>
          <article><span>04</span><strong>Confirma tu evento</strong><p>Cuando la propuesta es aceptada, la fecha queda separada para la fiesta.</p></article>
        </div>
      </section>

      <footer id="contacto" className="public-footer">
        <span>FastKote · Chichi Está de Fiesta</span>
        <span>Paquetes, decoración y detalles para eventos infantiles y familiares.</span>
      </footer>
    </main>
  );
}
