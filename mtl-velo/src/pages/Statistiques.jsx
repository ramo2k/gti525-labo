import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

// T2.3 : Algorithme Ray-Casting pour vérifier si un point GPS est dans un polygone
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

// T2.3 : Croise les coordonnées avec le fichier GeoJSON pour déduire l'arrondissement
const getArrondissement = (lat, lng, geojsonData) => {
  if (!geojsonData || !lat || !lng) return "Inconnu";
  const pt = [parseFloat(lng), parseFloat(lat)];

  for (const feature of geojsonData.features) {
    const geomType = feature.geometry.type;
    const coords = feature.geometry.coordinates;

    // Gère les polygones simples et les multipolygones selon le format GeoJSON
    if (geomType === 'Polygon' && isPointInPolygon(pt, coords[0])) {
      return feature.properties.NOM;
    } else if (geomType === 'MultiPolygon') {
      for (const poly of coords) {
        if (isPointInPolygon(pt, poly[0])) return feature.properties.NOM;
      }
    }
  }
  return "Inconnu";
};

// T2.4 : Ouvre OpenStreetMap dans un nouvel onglet avec un marqueur sur les coordonnées
const openMap = (lat, lng) => {
  window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`, '_blank');
};

const Statistiques = () => {
  // T2.1 : Chargement des compteurs
  const { data: compteursData, loading: loadingCSV } = useCSV('/data/compteurs.csv');
  // L'option header: false lit le fichier même sans ligne de titre
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [geoJson, setGeoJson] = useState(null);
  const [search, setSearch] = useState('');
  const [arrondissement, setArrondissement] = useState('');

  // Chargement asynchrone des frontières géographiques
  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(response => response.json())
      .then(data => setGeoJson(data));
  }, []);

  // Liste des arrondissements pour le menu déroulant
  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  // Ajoute virtuellement l'arrondissement calculé à chaque compteur
  const compteursEnrichis = useMemo(() => {
    if (!compteursData.length || !geoJson) return compteursData;
    
    return compteursData.map(compteur => ({
      ...compteur,
      Arrondissement: getArrondissement(compteur.Latitude, compteur.Longitude, geoJson)
    }));
  }, [compteursData, geoJson]);

  // Applique la recherche textuelle et le filtre géographique
  const filteredData = useMemo(() => {
    let result = compteursEnrichis;
    
    // T2.2 : Filtre sur le nom
    if (search) {
      result = result.filter(item => item.Nom?.toLowerCase().includes(search.toLowerCase()));
    }
    
    // T2.3 : Filtre sur l'arrondissement
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    return result;
  }, [compteursEnrichis, search, arrondissement]);

  // Gère le tri des colonnes
  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // T2.1 : Définition des colonnes obligatoires pour les compteurs
  const columns = [
    { key: 'ID', label: 'ID' },
    { key: 'Nom', label: 'Nom' },
    { 
      key: 'Statut', 
      label: 'Statut', 
      // Affiche le statut avec un badge parfaitement centré
      render: (row) => (
        <span className={`block w-fit mx-auto px-3 py-1 text-center text-xs rounded-full font-bold ${
          row.Statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {row.Statut}
        </span>
      ) 
    },
    { key: 'Annee_implante', label: "Année" },
    { key: 'Arrondissement', label: "Arrondissement" },
    {
      key: '_carte',
      label: 'Carte',
      sortable: false,
      // T2.4 : Affiche le bouton seulement si on a les coordonnées GPS
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

  // T1.4 : Menu des filtres
  const filters = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Recherche par nom</label>
        <input 
          type="text" 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white" 
          placeholder="Ex: Rachel / Papineau"
          value={search} 
          onChange={(e) => setSearch(e.target.value)} 
        />
      </div>
      
      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-slate-700">Arrondissement</label>
        <select 
          className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white" 
          value={arrondissement} 
          onChange={(e) => setArrondissement(e.target.value)}
        >
          <option value="">Tous les arrondissements</option>
          {territoires.map((terr, idx) => (
            <option key={idx} value={terr}>{terr}</option>
          ))}
        </select>
      </div>
    </div>
  );

  // On attend que les deux sources de données soient prêtes
  const isLoading = loadingCSV || !geoJson;

  return (
    <PageLayout title="Compteurs vélo" itemTotal={sortedData.length} filters={filters}>
      {/* Message d'attente pendant l'analyse mathématique des coordonnées */}
      {isLoading ? <p className="text-slate-500 animate-pulse">Analyse géographique en cours...</p> : (
        <DataTable 
          columns={columns} 
          data={sortedData} 
          requestSort={requestSort} 
          sortConfig={sortConfig} 
          emptyMessage="Aucun compteur trouvé." 
        />
      )}
    </PageLayout>
  );
};

export default Statistiques;