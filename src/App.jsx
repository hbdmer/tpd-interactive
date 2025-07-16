// src/App.jsx
import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvent,
  Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Assets
import Logo from './assets/icon/favicon.ico';
import mapDefault from './assets/map/nationmap.png';
import mapBiome from './assets/map/biomemap.png';
import mapFarm from './assets/map/farmmap.png';
import mapPop from './assets/map/popmap.png';
import mapRes from './assets/map/resmap.png';
import mapReg from './assets/map/namedmap.png';
import markerIcons from './markerIcons';
import resourceLegend from './assets/map/Resource_legend.png';

// Components
import CursorManager from './components/CursorManager';
import FleetMapApp from './components/FleetManager';
import MapEventHandler from './components/MapEventHandler';
import Toolbar from './components/Toolbar';
import Toast from './components/Toast';
import CoordinateDisplay from './components/CoordinateDisplay';
import MapSwitcher from './components/MapSwitcher';
import NationSummary from './components/NationSummary';
import NationSummaryPanel from './components/NationSummaryPanel';

// Styles
import './App.css';

// Constants
const bounds = [[0, 0], [6000, 8000]];
const center = [3000, 4000];
const markersData = [];

const TopLeftCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const turnCtx = require.context('./assets/map/turnmap', false, /\.png$/);
const TURN_MAPS = turnCtx.keys().sort().reduce((acc, file) => {
  const name = file.replace('./', '').replace('.png', '');
  acc[name] = turnCtx(file);
  return acc;
}, {});

const MAPS = {
  Claims: mapDefault,
  Biome: mapBiome,
  Arability: mapFarm,
  Population: mapPop,
  Resources: mapRes,
  Region: mapReg,
  ...TURN_MAPS,
};

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [toastMsg, setToastMsg] = useState('');
  const [drawStart, setDrawStart] = useState(null);
  const [lines, setLines] = useState([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState('tab1');
  const [selectedMap, setSelectedMap] = useState('Claims');
  const [eraseRadius, setEraseRadius] = useState(50);
  const [isMultiDraw, setIsMultiDraw] = useState(false);
  const [fleetImportText, setFleetImportText] = useState('');
  const [fleetImportTrigger, setFleetImportTrigger] = useState('');
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetData, setFleetData] = useState([]);
  const [legendOpen, setLegendOpen] = useState(false);
  const [importedMaps, setImportedMaps] = useState([]);
  const [showCapitals, setShowCapitals] = useState(true);
  const [activeNation, setActiveNation] = useState(null);
  const [nationSidebarOpen, setNationSidebarOpen] = useState(false);


  const toggleSidebar = () => setSidebarOpen(open => !open);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${coords.x}\t${coords.y}`);
    setToastMsg('Copied to clipboard');
    setTimeout(() => setToastMsg(''), 2000);
  }, [coords]);

  const handleImport = (map) => {
    setImportedMaps(prev => [...prev, map]);
    setSelectedMap(map.name);
  };

  const handleDeleteImport = (name) => {
    setImportedMaps(prev => prev.filter(m => m.name !== name));
    if (selectedMap === name) setSelectedMap('Claims');
  };


  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Control') setIsMultiDraw(true);
    };
    const handleKeyUp = (e) => {
      if (e.key === 'Control') setIsMultiDraw(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const MapClickDeselect = ({ setSelectedFleet }) => {
    useMapEvent('click', (e) => {
      setSelectedFleet(null);
    });
    return null;
  };

  

  const mapClasses = ['leaflet-container', activeTool === 'copy' && 'copy-cursor', activeTool === 'erase' && 'erase-cursor'].filter(Boolean).join(' ');

  return (
    
  <div className={`App ${sidebarOpen ? 'sidebar-open' : ''} ${nationSidebarOpen ? 'nation-open' : ''}`}>
      <div className={`sidebar-tab ${sidebarOpen ? 'open' : ''}`} onClick={toggleSidebar}>☰</div>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-tabs">
            <button className={`sidebar-tab-btn ${activeSidebarTab === 'tab1' ? 'active' : ''}`} onClick={() => setActiveSidebarTab('tab1')}>
              <img src={Logo} alt="TPD" className="tab-icon" />
            </button>
            <button className={`sidebar-tab-btn ${activeSidebarTab === 'tab2' ? 'active' : ''}`} onClick={() => setActiveSidebarTab('tab2')}>
              ⛭
            </button>
          </div>
        </div>
        <div className="sidebar-main">
          <div className="sidebar-content">
          {activeSidebarTab === 'tab1' && (
              <div>
                
                <MapSwitcher
                  current={selectedMap}
                  onChange={setSelectedMap}
                  MAPS={MAPS}
                  TURN_MAPS={TURN_MAPS}
                  importedMaps={importedMaps}
                  onImport={handleImport}
                  onDeleteImport={handleDeleteImport}
                />
                 
              </div>
            )}
          {activeSidebarTab === 'tab2' && (
            <div>
              <textarea
                className="w-full h-40 border p-2 text-sm"
                value={fleetImportText}
                onChange={(e) => setFleetImportText(e.target.value)}
                placeholder="Paste fleet data here..."
              />
              <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setFleetImportTrigger(fleetImportText)}
              >
                Import Fleets
              </button>
              
              {selectedFleet && (
                <div className="mt-4 text-sm bg-black bg-opacity-30 text-white p-3 border border-white rounded">
                  <br /><strong>{selectedFleet.name}</strong><br />
                  {selectedFleet.place}<br />
                  Officer: {selectedFleet.officers}<br /><br />
                  Stance: {selectedFleet.stance}<br /> <br />
                  Health: {selectedFleet.health}<br />
                  Max Range: {selectedFleet.range}<br /><br />
                  Initial Position: ({selectedFleet.xStart}, {selectedFleet.yStart})<br />

                  {selectedFleet.xMid !== null && selectedFleet.yMid !== null ? (
                    <>
                      Midpoint: ({Math.round(selectedFleet.xMid)}, {Math.round(selectedFleet.yMid)})<br />
                      End Position: ({Math.round(selectedFleet.x)}, {Math.round(selectedFleet.y)})<br /><br />
                      Distance A → B: {Math.round(
                        Math.hypot(
                          selectedFleet.xMid - selectedFleet.xStart,
                          selectedFleet.yMid - selectedFleet.yStart
                        )
                      )} units<br />
                      Distance B → C: {Math.round(
                        Math.hypot(
                          selectedFleet.x - selectedFleet.xMid,
                          selectedFleet.y - selectedFleet.yMid
                        )
                      )} units<br /><br />
                      Total Distance: {Math.round(
                        Math.hypot(
                          selectedFleet.xMid - selectedFleet.xStart,
                          selectedFleet.yMid - selectedFleet.yStart
                        ) + Math.hypot(
                          selectedFleet.x - selectedFleet.xMid,
                          selectedFleet.y - selectedFleet.yMid
                        )
                      )} units<br />
                    </>
                  ) : (
                    <>
                      End Position: ({Math.round(selectedFleet.x)}, {Math.round(selectedFleet.y)})<br /><br />
                      Distance: {Math.round(
                        Math.hypot(
                          selectedFleet.x - selectedFleet.xStart,
                          selectedFleet.y - selectedFleet.yStart
                        )
                      )} units<br /><br />
                    </>
                  )}
                  {/* Midpoint Controls */}
                  {selectedFleet && (
                <div className="mt-2">
                  <label className="block font-bold mb-1">Midpoint:</label>

                  {selectedFleet.xMid !== null && selectedFleet.yMid !== null ? (
                    <>
                      (
                      <input
                        className="fleet-input"
                        type="number"
                        value={selectedFleet.xMid ?? ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setSelectedFleet(prev => ({
                            ...prev,
                            xMid: isNaN(value) ? null : value
                          }));
                        }}
                      />
                      ,
                      <input
                        className="fleet-input"
                        type="number"
                        value={selectedFleet.yMid ?? ''}
                        onChange={(e) => {
                          const value = parseFloat(e.target.value);
                          setSelectedFleet(prev => ({
                            ...prev,
                            yMid: isNaN(value) ? null : value
                          }));
                        }}
                      />
                      )
                      <button
                        className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                        onClick={() => {
                          setSelectedFleet(prev => ({
                            ...prev,
                            midpointActive: false,
                            xMid: null,
                            yMid: null
                          }));
                        }}
                      >
                        Remove
                      </button>
                    </>
                  ) : (
                    <button
                      className="mt-1 px-3 py-1 bg-blue-700 text-white text-xs rounded"
                      onClick={() =>
                        setSelectedFleet(prev => ({
                          ...prev,
                          midpointActive: true,
                          xMid: prev.x,  // current endPos → becomes midpoint
                          yMid: prev.y,
                          x: prev.xStart,
                          y: prev.yStart,
                        }))
                      }
                    >
                      Set Midpoint
                    </button>
                  )}
                </div>
              )}
                  <div className="mt-2">
                    End Position:
                    (<input
                      className="fleet-input"
                      type="number"
                      value={Math.round(selectedFleet.x)}
                      onChange={(e) =>
                        setSelectedFleet(prev => ({ ...prev, x: parseFloat(e.target.value) }))
                      }
                    />
                    <input
                      className="fleet-input"
                      type="number"
                      value={Math.round(selectedFleet.y)}
                      onChange={(e) =>
                        setSelectedFleet(prev => ({ ...prev, y: parseFloat(e.target.value) }))
                      }
                    />)
                  </div>
                </div>
              )}
                <div className="mt-4 text-sm bg-black bg-opacity-30 text-white p-3 border border-white rounded">
                  {/* existing fleet info UI ... */}
                  
                  {/* New: Scrollable fleet list table */}
                  <div className="mt-6">
                    <label className="block font-bold mb-2"><br />All Fleets End Positions:</label>
                    <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid white', borderRadius: '4px' }}>
                      <table className="min-w-full text-xs">
                        <thead className="bg-gray-800 text-white">
                          <tr>
                            <th className="px-2 py-1 text-left">Name</th>
                            <th className="px-2 py-1 text-left">X</th>
                            <th className="px-2 py-1 text-left">Y</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {fleetData.map(f => (
                            <tr key={f.name} className="hover:bg-gray-700">
                              <td className="px-2 py-1 whitespace-nowrap">{f.name}</td>
                              <td className="px-2 py-1">{Math.round(f.x)}</td>
                              <td className="px-2 py-1">{Math.round(f.y)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
            </div>
          )}
          </div>
        </div>
        <div className="sidebar-footer"><small></small></div>
      </aside>

      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        eraseRadius={eraseRadius}
        setEraseRadius={setEraseRadius}
      />
      <Toast message={toastMsg} />
      
      <MapContainer
      center={center}
      zoom={-2}
      minZoom={-5}
      maxZoom={5}
      crs={TopLeftCRS}
      className={mapClasses}
      style={{ height: '100vh', width: '100%' }}
      dragging={true}
      trackResize={true}
      zoomControl={true}
    >
      <ImageOverlay
        url={
          importedMaps.find(m => m.name === selectedMap)?.url
          || MAPS[selectedMap]
        }
        bounds={bounds}
      />
      {showCapitals && (
        <NationSummary onSelectNation={(name) => {
          setActiveNation(name);
          setNationSidebarOpen(true);
        }} />
      )}

      {markersData.map((m, i) => (
        <Marker key={i} position={m.position} icon={markerIcons.clickmarker}>
          <Popup>{m.title}</Popup>
        </Marker>
      ))}

      {lines.map((line) => (
        <Polyline key={line.id} positions={line.positions}>
          <Tooltip permanent direction="center" offset={[0, -10]}>
            {line.dist.toFixed(0)} units
          </Tooltip>
        </Polyline>
      ))}

      <FleetMapApp
        importText={fleetImportTrigger}
        selectedFleet={selectedFleet}
        setSelectedFleet={setSelectedFleet}
        activeTool={activeTool}
        onFleetUpdate={setFleetData}
      />
      <MapClickDeselect setSelectedFleet={setSelectedFleet} />
      <MapEventHandler
        activeTool={activeTool}
        handleCopy={handleCopy}
        setCoords={setCoords}
        drawStart={drawStart}
        setDrawStart={setDrawStart}
        setLines={setLines}
        eraseRadius={eraseRadius}
        isMultiDraw={isMultiDraw}
      />
      <CursorManager activeTool={activeTool} />
      <CoordinateDisplay coords={coords} />
    </MapContainer>
        <div
          className={`nation-tab ${nationSidebarOpen ? 'open' : ''}`}
          onClick={() => setNationSidebarOpen(prev => !prev)}
        >
          ☰
        </div>

        <div className={`nation-sidebar ${nationSidebarOpen ? 'open' : ''}`}>
          <div className="nation-sidebar-header">
            <span>{activeNation || 'Nation Summary'}</span>
            <button onClick={() => setNationSidebarOpen(false)}>×</button>
          </div>
          <div className="nation-sidebar-body">
            <NationSummaryPanel
              nationName={activeNation}
              open={nationSidebarOpen}
              onClose={() => {
                setNationSidebarOpen(false);
                setActiveNation(null);
              }}
            />
          </div>
        </div>
        {/* Legend Button */}
          <div className={`legend-tab ${legendOpen ? 'open' : ''}`} onClick={() => setLegendOpen(o => !o)}>
            Legend
          </div>

          {/* Legend Panel */}
          <div className={`resource-legend ${legendOpen ? 'open' : ''}`}>
            <img src={resourceLegend} alt="Resource Legend" />
          </div>

          {/* Marker Tab – must come AFTER legend panel for ~ to work */}
          <div className="marker-tab" onClick={() => setShowCapitals(v => !v)}>
            {showCapitals ? 'Hide Capitals' : 'Show Capitals'}
          </div>
        {/* SLIDE‑OUT PANEL */}
        <div className={`resource-legend ${legendOpen ? 'open' : ''}`}>
          <img src={resourceLegend} alt="Resource Legend" />
        </div>
    </div>
  );
};

export default App;