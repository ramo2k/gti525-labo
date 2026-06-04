import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';


const ReseauCyclable = () => {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/data/reseau_cyclable.geojson')
      .then(res => res.json())
      .then(data => { setGeoJson(data); setLoading(false); })
      .catch(err => { console.error(err); setLoading(false); });
  }, []);

  // Calcul des stats : nombre de pistes et longueur totale
  const stats = useMemo(() => {
    if (!geoJson) return null;
    const features = geoJson.features ?? [];
    const totalPistes = features.length;
    const totalKm = features.reduce((sum, f) => sum + (f.properties.LONGUEUR || 0), 0) / 1000;
    return { totalPistes, totalKm: totalKm.toFixed(1) };
  }, [geoJson]);

  return (
    <PageLayout title="Réseau cyclable">
      {loading ? (
        <p className="text-slate-500 animate-pulse">Chargement du réseau cyclable...</p>
      ) : (
        <>
          {/* Bandeau de statistiques */}
          {stats && (
            <div className="flex gap-4 mb-6">
              <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-mtl-primaire">{stats.totalPistes.toLocaleString('fr-CA')}</p>
                <p className="text-sm text-slate-500 mt-1">Pistes cyclables</p>
              </div>
              <div className="flex-1 bg-white rounded-lg border border-slate-200 p-4 text-center shadow-sm">
                <p className="text-3xl font-bold text-mtl-primaire">{Number(stats.totalKm).toLocaleString('fr-CA')} km</p>
                <p className="text-sm text-slate-500 mt-1">Longueur totale</p>
              </div>
            </div>
          )}

          {/* Reste du contenu existant de la page ici */}
        </>
      )}
    </PageLayout>
  );
};

export default ReseauCyclable;
