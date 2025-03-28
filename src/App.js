/* eslint-disable react/react-in-jsx-scope */
//cd /c/Users/Troub/my-app
//git checkout gh-pages

//import logo from './TPD_logo.png';
import React, { useState } from 'react';
import { MapContainer, ImageOverlay, Marker, Popup, useMapEvent } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import './App.css';
import mapImage from './assets/map/map.png';
import markerIcons from './markerIcons';

// Fix default icon issues with Webpack:
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
//   iconUrl: require('leaflet/dist/images/marker-icon.png'),
//   shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
// });

const TopLeftCRS = L.extend({}, L.CRS.Simple, {
  transformation: new L.Transformation(1, 0, 1, 0)
});

function CoordinateDisplay() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  useMapEvent('mousemove', (e) => {
    // With our custom CRS, e.latlng.lat equals the y coordinate (0 to 6000)
    // and e.latlng.lng equals the x coordinate (0 to 8000)
    setCoords({ x: Math.round(e.latlng.lng), y: Math.round(e.latlng.lat) });
  });

  return (
    <div 
      className="coordinate-display" 
      style={{
        position: 'absolute',
        top: 10,
        left: 50,
        zIndex: 1000,
        background: 'rgba(255,255,255,0.8)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '0.9rem',
        cursor: 'default'
      }}
    >
      Coordinates: {coords.x}, {coords.y}
    </div>
  );
}

function ClickMarker() {
  // const [position, setPosition] = useState(null);
  
  useMapEvent('click', (e) => {
    const pos = { lat: e.latlng.lat, lng: e.latlng.lng };
    const textToCopy = `${Math.round(pos.lng)}, ${Math.round(pos.lat)}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('Copied to clipboard:', textToCopy);
      })
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
      });
  });
  return null;

  // return position === null ? null : (
  //   <Marker position={position} icon={markerIcons['clickmarker']}>
  //     <Popup>
  //       Coordinates: {Math.round(position.lng)}, {Math.round(position.lat)}
  //     </Popup>
  //   </Marker>
  // );
}

// If the click event's target is not part of a marker, reset the sidebar.
function ResetSidebar({ resetSidebar }) {
  useMapEvent('click', (e) => {
    // If the clicked element (or one of its parents) doesn't have the class "leaflet-marker-icon",
    // then we consider that a click off a marker.
    if (!e.originalEvent.target.closest('.leaflet-marker-icon')) {
      resetSidebar();
    }
  });
  return null;
}

// Sidebar component that displays marker information.
function Sidebar({ isOpen, activeTab, setActiveTab, markerInfo }) {
  return (
    <div className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab-btn ${activeTab === "info" ? "active" : ""}`}
            onClick={() => setActiveTab("info")}
          >
            Marker Info
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === "legend" ? "active" : ""}`}
            onClick={() => setActiveTab("legend")}
          >
            Legend
          </button>
          <button
            className={`sidebar-tab-btn ${activeTab === "settings" ? "active" : ""}`}
            onClick={() => setActiveTab("settings")}
          >
            Settings
          </button>
        </div>
      </div>
      <div className="sidebar-main">
        <div className="sidebar-content">
          {activeTab === "info" && (
            markerInfo ? (
              <div>
                <h3>{markerInfo.title}</h3>
                <p>{markerInfo.description}</p>
              </div>
            ) : (
              <p>Click on a marker to view its details.</p>
            )
          )}
          {activeTab === "legend" && (
            <div>
              <h3>Legend</h3>
              <p>Here you can describe your marker symbols and map features.</p>
            </div>
          )}
          {activeTab === "settings" && (
            <div>
              <h3>Settings</h3>
              <p>Map settings can be adjusted here.</p>
            </div>
          )}
        </div>
      </div>
      <div className="sidebar-footer">
        <p>Footer</p>
      </div>
    </div>
  );
}

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const [activeTab, setActiveTab] = useState("info");
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Demo marker data.
  const markersData = [
    {
      id: 1,
      position: [2800, 3500],
      title: 'Marker One',
      description: 'Details about Marker One.'
    },
    {
      id: 2,
      position: [3200, 4200],
      title: 'Marker Two',
      description: 'Details about Marker Two.'
    }
    // More markers can be added here.
  ];

  const bounds = [[0, 0], [6000, 8000]];
  const center = [3000, 4000];

  return (
    <div className={`App ${sidebarOpen ? "sidebar-open" : ""}`}>
      {/* Sidebar Component */}
      <Sidebar
        isOpen={sidebarOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        markerInfo={selectedMarker}
      />
      {/* Sidebar Toggle Tab */}
      <div className={`sidebar-tab ${sidebarOpen ? "open" : ""}`} onClick={toggleSidebar}>
        ☰
      </div>
      <MapContainer
        center={center}
        zoom={-2}
        minZoom={-5}
        maxZoom={5}
        style={{ height: '100vh', width: '100%' }}
        crs={TopLeftCRS}
      >
        <ImageOverlay url={mapImage} bounds={bounds} />
        <Marker position={center} icon={markerIcons['GoAllons']}>
          <Popup>This is the center marker with a custom icon!</Popup>
        </Marker>
        {markersData.map(marker => (
          <Marker
            key={marker.id}
            position={marker.position}
            icon={markerIcons['clickmarker']}
            eventHandlers={{
              click: () => {
                setSelectedMarker(marker);
                if (!sidebarOpen) toggleSidebar();
              }
            }}
          >
            <Popup>{marker.title}</Popup>
          </Marker>
        ))}
        <CoordinateDisplay />
        <ClickMarker />
      </MapContainer>
    </div>
  );
}

export default App;
