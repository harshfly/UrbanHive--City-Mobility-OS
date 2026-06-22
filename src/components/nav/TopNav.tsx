import React, { useState, useEffect } from 'react';
import { CitySelector } from './CitySelector';
import { AIModeToggle } from './AIModeToggle';
import { AlertBell } from './AlertBell';
import { 
  User, Activity, Search, Command, Calendar, Clock, 
  Sun, CloudRain, CloudFog, CloudLightning 
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useEnvironmentStore } from '../../store/useEnvironmentStore';

export const TopNav: React.FC = () => {
  const { city } = useAppStore();
  const { weather } = useEnvironmentStore();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSpotlight = () => {
    // Dispatch Cmd+K keyboard event to trigger Spotlight
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const weatherDetails = {
    sunny: { icon: <Sun size={13} className="text-amber-500 animate-pulse" />, temp: '32°C', label: 'Sunny' },
    rain: { icon: <CloudRain size={13} className="text-blue-500" />, temp: '22°C', label: 'Rainy' },
    fog: { icon: <CloudFog size={13} className="text-slate-400" />, temp: '18°C', label: 'Foggy' },
    storm: { icon: <CloudLightning size={13} className="text-purple-500 animate-pulse" />, temp: '20°C', label: 'Storm' },
  };

  const current = weatherDetails[weather] || weatherDetails.sunny;

  return (
    <header className="h-16 bg-bg-surface border-b border-border-subtle flex items-center justify-between px-6 z-20 shrink-0 shadow-[0_1px_2px_rgba(16,20,36,0.02)]">
      {/* Dynamic Title / Environment Context */}
      <div className="flex items-center gap-3 shrink-0">
        <Activity size={18} className="text-accent-primary animate-pulse" />
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-text-primary leading-none">Indore Mobility Operations</h1>
          <span className="text-[11px] text-text-tertiary mt-1 font-medium">Zone: {city}</span>
        </div>
      </div>

      {/* Live Info Capsule */}
      <div className="hidden lg:flex items-center gap-3 px-3 py-1.5 bg-bg-canvas border border-border-subtle rounded-xl text-[10px] font-mono font-bold text-text-secondary select-none shadow-sm transition-all">
        <div className="flex items-center gap-1.5 border-r border-border-subtle pr-3">
          <Calendar size={12} className="text-accent-primary" />
          <span>{formatDate(time)}</span>
        </div>
        <div className="flex items-center gap-1.5 border-r border-border-subtle pr-3">
          <Clock size={12} className="text-accent-primary animate-pulse" />
          <span>{formatTime(time)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {current.icon}
          <span>{current.label}, {current.temp}</span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-4">
        {/* Spotlight trigger - widened */}
        <button
          onClick={handleSpotlight}
          className="hidden sm:flex items-center justify-between w-64 md:w-80 lg:w-96 px-3.5 py-1.5 rounded-xl bg-bg-canvas border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-strong transition-all duration-200 cursor-pointer shadow-inner"
        >
          <div className="flex items-center gap-2">
            <Search size={13} className="text-text-tertiary" />
            <span className="text-xs font-medium text-text-tertiary">Search commands, junctions, corridors...</span>
          </div>
          <kbd className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-bg-surface border border-border-subtle text-[9px] font-mono font-bold text-text-tertiary shrink-0">
            <Command size={9} /> K
          </kbd>
        </button>
        
        <CitySelector />
        <AIModeToggle />
        <AlertBell />
        <button className="w-8 h-8 rounded-full bg-accent-primary-soft flex items-center justify-center text-accent-primary hover:bg-accent-primary hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary">
          <User size={16} />
        </button>
      </div>
    </header>
  );
};
