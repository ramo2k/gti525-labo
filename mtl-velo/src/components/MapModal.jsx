import { useRef, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Un point sur la carte : s'il est celui en surbrillance, sa popup s'ouvre automatiquement
const MarkerPoint = ({ point, isHighlighted }) => {
  const ref = useRef(null);

  // Dès que ce marqueur devient le point mis en évidence, on ouvre sa popup pour bien le montrer
  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.openPopup();
    }
  }, [isHighlighted]);

  return (
    <CircleMarker
      ref={ref}
      center={[point.lat, point.lng]}
      radius={isHighlighted ? 12 : 6}
      pathOptions={{
        color: isHighlighted ? 'red' : '#15803D',
        // On précise aussi le remplissage (fillColor/fillOpacity), sinon Leaflet le laisse
        // presque transparent par défaut et le point en surbrillance ne ressort pas assez
        fillColor: isHighlighted ? 'red' : '#15803D',
        fillOpacity: isHighlighted ? 0.9 : 0.5,
      }}
    >
      <Popup>{point.label}</Popup>
    </CircleMarker>
  );
};

// Modale simple qui affiche une liste de points sur une carte Leaflet.
// Le point dont l'id correspond à highlightId est affiché en rouge, plus gros, avec sa popup ouverte.
const MapModal = ({ points, highlightId, onClose, title }) => {
  // On centre la carte sur le point sélectionné (sinon sur Montréal par défaut)
  const pointSelectionne = points.find(p => p.id === highlightId);
  const centre = pointSelectionne
    ? [pointSelectionne.lat, pointSelectionne.lng]
    : [45.5088, -73.5878];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]" onClick={onClose}>
      <div className="bg-white p-4 rounded-lg w-full max-w-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-mtl-primaire">{title}</h2>
          <button onClick={onClose} className="text-2xl leading-none px-2">&times;</button>
        </div>

        <MapContainer center={centre} zoom={13} style={{ height: '500px', width: '100%' }}>
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {points.map((p) => (
            <MarkerPoint key={p.id} point={p} isHighlighted={p.id === highlightId} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapModal;