import { useState, useMemo, useEffect } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const POI = () => {
  const { data, loading } = useCSV('/data/poi.csv'); 
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [arrondissement, setArrondissement] = useState('');
  
  // T2.5 : États nécessaires pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  // Sécurité T2.5 : Si on change de filtre, on revient automatiquement à la page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [arrondissement]);

  // Filtre par arrondissement
  const filteredData = useMemo(() => {
    let result = data;
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    return result;
  }, [data, arrondissement]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  // T2.5 : Tronquer les données triées pour n'afficher que le segment de la page active
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  // Calcul du nombre total de pages nécessaires
  const totalPages = Math.ceil(sortedData.length / itemsPerPage);

  // T2.4 & T2.5 : Configuration des colonnes
  const columns = [
    { key: 'Arrondissement', label: 'Arrondissement' },
    { 
      key: 'Type', 
      label: 'Type',
      render: () => <span className="px-2 py-1 text-xs rounded-full font-medium bg-blue-100 text-blue-800">Fontaine</span>
    },
    { key: 'Nom_parc_lieu', label: 'Nom du lieu' },
    { key: 'Intersection', label: 'Adresse' },
    {
      key: 'actions',
      label: 'Carte',
      // T2.4 : On reçoit l'objet complet "item" de la ligne pour extraire ses coordonnées
      render: (item) => {
        // NOTE : Vérifiez bien la casse exacte des colonnes de coordonnées dans votre fichier poi.csv 
        // (Exemples fréquents : Latitude/Longitude, lat/lng, ou X/Y)
        const lat = item.Latitude || item.latitude;
        const lon = item.Longitude || item.longitude;

        if (!lat || !lon) {
          return <span className="text-slate-400 text-xs italic">Non disponible</span>;
        }

        // URL OpenStreetMap configurée avec un marqueur (mlat/mlon) et un niveau de zoom à 17
        const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
        
        // Alternative Google Maps (si vous préférez) :
        // const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

        return (
          <a 
            href={mapUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="inline-block px-3 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 text-xs font-medium rounded transition-colors duration-150"
          >
            Voir sur la carte
          </a>
        );
      }
    }
  ];

  const filters = (
    <div className="mb-4">
      <label className="block text-sm font-medium text-slate-700 mb-2">Arrondissement</label>
      <select
        className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mtl-primaire bg-white"
        value={arrondissement}
        onChange={(e) => setArrondissement(e.target.value)}
      >
        <option value="">Tous les arrondissements</option>
        {territoires.map((terr, idx) => (
          <option key={idx} value={terr}>{terr}</option>
        ))}
      </select>
    </div>
  );

  return (
    <PageLayout title="Points d'intérêt" itemTotal={sortedData.length} filters={filters}>
      {loading ? (
        <p className="text-slate-500">Chargement des données...</p>
      ) : (
        <>
          {/* T2.5 : On envoie les données paginées (20 max) au lieu du tableau complet */}
          <DataTable 
            columns={columns} 
            data={paginatedData} 
            requestSort={requestSort} 
            sortConfig={sortConfig} 
            emptyMessage="Aucun point d'intérêt trouvé pour cet arrondissement." 
          />

          {/* T2.5 : Interface utilisateur de la pagination (s'affiche uniquement si plusieurs pages) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 mt-4">
              <div className="flex flex-1 justify-between sm:hidden">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  className="px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Précédent
                </button>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  className="ml-3 px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50"
                >
                  Suivant
                </button>
              </div>
              <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-slate-700">
                    Page <span className="font-medium">{currentPage}</span> sur <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(1)}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 rounded-l-md hover:bg-slate-50 disabled:opacity-50"
                    >
                      Début
                    </button>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Précédent
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                    >
                      Suivant
                    </button>
                    <button
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(totalPages)}
                      className="px-3 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-500 rounded-r-md hover:bg-slate-50 disabled:opacity-50"
                    >
                      Fin
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
};

export default POI;