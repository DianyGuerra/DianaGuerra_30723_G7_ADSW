export function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card">
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
