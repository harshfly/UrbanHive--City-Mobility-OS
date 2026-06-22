import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Junction } from '../../types';
import { useNavigate } from 'react-router-dom';

interface JunctionMarkerProps {
  junction: Junction;
  ghostMode?: boolean;
}

const statusColors: Record<string, string> = {
  green: '#0F8B6C',
  amber: '#C77D12',
  red: '#D6364F',
};

const createIcon = (status: string, ghost?: boolean) => {
  const color = statusColors[status] || '#0F8B6C';
  const opacity = ghost ? 0.6 : 1;
  const dashStyle = ghost ? 'stroke-dasharray: 4 2;' : '';
  const pulseClass = status === 'amber' ? 'marker-pulse-amber' : status === 'red' ? 'marker-pulse-red' : '';

  return L.divIcon({
    className: pulseClass,
    html: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="opacity:${opacity}">
      <circle cx="12" cy="12" r="8" fill="${color}" fill-opacity="0.2" />
      <circle cx="12" cy="12" r="5" fill="${color}" stroke="white" stroke-width="2" style="${dashStyle}" />
    </svg>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

export const JunctionMarker: React.FC<JunctionMarkerProps> = ({ junction, ghostMode }) => {
  const navigate = useNavigate();

  return (
    <Marker
      position={[junction.lat, junction.lng]}
      icon={createIcon(junction.status, ghostMode)}
      eventHandlers={{
        click: () => navigate(`/traffic/${junction.id}`),
      }}
    >
      <Tooltip direction="top" offset={[0, -12]} className="!bg-bg-surface !border-border-subtle !rounded-lg !shadow-md !px-3 !py-2 !text-text-primary">
        <div>
          <div className="text-sm font-semibold">{junction.name}</div>
          <div className="text-xs text-text-secondary capitalize">{junction.status}</div>
          <div className="text-xs font-mono text-text-tertiary">Avg wait: {junction.avgWaitSeconds}s</div>
        </div>
      </Tooltip>
    </Marker>
  );
};
