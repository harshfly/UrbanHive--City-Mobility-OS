import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layouts/PageHeader';
import { Badge } from '../components/ui/Badge';
import { fetchChargers } from '../api/chargers.api';
import { Charger } from '../types';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAppStore } from '../store/useAppStore';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { V2GGridController } from '../components/ev/V2GGridController';
import { cn } from '../theme/cn';
import { Sparkles, ArrowRight, Check } from 'lucide-react';

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

const AIRebalanceHero: React.FC<{ overloaded: Charger[], lowLoad: Charger[], aiMode: string }> = ({ overloaded, lowLoad, aiMode }) => {
  const [applied, setApplied] = useState(aiMode === 'autonomous');
  const isManual = aiMode === 'manual';

  useEffect(() => {
    if (aiMode === 'autonomous') setApplied(true);
    else if (aiMode === 'manual') setApplied(false);
  }, [aiMode]);

  if (overloaded.length === 0 || lowLoad.length === 0) return null;

  const source = overloaded[0];
  const target = lowLoad[0];

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
          <div className="w-10 h-10 rounded-2xl bg-accent-primary-soft flex items-center justify-center text-accent-primary shadow-inner">
            <Sparkles size={20} className="animate-pulse" />
          </div>
          <div>
            <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
              Grid Load Rebalance Suggestion
            </h2>
            <p className="text-xs text-text-secondary mt-0.5">
              Redirecting 4 incoming vehicles from <strong className="font-bold text-text-primary">{source.name}</strong> to <strong className="font-bold text-text-primary">{target.name}</strong> ({target.currentLoad}% load, +3 min travel).
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
                  className="px-4 py-2 bg-accent-primary hover:bg-accent-primary/95 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  Approve Rebalance <ArrowRight size={12} />
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

const EvCharging: React.FC = () => {
  const [chargers, setChargers] = useState<Charger[]>([]);
  const [loading, setLoading] = useState(true);
  const aiMode = useAppStore((s) => s.aiMode);
  const activeCity = useAppStore((s) => s.city);

  useEffect(() => {
    Promise.resolve().then(() => {
      setLoading(true);
    });
    let active = true;
    fetchChargers().then((data) => {
      if (active) {
        setChargers(data);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, [activeCity]);

  const getColor = (load: number) => {
    if (load >= 80) return '#FF3B30'; // accent-red
    if (load >= 50) return '#FF9500'; // accent-amber
    return '#34C759'; // accent-green
  };

  const getRadius = (load: number) => {
    return Math.max(8, load / 5);
  };

  const overloaded = chargers.filter((c) => c.currentLoad > 90);
  const lowLoad = chargers.filter((c) => c.currentLoad < 30);

  // Dynamic Chart Calculations
  const highLoadCount = chargers.filter(c => c.currentLoad >= 80).length;
  const medLoadCount = chargers.filter(c => c.currentLoad >= 50 && c.currentLoad < 80).length;
  const optimalLoadCount = chargers.filter(c => c.currentLoad < 50).length;
  const totalChargers = chargers.length;

  const donutData = totalChargers > 0 ? [
    { name: 'Optimal Load (<50%)', value: optimalLoadCount, fill: '#34C759' },
    { name: 'Medium Load (50-80%)', value: medLoadCount, fill: '#FF9500' },
    { name: 'High Load (>80%)', value: highLoadCount, fill: '#FF3B30' },
  ].filter(d => d.value > 0) : [];

  const topWaitStations = [...chargers]
    .sort((a, b) => b.waitTimeMins - a.waitTimeMins)
    .slice(0, 5)
    .map(c => {
      // Create short names for x-axis to fit well
      const shortName = c.name.replace(/(Station|Hub|Supercharger|Plaza)/ig, '').trim() || c.name;
      const fill = c.waitTimeMins >= 20 ? '#FF3B30' : c.waitTimeMins >= 10 ? '#FF9500' : '#34C759';
      return { name: shortName, fullName: c.name, value: c.waitTimeMins, fill };
    });

  if (loading) {
    return (
      <div>
        <PageHeader title="EV & Charging" />
        <div className="h-96 bg-bg-surface-alt rounded-xl animate-pulse" />
      </div>
    );
  }

  const activeConfig = cityConfig[activeCity] || cityConfig['Indore (Vijay Nagar)'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="flex flex-col gap-4 md:gap-6">
      <div className="order-1 w-full">
        <PageHeader title="EV & Charging" />
      </div>

      {/* AI Rebalance Hero */}
      <div className="order-3 md:order-2">
        <AIRebalanceHero overloaded={overloaded} lowLoad={lowLoad} aiMode={aiMode} />
      </div>

      <div className="order-2 md:order-3 grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
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
            {chargers.map((c) => (
              <CircleMarker
                key={c.id}
                center={[c.lat, c.lng]}
                radius={getRadius(c.currentLoad)}
                pathOptions={{
                  fillColor: getColor(c.currentLoad),
                  fillOpacity: 0.7,
                  color: getColor(c.currentLoad),
                  weight: 2,
                }}
              >
                <Tooltip>
                  <div className="p-1">
                    <div className="font-bold text-xs text-text-primary">{c.name}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">Load: {c.currentLoad}% | Wait: {c.waitTimeMins}m</div>
                  </div>
                </Tooltip>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Station table */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl md:rounded-3xl shadow-sm overflow-hidden flex flex-col h-[350px] lg:h-[480px]">
          <div className="px-6 py-4 border-b border-border-subtle bg-gradient-to-r from-bg-surface to-bg-canvas/10">
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">Charging Stations</h3>
          </div>
          <div className="overflow-y-auto flex-1">
            {chargers.length > 0 ? chargers.map((c) => (
              <div key={c.id} className="px-6 py-4 border-b border-border-subtle last:border-0 hover:bg-bg-canvas/40 transition-colors flex flex-col gap-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary truncate">{c.name}</span>
                  <Badge variant={c.currentLoad > 80 ? 'red' : c.currentLoad > 50 ? 'amber' : 'green'}>
                    {c.currentLoad}%
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-[10px] text-text-secondary font-mono font-semibold">
                  <span>Cap: {c.capacity} bays</span>
                  <span>Wait: {c.waitTimeMins}m</span>
                  <span>{c.distanceKm} km</span>
                </div>
              </div>
            )) : (
              <div className="p-8 text-center text-text-tertiary text-xs font-medium">No active stations in this city.</div>
            )}
          </div>
        </div>
      </div>

      {/* Circular Charging Analytics */}
      <div className="order-4 grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Card 1: Grid Load Donut */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Network Load Distribution</h3>
            <p className="text-xs text-text-secondary">Current station capacity utilization spread across the city.</p>
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
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-bold">Total Stations</span>
                  <span className="text-xl font-mono font-bold text-text-primary leading-none mt-0.5">{totalChargers}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No stations are currently active to compute load.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Highest Wait Times Bar Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[290px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Peak Wait Times</h3>
            <p className="text-xs text-text-secondary">The highest expected wait times (in minutes) across top congested stations.</p>
          </div>

          <div className="flex-1 mt-4">
            {topWaitStations.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topWaitStations} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 'dataMax + 5']} tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={36} animationDuration={400}>
                    {topWaitStations.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No stations are active to track wait times.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* V2G Smart Grid Controller */}
      <div className="order-5">
        <V2GGridController />
      </div>
    </motion.div>
  );
};

export default EvCharging;
