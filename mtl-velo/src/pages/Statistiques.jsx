import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import MapModal from '../components/MapModal';
import PassagesModal from '../components/PassagesModal';
import TerritoiresMap from '../components/TerritoiresMap';
import Pagination from '../components/Pagination';


const PAGE_SIZE = 20;
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
/*const openMap = (lat, lng) => {
  window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=17`, '_blank', 'noopener,noreferrer');
};*/


const Statistiques = () => {
  // T2.1 : Chargement des compteurs
  const { data: compteursData, loading: loadingCSV, error: errorCSV } = useCSV('/data/compteurs.csv');
  // L'option header: false lit le fichier même sans ligne de titre
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [geoJson, setGeoJson] = useState(null);
  const [errorGeoJson, setErrorGeoJson] = useState(null);
  const [search, setSearch] = useState('');
  const [arrondissement, setArrondissement] = useState('');
  const [carteId, setCarteId] = useState(null);
  const [compteurPassages, setCompteurPassages] = useState(null);
  const [page, setPage] = useState(1);

  // Chargement asynchrone des frontières géographiques
  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(response => {
        if (!response.ok) throw new Error("Réseau: " + response.statusText);
        return response.json();
      })
      .then(data => setGeoJson(data))
      .catch(err => {
        console.error("Erreur GeoJSON", err);
        setErrorGeoJson(err);
      });
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

  // Calcule le nombre de pages et extrait seulement les compteurs de la page actuelle
const totalPages = Math.ceil(sortedData.length / PAGE_SIZE);
const pagedData = sortedData.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

// Revient à la page 1 quand on change un filtre (sinon on peut se retrouver sur une page
// qui n'existe plus)
const handleSearchChange = (valeur) => {
  setSearch(valeur);
  setPage(1);
};
const handleArrondissementChange = (valeur) => {
  setArrondissement(valeur);
  setPage(1);
};

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
          //onClick={() => openMap(row.Latitude, row.Longitude)}
          onClick={() => setCarteId(row.ID)}
          className="px-3 py-1 text-xs font-medium rounded bg-mtl-primaire text-white hover:bg-green-800 transition-colors"
          title="Voir sur OpenStreetMap"
        >
          Carte
        </button>
      ) : <span className="text-mtl-texte/50 text-xs italic">N/A</span>
    },
    {
  key: '_passages',
  label: 'Passages',
  sortable: false,
  render: (row) => (
    <button
      onClick={() => setCompteurPassages(row)}
      className="px-3 py-1 text-xs font-medium rounded border border-mtl-primaire text-mtl-primaire hover:bg-mtl-primaire hover:text-white transition-colors"
      title="Voir les passages"
    >
      Passages
    </button>
  )
}
  ];

  // T1.4 : Menu des filtres
  const filters = (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <label htmlFor="search-input" className="text-sm font-medium text-mtl-texte">Recherche par nom</label>
        <input 
          id="search-input"
          type="text" 
          className="w-full border border-mtl-texte/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white" 
          placeholder="Ex: Rachel / Papineau"
          value={search} 
          onChange={(e) => handleSearchChange(e.target.value)}
        />
      </div>
      
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

  // On attend que les deux sources de données soient prêtes (ou qu'une erreur survienne)
  const isLoading = loadingCSV || (!geoJson && !errorGeoJson);
  const hasError = errorCSV || errorGeoJson;

  return (
    <PageLayout title="Compteurs vélo" itemTotal={sortedData.length} filters={filters}>
      {hasError ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données des compteurs ou des territoires. Veuillez vérifier votre connexion.</span>
        </div>
      ) : isLoading ? (
        <p className="text-mtl-texte/70 animate-pulse" role="status" aria-live="polite">
          Analyse géographique en cours...
        </p> 
      ) : (
        <>
    {/* Carte cliquable des arrondissements, synchronisée avec le menu déroulant */}
    <TerritoiresMap geoJsonData={geoJson} selected={arrondissement} onSelect={handleArrondissementChange} />
        <DataTable 
          columns={columns} 
          data={pagedData} 
          requestSort={requestSort} 
          sortConfig={sortConfig} 
          emptyMessage="Aucun compteur trouvé." 
        />
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </>
      )}
      {carteId && (
  <MapModal
    title="Carte des compteurs"
    points={compteursEnrichis
      .filter(c => c.Latitude && c.Longitude)
      .map(c => ({ id: c.ID, lat: parseFloat(c.Latitude), lng: parseFloat(c.Longitude), label: c.Nom }))}
    highlightId={carteId}
    onClose={() => setCarteId(null)}
  />
)}

{compteurPassages && (
  <PassagesModal
    compteur={compteurPassages}
    onClose={() => setCompteurPassages(null)}
  />
)}
    </PageLayout>
  );
};

export default Statistiques;