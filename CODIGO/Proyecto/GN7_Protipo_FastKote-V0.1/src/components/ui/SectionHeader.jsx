export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">{eyebrow}</p>
        <h2 className="mt-1 text-2xl font-bold text-slate-950">{title}</h2>
        <p className="mt-1 max-w-4xl text-sm text-slate-600">{description}</p>
      </div>
      {action}
    </div>
  );
}
