// src/components/Sidebar/Sidebar.jsx

import { useCallback } from 'react';
import SidebarTabs   from './SidebarTabs';
import Tab1Content   from './Tab1Content';
import Tab2Content   from './Tab2Content';
import './Sidebar.css';

export default function Sidebar({
  sidebarOpen,
  toggleSidebar,
  activeSidebarTab,
  setActiveSidebarTab,

  // map-switcher props
  selectedMap,
  setSelectedMap,
  MAPS,
  TURN_MAPS,

  // import-list state (we need the setter)
  importedMaps,
  setImportedMaps,

  // fleet props…
  fleetImportText,
  setFleetImportText,
  setFleetImportTrigger,
  selectedFleet,
  setSelectedFleet,
  fleetData,
  setSelectedFleetCoords,
}) {
  // correct import handler
  const handleImport = useCallback((map) => {
    setImportedMaps(prev => [...prev, map]);
    setSelectedMap(map.name);
  }, [setImportedMaps, setSelectedMap]);

  // correct delete handler
  const handleDeleteImport = useCallback((name) => {
    setImportedMaps(prev => prev.filter(m => m.name !== name));
    if (selectedMap === name) {
      setSelectedMap('Claims');
    }
  }, [setImportedMaps, selectedMap, setSelectedMap]);

  return (
    <div className={`sidebar-root ${sidebarOpen ? 'sidebar-open' : ''}`}>
      <div
        className={`sidebar-tab ${sidebarOpen ? 'open' : ''}`}
        onClick={toggleSidebar}
      >
        ☰
      </div>

      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <SidebarTabs
            active={activeSidebarTab}
            onChange={setActiveSidebarTab}
          />
        </div>
        <div className="sidebar-main">
          <div className="sidebar-content">
            {activeSidebarTab === 'tab1' && (
              <Tab1Content
                selectedMap={selectedMap}
                onChange={setSelectedMap}
                MAPS={MAPS}
                TURN_MAPS={TURN_MAPS}
                importedMaps={importedMaps}
                onImport={handleImport}
                onDeleteImport={handleDeleteImport}
              />
            )}

            {activeSidebarTab === 'tab2' && (
              <Tab2Content
                fleetImportText={fleetImportText}
                setFleetImportText={setFleetImportText}
                setFleetImportTrigger={setFleetImportTrigger}
                selectedFleet={selectedFleet}
                setSelectedFleet={setSelectedFleet}
                fleetData={fleetData}
                setSelectedFleetCoords={setSelectedFleetCoords}
              />
            )}
          </div>
        </div>
        <div className="sidebar-footer"><small></small></div>
      </aside>
    </div>
  );
}
