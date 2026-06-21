import React from 'react';
import { Polyline } from 'react-leaflet';

interface CorridorRouteLayerProps {
  path: [number, number][];
}

export const CorridorRouteLayer: React.FC<CorridorRouteLayerProps> = ({ path }) => {
  return (
    <>
      {/* Base glow */}
      <Polyline
        positions={path}
        pathOptions={{
          color: '#D6364F',
          weight: 6,
          opacity: 0.3,
        }}
      />
      {/* Animated dashed line */}
      <Polyline
        positions={path}
        pathOptions={{
          color: '#D6364F',
          weight: 3,
          opacity: 0.9,
          dashArray: '12 8',
          lineCap: 'round',
        }}
      />
    </>
  );
};
