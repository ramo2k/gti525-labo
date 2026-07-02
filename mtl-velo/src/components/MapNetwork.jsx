import { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrackStyle } from '../utils/mapLogic';
import MapLegendModal from './MapLegendModal';

/**
 * Composant de carte isolé (SOLID) gérant l'affichage Leaflet (T1.1, T1.2, T1.4).
 * Affiche à la fois le réseau cyclable ET les polygones d'arrondissement (une seule carte).
 */
const MapNetwork = ({ geoJsonData, filterFeature, filterKey, territoiresGeoJson, arrondissement, onSelectArrondissement }) => {
  const [isLegendOpen, setIsLegendOpen] = useState(false);
  // Opacité du remplissage de l'arrondissement en surbrillance, réglable par l'utilisateur
  const [zoneOpacity, setZoneOpacity] = useState(0.4);

  // Centre de la carte (Montréal)
  const position = [45.5088, -73.5878];

  // Style des polygones d'arrondissement : en rouge/surbrillance si sélectionné
  const territoireStyle = (feature) => ({
    color: feature.properties.NOM === arrondissement ? '#B91C1C' : '#15803D',
    weight: feature.properties.NOM === arrondissement ? 3 : 1,
    fillColor: feature.properties.NOM === arrondissement ? '#EF4444' : '#15803D',
    fillOpacity: feature.properties.NOM === arrondissement ? zoneOpacity : 0.05,
  });

  // Un clic sur un polygone sélectionne (ou désélectionne) l'arrondissement
  const onEachTerritoire = (feature, layer) => {
    layer.bindTooltip(feature.properties.NOM);
    layer.on('click', () => {
      const nom = feature.properties.NOM;
      onSelectArrondissement(nom === arrondissement ? '' : nom);
    });
  };

  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-md border border-mtl-texte/20">

      {/* Nouveau : curseur pour régler l'opacité de l'arrondissement en surbrillance */}
      <div className="absolute bottom-4 left-4 z-[400] bg-white p-3 rounded-lg shadow-lg border border-mtl-texte/10 flex items-center gap-2">
        <label htmlFor="opacity-range" className="text-xs font-medium text-mtl-texte">Opacité</label>
        <input
          id="opacity-range"
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={zoneOpacity}
          onChange={(e) => setZoneOpacity(parseFloat(e.target.value))}
        />
      </div>

      {/* Bouton pour ouvrir la légende flottante par-dessus la carte (T1.4) */}
      <button
        onClick={() => setIsLegendOpen(true)}
        className="absolute top-4 right-4 z-[400] bg-white text-mtl-primaire p-3 rounded-full shadow-lg border border-mtl-texte/10 hover:bg-mtl-fond focus:outline-none focus:ring-2 focus:ring-mtl-primaire transition-colors"
        aria-label="Afficher la légende"
        aria-haspopup="dialog"
        aria-expanded={isLegendOpen}
        title="Légende"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>

      {/* T1.1 : Carte avec MapContainer */}
      <MapContainer center={position} zoom={11} scrollWheelZoom={true} className="w-full h-full z-0">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Nouveau : polygones des arrondissements (cliquables), dessinés en dessous des pistes */}
        {territoiresGeoJson && (
          <GeoJSON
            key={`territoires-${arrondissement}-${zoneOpacity}`}
            data={territoiresGeoJson}
            style={territoireStyle}
            onEachFeature={onEachTerritoire}
          />
        )}

        {/* T1.2 : Tracés colorés du réseau cyclable */}
        {geoJsonData && (
          <GeoJSON 
            key={`geojson-${filterKey}`}
            data={geoJsonData} 
            style={getTrackStyle}
            filter={filterFeature}
          />
        )}
      </MapContainer>

      {/* Modale de légende */}
      <MapLegendModal 
        isOpen={isLegendOpen} 
        onClose={() => setIsLegendOpen(false)} 
      />
    </div>
  );
};

export default MapNetwork;