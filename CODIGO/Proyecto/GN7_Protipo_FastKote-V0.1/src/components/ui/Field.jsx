export function Field({ label, value, onChange, type = "text", min, step, placeholder, error, as = "input" }) {
  const baseClass = `w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 ${
    error ? "border-rose-300" : "border-slate-200"
  } text-slate-900 placeholder:text-slate-400 [color-scheme:light]`;

  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      {as === "textarea" ? (
        <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className={`${baseClass} min-h-24 resize-y`} />
      ) : (
        <input value={value} onChange={(event) => onChange(event.target.value)} type={type} min={min} step={step} placeholder={placeholder} className={baseClass} />
      )}
      {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}
