export function SelectField({ label, value, onChange, children, error }) {
  return (
    <label className="grid gap-1.5 text-sm font-medium text-slate-700">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100 ${
          error ? "border-rose-300" : "border-slate-200"
        } text-slate-900 [color-scheme:light]`}
      >
        {children}
      </select>
      {error && <span className="text-xs font-semibold text-rose-600">{error}</span>}
    </label>
  );
}
