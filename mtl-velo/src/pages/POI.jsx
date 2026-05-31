import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const POI = () => {
  // Assure-toi que le nom du fichier ici matche bien avec ce que tu as dans ton dossier public/data/
  const { data, loading } = useCSV('/data/poi.csv'); 
  const { items: sortedData, requestSort, sortConfig } = useSort(data);

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

  const placeholderFilter = (
    <p className="text-sm text-slate-500 italic">Le filtre par arrondissement sera ajouté ici plus tard (T2.3).</p>
  );

  return (
    <PageLayout title="Points d'intérêt" itemTotal={sortedData.length} filters={placeholderFilter}>
      {loading ? <p className="text-slate-500">Chargement des données...</p> : (
        <DataTable columns={columns} data={sortedData} requestSort={requestSort} sortConfig={sortConfig} emptyMessage="Aucun point d'intérêt." />
      )}
    </PageLayout>
  );
};

export default POI;