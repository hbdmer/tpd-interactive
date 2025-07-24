// src/App.jsx
import { useState } from 'react';
import {
  MapContainer,
  ImageOverlay,
  Marker,
  Popup,
  Polyline,
  Tooltip,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Assets
import mapClaim from './assets/map/nationmap.png';
import mapBiome from './assets/map/biomemap.png';
import mapFarm from './assets/map/farmmap.png';
import mapPop from './assets/map/popmap.png';
import mapRes from './assets/map/resmap.png';
import mapReg from './assets/map/namedmap.png';
import markerIcons from './markerIcons';
import resourceLegend from './assets/map/Resource_legend.png';

// Components
import Sidebar from './components/Sidebar/Sidebar';
import CursorManager from './components/Map/CursorManager';
import FleetMapApp from './components/Fleet/FleetManager';
import MapEventHandler from './components/Map/MapEventHandler';
import Toolbar from './components/UI/Toolbar';
import Toast from './components/UI/Toast';
import CoordinateDisplay from './components/Map/CoordinateDisplay';
import NationSummary from './components/Nation/NationSummary';
import NationSummaryPanel from './components/Nation/NationSummaryPanel';
import NationSidebar from './components/NationSidebar/NationSidebar';
import LegendPanel from './components/LegendPanel/LegendPanel';
import MarkerToggle from './components/MarkerToggle/MarkerToggle';

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
  Claims: mapClaim,
  Biome: mapBiome,
  Arability: mapFarm,
  Population: mapPop,
  Resources: mapRes,
  Region: mapReg,
  ...TURN_MAPS,
};

const mapKeys = Object
  .keys(TURN_MAPS)
  .filter(k => /^map\d+$/.test(k));  // only map00, map01, … map12

const sorted = mapKeys
  .map(k => ({ key: k, num: parseInt(k.replace('map',''), 10) }))
  .sort((a, b) => b.num - a.num);

const latestMapKey = sorted[0]?.key;

const App = () => {
  // UI toggles
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSidebarTab, setActiveSidebarTab] = useState('tab1');
  const [legendOpen, setLegendOpen] = useState(false);

  const [nationSidebarOpen, setNationSidebarOpen] = useState(false);

  // Active selections
  const [activeTool, setActiveTool] = useState(null);
  const [activeNation, setActiveNation] = useState(null);

  // Coordinates
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  // Drawing
  const [lines, setLines] = useState([]);
  const [drawStart, setDrawStart] = useState(null);
  const [eraseRadius, setEraseRadius] = useState(50);
  const [isMultiDraw, setIsMultiDraw] = useState(false);

  // Clipboard

  // Fleet import/data
  const [fleetImportText, setFleetImportText] = useState('');
  const [fleetImportTrigger, setFleetImportTrigger] = useState('');
  const [selectedFleet, setSelectedFleet] = useState(null);
  const [fleetData, setFleetData] = useState([]);

  // Maps
  const [importedMaps, setImportedMaps] = useState([]);
  const [selectedMap, setSelectedMap] = useState(
    // use the latest turn if one exists, otherwise default to "Claims"
    latestMapKey || 'Claims'
  );
  const [showCapitals, setShowCapitals] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');

  const toggleSidebar = () => setSidebarOpen(open => !open);


  const mapClasses = ['leaflet-container', activeTool === 'copy' && 'copy-cursor', activeTool === 'erase' && 'erase-cursor'].filter(Boolean).join(' ');

  return (
    <div className={`App ${sidebarOpen ? 'sidebar-open' : ''} …`}>
      <Sidebar
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
        activeSidebarTab={activeSidebarTab}
        setActiveSidebarTab={setActiveSidebarTab}
        selectedMap={selectedMap}
        setSelectedMap={setSelectedMap}

        MAPS={MAPS}
        TURN_MAPS={TURN_MAPS}
        importedMaps={importedMaps}
        setImportedMaps={setImportedMaps}

        fleetImportText={fleetImportText}
        setFleetImportText={setFleetImportText}
        setFleetImportTrigger={setFleetImportTrigger}

        selectedFleet={selectedFleet}
        setSelectedFleet={setSelectedFleet}
        fleetData={fleetData}
      />

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
        <MapEventHandler
          coords={coords}
          setToastMsg={setToastMsg}
          activeTool={activeTool}
          setCoords={setCoords}
          drawStart={drawStart}
          setDrawStart={setDrawStart}
          setLines={setLines}
          eraseRadius={eraseRadius}
          isMultiDraw={isMultiDraw}
          setIsMultiDraw={setIsMultiDraw}
          setSelectedFleet={setSelectedFleet}
        />
        <CursorManager activeTool={activeTool} />
        <CoordinateDisplay coords={coords} />
      </MapContainer>

      <NationSidebar
        open={nationSidebarOpen}
        onToggle={() => setNationSidebarOpen(o => !o)}
        activeNation={activeNation}
        onClose={() => { setNationSidebarOpen(false); setActiveNation(null); }}
      >
        <NationSummaryPanel nationName={activeNation} />
      </NationSidebar>

      <LegendPanel
        open={legendOpen}
        nationOpen={nationSidebarOpen}
        onToggle={() => setLegendOpen(o => !o)}
        src={resourceLegend}
        alt="Resource Legend"
      />

      <MarkerToggle
        nationOpen={nationSidebarOpen}
        show={showCapitals}
        onToggle={() => setShowCapitals(v => !v)}
      />
    </div>
  );
};

export default App;