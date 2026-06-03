import { useState, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const POI = () => {
  const { data, loading } = useCSV('/data/poi.csv'); 
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [arrondissement, setArrondissement] = useState('');

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  // T2.3 : Filtre par arrondissement réel (cette colonne existe bien dans poi.csv)
  const filteredData = useMemo(() => {
    let result = data;
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    return result;
  }, [data, arrondissement]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // Exactement les 4 colonnes demandées pour les Points d'intérêt
  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type',
      render: () => <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">Fontaine</span>
    },
    { key: 'Nom_parc_lieu', label: 'Nom du lieu' },
    { key: 'Intersection', label: 'Adresse' }
  ];

  const filters = (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">Arrondissement</label>
      <select
        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
        value={arrondissement}
        onChange={(e) => setArrondissement(e.target.value)}
      >
        <option value="">Tous les arrondissements</option>
        {territoires.map((terr, idx) => (
          <option key={idx} value={terr}>{terr}</option>
        ))}
      </select>
    </div>
  );

  return (
    <PageLayout title="Points d'intérêt" itemTotal={sortedData.length} filters={filters}>
      {loading ? <p className="text-slate-500">Chargement des données...</p> : (
        <DataTable columns={columns} data={sortedData} requestSort={requestSort} sortConfig={sortConfig} emptyMessage="Aucun point d'intérêt trouvé pour cet arrondissement." />
      )}
    </PageLayout>
  );
};

export default POI;
