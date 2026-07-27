import { useState, useEffect, useMemo, useContext, useCallback } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';
import MapModal from '../components/MapModal';
import TerritoiresMap from '../components/TerritoiresMap';
import Pagination from '../components/Pagination';
import PoiModal from '../components/PoiModal';

const PAGE_SIZE = 20;

const POI = () => {
  const { isAuthenticated, token } = useContext(AuthContext);

  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null); // { type: 'success' | 'error', message: '' }

  const [carteId, setCarteId] = useState(null);
  const [arrondissement, setArrondissement] = useState('');
  const [page, setPage] = useState(1); 
  const [geoJson, setGeoJson] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [poiToEdit, setPoiToEdit] = useState(null);

  // Territoires pour le filtre (codé en dur ou via fetch)
  const territoires = useMemo(() => [
    "Ahuntsic-Cartierville", "Anjou", "Côte-des-Neiges-Notre-Dame-de-Grâce",
    "Lachine", "LaSalle", "Le Plateau-Mont-Royal", "Le Sud-Ouest",
    "L'Île-Bizard-Sainte-Geneviève", "Mercier-Hochelaga-Maisonneuve",
    "Montréal-Nord", "Outremont", "Pierrefonds-Roxboro",
    "Rivière-des-Prairies-Pointe-aux-Trembles", "Rosemont-La Petite-Patrie",
    "Saint-Laurent", "Saint-Léonard", "Verdun", "Ville-Marie", "Villeray-Saint-Michel-Parc-Extension"
  ], []);

  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(res => res.json())
      .then(data => setGeoJson(data));
  }, []);

  const fetchPOIs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL('/gti525/v1/pointsdinteret', window.location.origin);
      url.searchParams.append('page', page);
      url.searchParams.append('limite', PAGE_SIZE);
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
  }, [page, arrondissement]);

  useEffect(() => {
    fetchPOIs();
  }, [fetchPOIs]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleArrondissementChange = (valeur) => {
    setArrondissement(valeur);
    setPage(1);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce point d'intérêt ?")) return;
    
    setNotification(null);
    try {
      const res = await fetch(`/gti525/v1/pointsdinteret/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        setNotification({ type: 'success', message: "Le point d'intérêt a été supprimé avec succès." });
        fetchPOIs();
      } else {
        setNotification({ type: 'error', message: "Erreur lors de la suppression." });
      }
    } catch (err) {
      setNotification({ type: 'error', message: "Erreur réseau lors de la suppression." });
    }
  };

  const handleSavePoi = async (formData) => {
    const isEdit = !!poiToEdit;
    const url = isEdit ? `/gti525/v1/pointsdinteret/${poiToEdit.ID}` : `/gti525/v1/pointsdinteret`;
    const method = isEdit ? 'PUT' : 'POST';

    setNotification(null);
    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsModalOpen(false);
        setPoiToEdit(null);
        setNotification({ type: 'success', message: isEdit ? "Le point d'intérêt a été modifié avec succès." : "Le point d'intérêt a été ajouté avec succès." });
        fetchPOIs();
      } else {
        const errorData = await res.json();
        setNotification({ type: 'error', message: errorData.erreur || "Une erreur est survenue lors de la sauvegarde." });
      }
    } catch (err) {
      setNotification({ type: 'error', message: "Erreur réseau lors de la sauvegarde." });
    }
  };

  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type', 
      sortable: false,
      render: (row) => <span className="px-3 py-1 text-xs rounded-full font-bold bg-mtl-fond border border-mtl-texte/20 text-mtl-texte">{row.Type}</span> 
    },
    { key: 'Nom', label: 'Nom du lieu', sortable: false },
    { key: 'Intersection', label: 'Adresse', sortable: false },
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
    }
  ];

  if (isAuthenticated) {
    columns.push({
      key: '_actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <div className="flex space-x-2">
          <button 
            onClick={() => { setPoiToEdit(row); setIsModalOpen(true); }}
            className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition-colors"
          >
            Modifier
          </button>
          <button 
            onClick={() => handleDelete(row.ID)}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
          >
            Supprimer
          </button>
        </div>
      )
    });
  }

  const filters = (
    <div className="flex flex-col gap-4">
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
      
      {isAuthenticated && (
        <button
          onClick={() => { setPoiToEdit(null); setIsModalOpen(true); }}
          className="w-full mt-2 bg-mtl-primaire hover:bg-mtl-survol text-white font-bold py-2 px-4 rounded shadow transition-colors"
        >
          Ajouter un point d'intérêt
        </button>
      )}
    </div>
  );

  return (
    <PageLayout title="Points d'intérêt" itemTotal={total} filters={filters}>
      
      {/* Notification interne pour les succès et erreurs d'actions */}
      {notification && (
        <div className={`mb-4 px-4 py-3 rounded relative border ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'
        }`} role="alert">
          <span className="block sm:inline">{notification.message}</span>
          <button 
            className="absolute top-0 bottom-0 right-0 px-4 py-3" 
            onClick={() => setNotification(null)}
          >
            <span className="sr-only">Fermer</span>
            <svg className="fill-current h-6 w-6" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Fermer</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      )}

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Erreur de chargement ! </strong>
          <span className="block sm:inline">Impossible de récupérer les données des points d'intérêt via l'API.</span>
        </div>
      ) : loading ? <p className="text-mtl-texte/70 animate-pulse">Chargement des données via API...</p> : (
        <>
          <TerritoiresMap geoJsonData={geoJson} selected={arrondissement} onSelect={handleArrondissementChange} />
          
          <DataTable
            columns={columns}
            data={data}
            requestSort={() => {}} // Pas de tri local puisque la pagination est serveur
            sortConfig={null}
            emptyMessage="Aucun point d'intérêt."
          />

          {totalPages > 1 && (
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </>
      )}

      {carteId && (
        <MapModal
          title="Carte des points d'intérêt"
          points={data
            .filter(p => p.ID === carteId)
            .map(p => ({ id: p.ID, lat: parseFloat(p.Latitude), lng: parseFloat(p.Longitude), label: p.Nom }))}
          highlightId={carteId}
          onClose={() => setCarteId(null)}
        />
      )}

      <PoiModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleSavePoi}
        poiToEdit={poiToEdit}
      />
    </PageLayout>
  );
};

export default POI;