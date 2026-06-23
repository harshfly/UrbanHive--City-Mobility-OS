import React from 'react';
import { Activity, Car, Zap, Fuel, AlertTriangle, Cloud, Clock } from 'lucide-react';

const TopBar = ({ activeLayers, toggleLayer }) => {
  const timeString = new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const buttons = [
    { id: 'traffic', label: 'Traffic', icon: Activity },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'ev', label: 'EV', icon: Zap },
    { id: 'petrol', label: 'Petrol', icon: Fuel },
    { id: 'emergency', label: 'Emergency', icon: AlertTriangle }
  ];

  return (
    <div className="h-16 glass flex items-center justify-between px-6 z-[1000] relative border-b border-white/20">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-[#007AFF] rounded-xl flex items-center justify-center text-white font-bold shadow-sm">
          UH
        </div>
        <div>
          <h1 className="font-bold text-gray-900 leading-tight">UrbanHive</h1>
          <p className="text-xs text-gray-500">City Mobility OS</p>
        </div>
      </div>

      <div className="flex gap-2">
        {buttons.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => toggleLayer(id)}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm ${
              activeLayers[id] 
                ? 'bg-[#007AFF] text-white border border-[#007AFF]/20' 
                : 'bg-white/50 border-white/30 text-gray-700 hover:bg-white/80'
            }`}
          >
            <Icon size={16} className={activeLayers[id] ? 'text-white' : 'text-gray-500'} />
            {label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-4 text-sm font-medium text-gray-700">
        <div className="flex items-center gap-1.5">
          <Cloud size={16} className="text-gray-400" />
          <span>Indore, 32°C Sunny</span>
        </div>
        <div className="flex items-center gap-1.5 border-l pl-4 border-gray-200">
          <Clock size={16} className="text-gray-400" />
          <span>{timeString}</span>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
