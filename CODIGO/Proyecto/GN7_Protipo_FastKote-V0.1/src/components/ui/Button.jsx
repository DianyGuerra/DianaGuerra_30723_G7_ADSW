import { AppIcon } from "./AppIcon";

export function Button({ children, icon, variant = "primary", className = "", onClick, disabled = false }) {
  const variants = {
    primary: "bg-violet-700 text-white hover:bg-violet-800 shadow-sm",
    secondary: "bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
    whatsapp: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-md px-3.5 py-2 text-sm font-semibold transition disabled:pointer-events-none disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {icon && <AppIcon name={icon} />}
      <span>{children}</span>
    </button>
  );
}
