import React from 'react';
import { X, Navigation } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';

const SidePanel = ({ feature, onClose, onDeactivateEmergency }) => {
  if (!feature) return null;

  const handleNavigate = () => {
    // Open Google Maps
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${feature.data.lat},${feature.data.lng}`, '_blank');
  };

  const renderContent = () => {
    switch (feature.type) {
      case 'traffic': {
        const { name, status, speed, phase } = feature.data;
        const mockChartData = Array.from({length: 10}, (_, i) => ({ speed: Math.max(5, speed + (Math.random() * 10 - 5)) }));
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">
              {name} — {status === 'heavy' ? 'Heavy Traffic' : status === 'moderate' ? 'Moderate Traffic' : 'Flowing'}
            </h2>
            
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="text-sm text-gray-600 mb-1">Current speed:</p>
              <p className="text-2xl font-bold text-gray-900">{speed} km/h <span className="text-sm font-normal text-gray-500">(usual: 45 km/h)</span></p>
            </div>

            <div className="flex justify-between items-center bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div>
                <p className="text-sm text-gray-600">AI signal phase:</p>
                <p className="font-medium text-gray-900">Phase {phase} active</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Est. wait:</p>
                <p className="font-medium text-gray-900">~{status === 'heavy' ? 4 : status === 'moderate' ? 2 : 1} min</p>
              </div>
            </div>

            <div className="h-24 mt-2">
              <p className="text-xs text-gray-500 mb-2 uppercase tracking-wider font-semibold">Recent Speed Trend</p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockChartData}>
                  <YAxis domain={[0, 60]} hide />
                  <Line type="monotone" dataKey="speed" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        );
      }

      case 'parking': {
        const { name, capacity, occupied, fill_pct, eta_full } = feature.data;
        const freeSpaces = capacity - occupied;

        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full border-8 border-blue-100 flex items-center justify-center relative">
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                  <circle cx="36" cy="36" r="36" className="fill-none stroke-blue-600 stroke-[8]" strokeDasharray={`${fill_pct * 2.26} 226`} />
                </svg>
                <span className="font-bold text-gray-900">{fill_pct.toFixed(0)}%</span>
              </div>
              <div>
                <p className="text-3xl font-bold text-gray-900">{freeSpaces} <span className="text-base font-normal text-gray-500">free of {capacity}</span></p>
                <p className="text-sm text-gray-600">Parking spaces available</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)] mt-2">
              <p className="text-sm text-gray-600">Estimated full in:</p>
              <p className={`text-xl font-bold ${eta_full < 15 ? 'text-red-600' : 'text-gray-900'}`}>{eta_full} min</p>
            </div>

            <button onClick={handleNavigate} className="w-full bg-[#007AFF] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'ev': {
        const { name, load, bays_total, bays_free, suggestion } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className="flex justify-between items-end mb-2">
                <p className="text-sm text-gray-600">Station Load</p>
                <p className="font-bold text-gray-900">{load}%</p>
              </div>
              <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${load > 80 ? 'bg-red-500' : load > 60 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                  style={{width: `${load}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="text-sm text-gray-600 mb-1">Free bays:</p>
              <p className="text-2xl font-bold text-gray-900">{bays_free} <span className="text-sm font-normal text-gray-500">of {bays_total}</span></p>
            </div>

            {load > 80 && suggestion && (
              <div className="bg-blue-50/80 backdrop-blur-md text-blue-800 p-5 rounded-2xl border border-blue-200/50 flex gap-3 items-start mt-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <div className="mt-0.5">⚡</div>
                <div>
                  <p className="font-medium mb-1">This charger is getting full.</p>
                  <p className="text-sm">{suggestion}</p>
                </div>
              </div>
            )}

            <button onClick={handleNavigate} className="w-full bg-[#007AFF] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'petrol': {
        const { name, queue, congestion, recommended } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-bold text-gray-900 border-b pb-2">{name}</h2>
            
            <div className="flex gap-4">
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{queue}</p>
                <p className="text-sm text-gray-600">Cars waiting</p>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-lg font-bold text-gray-900 capitalize mt-1">{congestion}</p>
                <p className="text-sm text-gray-600">Road to pump</p>
              </div>
            </div>

            {recommended && (
              <div className="bg-green-50/80 backdrop-blur-md text-green-800 p-5 rounded-2xl border border-green-200/50 flex items-center gap-3 mt-2 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600 shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                <p className="text-sm font-medium">AI Pick — lowest wait + easiest route right now</p>
              </div>
            )}

            <button onClick={handleNavigate} className="w-full bg-[#007AFF] text-white rounded-full py-3.5 mt-4 font-semibold flex items-center justify-center gap-2 hover:bg-blue-600 shadow-sm transition-colors">
              <Navigation size={18} />
              Navigate Here
            </button>
          </div>
        );
      }

      case 'emergency_corridor': {
        const { id, vehicleType, from, to, eta, clearedJunctions } = feature.data;
        
        return (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></div>
              <h2 className="text-xl font-bold">Corridor Active</h2>
            </div>
            
            <div className="bg-red-50/80 backdrop-blur-md p-5 rounded-2xl border border-red-200/50 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <p className="font-bold text-red-900 text-lg">{id} — {vehicleType}</p>
              <div className="flex items-center gap-2 mt-2 text-red-800 font-medium">
                <span>{from}</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                <span>{to}</span>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{clearedJunctions}</p>
                <p className="text-sm text-gray-600">Junctions cleared</p>
              </div>
              <div className="flex-1 bg-white/60 backdrop-blur-md p-5 rounded-2xl border border-white/50 text-center shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                <p className="text-3xl font-bold text-gray-900">{eta} <span className="text-lg">min</span></p>
                <p className="text-sm text-gray-600">Est. arrival</p>
              </div>
            </div>

            <button 
              onClick={onDeactivateEmergency} 
              className="w-full bg-[#FF3B30] text-white rounded-full py-3.5 mt-4 font-semibold hover:bg-red-600 shadow-sm transition-colors"
            >
              Deactivate Corridor
            </button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`absolute top-0 right-0 bottom-0 w-[380px] glass z-[1000] transform transition-transform duration-300 cubic-bezier(0.2, 0.8, 0.2, 1) ${feature ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
        >
          <X size={24} />
        </button>
        <div className="p-6 pt-12 overflow-y-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default SidePanel;
