import React, { useState } from 'react';
import { useUrbanHiveSocket } from './hooks/useUrbanHiveSocket';
import TopBar from './components/TopBar';
import StatusBar from './components/StatusBar';
import UrbanHiveMap from './components/UrbanHiveMap';
import SidePanel from './components/SidePanel';
import EmergencyModal from './components/EmergencyModal';

function App() {
  const { data, connected, alerts } = useUrbanHiveSocket();

  const [activeLayers, setActiveLayers] = useState({
    traffic: true,
    parking: false,
    ev: false,
    petrol: false,
    emergency: false
  });

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyCorridor, setEmergencyCorridor] = useState(null);

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  const handleFeatureClick = (feature) => {
    setSelectedFeature(feature);
  };

  const closeSidePanel = () => {
    setSelectedFeature(null);
  };

  const handleEmergencyActivate = (payload) => {
    // Mocking an emergency activation success
    setEmergencyCorridor({
      ...payload,
      coords: [[22.7523,75.8890],[22.7400,75.8700],[22.7196,75.8577]],
      eta: 6,
      clearedJunctions: 4
    });
    setActiveLayers(prev => ({ ...prev, emergency: true }));
    setIsEmergencyModalOpen(false);
    
    // Auto open side panel for emergency
    setSelectedFeature({
      type: 'emergency_corridor',
      data: {
        id: payload.vehicle_id,
        vehicleType: payload.type,
        from: payload.from_location,
        to: payload.to_location,
        eta: 6,
        clearedJunctions: 4
      }
    });
  };

  const deactivateEmergency = () => {
    setEmergencyCorridor(null);
    setActiveLayers(prev => ({ ...prev, emergency: false }));
    closeSidePanel();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-100 font-sans">
      <TopBar 
        activeLayers={activeLayers} 
        toggleLayer={toggleLayer} 
      />
      
      <div className="flex-1 relative overflow-hidden">
        <UrbanHiveMap 
          data={data}
          activeLayers={activeLayers}
          onFeatureClick={handleFeatureClick}
          emergencyCorridor={emergencyCorridor}
        />

        <SidePanel 
          feature={selectedFeature} 
          onClose={closeSidePanel} 
          onDeactivateEmergency={deactivateEmergency}
        />

        {/* Floating Emergency Button */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="absolute bottom-6 right-6 w-14 h-14 bg-[#FF3B30] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgba(255,59,48,0.4)] hover:scale-110 hover:bg-[#FF453A] transition-all duration-300 z-[1000] border border-white/20"
          title="Activate Emergency Corridor"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
        </button>
      </div>

      <StatusBar 
        data={data} 
        connected={connected} 
        alerts={alerts} 
      />

      {isEmergencyModalOpen && (
        <EmergencyModal 
          onClose={() => setIsEmergencyModalOpen(false)} 
          onActivate={handleEmergencyActivate}
        />
      )}
    </div>
  );
}

export default App;
