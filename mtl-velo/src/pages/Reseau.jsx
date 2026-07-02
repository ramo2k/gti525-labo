import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';
import MapNetwork from '../components/MapNetwork';
import NetworkFilters from '../components/NetworkFilters';
import NetworkStatsPanel from '../components/NetworkStatsPanel';
import TerritoiresMap from '../components/TerritoiresMap';
import { useCSV } from '../hooks/useCSV';
import { useMapFilters } from '../hooks/useMapFilters';

// Algorithme Ray-Casting (même logique que dans Statistiques.jsx) pour savoir
// si un point GPS se trouve à l'intérieur d'un polygone d'arrondissement
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

// Retourne le nom de l'arrondissement contenant un point [lng, lat]
const getArrondissement = (lng, lat, territoiresGeoJson) => {
  if (!territoiresGeoJson) return "Inconnu";
  const pt = [lng, lat];
  for (const feature of territoiresGeoJson.features) {
    const coords = feature.geometry.coordinates;
    if (feature.geometry.type === 'Polygon' && isPointInPolygon(pt, coords[0])) {
      return feature.properties.NOM;
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const poly of coords) {
        if (isPointInPolygon(pt, poly[0])) return feature.properties.NOM;
      }
    }
  }
  return "Inconnu";
};

const ReseauCyclable = () => {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carte + liste des arrondissements pour le nouveau filtre
  const [territoiresGeoJson, setTerritoiresGeoJson] = useState(null);
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false });
  const [arrondissement, setArrondissement] = useState('');

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(res => res.json())
      .then(data => setTerritoiresGeoJson(data));
  }, []);

  // Chargement asynchrone du fichier GeoJSON
  useEffect(() => {
    fetch('/data/reseau_cyclable.geojson')
      .then(res => {
        if (!res.ok) throw new Error("Réseau: " + res.statusText);
        return res.json();
      })
      .then(data => { setGeoJson(data); setLoading(false); })
      .catch(err => { console.error(err); setError(err); setLoading(false); });
  }, []);

  // Utilisation du hook personnalisé pour la logique métier (T1.5, T1.3)
  const { 
    selectedCategories, 
    toggleCategory, 
    saison4, 
    setSaison4, 
    filterFeature 
  } = useMapFilters(geoJson);

  // Combine le filtre existant (catégorie/saison) avec le nouveau filtre par arrondissement.
  // On teste le premier point du tracé (une piste entière est dans un seul arrondissement en général).
  const filterFeatureFinal = (feature) => {
    if (!filterFeature(feature)) return false;
    if (!arrondissement) return true;
    const [lng, lat] = feature.geometry.coordinates[0];
    return getArrondissement(lng, lat, territoiresGeoJson) === arrondissement;
  };

  // Statistiques recalculées à partir du filtre final (incluant l'arrondissement)
  const stats = useMemo(() => {
    if (!geoJson) return { totalSegments: 0, totalLengthKm: 0 };
    let totalLengthMeters = 0;
    let totalSegments = 0;
    geoJson.features.forEach((f) => {
      if (filterFeatureFinal(f)) {
        totalSegments++;
        totalLengthMeters += (f.properties.LONGUEUR || 0);
      }
    });
    return {
      totalSegments,
      totalLengthKm: (totalLengthMeters / 1000).toLocaleString('fr-CA', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geoJson, filterFeature, arrondissement, territoiresGeoJson]);

  return (
    <PageLayout title="Réseau cyclable">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données du réseau cyclable.</span>
        </div>
      ) : loading ? (
        <p className="text-mtl-texte/70 animate-pulse" role="status" aria-live="polite">
          Chargement de la carte du réseau cyclable...
        </p>
      ) : (
        geoJson && (
  <div className="flex flex-col">
    {/* Nouveau : menu déroulant pour filtrer par arrondissement */}
    <div className="bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 mb-6">
      <label htmlFor="arrondissement-select" className="text-sm font-medium text-mtl-texte block mb-2">
        Arrondissement
      </label>
      <select
        id="arrondissement-select"
        className="w-full md:w-1/3 border border-mtl-texte/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
        value={arrondissement}
        onChange={(e) => setArrondissement(e.target.value)}
      >
        <option value="">Tous les arrondissements</option>
        {territoires.map((terr, idx) => (
          <option key={idx} value={terr}>{terr}</option>
        ))}
      </select>
    </div>

    {/* Nouveau : carte cliquable des arrondissements, synchronisée avec le menu déroulant */}
    <TerritoiresMap geoJsonData={territoiresGeoJson} selected={arrondissement} onSelect={setArrondissement} />

    {/* T1.5 : Contrôles de filtrage */}
    <NetworkFilters 
      selectedCategories={selectedCategories}
      toggleCategory={toggleCategory}
      saison4={saison4}
      setSaison4={setSaison4}
    />

    {/* T1.1, T1.2 : Carte interactive Leaflet */}
    <MapNetwork 
      geoJsonData={geoJson} 
      filterFeature={filterFeatureFinal} 
      filterKey={`${selectedCategories.join('-')}-${saison4}-${arrondissement}`}
    />

    {/* T1.3 : Panneau récapitulatif dynamique */}
    <NetworkStatsPanel stats={stats} />
  </div>
)
      )}
    </PageLayout>
  );
};

export default ReseauCyclable;