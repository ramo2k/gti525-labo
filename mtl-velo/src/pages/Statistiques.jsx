import { useState, useEffect, useMemo } from 'react';
import { useCSV } from '../hooks/useCSV';
import { useSort } from '../hooks/useSort';
import PageLayout from '../components/PageLayout';
import DataTable from '../components/DataTable';

const isPointInPolygon = (point, polygon) => {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const getArrondissement = (lat, lng, geojsonData) => {
  if (!geojsonData || !lat || !lng) return "Inconnu";
  const pt = [parseFloat(lng), parseFloat(lat)];

  for (const feature of geojsonData.features) {
    if (feature.geometry.type === 'Polygon') {
      if (isPointInPolygon(pt, feature.geometry.coordinates[0])) {
        return feature.properties.NOM;
      }
    } else if (feature.geometry.type === 'MultiPolygon') {
      for (const poly of feature.geometry.coordinates) {
        if (isPointInPolygon(pt, poly[0])) {
          return feature.properties.NOM;
        }
      }
    }
  }
  return "Inconnu";
};

const Statistiques = () => {
  const { data: compteursData, loading: loadingCSV } = useCSV('/data/compteurs.csv');
  const { data: territoiresData } = useCSV('/data/territoires.csv', { header: false }); 
  
  const [geoJson, setGeoJson] = useState(null);
  const [search, setSearch] = useState('');
  const [arrondissement, setArrondissement] = useState('');

  useEffect(() => {
    fetch('/data/territoires.geojson')
      .then(response => response.json())
      .then(data => setGeoJson(data))
      .catch(error => console.error("Erreur de chargement du GeoJSON:", error));
  }, []);

  const territoires = useMemo(() => {
    if (!territoiresData) return [];
    return territoiresData.map(row => row[0]).sort();
  }, [territoiresData]);

  const compteursEnrichis = useMemo(() => {
    if (!compteursData.length || !geoJson) return compteursData;
    return compteursData.map(compteur => ({
      ...compteur,
      Arrondissement: getArrondissement(compteur.Latitude, compteur.Longitude, geoJson)
    }));
  }, [compteursData, geoJson]);

  const filteredData = useMemo(() => {
    let result = compteursEnrichis;
    
    if (search) {
      result = result.filter(item => item.Nom?.toLowerCase().includes(search.toLowerCase()));
    }
    
    if (arrondissement) {
      result = result.filter(item => item.Arrondissement === arrondissement);
    }
    
    return result;
  }, [compteursEnrichis, search, arrondissement]);

  const { items: sortedData, requestSort, sortConfig } = useSort(filteredData);

  const columns = [
    { key: 'ID', label: 'ID' },
    { key: 'Nom', label: 'Nom' },
    { 
      key: 'Statut', 
      label: 'Statut',
      render: (row) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${row.Statut === 'Actif' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
          {row.Statut}
        </span>
      )
    },
    { key: 'Annee_implante', label: "Année" },
    { key: 'Arrondissement', label: "Arrondissement" }
  ];

  const filters = (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">Rechercher par nom...</label>
        <input
          type="text"
          className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-mtl-primaire"
          placeholder="Ex: Rachel / Papineau"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
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
    </>
  );

  const isLoading = loadingCSV || !geoJson;

  return (
    <PageLayout title="Compteurs vélo" itemTotal={sortedData.length} filters={filters}>
      {isLoading ? <p className="text-slate-500 animate-pulse">Chargement et calcul des arrondissements en cours...</p> : (
        <DataTable columns={columns} data={sortedData} requestSort={requestSort} sortConfig={sortConfig} emptyMessage="Aucun compteur trouvé." />
      )}
    </PageLayout>
  );
};

export default Statistiques;
