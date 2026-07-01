import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';

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

  // T2.6 : Calcul des statistiques du réseau
  const stats = useMemo(() => {
    if (!geoJson) return null;
    
    const features = geoJson.features ?? [];
    const totalPistes = features.length;
    
    // Fait la somme des longueurs (en mètres) puis divise par 1000 pour les kilomètres
    const totalKm = features.reduce((sum, f) => sum + (f.properties.LONGUEUR || 0), 0) / 1000;
    
    return { totalPistes, totalKm: totalKm.toFixed(1) };
  }, [geoJson]);

  return (
    <PageLayout title="Réseau cyclable">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données du réseau cyclable.</span>
        </div>
      ) : loading ? (
        <p className="text-mtl-texte/70 animate-pulse">Chargement du réseau cyclable...</p>
      ) : (
        // Affiche les cartes de statistiques si les données sont prêtes
        stats && (
          <div className="flex flex-col md:flex-row gap-6 mb-8">
            {/* Carte du nombre de segments */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">🚴‍♂️</div>
              <p className="text-3xl font-extrabold text-mtl-primaire mb-1">{stats.totalPistes.toLocaleString('fr-CA')}</p>
              <p className="text-sm font-medium text-mtl-texte/70 uppercase tracking-wider">
                Segments de pistes
              </p>
            </div>
            
            {/* Carte de la longueur totale */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 text-center hover:shadow-md transition-shadow">
              <div className="text-4xl mb-2">📏</div>
              <p className="text-3xl font-extrabold text-mtl-primaire mb-1">{stats.totalKm} km</p>
              <p className="text-sm font-medium text-mtl-texte/70 uppercase tracking-wider">
                Longueur du réseau
              </p>
            </div>
          </div>
        )
      )}
    </PageLayout>
  );
};

export default ReseauCyclable;