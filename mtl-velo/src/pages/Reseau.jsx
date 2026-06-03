import { useState, useEffect, useMemo } from 'react';
import PageLayout from '../components/PageLayout';

const Reseau = () => {
  const [geojsonData, setGeojsonData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Chargement du fichier GeoJSON statique
  useEffect(() => {
    fetch('/data/reseau_cyclable.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error("Impossible de charger les données géographiques");
        }
        return response.json();
      })
      .then((data) => {
        setGeojsonData(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur d'acquisition du réseau cyclable:", error);
        setLoading(false);
      });
  }, []);

  // T2.6 : Analyse et calculs mathématiques à partir du contenu GeoJSON
  const stats = useMemo(() => {
    if (!geojsonData || !geojsonData.features) {
      return { totalPistes: 0, longueurTotaleKm: '0.00' };
    }

    // Le nombre de pistes correspond au nombre d'objets géométriques (features)
    const totalPistes = geojsonData.features.length;

    // Calcul cumulé des distances
    const longueurCumuleeUniteOrigine = geojsonData.features.reduce((sum, feature) => {
      // NOTE : Repérez la clé exacte de distance dans les propriétés de votre geojson (souvent 'LONGUEUR' ou 'longueur')
      const longueurSegment = feature.properties?.LONGUEUR || feature.properties?.longueur || 0;
      return sum + Number(longueurSegment);
    }, 0);

    // Conversion : Les fichiers de la ville de Montréal expriment généralement les mesures en mètres.
    // Si votre fichier exprime déjà les données en kilomètres, retirez simplement la division par 1000.
    const longueurTotaleKm = (longueurCumuleeUniteOrigine / 1000).toFixed(2);

    return { totalPistes, longueurTotaleKm };
  }, [geojsonData]);

  return (
    <PageLayout title="Réseau cyclable">
      {loading ? (
        <p className="text-slate-500">Calcul et chargement des infrastructures de transport...</p>
      ) : (
        <div className="space-y-6">
          <p className="text-slate-600">
            Voici un aperçu global des infrastructures cyclables répertoriées sur le territoire de la Ville de Montréal.
          </p>
          
          {/* Grille d'affichage des statistiques clés */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-4">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Segments de pistes</h3>
              <p className="mt-2 text-5xl font-black text-slate-800">{stats.totalPistes}</p>
            </div>
            
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 shadow-sm text-center">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Longueur cumulée</h3>
              <p className="mt-2 text-5xl font-black text-slate-800">
                {stats.longueurTotaleKm} <span className="text-2xl font-bold text-slate-500">km</span>
              </p>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default Reseau;