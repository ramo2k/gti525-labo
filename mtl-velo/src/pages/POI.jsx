import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import MapModal from '../components/MapModal';
import TerritoiresMap from '../components/TerritoiresMap';
import Pagination from '../components/Pagination';

// T2.5 : Nombre maximum de points d'intérêt à afficher par page
const PAGE_SIZE = 20;

// T2.4 : Ouvre OpenStreetMap dans un nouvel onglet avec un marqueur sur les coordonnées
/*const openMap = (lat, lng) => {
  window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`, '_blank', 'noopener,noreferrer');
};*/


const POI = () => {
  // T2.1 : Chargement des données CSV via notre hook personnalisé
  const [carteId, setCarteId] = useState(null);
  const { data, loading, error } = useCSV('/data/poi.csv'); 
  // L'option header: false indique que ce fichier n'a pas de ligne de titre
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [arrondissement, setArrondissement] = useState('');
  const [page, setPage] = useState(1); 
  const [geoJson, setGeoJson] = useState(null);
  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

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
  const handleArrondissementChange = (valeur) => {
  setArrondissement(valeur);
  setPage(1);
  };

  // T2.1 : Définition des colonnes obligatoires pour les points d'intérêt
  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type', 
      // Ajout d'un badge visuel pour le type
      render: () => <span className="px-3 py-1 text-xs rounded-full font-bold bg-mtl-fond border border-mtl-texte/20 text-mtl-texte">Fontaine</span> 
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
          onClick={() => setCarteId(row.ID)}
          className="px-3 py-1 text-xs font-medium rounded bg-mtl-primaire text-white hover:bg-green-800 transition-colors"
          title="Voir sur OpenStreetMap"
        >
          Carte
        </button>
      ) : <span className="text-mtl-texte/50 text-xs italic">N/A</span>
    }
  ];

  // T1.4 : Menu des filtres injecté dans le panneau latéral
  const filters = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="arrondissement-select" className="text-sm font-medium text-mtl-texte">Arrondissement</label>
        <select 
          id="arrondissement-select"
          className="w-full border border-mtl-texte/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white" 
          value={arrondissement} 
          onChange={(e) => handleArrondissementChange(e.target.value)}
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
      {/* Affiche un indicateur pendant le chargement initial ou une erreur */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données des points d'intérêt.</span>
        </div>
      ) : loading ? <p className="text-mtl-texte/70 animate-pulse">Chargement des données...</p> : (
        <>
        <TerritoiresMap geoJsonData={geoJson} selected={arrondissement} onSelect={handleArrondissementChange} />
          <DataTable
            columns={columns}
            data={pagedData}
            requestSort={requestSort}
            sortConfig={sortConfig}
            emptyMessage="Aucun point d'intérêt."
          />

          {/* T2.5 : Affiche les boutons de pagination seulement s'il y a plus d'une page */}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      {carteId && (
  <MapModal
    title="Carte des points d'intérêt"
    points={sortedData
      .filter(p => p.Latitude && p.Longitude)
      .map(p => ({ id: p.ID, lat: parseFloat(p.Latitude), lng: parseFloat(p.Longitude), label: p.Nom_parc_lieu }))}
    highlightId={carteId}
    onClose={() => setCarteId(null)}
  />
)}
    </PageLayout>
  );
};

export default POI;