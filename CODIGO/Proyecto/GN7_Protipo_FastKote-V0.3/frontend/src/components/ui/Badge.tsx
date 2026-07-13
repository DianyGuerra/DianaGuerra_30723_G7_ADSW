const translations: Record<string, string> = {
  ACTIVE: 'Activo',
  INACTIVE: 'Inactivo',
  DRAFT: 'Borrador',
  SENT: 'Enviada',
  ACCEPTED: 'Aceptada',
  REJECTED: 'Rechazada',
  EXPIRED: 'Vencida',
  BLOCKED: 'Bloqueada',
  RELEASED: 'Liberada',
  COMPLETED: 'Completada',
};

export function Badge({ value }: { value: string }) {
  const className = value === 'ACTIVE' || value === 'ACCEPTED' || value === 'BLOCKED' || value === 'COMPLETED' ? 'badge success' : value === 'DRAFT' || value === 'SENT' ? 'badge warning' : 'badge danger';
  return <span className={className}>{translations[value] || value}</span>;
}
