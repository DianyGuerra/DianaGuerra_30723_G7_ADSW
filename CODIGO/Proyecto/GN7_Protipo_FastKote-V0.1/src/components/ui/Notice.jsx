export function Notice({ notice, onClose }) {
  if (!notice) return null;

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-lg border border-violet-200 bg-violet-50 p-4 text-sm text-violet-900 sm:flex-row sm:items-center sm:justify-between">
      <span>{notice}</span>
      <button type="button" className="self-start rounded-md px-2 py-1 text-xs font-bold hover:bg-violet-100 sm:self-auto" onClick={onClose}>
        Cerrar
      </button>
    </div>
  );
}
