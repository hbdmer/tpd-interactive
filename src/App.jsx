import React, { useState, useCallback, memo, useEffect, useRef } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvent,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Logo from './assets/icon/favicon.ico';

import './App.css';
import mapImage from './assets/map/map.png';
import markerIcons from './markerIcons';
import CursorManager from './components/CursorManager';

const TopLeftCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0),
});

const bounds = [
  [0, 0],
  [6000, 8000],
];
const center = [3000, 4000];
const markersData = [];

const Toolbar = memo(({ activeTool, setActiveTool }) => (
  <div className="toolbar">
    {['copy', 'draw', 'erase'].map((tool) => (
      <button
        key={tool}
        className={activeTool === tool ? 'active' : ''}
        onClick={() => setActiveTool(tool)}
      >
        {tool.charAt(0).toUpperCase() + tool.slice(1)}
      </button>
    ))}
  </div>
));

const Toast = memo(({ message }) => (
  <div className={`toast ${message ? 'visible' : ''}`}>{message}</div>
));

function MapEventHandler({
  activeTool,
  handleCopy,
  setCoords,
  drawStart,
  setDrawStart,
  setLines,
}) {
  const map = useMap()
  const previewLine = useRef(null)

  // copy handler
  const handleCopyAction = useCallback(() => {
    handleCopy()
  }, [handleCopy])

  // draw handler
  const handleDrawAction = useCallback(
    (latlng) => {
      if (!drawStart) {
        setDrawStart(latlng)
      } else {
        setLines(prev => [...prev, [drawStart, latlng]])
        setDrawStart(null)
        // remove preview
        if (previewLine.current) {
          map.removeLayer(previewLine.current)
          previewLine.current = null
        }
      }
    },
    [drawStart, setDrawStart, setLines, map]
  )

  // erase handler
  const handleEraseAction = useCallback(
    (latlng) => {
      const RADIUS = 50
      setLines(prev =>
        prev.filter(([start, end]) => {
          const clickPt = map.latLngToLayerPoint(latlng)
          const p1 = map.latLngToLayerPoint(start)
          const p2 = map.latLngToLayerPoint(end)
          const dist = L.LineUtil.pointToSegmentDistance(clickPt, p1, p2)
          return dist > RADIUS
        })
      )
    },
    [map, setLines]
  )

  // preview on mousemove
  const onMouseMove = useCallback(
    ({ latlng }) => {
      setCoords({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) })
      if (activeTool === 'draw' && drawStart) {
        if (!previewLine.current) {
          previewLine.current = L.polyline([drawStart, latlng], { interactive: false }).addTo(map)
        } else {
          previewLine.current.setLatLngs([drawStart, latlng])
        }
      }
    },
    [activeTool, drawStart, map, setCoords]
  )

  // click dispatcher
  const onMapClick = useCallback(
    ({ latlng }) => {
      if (activeTool === 'copy') {
        handleCopyAction()
      } else if (activeTool === 'draw') {
        handleDrawAction(latlng)
      } else if (activeTool === 'erase') {
        handleEraseAction(latlng)
      }
    },
    [activeTool, handleCopyAction, handleDrawAction, handleEraseAction]
  )

  // cleanup preview on unmount
  useEffect(() => () => {
    if (previewLine.current) {
      map.removeLayer(previewLine.current)
      previewLine.current = null
    }
  }, [map])

  useMapEvent('mousemove', onMouseMove)
  useMapEvent('click', onMapClick)

  return null
}

const CoordinateDisplay = memo(({ coords }) => (
  <div className="coordinate-display">
    Coordinates: {coords.x}, {coords.y}
  </div>
));

const App = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTool, setActiveTool] = useState(null);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [toastMsg, setToastMsg] = useState('');
  const [drawStart, setDrawStart] = useState(null);
  const [lines, setLines] = useState([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState('tab1');
  const toggleSidebar = () => setSidebarOpen(open => !open);


  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${coords.x}\t${coords.y}`);
    setToastMsg('Copied to clipboard');
    setTimeout(() => setToastMsg(''), 2000);
  }, [coords]);

  useEffect(() => {
    // console.debug('activeTool →', activeTool);
  }, [activeTool]);

  const mapClasses = [
    'leaflet-container',
    activeTool === 'copy' && 'copy-cursor',
    activeTool === 'erase' && 'erase-cursor',
  ]
    .filter(Boolean)
    .join(' ');

    return (
      <div className={`App ${sidebarOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar toggle */}
        <div
          className={`sidebar-tab ${sidebarOpen ? 'open' : ''}`}
          onClick={toggleSidebar}
        >
          ☰
        </div>
  
        {/* Sidebar */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <div className="sidebar-tabs">
              <button
                className={`sidebar-tab-btn ${
                  activeSidebarTab === 'tab1' ? 'active' : ''
                }`}
                onClick={() => setActiveSidebarTab('tab1')}
              >
                  <img src={Logo} alt="TPD" className="tab-icon" />
              </button>
              <button
                className={`sidebar-tab-btn ${
                  activeSidebarTab === 'tab2' ? 'active' : ''
                }`}
                onClick={() => setActiveSidebarTab('tab2')}
              >
                ⛭
              </button>
            </div>
          </div>
  
          <div className="sidebar-main">
            <div className="sidebar-content">
              {activeSidebarTab === 'tab1' && (
                <div>
                  {/* Tab 1 content */}
                  <p>https://discord.gg/QTdhrg4sVm.</p>
                </div>
              )}
              {activeSidebarTab === 'tab2' && (
                <div>
                  {/* Tab 2 content */}
                  <p>WIP</p>
                </div>
              )}
            </div>
          </div>
  
          <div className="sidebar-footer">
            <small></small>
          </div>
        </aside>

      <Toolbar activeTool={activeTool} setActiveTool={setActiveTool} />
      <Toast message={toastMsg} />

      <MapContainer
        center={center}
        zoom={-2}
        minZoom={-5}
        maxZoom={5}
        crs={TopLeftCRS}
        className={mapClasses}
        style={{ height: '100vh', width: '100%' }}
      >
        <ImageOverlay url={mapImage} bounds={bounds} />

        {markersData.map((m, i) => (
          <Marker key={i} position={m.position} icon={markerIcons.clickmarker}>
            <Popup>{m.title}</Popup>
          </Marker>
        ))}

        {lines.map((positions, i) => (
          <Polyline key={i} positions={positions} />
        ))}

        <MapEventHandler
          activeTool={activeTool}
          handleCopy={handleCopy}
          setCoords={setCoords}
          drawStart={drawStart}
          setDrawStart={setDrawStart}
          setLines={setLines}
        />

        <CursorManager activeTool={activeTool} />
        <CoordinateDisplay coords={coords} />
      </MapContainer>
    </div>
  );
};

export default App;
