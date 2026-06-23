import React, { useState, useEffect } from 'react';
import { PageHeader } from '../layouts/PageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { fetchParkingZones } from '../api/parking.api';
import { ParkingZone } from '../types';
import { MapContainer, TileLayer, Polygon, Tooltip, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { showToast } from '../components/ui/Toast';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useAppStore } from '../store/useAppStore';

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

const Parking: React.FC = () => {
  const [zones, setZones] = useState<ParkingZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedZone, setSelectedZone] = useState<ParkingZone | null>(null);
  const [reserveModal, setReserveModal] = useState(false);
  const [reservedSpot, setReservedSpot] = useState<string | null>(null);
  const activeCity = useAppStore((s) => s.city);

  useEffect(() => {
    Promise.resolve().then(() => {
      setLoading(true);
    });
    let active = true;
    fetchParkingZones().then((data) => {
      if (active) {
        setZones(data);
        setLoading(false);
        setSelectedZone(null); // reset selection when city changes
      }
    });
    return () => {
      active = false;
    };
  }, [activeCity]);

  const getColor = (zone: ParkingZone) => {
    const ratio = zone.availableSpots / zone.totalSpots;
    if (ratio === 0) return '#FF3B30'; // accent-red (full)
    if (ratio < 0.3) return '#FF9500'; // accent-amber (getting full)
    return '#34C759'; // accent-green (plenty available)
  };

  const handleReserve = () => {
    const spotNum = `S-${Math.floor(Math.random() * 900 + 100)}`;
    setReservedSpot(spotNum);
    showToast(`Spot ${spotNum} reserved for 15 minutes`, 'success');
    setReserveModal(false);
  };

  // Dynamic Chart Data Calculations
  const totalCitySpots = zones.reduce((acc, z) => acc + z.totalSpots, 0);
  const availableCitySpots = zones.reduce((acc, z) => acc + z.availableSpots, 0);
  const occupiedCitySpots = totalCitySpots - availableCitySpots;

  const donutData = totalCitySpots > 0 ? [
    { name: 'Available Spots', value: availableCitySpots, fill: '#34C759' },
    { name: 'Occupied Spots', value: occupiedCitySpots, fill: '#FF3B30' },
  ].filter(d => d.value > 0) : [];

  const topOccupiedZones = [...zones]
    .map(z => ({
      name: z.name,
      occupancyRatio: ((z.totalSpots - z.availableSpots) / z.totalSpots) * 100,
      fill: ((z.totalSpots - z.availableSpots) / z.totalSpots) * 100 > 80 ? '#FF3B30' : 
            ((z.totalSpots - z.availableSpots) / z.totalSpots) * 100 > 50 ? '#FF9500' : '#34C759'
    }))
    .sort((a, b) => b.occupancyRatio - a.occupancyRatio)
    .slice(0, 5);

  if (loading) {
    return (
      <div>
        <PageHeader title="Parking" />
        <div className="h-96 bg-bg-surface-alt rounded-xl animate-pulse" />
      </div>
    );
  }

  const activeConfig = cityConfig[activeCity] || cityConfig['Indore (Vijay Nagar)'];

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <PageHeader title="Parking" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl md:rounded-3xl overflow-hidden border border-border-subtle shadow-sm h-[350px] lg:h-[520px]">
          <MapContainer
            center={activeConfig.center}
            zoom={activeConfig.zoom}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
            <MapViewUpdater center={activeConfig.center} zoom={activeConfig.zoom} />
            {zones.map((z) => (
              <Polygon
                key={z.id}
                positions={z.polygon}
                pathOptions={{
                  fillColor: getColor(z),
                  fillOpacity: 0.3,
                  color: getColor(z),
                  weight: 2,
                }}
                eventHandlers={{
                  click: () => setSelectedZone(z),
                }}
              >
                <Tooltip>
                  <div className="p-1">
                    <div className="font-bold text-xs text-text-primary">{z.name}</div>
                    <div className="text-[10px] text-text-secondary mt-0.5">{z.availableSpots} of {z.totalSpots} spots free</div>
                  </div>
                </Tooltip>
              </Polygon>
            ))}
          </MapContainer>
        </div>

        {/* Side panel */}
        <div className="bg-bg-surface border border-border-subtle rounded-2xl md:rounded-3xl shadow-sm p-4 md:p-6 flex flex-col justify-between h-[350px] lg:h-[520px]">
          {selectedZone ? (
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-bold text-text-primary uppercase tracking-wider">{selectedZone.name}</h3>
              
              <div className="bg-bg-canvas/50 border border-border-subtle/50 rounded-2xl p-4 flex flex-col gap-1">
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold">Available Slots</span>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono font-bold text-3xl text-text-primary">{selectedZone.availableSpots}</span>
                  <span className="text-xs text-text-secondary font-medium">/ {selectedZone.totalSpots} spots free</span>
                </div>
              </div>

              {/* Visual bar */}
              <div>
                <span className="text-[10px] text-text-secondary uppercase tracking-wider font-bold block mb-2">Occupancy Level</span>
                <div className="w-full h-3 bg-bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${((selectedZone.totalSpots - selectedZone.availableSpots) / selectedZone.totalSpots) * 100}%`,
                      backgroundColor: getColor(selectedZone), // mapped correctly to status
                    }}
                  />
                </div>
              </div>

              <Button
                onClick={() => setReserveModal(true)}
                disabled={selectedZone.availableSpots === 0}
                className="w-full py-3"
              >
                Reserve Spot Now
              </Button>

              {reservedSpot && (
                <div className="mt-2 p-4 bg-accent-primary-soft border border-accent-primary/20 rounded-2xl text-center flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-accent-primary uppercase tracking-widest">Active Booking Code</span>
                  <span className="text-xl font-mono font-bold text-accent-primary">{reservedSpot}</span>
                  <span className="text-[10px] text-text-secondary font-medium">Valid for next 15 minutes</span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="text-text-tertiary opacity-30 mb-3">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="1" y="1" width="22" height="22" rx="6" />
                  <path d="M9 7h5a2 2 0 0 1 0 4h-5v6" />
                </svg>
              </div>
              <p className="text-xs font-bold text-text-secondary">Select a parking zone on the map</p>
              <p className="text-[10px] text-text-tertiary mt-1">Real-time status overlays and booking allocations are shown here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Circular Parking Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Card 1: Space Type Allocation Donut */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">City-Wide Occupancy</h3>
            <p className="text-xs text-text-secondary">Overall ratio of available to occupied parking bays.</p>
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
                  <span className="text-[9px] uppercase tracking-wider text-text-tertiary font-bold">Total Spots</span>
                  <span className="text-xl font-mono font-bold text-text-primary leading-none mt-0.5">{totalCitySpots}</span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No parking zones exist in the selected city.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: District Occupancy Bar Chart */}
        <div className="bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm flex flex-col h-[280px]">
          <div>
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Peak Occupied Zones</h3>
            <p className="text-xs text-text-secondary">Parking zones currently experiencing the highest volume.</p>
          </div>

          <div className="flex-1 mt-4">
            {topOccupiedZones.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topOccupiedZones} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
                  <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 9, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                  <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E5EA', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', fontSize: '12px', fontWeight: 'bold' }} />
                  <Bar dataKey="occupancyRatio" radius={[6, 6, 0, 0]} barSize={36} animationDuration={400}>
                    {topOccupiedZones.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center text-center h-full">
                <span className="text-xs font-bold text-text-secondary uppercase tracking-wider">No Data Available</span>
                <span className="text-[10px] text-text-tertiary mt-1 max-w-[200px] leading-relaxed">
                  No parking zones exist to calculate occupancy.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reserve Modal */}
      <Modal isOpen={reserveModal} onClose={() => setReserveModal(false)} title="Confirm Reservation">
        <p className="text-sm text-text-secondary mb-4">
          Reserve a parking spot at <strong>{selectedZone?.name}</strong>? The spot will be held for 15 minutes.
        </p>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={() => setReserveModal(false)} className="flex-1">Cancel</Button>
          <Button onClick={handleReserve} className="flex-1">Confirm Reserve</Button>
        </div>
      </Modal>
    </motion.div>
  );
};

export default Parking;
