import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PageLayout from '../components/PageLayout';
import MapNetwork from '../components/MapNetwork';
import NetworkFilters from '../components/NetworkFilters';
import NetworkStatsPanel from '../components/NetworkStatsPanel';
import { useCSV } from '../hooks/useCSV';
import { useMapFilters } from '../hooks/useMapFilters';

const ReseauCyclable = () => {
  const [geoJson, setGeoJson] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapDataVersion, setMapDataVersion] = useState(0); // Nouveau state pour forcer Leaflet à se mettre à jour
  
  const dateFinRef = useRef(null); // Référence pour l'input de date de fin

  // Carte + liste des arrondissements pour le nouveau filtre
  const [territoiresGeoJson, setTerritoiresGeoJson] = useState(null);
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false });
  const [arrondissement, setArrondissement] = useState('');

  // Nouveaux états pour le filtre de popularité (T5.4)
  const [populaireDebut, setPopulaireDebut] = useState('');
  const [populaireFin, setPopulaireFin] = useState('');
  const [filterError, setFilterError] = useState(null);
  const [filterSuccess, setFilterSuccess] = useState(null);

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(res => res.json())
      .then(data => setTerritoiresGeoJson(data));
  }, []);

  // Fonction pour charger le réseau cyclable depuis l'API, avec ou sans filtre de popularité
  const fetchReseau = async (debut, fin) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/gti525/v1/pistes', window.location.origin);
      if (debut && fin) {
        url.searchParams.append('populaireDebut', debut);
        url.searchParams.append('populaireFin', fin);
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error("Réseau: " + res.statusText);
      
      const data = await res.json();
      
      // Si l'API retourne un tableau vide pour les features, on le garde tel quel
      // pour que la carte se vide (aucun arrondissement populaire trouvé)
      setGeoJson(data);
      setMapDataVersion(v => v + 1); // Indique à Leaflet que les données ont changé

      if (debut && fin) {
        setFilterSuccess(`Résultats mis à jour pour la période du ${debut} au ${fin}.`);
      } else {
        setFilterSuccess(null); // Pas de message de succès quand on réinitialise
      }
    } catch (err) {
      console.error(err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  // Chargement initial unique (sans filtres de popularité)
  useEffect(() => {
    fetchReseau('', '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFilterPopularity = (e) => {
    e.preventDefault();
    setFilterError(null);
    setFilterSuccess(null);
    if (!populaireDebut || !populaireFin) {
      setFilterError("Veuillez sélectionner une date de début ET une date de fin pour filtrer.");
      return;
    }
    fetchReseau(populaireDebut, populaireFin);
  };

  const handleResetPopularity = () => {
    setFilterError(null);
    setFilterSuccess(null);
    setPopulaireDebut('');
    setPopulaireFin('');
    fetchReseau('', ''); 
  };

  // Utilisation du hook personnalisé pour la logique métier des catégories
  const { 
    selectedCategories, 
    toggleCategory, 
    saison4, 
    setSaison4, 
    filterFeature 
  } = useMapFilters(geoJson);

  const filterFeatureFinal = (feature) => {
    if (!filterFeature(feature)) return false;
    if (!arrondissement) return true;
    return feature.properties.arrondissement === arrondissement;
  };

  const stats = useMemo(() => {
    if (!geoJson) return { totalSegments: 0, totalLengthKm: 0 };
    let totalLengthMeters = 0;
    let totalSegments = 0;
    geoJson.features.forEach((f) => {
      if (filterFeatureFinal(f)) {
        totalSegments++;
        totalLengthMeters += (f.properties.longueur || 0); // L'API renvoie des minuscules pour les props
      }
    });
    return {
      totalSegments,
      totalLengthKm: (totalLengthMeters / 1000).toLocaleString('fr-CA', {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      })
    };
  }, [geoJson, filterFeature, arrondissement]);

  return (
    <PageLayout title="Réseau cyclable">
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données du réseau cyclable via l'API.</span>
        </div>
      ) : (
        <div className="flex flex-col">
          {/* Menu déroulant pour filtrer par arrondissement */}
          <div className="bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 mb-6">
            <h3 className="font-bold text-mtl-primaire mb-4">Filtrage Géographique</h3>
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

          {/* T5.4 : Filtre de popularité par date */}
          <div className="bg-white rounded-xl shadow-sm border border-mtl-texte/20 p-6 mb-6">
            <h3 className="font-bold text-mtl-primaire mb-4">Top 3 des arrondissements populaires</h3>
            <p className="text-sm text-mtl-texte/80 mb-4">
              Sélectionnez une plage de dates pour n'afficher que les pistes cyclables des 3 arrondissements les plus achalandés (selon la moyenne de passages par compteur).
            </p>

            {filterError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm font-medium">
                ❌ {filterError}
              </div>
            )}
            {filterSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded text-sm font-medium transition-all">
                ✅ {filterSuccess}
              </div>
            )}

            <form onSubmit={handleFilterPopularity} className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col">
                <label className="text-sm font-medium text-mtl-texte mb-1">Date de début</label>
                <input
                  type="date"
                  value={populaireDebut}
                  onChange={(e) => {
                    setPopulaireDebut(e.target.value);
                    if (e.target.value && dateFinRef.current) {
                      try {
                        // Ouvre automatiquement le calendrier suivant (supporté sur navigateurs récents)
                        setTimeout(() => dateFinRef.current.showPicker(), 50);
                      } catch (err) {
                        console.warn("showPicker non supporté par ce navigateur");
                      }
                    }
                  }}
                  className="border border-mtl-texte/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
                />
              </div>
              <div className="flex flex-col">
                <label className="text-sm font-medium text-mtl-texte mb-1">Date de fin</label>
                <input
                  type="date"
                  ref={dateFinRef}
                  value={populaireFin}
                  onChange={(e) => setPopulaireFin(e.target.value)}
                  className="border border-mtl-texte/30 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
                />
              </div>
              <div className="flex gap-2 mt-2 md:mt-0">
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded text-white font-medium ${loading ? 'bg-mtl-primaire/50' : 'bg-mtl-primaire hover:bg-mtl-survol'} transition-colors`}
                >
                  {loading ? 'Chargement...' : 'Filtrer les pistes'}
                </button>
                {(populaireDebut || populaireFin) && (
                  <button
                    type="button"
                    onClick={handleResetPopularity}
                    className="px-4 py-2 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition-colors font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
            </form>
          </div>

          <NetworkFilters 
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            saison4={saison4}
            setSaison4={setSaison4}
          />

          {loading && !geoJson ? (
            <p className="text-mtl-texte/70 animate-pulse mt-4">Chargement de la carte...</p>
          ) : geoJson ? (
            <>
              <MapNetwork 
                geoJsonData={geoJson} 
                filterFeature={filterFeatureFinal} 
                filterKey={`${selectedCategories.join('-')}-${saison4}-${arrondissement}-${mapDataVersion}`}
                territoiresGeoJson={territoiresGeoJson}
                arrondissement={arrondissement}
                onSelectArrondissement={setArrondissement}
              />
              <NetworkStatsPanel stats={stats} />
            </>
          ) : null}
        </div>
      )}
    </PageLayout>
  );
};

export default ReseauCyclable;