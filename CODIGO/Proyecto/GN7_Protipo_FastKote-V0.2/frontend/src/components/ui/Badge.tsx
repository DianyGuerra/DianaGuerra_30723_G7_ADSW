export function Badge({ value }: { value: string }) {
  const className = value === 'ACTIVE' || value === 'ACCEPTED' || value === 'BLOCKED' ? 'badge success' : value === 'DRAFT' || value === 'SENT' ? 'badge warning' : 'badge danger';
  return <span className={className}>{value}</span>;
}
