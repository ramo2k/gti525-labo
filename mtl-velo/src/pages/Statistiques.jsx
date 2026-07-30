import { useState, useEffect, useMemo, useCallback } from 'react';
import { useArrondissements } from '../utils/useArrondissements';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import MapModal from '../components/MapModal';
import PassagesModal from '../components/PassagesModal';
import TerritoiresMap from '../components/TerritoiresMap';
import Pagination from '../components/Pagination';

const PAGE_SIZE = 20;

const Statistiques = () => {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [geoJson, setGeoJson] = useState(null);
  const [search, setSearch] = useState('');
  const [arrondissement, setArrondissement] = useState('');
  const [carteId, setCarteId] = useState(null);
  const [compteurPassages, setCompteurPassages] = useState(null);
  const [page, setPage] = useState(1);

  // Lecture dynamique des territoires
  const { territoires } = useArrondissements();

  // Chargement asynchrone des frontières géographiques (pour la carte cliquable)
  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(response => {
        if (!response.ok) throw new Error("Réseau: " + response.statusText);
        return response.json();
      })
      .then(data => setGeoJson(data))
      .catch(err => {
        console.error("Erreur GeoJSON", err);
      });
  }, []);

  const fetchCompteurs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/gti525/v1/compteurs', window.location.origin);
      url.searchParams.append('page', page);
      url.searchParams.append('limite', PAGE_SIZE);
      if (search) {
        url.searchParams.append('nom', search);
      }
      if (arrondissement) {
        url.searchParams.append('arrondissement', arrondissement);
      }

      const res = await fetch(url);
      if (!res.ok) throw new Error('Erreur réseau');
      
      const json = await res.json();
      setData(json.donnees || []);
      setTotal(json.total || 0);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, arrondissement]);

  useEffect(() => {
    fetchCompteurs();
  }, [fetchCompteurs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleSearchChange = (valeur) => {
    setSearch(valeur);
    setPage(1);
  };

  const handleArrondissementChange = (valeur) => {
    setArrondissement(valeur);
    setPage(1);
  };

  const columns = [
    { key: 'ID', label: 'ID', sortable: false },
    { key: 'Nom', label: 'Nom', sortable: false },
    { 
      key: 'Statut', 
      label: 'Statut', 
      sortable: false,
      render: (row) => (
        <span className={`block w-fit mx-auto px-3 py-1 text-center text-xs rounded-full font-bold ${
          row.Statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
        }`}>
          {row.Statut}
        </span>
      ) 
    },
    { key: 'Annee_implante', label: "Année", sortable: false },
    { key: 'Arrondissement', label: "Arrondissement", sortable: false },
    {
      key: '_carte',
      label: 'Carte',
      sortable: false,
      render: (row) => row.Latitude && row.Longitude ? (
        <button
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

  return (
    <PageLayout title="Compteurs vélo" itemTotal={total} filters={filters}>
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données des compteurs via l'API.</span>
        </div>
      ) : loading ? (
        <p className="text-mtl-texte/70 animate-pulse" role="status" aria-live="polite">
          Chargement des données de compteurs via API...
        </p> 
      ) : (
        <>
          <TerritoiresMap geoJsonData={geoJson} selected={arrondissement} onSelect={handleArrondissementChange} />
          
          <DataTable 
            columns={columns} 
            data={data} 
            requestSort={() => {}} 
            sortConfig={null} 
            emptyMessage="Aucun compteur trouvé." 
          />
          
          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {carteId && (
        <MapModal
          title="Carte des compteurs"
          points={data
            .filter(c => c.ID === carteId)
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