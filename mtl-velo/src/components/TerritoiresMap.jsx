import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Carte des arrondissements (territoires.geojson).
// Cliquer sur un polygone sélectionne l'arrondissement (synchronisé avec le menu déroulant).
const TerritoiresMap = ({ geoJsonData, selected, onSelect }) => {
  if (!geoJsonData) return null;

  // Le polygone sélectionné est mis en surbrillance (rouge)
  const style = (feature) => ({
    color: feature.properties.NOM === selected ? '#B91C1C' : '#15803D',
    weight: feature.properties.NOM === selected ? 3 : 1,
    fillColor: feature.properties.NOM === selected ? '#EF4444' : '#15803D',
    fillOpacity: feature.properties.NOM === selected ? 0.4 : 0.05,
  });

  // Un clic sélectionne l'arrondissement (ou le désélectionne si déjà sélectionné)
  const onEachFeature = (feature, layer) => {
    layer.bindTooltip(feature.properties.NOM);
    layer.on('click', () => {
      const nom = feature.properties.NOM;
      onSelect(nom === selected ? '' : nom);
    });
  };

  return (
    <div className="mb-6 relative isolate">
      <MapContainer center={[45.5088, -73.5878]} zoom={10} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {/* key={selected} force le réaffichage du style quand la sélection change */}
        <GeoJSON key={selected} data={geoJsonData} style={style} onEachFeature={onEachFeature} />
      </MapContainer>
    </div>
  );
};

export default TerritoiresMap;