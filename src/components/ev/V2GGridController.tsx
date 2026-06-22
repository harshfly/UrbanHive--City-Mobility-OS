import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, BatteryCharging, ArrowLeftRight, AlertTriangle, Power, Gauge } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';
import { cn } from '../../theme/cn';
import { Badge } from '../ui/Badge';

// Individual EV car indicator with electric pulse
const EVCarNode: React.FC<{ index: number; v2gActive: boolean; feedingGrid: boolean }> = ({ index, v2gActive, feedingGrid }) => {
  return (
    <div className="relative flex flex-col items-center gap-1">
      <motion.div
        className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center border-2 transition-all',
          feedingGrid
            ? 'bg-emerald-50 border-emerald-400 shadow-[0_0_12px_rgba(52,199,89,0.3)]'
            : v2gActive
              ? 'bg-blue-50 border-blue-400'
              : 'bg-bg-canvas border-border-subtle'
        )}
        animate={feedingGrid ? { scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <BatteryCharging size={14} className={feedingGrid ? 'text-emerald-500' : v2gActive ? 'text-blue-500' : 'text-text-tertiary'} />
      </motion.div>
      
      {/* Electric pulse animation */}
      {feedingGrid && (
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], y: [-2, -14] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: index * 0.2 }}
        >
          <Zap size={9} className="text-emerald-400 fill-emerald-400" />
        </motion.div>
      )}
      
      <span className="text-[8px] font-mono font-bold text-text-tertiary">EV-{(index + 1).toString().padStart(2, '0')}</span>
    </div>
  );
};

export const V2GGridController: React.FC<{ className?: string }> = ({ className }) => {
  const [gridDemand, setGridDemand] = useState(55); // 0-100
  const [v2gEnabled, setV2gEnabled] = useState(false);
  const evCount = 8;

  // Calculate how many EVs are feeding back to grid
  const feedingCount = useMemo(() => {
    if (!v2gEnabled) return 0;
    if (gridDemand < 60) return 0;
    if (gridDemand < 75) return 2;
    if (gridDemand < 85) return 4;
    if (gridDemand < 95) return 6;
    return evCount;
  }, [v2gEnabled, gridDemand]);

  // Calculate effective grid load
  const effectiveLoad = useMemo(() => {
    if (!v2gEnabled) return gridDemand;
    const v2gReduction = feedingCount * 4; // Each EV reduces 4%
    return Math.max(30, gridDemand - v2gReduction);
  }, [gridDemand, v2gEnabled, feedingCount]);

  const isStressed = effectiveLoad > 85;
  const isCritical = effectiveLoad > 95;

  // Hourly grid load chart data
  const gridChartData = useMemo(() => {
    return [
      { hour: '6AM', load: 30 },
      { hour: '8AM', load: 55 },
      { hour: '10AM', load: 65 },
      { hour: '12PM', load: gridDemand },
      { hour: '2PM', load: Math.min(100, gridDemand + 10) },
      { hour: '4PM', load: Math.min(100, gridDemand + 5) },
      { hour: '6PM', load: Math.max(40, gridDemand - 15) },
      { hour: '8PM', load: Math.max(35, gridDemand - 25) },
    ].map((d) => ({
      ...d,
      effective: v2gEnabled ? Math.max(30, d.load - feedingCount * 3) : d.load,
    }));
  }, [gridDemand, v2gEnabled, feedingCount]);

  const getBarColor = (val: number) => {
    if (val > 90) return '#FF3B30';
    if (val > 70) return '#FF9500';
    return '#34C759';
  };

  return (
    <div className={cn('bg-bg-surface border border-border-subtle rounded-3xl p-6 shadow-sm', className)}>
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Power size={14} className="text-accent-primary" />
            <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider">V2G Smart Grid Controller</h3>
          </div>
          <p className="text-[10px] text-text-secondary">Vehicle-to-Grid energy feedback system</p>
        </div>
        <div className="flex items-center gap-2">
          {isStressed && !v2gEnabled && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 px-2 py-1 rounded-full bg-accent-red-soft border border-red-200"
            >
              <AlertTriangle size={10} className="text-accent-red" />
              <span className="text-[9px] font-bold text-accent-red">Grid Stressed</span>
            </motion.div>
          )}
          <Badge variant={effectiveLoad > 85 ? 'red' : effectiveLoad > 60 ? 'amber' : 'green'}>
            {Math.round(effectiveLoad)}% Load
          </Badge>
        </div>
      </div>

      {/* Grid Demand Slider */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">City Power Demand</span>
          <span className="text-xs font-mono font-bold text-text-primary">{gridDemand}%</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="20"
            max="100"
            value={gridDemand}
            onChange={(e) => setGridDemand(Number(e.target.value))}
            className="w-full h-2 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #34C759 0%, #FF9500 60%, #FF3B30 100%)`,
            }}
          />
          <div className="flex justify-between mt-1">
            <span className="text-[8px] font-mono text-text-tertiary">Low</span>
            <span className="text-[8px] font-mono text-text-tertiary">Peak</span>
          </div>
        </div>
      </div>

      {/* V2G Toggle */}
      <div className="mb-5">
        <button
          onClick={() => setV2gEnabled(!v2gEnabled)}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition-all duration-500',
            v2gEnabled
              ? 'bg-emerald-50 border-emerald-400 shadow-[0_0_20px_rgba(52,199,89,0.15)]'
              : 'bg-bg-canvas border-border-subtle hover:border-border-strong'
          )}
        >
          <div className="flex items-center gap-3">
            <motion.div
              animate={v2gEnabled ? { rotate: [0, 180] } : { rotate: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ArrowLeftRight size={16} className={v2gEnabled ? 'text-emerald-500' : 'text-text-tertiary'} />
            </motion.div>
            <div className="text-left">
              <div className={cn('text-xs font-bold', v2gEnabled ? 'text-emerald-700' : 'text-text-primary')}>
                V2G Feedback {v2gEnabled ? 'Active' : 'Disabled'}
              </div>
              <div className="text-[10px] text-text-secondary mt-0.5">
                {v2gEnabled
                  ? `${feedingCount} EVs feeding ${feedingCount * 4}kW back to grid`
                  : 'Enable to allow parked EVs to supply power back'}
              </div>
            </div>
          </div>
          <div className={cn(
            'w-11 h-6 rounded-full transition-all duration-500 relative',
            v2gEnabled ? 'bg-emerald-500' : 'bg-zinc-200'
          )}>
            <motion.div
              className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm"
              animate={{ left: v2gEnabled ? '22px' : '2px' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </button>
      </div>

      {/* EV Fleet Visual */}
      <div className="mb-5">
        <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest block mb-3">Connected EV Fleet</span>
        <div className="grid grid-cols-8 gap-2">
          {Array.from({ length: evCount }).map((_, i) => (
            <EVCarNode
              key={i}
              index={i}
              v2gActive={v2gEnabled}
              feedingGrid={v2gEnabled && i < feedingCount}
            />
          ))}
        </div>
        
        {/* V2G Flow indicator */}
        <AnimatePresence>
          {v2gEnabled && feedingCount > 0 && (
            <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              exit={{ opacity: 0, scaleX: 0 }}
              className="mt-3 h-1 bg-gradient-to-r from-emerald-400 via-emerald-300 to-blue-400 rounded-full overflow-hidden"
            >
              <motion.div
                className="h-full w-1/4 bg-white/50 rounded-full"
                animate={{ x: ['0%', '300%'] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hourly Grid Load Chart */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest">Hourly Grid Load</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-[9px] font-bold text-text-tertiary">
              <span className="w-2 h-2 rounded-sm bg-zinc-300" /> Demand
            </span>
            {v2gEnabled && (
              <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
                <span className="w-2 h-2 rounded-sm bg-emerald-400" /> V2G Active
              </span>
            )}
          </div>
        </div>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={gridChartData} margin={{ top: 5, right: 5, left: -30, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F5F5F7" />
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 8, fill: '#8E8E93', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
              <Bar dataKey={v2gEnabled ? 'effective' : 'load'} radius={[4, 4, 0, 0]} barSize={16}>
                {gridChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(v2gEnabled ? entry.effective : entry.load)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Status Summary */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-bg-canvas border border-border-subtle/60 rounded-xl p-2.5 text-center">
          <span className="block text-[8px] uppercase tracking-wider text-text-tertiary font-bold">Peak Load</span>
          <span className={cn('text-xs font-mono font-bold', isCritical ? 'text-accent-red' : 'text-text-primary')}>
            {Math.round(Math.min(100, gridDemand + 10))}%
          </span>
        </div>
        <div className="bg-bg-canvas border border-border-subtle/60 rounded-xl p-2.5 text-center">
          <span className="block text-[8px] uppercase tracking-wider text-text-tertiary font-bold">V2G Output</span>
          <span className="text-xs font-mono font-bold text-emerald-500">
            {v2gEnabled ? `${feedingCount * 4}kW` : '—'}
          </span>
        </div>
        <div className="bg-bg-canvas border border-border-subtle/60 rounded-xl p-2.5 text-center">
          <span className="block text-[8px] uppercase tracking-wider text-text-tertiary font-bold">Savings</span>
          <span className="text-xs font-mono font-bold text-accent-primary">
            {v2gEnabled ? `₹${feedingCount * 120}` : '—'}
          </span>
        </div>
      </div>
    </div>
  );
};
