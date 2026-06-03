const DataTable = ({ columns, data, requestSort, sortConfig, emptyMessage }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse min-w-max">
        <thead>
          <tr className="bg-slate-100 border-b-2 border-slate-200">
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-3 cursor-pointer hover:bg-slate-200 select-none font-semibold text-slate-700"
                onClick={() => col.sortable !== false && requestSort(col.key)}
              >
                {col.label} {sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? '↑' : '↓') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, idx) => (
              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="p-3 text-slate-600">
                    {/* Permet un rendu personnalisé (ex: badges) sinon affiche le texte brut */}
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="p-4 text-center text-slate-500">
                {emptyMessage || "Aucune donnée."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;