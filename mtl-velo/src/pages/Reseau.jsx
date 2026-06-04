import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';

const ReseauCyclable = () => {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement asynchrone du fichier GeoJSON
  useEffect(() => {
    fetch('/data/reseau_cyclable.geojson')
      .then(res => res.json())
      .then(data => { setGeoJson(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
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
      {loading ? (
        <p className="text-slate-500 animate-pulse">Chargement du réseau cyclable...</p>
      ) : (
        // Affiche les cartes de statistiques si les données sont prêtes
        stats && (
          <div className="flex flex-col sm:flex-row gap-6 mb-8">
            
            {/* Carte de statistique : Nombre de pistes */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow">
              <p className="text-4xl font-extrabold text-mtl-primaire mb-2">
                {stats.totalPistes.toLocaleString('fr-CA')}
              </p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Pistes cyclables
              </p>
            </div>
            
            {/* Carte de statistique : Longueur totale */}
            <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6 text-center hover:shadow-md transition-shadow">
              <p className="text-4xl font-extrabold text-mtl-primaire mb-2">
                {Number(stats.totalKm).toLocaleString('fr-CA')} km
              </p>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wider">
                Longueur totale
              </p>
            </div>
            
          </div>
        )
      )}
    </PageLayout>
  );
};

export default ReseauCyclable;