import { AppIcon } from "./AppIcon";

export function SearchBar({ placeholder = "Buscar...", value, onChange }) {
  return (
    <div className="relative w-full">
      <AppIcon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-violet-400 focus:ring-4 focus:ring-violet-100 [color-scheme:light]"
      />
    </div>
  );
}
