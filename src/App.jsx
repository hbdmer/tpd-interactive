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
import mapDefault from './assets/map/map.png';
import mapBiome from './assets/map/map_biome.png';
import mapFarm from './assets/map/map_farm.png';
import mapPop from './assets/map/map_pop.png';
import mapRes from './assets/map/map_res.png';
import markerIcons from './markerIcons';

// Components
import CursorManager from './components/CursorManager';
import FleetMapApp from './components/FleetManager';

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
  ...TURN_MAPS,
};

const MapSwitcher = ({ current, onChange }) => (
  <div className="map-switcher">
    <h4>Base Maps</h4>
    {Object.keys(MAPS).filter(k => !TURN_MAPS[k]).map(k => (
      <button
        key={k}
        className={current === k ? 'active' : ''}
        onClick={() => onChange(k)}
      >{k}</button>
    ))}
    <div className="turnmap-group">
      <h4>Turn Maps</h4>
      <div className="turnmap-list">
        {Object.entries(TURN_MAPS).map(([name]) => (
          <button
            key={name}
            onClick={() => onChange(name)}
            className={current === name ? 'active' : ''}
          >{name}</button>
        ))}
      </div>
    </div>
  </div>
);

const Toolbar = memo(({ activeTool, setActiveTool, eraseRadius, setEraseRadius }) => {
  return (
    <div className="toolbar">
      {['copy', 'draw', 'erase'].map(tool => (
        <button
          key={tool}
          className={activeTool === tool ? 'active' : ''}
          onClick={() => setActiveTool(tool)}
        >{tool.charAt(0).toUpperCase() + tool.slice(1)}</button>
      ))}
      {activeTool === 'erase' && (
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={eraseRadius}
          onChange={e => setEraseRadius(Number(e.target.value))}
          className="vertical-slider"
        />
      )}
    </div>
  );
});

const Toast = memo(({ message }) => (
  <div className={`toast ${message ? 'visible' : ''}`}>{message}</div>
));

const CoordinateDisplay = memo(({ coords }) => (
  <div className="coordinate-display">Coordinates: {coords.x}, {coords.y}</div>
));

function MapEventHandler({ activeTool, handleCopy, setCoords, drawStart, setDrawStart, setLines, eraseRadius, isMultiDraw }) {
  const map = useMap();
  const previewLine = useRef(null);
  const eraseCircle = useRef(null);
  const drawPoints = useRef([]);

  const handleDrawAction = useCallback(latlng => {
    drawPoints.current.push(latlng);

    if (!drawStart) {
      setDrawStart(latlng);
    } else {
      const dist = Math.hypot(latlng.lng - drawStart.lng, latlng.lat - drawStart.lat);
      setLines(prev => [...prev, { id: crypto.randomUUID(), positions: [drawStart, latlng], dist }]);

      if (!isMultiDraw) {
        setDrawStart(null);

        const text = drawPoints.current.map(p => `${Math.round(p.lng)}\t${Math.round(p.lat)}`).join('\n');
        navigator.clipboard.writeText(text);
        drawPoints.current = [];
      } else {
        setDrawStart(latlng);
      }

      if (previewLine.current) {
        map.removeLayer(previewLine.current);
        previewLine.current = null;
      }
    }
  }, [drawStart, map, setDrawStart, setLines, isMultiDraw]);

  const closestDist = (latlng, start, end) => {
    const Cx = end.lng - start.lng, Cy = end.lat - start.lat;
    const t = ((latlng.lng - start.lng) * Cx + (latlng.lat - start.lat) * Cy) / (Cx * Cx + Cy * Cy);
    const clamped = Math.max(0, Math.min(1, t));
    const xx = start.lng + clamped * Cx;
    const yy = start.lat + clamped * Cy;
    return Math.hypot(latlng.lng - xx, latlng.lat - yy);
  };

  const handleEraseAction = useCallback(latlng => {
    setLines(prev => prev.filter(line => {
      const [start, end] = Array.isArray(line) ? line : line.positions;
      return closestDist(latlng, start, end) > eraseRadius;
    }));
  }, [setLines, eraseRadius]);

  const onMouseMove = useCallback(({ latlng }) => {
    setCoords({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) });

    if (activeTool === 'draw' && drawStart) {
      if (!previewLine.current) {
        previewLine.current = L.polyline([drawStart, latlng], { interactive: false }).addTo(map);
      } else {
        previewLine.current.setLatLngs([drawStart, latlng]);
      }
    }

    if (activeTool === 'erase') {
      if (!eraseCircle.current) {
        eraseCircle.current = L.circle(latlng, {
          radius: eraseRadius,
          color: 'red',
          weight: 1,
          fillOpacity: 0.1,
          interactive: false,
        }).addTo(map);
      } else {
        eraseCircle.current.setLatLng(latlng);
        eraseCircle.current.setRadius(eraseRadius);
      }
    } else {
      if (eraseCircle.current) {
        map.removeLayer(eraseCircle.current);
        eraseCircle.current = null;
      }
    }
  }, [activeTool, drawStart, eraseRadius, map, setCoords]);

  const onMapClick = useCallback(({ latlng }) => {
    if (activeTool === 'copy') handleCopy();
    else if (activeTool === 'draw') handleDrawAction(latlng);
    else if (activeTool === 'erase') handleEraseAction(latlng);
  }, [activeTool, handleCopy, handleDrawAction, handleEraseAction]);

  useEffect(() => () => {
    if (previewLine.current) {
      map.removeLayer(previewLine.current);
      previewLine.current = null;
    }
    if (eraseCircle.current) {
      map.removeLayer(eraseCircle.current);
      eraseCircle.current = null;
    }
  }, [map]);

  useEffect(() => {
    if (activeTool !== 'draw') {
      setDrawStart(null);
      drawPoints.current = [];
      if (previewLine.current) {
        map.removeLayer(previewLine.current);
        previewLine.current = null;
      }
    }
  }, [activeTool, map, setDrawStart]);

  useMapEvent('mousemove', onMouseMove);
  useMapEvent('click', onMapClick);
  return null;
}


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


  const toggleSidebar = () => setSidebarOpen(open => !open);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${coords.x}\t${coords.y}`);
    setToastMsg('Copied to clipboard');
    setTimeout(() => setToastMsg(''), 2000);
  }, [coords]);

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
    <div className={`App ${sidebarOpen ? 'sidebar-open' : ''}`}>
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
                
                <MapSwitcher current={selectedMap} onChange={setSelectedMap} />
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
        <ImageOverlay url={MAPS[selectedMap]} bounds={bounds} />
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
    </div>
  );
};

export default App;