import { statusStyles } from "../../constants/statusStyles";

export function Badge({ children, variant = "Borrador" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusStyles[variant] || statusStyles.Borrador}`}>
      {children}
    </span>
  );
}
