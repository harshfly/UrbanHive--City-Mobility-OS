import React, { useState } from 'react';
import { useUrbanHiveSocket } from './hooks/useUrbanHiveSocket';
import TopBar from './components/TopBar';
import StatusBar from './components/StatusBar';
import UrbanHiveMap from './components/UrbanHiveMap';
import SidePanel from './components/SidePanel';
import EmergencyModal from './components/EmergencyModal';
import SearchBar from './components/SearchBar';
import MapControls from './components/MapControls';
import { Activity, Car, Zap, Fuel, AlertTriangle, Map, Navigation2, Sun, Moon } from 'lucide-react';

function App() {
  const { data, connected, alerts } = useUrbanHiveSocket();

  const [activeLayers, setActiveLayers] = useState({
    infra: true,
    traffic: true,
    parking: false,
    ev: false,
    petrol: false,
    emergency: false
  });

  const [selectedFeature, setSelectedFeature] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapStyle, setMapStyle] = useState('light');
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [emergencyCorridor, setEmergencyCorridor] = useState(null);

  const handleLocate = () => {
    setMapCenter([22.7196, 75.8577]);
    setMapZoom(13);
  };

  const handleSelectLocation = (item) => {
    setSelectedFeature({ type: item.type, data: item.data });
    setMapCenter([item.lat, item.lng]);
    setMapZoom(14);

    const layerMapping = { metro_station: 'infra', famous_location: 'infra', parking: 'parking', ev: 'ev', petrol: 'petrol' };
    const targetLayer = layerMapping[item.type];
    if (targetLayer && !activeLayers[targetLayer]) {
      setActiveLayers(prev => ({ ...prev, [targetLayer]: true }));
    }
  };

  const toggleLayer = (layer) => {
    setActiveLayers(prev => ({ ...prev, [layer]: !prev[layer] }));
  };

  const handleFeatureClick = (feature) => setSelectedFeature(feature);
  const closeSidePanel = () => setSelectedFeature(null);

  const handleEmergencyActivate = (payload) => {
    setEmergencyCorridor({
      ...payload,
      coords: [[22.7523,75.8890],[22.7400,75.8700],[22.7196,75.8577]],
      eta: 6, clearedJunctions: 4
    });
    setActiveLayers(prev => ({ ...prev, emergency: true }));
    setIsEmergencyModalOpen(false);
    setSelectedFeature({
      type: 'emergency_corridor',
      data: { id: payload.vehicle_id, vehicleType: payload.type, from: payload.from_location, to: payload.to_location, eta: 6, clearedJunctions: 4 }
    });
  };

  const deactivateEmergency = () => {
    setEmergencyCorridor(null);
    setActiveLayers(prev => ({ ...prev, emergency: false }));
    closeSidePanel();
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F5F5F7]">
      <TopBar>
        {/* Desktop Search Bar (Hidden on Mobile) */}
        <div className="hidden md:block w-[360px]">
          <SearchBar data={data} onSelectLocation={handleSelectLocation} isDesktopNav={true} />
        </div>
      </TopBar>

      <div className="flex-1 relative overflow-hidden">
        <UrbanHiveMap
          data={data}
          activeLayers={activeLayers}
          onFeatureClick={handleFeatureClick}
          emergencyCorridor={emergencyCorridor}
          mapCenter={mapCenter}
          mapZoom={mapZoom}
          onZoomEnd={setMapZoom}
          mapStyle={mapStyle}
        />

        {/* Mobile Search Bar (Hidden on Desktop) */}
        <div className="md:hidden">
          <SearchBar data={data} onSelectLocation={handleSelectLocation} />
        </div>

        {/* Apple-style Glassmorphic Layer Toggles */}
        <div className="absolute top-[60px] md:top-4 left-0 right-0 z-[999] px-3 md:px-4 flex md:justify-center pointer-events-none">
          <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide pointer-events-auto" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <button
              onClick={() => setMapStyle(mapStyle === 'dark' ? 'light' : 'dark')}
              className="flex items-center gap-1.5 md:gap-2 h-8 md:h-9 px-3 md:px-3.5 rounded-full text-[11px] md:text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-gray-800 hover:bg-white/50"
            >
              {mapStyle === 'dark' ? <Sun size={14} strokeWidth={2.2} className="text-amber-500" /> : <Moon size={14} strokeWidth={2.2} className="text-indigo-500" />}
              <span>{mapStyle === 'dark' ? 'Light Map' : 'Dark Map'}</span>
            </button>
            <div className="w-px h-5 my-auto bg-gray-300/50 mx-0.5"></div>
            {[
              { id: 'infra', label: 'Infrastructure', icon: Map, color: 'emerald' },
              { id: 'traffic', label: 'Traffic', icon: Activity, color: 'emerald' },
              { id: 'parking', label: 'Parking', icon: Car, color: 'emerald' },
              { id: 'ev', label: 'EV Charging', icon: Zap, color: 'emerald' },
              { id: 'petrol', label: 'Petrol', icon: Fuel, color: 'emerald' },
              { id: 'emergency', label: 'Emergency', icon: AlertTriangle, color: 'red' },
            ].map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => toggleLayer(id)}
                className={`flex items-center gap-1.5 md:gap-2 h-8 md:h-9 px-3 md:px-3.5 rounded-full text-[11px] md:text-[12px] font-semibold whitespace-nowrap shrink-0 transition-all duration-200 active:scale-95 ${
                  activeLayers[id]
                    ? color === 'red'
                      ? 'bg-[#FF3B30] text-white shadow-[0_4px_12px_rgba(255,59,48,0.4)] border border-[#FF3B30]'
                      : 'bg-[#059669] text-white shadow-[0_4px_12px_rgba(5,150,105,0.4)] border border-[#059669]'
                    : 'bg-white/40 backdrop-blur-3xl border border-white/50 shadow-[0_2px_12px_rgba(0,0,0,0.06)] text-gray-700 hover:bg-white/50'
                }`}
              >
                <Icon size={13} strokeWidth={2.2} className={activeLayers[id] ? 'text-white' : 'text-gray-500'} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        <SidePanel
          feature={selectedFeature}
          onClose={closeSidePanel}
          onDeactivateEmergency={deactivateEmergency}
        />

        <MapControls
          currentZoom={mapZoom}
          onZoomChange={setMapZoom}
          onLocate={handleLocate}
          currentStyle={mapStyle}
          onStyleChange={setMapStyle}
          activeLayers={activeLayers}
          toggleLayer={toggleLayer}
          hasSidePanelOpen={!!selectedFeature}
        />

        {/* Emergency FAB — smaller on mobile */}
        <button
          onClick={() => setIsEmergencyModalOpen(true)}
          className="absolute bottom-20 md:bottom-5 left-3 md:left-4 w-10 h-10 md:w-11 md:h-11 bg-[#FF3B30] text-white rounded-xl flex items-center justify-center shadow-[0_4px_16px_rgba(255,59,48,0.35)] hover:shadow-[0_8px_24px_rgba(255,59,48,0.45)] active:scale-95 transition-all duration-200 z-[1000] group"
          title="Emergency"
        >
          <svg className="group-hover:rotate-12 transition-transform duration-200" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.268 21a2 2 0 0 0 3.464 0"/><path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326"/></svg>
        </button>
      </div>

      <StatusBar data={data} connected={connected} alerts={alerts} />

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
