import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const isPointInPolygon = (point, polygon) => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const getArrondissement = (lat, lng, geojsonData) => {
  if (!geojsonData || !lat || !lng) return "Inconnu";
  const pt = [parseFloat(lng), parseFloat(lat)];

  for (const feature of geojsonData.features) {
    if (feature.geometry.type === 'Polygon') {
      if (isPointInPolygon(pt, feature.geometry.coordinates[0])) {
        return feature.properties.NOM;
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const poly of feature.geometry.coordinates) {
        if (isPointInPolygon(pt, poly[0])) {
          return feature.properties.NOM;
        }
      }
    }
  }
  return "Inconnu";
};

const Statistiques = () => {
  const { data: compteursData, loading: loadingCSV } = useCSV('/data/compteurs.csv');
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [geoJson, setGeoJson] = useState(null);
  const [search, setSearch] = useState('');
  const [arrondissement, setArrondissement] = useState('');

  // T2.5 : États de la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(response => response.json())
      .then(data => setGeoJson(data))
      .catch(error => console.error("Erreur de chargement du GeoJSON:", error));
  }, []);

  // T2.5 : Réinitialiser à la page 1 si on fait une recherche ou change de filtre
  useEffect(() => {
    setCurrentPage(1);
  }, [search, arrondissement]);

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  const compteursEnrichis = useMemo(() => {
    if (!compteursData.length || !geoJson) return compteursData;
    return compteursData.map(compteur => ({
      ...compteur,
      Arrondissement: getArrondissement(compteur.Latitude, compteur.Longitude, geoJson)
    }));
  }, [compteursData, geoJson]);

  const filteredData = useMemo(() => {
    let result = compteursEnrichis;
    
    if (search) {
      result = result.filter(item => item.Nom?.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    
    return result;
  }, [compteursEnrichis, search, arrondissement]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // T2.5 : Découpage des données selon la page active
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // T2.4 : Ajout de la colonne "Carte"
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
    { key: 'Annee_implante', label: "Année" },
    { key: 'Arrondissement', label: "Arrondissement" },
    {
      key: 'actions',
      label: 'Carte',
      sortable: false, // Empêche de trier sur la colonne des boutons
      render: (row) => {
        // Extraction des coordonnées pour générer le lien
        const lat = row.Latitude || row.latitude;
        const lon = row.Longitude || row.longitude;

        if (!lat || !lon) {
          return <span className="text-slate-400 text-xs italic">N/A</span>;
        }

        const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;

        return (
          <a 
            href={mapUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium rounded transition-colors duration-150"
          >
            Voir sur la carte
          </a>
        );
      }
    }
  ];

  const filters = (
    <>
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
    </>
  );

  const isLoading = loadingCSV || !geoJson;

  return (
    <PageLayout title="Compteurs vélo" itemTotal={sortedData.length} filters={filters}>
      {isLoading ? (
        <p className="text-slate-500 animate-pulse">Chargement et calcul des arrondissements en cours...</p>
      ) : (
        <>
          {/* T2.5 : On affiche paginatedData plutôt que sortedData */}
          <DataTable 
            columns={columns} 
            data={paginatedData} 
            requestSort={requestSort} 
            sortConfig={sortConfig} 
            emptyMessage="Aucun compteur trouvé." 
          />

          {/* T2.5 : Interface de pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="ml-3 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 rounded-l-md hover:bg-slate-50 disabled:opacity-50"
                    >
                      Début
                    </button>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 rounded-r-md hover:bg-slate-50 disabled:opacity-50"
                    >
                      Fin
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default Statistiques;