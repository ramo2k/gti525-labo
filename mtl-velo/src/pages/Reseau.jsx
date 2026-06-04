import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';

// Calcule la distance en km entre deux points GPS (formule de Haversine)
const haversineKm = (coord1, coord2) => {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(coord2[1] - coord1[1]);
  const dLon = toRad(coord2[0] - coord1[0]);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(coord1[1])) * Math.cos(toRad(coord2[1])) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// Calcule la longueur en km d'une LineString ou MultiLineString
const lineLength = (geometry) => {
  if (geometry.type === 'LineString') {
    return geometry.coordinates.reduce((sum, coord, i, arr) =>
      i === 0 ? 0 : sum + haversineKm(arr[i - 1], coord), 0);
  }
  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.reduce((total, line) =>
      total + line.reduce((sum, coord, i, arr) =>
        i === 0 ? 0 : sum + haversineKm(arr[i - 1], coord), 0), 0);
  }
  return 0;
};

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
    const totalKm = features.reduce((sum, f) => sum + lineLength(f.geometry), 0);
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
