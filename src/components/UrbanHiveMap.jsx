import React, { useEffect } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

import TrafficLayer from './layers/TrafficLayer';
import ParkingLayer from './layers/ParkingLayer';
import EVLayer from './layers/EVLayer';
import PetrolLayer from './layers/PetrolLayer';
import EmergencyLayer from './layers/EmergencyLayer';

const indoreCenter = [22.7196, 75.8577];

const UrbanHiveMap = ({ data, activeLayers, onFeatureClick, emergencyCorridor }) => {
  return (
    <MapContainer 
      center={indoreCenter} 
      zoom={13} 
      zoomControl={false}
      className="w-full h-full"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />

      {activeLayers.traffic && data?.traffic?.roads && (
        <TrafficLayer 
          roads={data.traffic.roads} 
          onClick={(data) => onFeatureClick({ type: 'traffic', data })} 
        />
      )}

      {activeLayers.parking && data?.parking?.lots && (
        <ParkingLayer 
          lots={data.parking.lots} 
          onClick={(data) => onFeatureClick({ type: 'parking', data })} 
        />
      )}

      {activeLayers.ev && data?.ev?.chargers && (
        <EVLayer 
          chargers={data.ev.chargers} 
          onClick={(data) => onFeatureClick({ type: 'ev', data })} 
        />
      )}

      {activeLayers.petrol && data?.petrol?.pumps && (
        <PetrolLayer 
          pumps={data.petrol.pumps} 
          onClick={(data) => onFeatureClick({ type: 'petrol', data })} 
        />
      )}

      {activeLayers.emergency && emergencyCorridor && (
        <EmergencyLayer 
          corridor={emergencyCorridor} 
        />
      )}
    </MapContainer>
  );
};

export default UrbanHiveMap;
