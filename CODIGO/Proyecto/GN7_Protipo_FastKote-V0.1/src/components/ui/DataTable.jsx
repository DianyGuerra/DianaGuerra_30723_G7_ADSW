export function DataTable({ headers, rows }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[1120px] text-left text-sm">
        <thead className="bg-slate-50 text-xs uppercase text-slate-500">
          <tr>{headers.map((header, index) => <th key={`${header}-${index}`} className="p-4">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex} className="align-top hover:bg-slate-50/70">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className={`p-4 ${cellIndex === 0 ? "font-semibold text-slate-900" : "text-slate-600"}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
