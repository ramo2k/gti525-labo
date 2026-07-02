import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Modale simple qui affiche une liste de points sur une carte Leaflet.
// Le point dont l'id correspond à highlightId est affiché en rouge, plus gros.
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
            <CircleMarker
              key={p.id}
              center={[p.lat, p.lng]}
              radius={p.id === highlightId ? 12 : 6}
              pathOptions={{ color: p.id === highlightId ? 'red' : '#15803D' }}
            >
              <Popup>{p.label}</Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapModal;