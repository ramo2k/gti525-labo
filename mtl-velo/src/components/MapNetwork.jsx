import React, { useState } from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { getTrackStyle } from '../utils/mapLogic';
import MapLegendModal from './MapLegendModal';

/**
 * Composant de carte isolé (SOLID) gérant l'affichage Leaflet (T1.1, T1.2, T1.4).
 */
const MapNetwork = ({ geoJsonData, filterFeature, filterKey }) => {
  const [isLegendOpen, setIsLegendOpen] = useState(false);

  // Centre de la carte (Montréal)
  const position = [45.5088, -73.5878];
  
  return (
    <div className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-md border border-mtl-texte/20">
      
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
        
        {/* T1.2 : Tracés colorés */}
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
