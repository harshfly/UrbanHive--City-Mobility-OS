import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layouts/PageHeader';
import { Badge } from '../components/ui/Badge';
import { fetchTransitFleet } from '../api/transit.api';
import { TransitVehicle } from '../types';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, RadialBarChart, RadialBar, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Bus, Clock, ShieldAlert, Compass } from 'lucide-react';

const busIcon = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;background:#2F5FD6;border-radius:8px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.15)">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/>
      <circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/>
    </svg>
  </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

import { useAppStore } from '../store/useAppStore';

const cityRoutes: Record<string, { id: string; path: [number, number][]; color: string }[]> = {
  'Indore (Vijay Nagar)': [
    {
      id: 'route-north',
      path: [[22.7200, 75.8577], [22.7300, 75.8700], [22.7400, 75.8900], [22.7533, 75.8937]],
      color: '#2F5FD6',
    },
    {
      id: 'route-south',
      path: [[22.7533, 75.8937], [22.7350, 75.8890], [22.7000, 75.8700], [22.6916, 75.8672]],
      color: '#0F8B6C',
    },
    {
      id: 'route-airport',
      path: [[22.7196, 75.8577], [22.7244, 75.8600], [22.7300, 75.8500]],
      color: '#C77D12',
    },
  ],
  'Bhopal (MP Nagar)': [
    {
      id: 'route-bhopal-1',
      path: [[23.2324, 77.4285], [23.2300, 77.4330], [23.2380, 77.4370]],
      color: '#2F5FD6',
    },
  ],
  'Pune (Hinjewadi)': [
    {
      id: 'route-pune-1',
      path: [[18.5913, 73.7386], [18.5800, 73.7380], [18.5750, 73.7020]],
      color: '#2F5FD6',
    },
  ]
};

const cityConfig: Record<string, { center: [number, number]; zoom: number }> = {
  'Indore (Vijay Nagar)': { center: [22.7250, 75.8720], zoom: 13 },
  'Bhopal (MP Nagar)': { center: [23.2340, 77.4320], zoom: 14 },
  'Pune (Hinjewadi)': { center: [18.5880, 73.7320], zoom: 14 },
};

const MapViewUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const PublicTransport: React.FC = () => {
  const [fleet, setFleet] = useState<TransitVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const activeCity = useAppStore((state) => state.city);

  useEffect(() => {
    setLoading(true);
    fetchTransitFleet().then((data) => {
      setFleet(data);
      setLoading(false);
    });
  }, [activeCity]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Public Transport" />
        <div className="h-96 bg-bg-surface-alt rounded-xl animate-pulse" />
      </div>
    );
  }

  const activeRoutes = cityRoutes[activeCity] || cityRoutes['Indore (Vijay Nagar)'];
  const activeConfig = cityConfig[activeCity] || cityConfig['Indore (Vijay Nagar)'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Transit Fleet Status" />
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-3xl overflow-hidden border border-border-subtle shadow-sm" style={{ height: 500 }}>
          <MapContainer
            center={activeConfig.center}
            zoom={activeConfig.zoom}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapViewUpdater center={activeConfig.center} zoom={activeConfig.zoom} />
            {activeRoutes.map((r) => (
              <Polyline key={r.id} positions={r.path} pathOptions={{ color: r.color, weight: 3, opacity: 0.6, dashArray: '8 4' }} />
            ))}
            {fleet.map((v) => (
              <Marker key={v.id} position={[v.lat, v.lng]} icon={busIcon}>
                <Tooltip>
                  <div className="p-1">
                    <div className="font-bold text-xs text-text-primary">{v.id}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{v.route} | <span className="capitalize">{v.status}</span></div>
                  </div>
                </Tooltip>
              </Marker>
            ))}
          </MapContainer>
        </div>
 
        {/* Fleet list */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl shadow-sm overflow-hidden flex flex-col h-[500px]">
          <div className="px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-bg-surface to-bg-canvas/10">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Active Fleet Status</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {fleet.map((v) => (
              <div key={v.id} className="px-6 py-4 border-b border-border-subtle last:border-0 hover:bg-bg-canvas/40 transition-colors flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">{v.route}</span>
                  <Badge variant={v.status === 'on-time' ? 'green' : 'amber'} dot>{v.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-text-secondary font-mono font-semibold">
                  <span>ID: {v.id}</span>
                  <span>Next ETA: {Math.floor(v.nextStopEta / 60)}m {v.nextStopEta % 60}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Circular Fleet Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Schedule Adherence Donut */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[390px]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Schedule Adherence Split</h3>
              <Badge variant="green">On-Time Performance</Badge>
            </div>
            <p className="text-xs text-text-secondary">Real-time schedule compliance rating across all active city transit lines.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center my-4">
            <div className="h-40 flex items-center justify-center relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'On-Time', value: 78, fill: '#34C759' },
                      { name: 'Minor Delay', value: 16, fill: '#FF9500' },
                      { name: 'Out-Of-Service', value: 6, fill: '#AEAEB2' },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={60}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {[
                      { fill: '#34C759' },
                      { fill: '#FF9500' },
                      { fill: '#AEAEB2' },
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-[8px] uppercase tracking-wider text-text-tertiary font-bold">Active Fleet</span>
                <span className="text-sm font-mono font-bold text-text-primary leading-none mt-0.5">94%</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {[
                { name: 'On-Time Line', value: 78, fill: '#34C759' },
                { name: 'Minor Delay', value: 16, fill: '#FF9500' },
                { name: 'Offline / Yard', value: 6, fill: '#AEAEB2' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border-subtle/50 pb-1.5 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.fill }} />
                    <span className="text-xs font-bold text-text-primary truncate">{item.name}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-text-secondary">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-bg-canvas/50 border border-border-subtle/50 rounded-2xl p-3">
            <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block mb-1">Transit Efficiency</span>
            <div className="flex items-start gap-1.5 text-xs text-text-primary font-medium">
              <Clock size={14} className="text-accent-primary shrink-0 mt-0.5" />
              <p>
                Transit flow efficiency is operating at <strong className="font-bold text-accent-primary">+4.2%</strong> today. Priority lanes automatically bypassed 3 major queuing signals.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Lane Priority Clearance Bar Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col justify-between h-[390px]">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">BRTS Corridor priority rates</h3>
              <Badge variant="blue">Automated wave</Badge>
            </div>
            <p className="text-xs text-text-secondary">Green wave override trigger efficiency computed on smart express lanes.</p>
          </div>

          <div className="h-44 my-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { name: 'Bypass Corridor', value: 85, fill: '#34C759' },
                  { name: 'Vijay Nagar Bypass', value: 72, fill: '#0071E3' },
                  { name: 'Airport Link', value: 60, fill: '#FF9500' },
                ]}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={28}>
                  {[
                    { fill: '#34C759' },
                    { fill: '#0071E3' },
                    { fill: '#FF9500' },
                  ].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-bg-canvas/50 border border-border-subtle/50 rounded-2xl p-3">
            <span className="text-[9px] uppercase tracking-wider text-text-secondary font-bold block mb-1">Pre-emption Safeguard</span>
            <div className="flex items-start gap-1.5 text-xs text-text-primary font-medium">
              <ShieldAlert size={14} className="text-accent-primary shrink-0 mt-0.5" />
              <p>
                UrbanHive signal pre-emptions resolved 8 active transit bus schedule conflicts automatically in the last hour.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PublicTransport;
