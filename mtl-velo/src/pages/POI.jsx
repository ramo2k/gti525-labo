import { useState, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

// T2.5 : Nombre maximum de points d'intérêt à afficher par page
const PAGE_SIZE = 20;

// T2.4 : Ouvre OpenStreetMap dans un nouvel onglet avec un marqueur sur les coordonnées
const openMap = (lat, lng) => {
  window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`, '_blank');
};

const POI = () => {
  // T2.1 : Chargement des données CSV via notre hook personnalisé
  const { data, loading } = useCSV('/data/poi.csv'); 
  // L'option header: false indique que ce fichier n'a pas de ligne de titre
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [arrondissement, setArrondissement] = useState('');
  const [page, setPage] = useState(1); 

  // Extrait la liste des arrondissements et la trie par ordre alphabétique
  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  // T2.3 : Filtre dynamiquement les données selon le choix du menu déroulant
  const filteredData = useMemo(() => {
    let result = data;
    
    // Si un arrondissement est sélectionné, on ne garde que ses points d'intérêt
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    return result;
  }, [data, arrondissement]);

  // Hook personnalisé pour gérer le tri par colonne
  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // T2.5 : Calcule le nombre de pages et extrait uniquement les éléments de la page active
  const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
  const pagedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Ramène l'utilisateur à la première page s'il change le filtre pour éviter les bugs
  const handleArrondissementChange = (e) => {
    setArrondissement(e.target.value);
    setPage(1);
  };

  // T2.1 : Définition des colonnes obligatoires pour les points d'intérêt
  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type', 
      // Ajout d'un badge visuel pour le type
      render: () => <span className="px-3 py-1 text-xs rounded-full font-bold bg-blue-100 text-blue-800">Fontaine</span> 
    },
    { key: 'Nom_parc_lieu', label: 'Nom du lieu' },
    { key: 'Intersection', label: 'Adresse' },
    {
      key: '_carte',
      label: 'Carte',
      sortable: false, // Empêche le tri sur cette colonne
      // T2.4 : Affiche le bouton uniquement si les coordonnées GPS existent
      render: (row) => row.Latitude && row.Longitude ? (
        <button
          onClick={() => openMap(row.Latitude, row.Longitude)}
          className="px-3 py-1 text-xs font-medium rounded bg-mtl-primaire text-white hover:bg-mtl-survol transition-colors"
          title="Voir sur OpenStreetMap"
        >
          Carte
        </button>
      ) : <span className="text-slate-400 text-xs italic">N/A</span>
    }
  ];

  // T1.4 : Menu des filtres injecté dans le panneau latéral
  const filters = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Arrondissement</label>
        <select 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white" 
          value={arrondissement} 
          onChange={handleArrondissementChange}
        >
          <option value="">Tous les arrondissements</option>
          {territoires.map((terr, idx) => (
            <option key={idx} value={terr}>{terr}</option>
          ))}
        </select>
      </div>
    </div>
  );

  return (
    <PageLayout title="Points d'intérêt" itemTotal={sortedData.length} filters={filters}>
      {/* Affiche un indicateur pendant le chargement initial */}
      {loading ? <p className="text-slate-500 animate-pulse">Chargement des données...</p> : (
        <>
          <DataTable
            columns={columns}
            data={pagedData}
            requestSort={requestSort}
            sortConfig={sortConfig}
            emptyMessage="Aucun point d'intérêt."
          />

          {/* T2.5 : Affiche les boutons de pagination seulement s'il y a plus d'une page */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-200">
              <span className="text-sm font-medium text-slate-600">Page {page} sur {totalPages}</span>
              <div className="flex gap-2">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1} 
                  className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Précédent
                </button>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages} 
                  className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                >
                  Suivant
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