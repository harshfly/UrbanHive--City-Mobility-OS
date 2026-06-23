import React, { useEffect, useState } from 'react';

const StatusBar = ({ data, connected, alerts }) => {
  const [flash, setFlash] = useState(false);
  const [lastAlertCount, setLastAlertCount] = useState(0);

  useEffect(() => {
    if (alerts.length > lastAlertCount) {
      setFlash(true);
      setTimeout(() => setFlash(false), 300);
      setLastAlertCount(alerts.length);
    }
  }, [alerts, lastAlertCount]);

  // Aggregate numbers
  const totalVehicles = 4812; // Static as per requirements for tracked vehicles
  const avgSpeed = data?.traffic?.avg_speed || 0;
  const activeAlerts = alerts.length;
  const lastUpdate = data?.timestamp ? new Date(data.timestamp).toLocaleTimeString('en-US') : 'Waiting...';

  return (
    <div className={`h-10 border-t flex items-center px-6 text-xs font-medium justify-between z-[1000] relative transition-colors duration-300 ${flash ? 'bg-yellow-100 border-yellow-300' : 'glass-dark text-gray-300 border-white/10'}`}>
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          {connected ? (
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
          ) : (
            <div className="w-2 h-2 rounded-full border border-gray-400"></div>
          )}
          <span className={flash ? 'text-gray-900' : 'text-gray-300'}>
            {connected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
        
        <div className="hidden sm:flex gap-6">
          <span>Vehicles tracked: {totalVehicles.toLocaleString()}</span>
          <span>Avg speed: {avgSpeed} km/h</span>
          <span className={activeAlerts > 0 ? 'text-yellow-500' : ''}>Active alerts: {activeAlerts}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <span>Last update: {lastUpdate}</span>
      </div>
    </div>
  );
};

export default StatusBar;
