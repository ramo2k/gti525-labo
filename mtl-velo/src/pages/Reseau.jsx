import { useState, useEffect } from 'react';
import PageLayout from '../components/PageLayout';
import MapNetwork from '../components/MapNetwork';
import NetworkFilters from '../components/NetworkFilters';
import NetworkStatsPanel from '../components/NetworkStatsPanel';
import { useMapFilters } from '../hooks/useMapFilters';

const ReseauCyclable = () => {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
    filterFeature, 
    stats 
  } = useMapFilters(geoJson);

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
              filterFeature={filterFeature} 
              filterKey={`${selectedCategories.join('-')}-${saison4}`}
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