export function Modal({ title, children, onClose, style }: { title: string; children: React.ReactNode; onClose: () => void; style?: React.CSSProperties }) {
  return (
    <div className="modal-backdrop">
      <section className="modal-card" style={style}>
        <header>
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>
  );
}
