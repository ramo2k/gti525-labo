import { useState, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const Statistiques = () => {
  const { data, loading } = useCSV('/data/compteurs.csv');
  const [search, setSearch] = useState('');

  // T2.2 : Filtre de recherche dynamique
  const filteredData = useMemo(() => {
    if (!search) return data;
    return data.filter(item => item.Nom?.toLowerCase().includes(search.toLowerCase()));
  }, [data, search]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  const columns = [
    { key: 'ID', label: 'ID' },
    { key: 'Nom', label: 'Nom' },
    { 
      key: 'Statut', 
      label: 'Statut',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${row.Statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          {row.Statut}
        </span>
      )
    },
    { key: 'Annee_implante', label: 'Année' }
  ];

  const searchFilter = (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher par nom...</label>
      <input
        type="text"
        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mtl-primaire"
        placeholder="Ex: Rachel / Papineau"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
    </div>
  );

  return (
    <PageLayout title="Compteurs vélo" itemTotal={sortedData.length} filters={searchFilter}>
      {loading ? <p className="text-slate-500">Chargement des données...</p> : (
        <DataTable columns={columns} data={sortedData} requestSort={requestSort} sortConfig={sortConfig} emptyMessage="Aucun compteur trouvé." />
      )}
    </PageLayout>
  );
};

export default Statistiques;