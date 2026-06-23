export function Modal({ children, maxWidth = "max-w-5xl" }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4 backdrop-blur-sm">
      <div className={`max-h-[92vh] w-full overflow-auto rounded-lg bg-white p-6 shadow-2xl ${maxWidth}`}>{children}</div>
    </div>
  );
}
