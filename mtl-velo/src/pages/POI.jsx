import { useState, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const PAGE_SIZE = 20; // Limite d'affichage par page

// Ouvre OpenStreetMap à la position donnée
const openMap = (lat, lng) => {
  window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`, '_blank');
};

const POI = () => {
  const { data, loading } = useCSV('/data/poi.csv'); 
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [arrondissement, setArrondissement] = useState('');
  const [page, setPage] = useState(1); // Page courante

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  const filteredData = useMemo(() => {
    let result = data;
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    return result;
  }, [data, arrondissement]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // Pagination : tranche de PAGE_SIZE éléments
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const pagedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Réinitialiser la page lors d'un changement de filtre
  const handleArrondissementChange = (e) => {
    setArrondissement(e.target.value);
    setPage(1);
  };

  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type',
      render: () => <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">Fontaine</span>
    },
    { key: 'Nom_parc_lieu', label: 'Nom du lieu' },
    { key: 'Intersection', label: 'Adresse' },
    // Bouton carte — utilise Latitude/Longitude si dispo, sinon masqué
    {
      key: '_carte',
      label: 'Carte',
      render: (row) => row.Latitude && row.Longitude ? (
        <button
          onClick={() => openMap(row.Latitude, row.Longitude)}
          className="px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-700"
          title="Voir sur OpenStreetMap"
        >
          📍 Carte
        </button>
      ) : null
    }
  ];

  const filters = (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">Arrondissement</label>
      <select
        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
        value={arrondissement}
        onChange={handleArrondissementChange}
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
        <>
          <DataTable
            columns={columns}
            data={pagedData} // On passe seulement la page courante
            requestSort={requestSort}
            sortConfig={sortConfig}
            emptyMessage="Aucun point d'intérêt trouvé pour cet arrondissement."
          />

          {/* Contrôles de pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 text-sm text-slate-600">
              <span>Page {page} / {totalPages}</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                >
                  ← Précédent
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 rounded border border-slate-300 disabled:opacity-40 hover:bg-slate-100"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default POI;
