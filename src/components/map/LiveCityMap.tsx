import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Junction } from '../../types';
import { JunctionMarker } from './JunctionMarker';
import { CameraFeedOverlay } from './CameraFeedOverlay';
import { MapLegend } from './MapLegend';
import { Search } from 'lucide-react';
import { fetchJunctions } from '../../api/junctions.api';
import { useAppStore } from '../../store/useAppStore';

interface LiveCityMapProps {
  className?: string;
  showCamera?: boolean;
  showLegend?: boolean;
  showSearch?: boolean;
  ghostMode?: boolean;
  junctionsOverride?: Junction[];
  children?: React.ReactNode;
  center?: [number, number];
  zoom?: number;
}

// Dynamic map settings based on city selection
const cityConfig: Record<string, { center: [number, number]; zoom: number }> = {
  'Indore (Vijay Nagar)': { center: [22.7250, 75.8720], zoom: 13 },
  'Bhopal (MP Nagar)': { center: [23.2340, 77.4320], zoom: 14 },
  'Pune (Hinjewadi)': { center: [18.5880, 73.7320], zoom: 14 },
};

// Component to handle dynamic map panning/zooming when city changes
const MapViewUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

// Intricate network road polylines
const connections: [string, string][] = [
  // Indore road network (connecting new squares)
  ['j-1', 'j-4'],   // Vijay Nagar to LIG
  ['j-1', 'j-8'],   // Vijay Nagar to Radisson
  ['j-1', 'j-14'],  // Vijay Nagar to Bombay Hospital
  ['j-4', 'j-2'],   // LIG to Palasia
  ['j-4', 'j-10'],  // LIG to Khajrana
  ['j-8', 'j-10'],  // Radisson to Khajrana
  ['j-8', 'j-11'],  // Radisson to Bengali
  ['j-2', 'j-6'],   // Palasia to Geeta Bhawan
  ['j-2', 'j-12'],  // Palasia to Yeshwant Club
  ['j-2', 'j-15'],  // Palasia to Lantern
  ['j-6', 'j-5'],   // Geeta Bhawan to Regal
  ['j-6', 'j-11'],  // Geeta Bhawan to Bengali
  ['j-6', 'j-3'],   // Geeta Bhawan to Bhawarkua
  ['j-5', 'j-9'],   // Regal to Rajwada
  ['j-5', 'j-15'],  // Regal to Lantern
  ['j-5', 'j-12'],  // Regal to Yeshwant Club
  ['j-9', 'j-16'],  // Rajwada to Mhow Naka
  ['j-9', 'j-13'],  // Rajwada to Annapurna
  ['j-3', 'j-7'],   // Bhawarkua to Rajiv Gandhi
  ['j-3', 'j-16'],  // Bhawarkua to Mhow Naka
  ['j-16', 'j-13'], // Mhow Naka to Annapurna

  // Bhopal road network
  ['j-b1', 'j-b2'],
  ['j-b1', 'j-b4'],
  ['j-b2', 'j-b3'],
  ['j-b3', 'j-b4'],

  // Pune road network
  ['j-p1', 'j-p2'],
  ['j-p1', 'j-p4'],
  ['j-p2', 'j-p3'],
  ['j-p3', 'j-p4'],
];

const statusColors: Record<string, string> = {
  green: '#0F8B6C',
  amber: '#C77D12',
  red: '#D6364F',
};

export const LiveCityMap: React.FC<LiveCityMapProps> = ({
  className,
  showCamera = true,
  showLegend = true,
  showSearch = true,
  ghostMode = false,
  junctionsOverride,
  children,
  center,
  zoom,
}) => {
  const [junctions, setJunctions] = useState<Junction[]>([]);
  const [loading, setLoading] = useState(true);
  const selectedCityName = useAppStore((state) => state.city);

  // Determine active coordinates
  const activeConfig = cityConfig[selectedCityName] || cityConfig['Indore (Vijay Nagar)'];
  const finalCenter = center || activeConfig.center;
  const finalZoom = zoom || activeConfig.zoom;

  useEffect(() => {
    setLoading(true);
    if (junctionsOverride) {
      setJunctions(junctionsOverride);
      setLoading(false);
      return;
    }
    fetchJunctions().then((data) => {
      setJunctions(data);
      setLoading(false);
    });
  }, [junctionsOverride, selectedCityName]);

  if (loading) {
    return (
      <div className={`bg-bg-surface-alt rounded-xl animate-pulse ${className || ''}`} style={{ minHeight: 300 }} />
    );
  }

  const junctionMap = Object.fromEntries(junctions.map((j) => [j.id, j]));

  return (
    <div className={`relative rounded-xl overflow-hidden border border-border-subtle shadow-sm ${className || ''}`} style={{ minHeight: 300 }}>
      <MapContainer
        center={finalCenter}
        zoom={finalZoom}
        className="h-full w-full"
        style={{ minHeight: 300 }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
        <MapViewUpdater center={finalCenter} zoom={finalZoom} />

        {/* Road polylines */}
        {connections.map(([aId, bId], i) => {
          const a = junctionMap[aId];
          const b = junctionMap[bId];
          if (!a || !b) return null;
          // Use worst status of the two endpoints
          const worstStatus = a.status === 'red' || b.status === 'red' ? 'red'
            : a.status === 'amber' || b.status === 'amber' ? 'amber' : 'green';
          return (
            <Polyline
              key={i}
              positions={[[a.lat, a.lng], [b.lat, b.lng]]}
              pathOptions={{
                color: statusColors[worstStatus],
                weight: 3,
                opacity: ghostMode ? 0.4 : 0.7,
              }}
            />
          );
        })}

        {/* Junction markers */}
        {junctions.map((j) => (
          <JunctionMarker key={j.id} junction={j} ghostMode={ghostMode} />
        ))}

        {children}
      </MapContainer>

      {showCamera && <CameraFeedOverlay />}
      {showLegend && <MapLegend />}

      {showSearch && (
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              placeholder="Search junction or area"
              className="pl-9 pr-4 py-2 bg-bg-surface/95 backdrop-blur-sm border border-border-subtle rounded-lg text-sm text-text-primary placeholder-text-tertiary shadow-md focus:outline-none focus:ring-2 focus:ring-accent-primary w-52"
            />
          </div>
        </div>
      )}
    </div>
  );
};
