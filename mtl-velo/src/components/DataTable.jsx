/**
 * Composant de tableau de données (T2.1)
 * @param {Array} columns - Configuration des colonnes (ex: [{ key: 'ID', label: 'ID' }])
 * @param {Array} data - Les données à afficher (ex: [{ ID: 1, Nom: 'Test' }])
 * @param {Function} requestSort - Fonction appelée au clic pour trier (ex: requestSort('Nom'))
 * @param {Object} sortConfig - État actuel du tri pour la flèche (ex: { key: 'Nom', direction: 'asc' })
 * @param {String} emptyMessage - Message si le tableau est vide (ex: "Aucun résultat.")
 */
const DataTable = ({ columns, data, requestSort, sortConfig, emptyMessage }) => {
  return (
    <div className="overflow-x-auto rounded-lg border border-mtl-texte/20 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b-2 border-mtl-texte/20 bg-mtl-fond">
            {columns.map((col) => (
              <th
                key={col.key}
                // Empêche la flèche de tri de sauter sur une nouvelle ligne avec whitespace-nowrap
                className="p-3 text-mtl-texte whitespace-nowrap transition-colors"
              >
                {col.sortable !== false ? (
                  <button
                    type="button"
                    className="flex items-center w-full cursor-pointer select-none hover:text-mtl-primaire focus:outline-none"
                    onClick={() => requestSort(col.key)}
                    aria-sort={sortConfig?.key === col.key ? (sortConfig.direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                  >
                    {col.label} 
                    {/* Affiche la flèche dans le bon sens si la colonne est en cours de tri */}
                    {sortConfig?.key === col.key && (sortConfig.direction === 'asc' ? ' ↑' : ' ↓')}
                  </button>
                ) : (
                  col.label
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Vérifie s'il y a des données dans le tableau */}
          {data.length > 0 ? (
            
            // Cas Vrai : on boucle pour créer chaque ligne
            data.map((row, index) => (
              <tr key={index} className="border-b border-mtl-texte/10 hover:bg-mtl-fond transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className="p-3 text-mtl-texte/80">
                    {/* Affiche un rendu sur mesure s'il existe, sinon on affiche la donnée brute */}
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
            
          ) : (
            
            // Cas Faux : on affiche le message de tableau vide sur toute la largeur
            <tr>
              <td colSpan={columns.length} className="text-center p-8 text-mtl-texte/60 italic bg-mtl-fond">
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