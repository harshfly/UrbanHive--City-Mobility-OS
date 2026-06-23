import React, { useState } from 'react';
import { PageHeader } from '../layouts/PageHeader';
import { Badge } from '../components/ui/Badge';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { cn } from '../theme/cn';
import { Sparkles, ArrowRight, Check, Fuel } from 'lucide-react';

const cityConfig: Record<string, { center: [number, number]; zoom: number }> = {
  'Indore (Vijay Nagar)': { center: [22.7250, 75.8720], zoom: 13 },
  'Bhopal (MP Nagar)': { center: [23.2340, 77.4320], zoom: 14 },
  'Pune (Hinjewadi)': { center: [18.5880, 73.7320], zoom: 14 },
};

const mockPumps = [
  { id: 'p1', name: 'Indian Oil - Ring Road', operator: 'IOCL', lat: 22.7300, lng: 75.8850, queueLength: 12, waitTimeMins: 18, fuelAvailable: 85 },
  { id: 'p2', name: 'HP - Vijay Nagar Square', operator: 'HPCL', lat: 22.7450, lng: 75.8900, queueLength: 3, waitTimeMins: 4, fuelAvailable: 40 },
  { id: 'p3', name: 'Bharat Petroleum - Bypass', operator: 'BPCL', lat: 22.7100, lng: 75.9000, queueLength: 0, waitTimeMins: 0, fuelAvailable: 95 },
  { id: 'p4', name: 'Reliance Auto Zone', operator: 'Reliance', lat: 22.7600, lng: 75.8700, queueLength: 20, waitTimeMins: 35, fuelAvailable: 20 },
  { id: 'p5', name: 'Nayara Energy - AB Road', operator: 'Nayara', lat: 22.7200, lng: 75.8600, queueLength: 7, waitTimeMins: 10, fuelAvailable: 70 },
];

const MapViewUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.5 });
  }, [center, zoom, map]);
  return null;
};

const AIPetrolRecommendationHero: React.FC<{ aiMode: string }> = ({ aiMode }) => {
  const [applied, setApplied] = useState(aiMode === 'autonomous');
  const isManual = aiMode === 'manual';

  React.useEffect(() => {
    if (aiMode === 'autonomous') setApplied(true);
    else if (aiMode === 'manual') setApplied(false);
  }, [aiMode]);

  return (
    <div className="relative overflow-hidden bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-md hover:shadow-lg transition-all duration-300 mb-6">
      <div 
        className={cn(
          "absolute -right-24 -top-24 w-48 h-48 rounded-full blur-3xl opacity-10 pointer-events-none transition-all duration-500",
          aiMode === 'autonomous' ? 'bg-accent-green' : 
          aiMode === 'supervised' ? 'bg-accent-amber' : 'bg-text-secondary'
        )} 
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-accent-amber-soft flex items-center justify-center text-accent-amber shadow-inner">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              Fleet Routing Suggestion Active
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Redirecting 3 municipal logistics trucks from <strong className="font-bold text-text-primary">Reliance Auto Zone</strong> (35m wait) to <strong className="font-bold text-text-primary">BPCL Bypass</strong> (0m wait, +4 min travel).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0 z-10">
          {applied ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent-green-soft text-accent-green rounded-lg text-[10px] font-bold uppercase tracking-wider">
              <Check size={12} className="stroke-[3]" /> {aiMode === 'autonomous' ? 'Auto-Applied' : 'Applied'}
            </span>
          ) : (
            <>
              {aiMode === 'supervised' && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setApplied(true)}
                  className="px-4 py-2 bg-accent-amber hover:bg-accent-amber/95 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  Approve Routing <ArrowRight size={12} />
                </motion.button>
              )}
              {isManual && (
                <Badge variant="neutral" dot>Manual Mode Active</Badge>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const PetrolPump: React.FC = () => {
  const aiMode = useAppStore((s) => s.aiMode);
  const activeCity = useAppStore((s) => s.city);

  const getColor = (waitTime: number) => {
    if (waitTime >= 20) return '#FF3B30'; // Red
    if (waitTime >= 10) return '#FF9500'; // Amber
    return '#34C759'; // Green
  };

  const getRadius = (queue: number) => {
    return Math.max(8, queue);
  };

  const activeConfig = cityConfig[activeCity] || cityConfig['Indore (Vijay Nagar)'];
  
  // Show pumps only if we are on the mock city where data makes sense
  const isCorrectCity = activeCity === 'Indore (Vijay Nagar)';
  const displayPumps = isCorrectCity ? mockPumps : [];

  // Donut Chart: Wait Time Split
  const highWait = displayPumps.filter(p => p.waitTimeMins >= 20).length;
  const medWait = displayPumps.filter(p => p.waitTimeMins >= 10 && p.waitTimeMins < 20).length;
  const lowWait = displayPumps.filter(p => p.waitTimeMins < 10).length;
  const donutData = displayPumps.length > 0 ? [
    { name: 'Optimal Wait (<10m)', value: lowWait, fill: '#34C759' },
    { name: 'Moderate Wait (10-20m)', value: medWait, fill: '#FF9500' },
    { name: 'High Wait (>20m)', value: highWait, fill: '#FF3B30' },
  ].filter(d => d.value > 0) : [];

  // Bar Chart: Fuel Availability for Top Wait Stations
  const barData = [...displayPumps]
    .sort((a, b) => b.waitTimeMins - a.waitTimeMins)
    .slice(0, 5)
    .map(p => ({
      name: p.operator,
      value: p.fuelAvailable,
      fill: p.fuelAvailable < 30 ? '#FF3B30' : p.fuelAvailable < 60 ? '#FF9500' : '#34C759'
    }));

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Petrol Pumps" />

      {displayPumps.length > 0 && <AIPetrolRecommendationHero aiMode={aiMode} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle shadow-sm h-[350px] lg:h-[480px]">
          <MapContainer
            center={activeConfig.center}
            zoom={activeConfig.zoom}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapViewUpdater center={activeConfig.center} zoom={activeConfig.zoom} />
            {displayPumps.map((p) => (
              <CircleMarker
                key={p.id}
                center={[p.lat, p.lng]}
                radius={getRadius(p.queueLength)}
                pathOptions={{
                  fillColor: getColor(p.waitTimeMins),
                  fillOpacity: 0.7,
                  color: getColor(p.waitTimeMins),
                  weight: 2,
                }}
              >
                <Tooltip>
                  <div className="p-1">
                    <div className="font-bold text-xs text-text-primary">{p.name}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">Wait: {p.waitTimeMins}m | Fuel: {p.fuelAvailable}%</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Pump table */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col h-[350px] lg:h-[480px]">
          <div className="px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-bg-surface to-bg-canvas/10">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Local Pumps</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {displayPumps.length > 0 ? displayPumps.map((p) => (
              <div key={p.id} className="px-6 py-4 border-b border-border-subtle last:border-0 hover:bg-bg-canvas/40 transition-colors flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">{p.name}</span>
                  <Badge variant={p.waitTimeMins >= 20 ? 'red' : p.waitTimeMins >= 10 ? 'amber' : 'green'}>
                    {p.waitTimeMins}m Wait
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-text-secondary font-mono font-semibold">
                  <span>Op: {p.operator}</span>
                  <span>Queue: {p.queueLength}</span>
                  <span>Fuel: {p.fuelAvailable}%</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-tertiary text-xs font-medium">No pump data available for this city.</div>
            )}
          </div>
        </div>
      </div>

      {/* Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Wait Time Split */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Queue Status Split</h3>
            <p className="text-xs text-text-secondary">Distribution of pumps currently experiencing congestion.</p>
          </div>

          <div className="flex-1 flex items-center justify-center relative mt-4">
            {donutData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={donutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={400}
                    >
                      {donutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-bold">Total Pumps</span>
                  <span className="text-xl font-mono font-bold text-text-primary leading-none mt-0.5">{displayPumps.length}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Fuel Availability */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Stock Availability (%)</h3>
            <p className="text-xs text-text-secondary">Current fuel stock availability across the most congested pumps.</p>
          </div>

          <div className="flex-1 mt-4">
            {barData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36} animationDuration={400}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PetrolPump;
