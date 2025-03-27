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

function CoordinateDisplay() {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  
  useMapEvent('mousemove', (e) => {
    // With L.CRS.Simple, e.latlng.lat corresponds to the vertical pixel coordinate (0 to 6000)
    // and e.latlng.lng corresponds to the horizontal pixel coordinate (0 to 8000)
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
        background: 'rgba(255,255,255,0)',
        padding: '5px 10px',
        borderRadius: '4px',
        fontSize: '0.9rem'
      }}
    >
      Coordinates: {coords.x}, {coords.y}
    </div>
  );
}

function ClickMarker() {
  const [position, setPosition] = useState(null);

  const offsetX = 17; // Adjust horizontal offset (in coordinate units)
  const offsetY = 5;  // Adjust vertical offset (in coordinate units)

  useMapEvent('click', (e) => {
    const adjustedPosition = {
      lat: e.latlng.lat + offsetY,
      lng: e.latlng.lng + offsetX,
    };
    setPosition(adjustedPosition);
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcons['clickmarker']}>
      <Popup>
        Temporary Marker at {Math.round(position.lng)}, {Math.round(position.lat)}
      </Popup>
    </Marker>
  );
}

function App() {
  // Define bounds so that top left is (0,0) and bottom right is (6000,8000)
  const bounds = [[0, 0], [6000, 8000]];
  const center = [3000, 4000]; // roughly the center

  return (
    <div className="App">

      <MapContainer
        center={center}
        zoom={-2}         // initial zoom level (negative to zoom out further)
        minZoom={-5}      // allow zooming out even more
        maxZoom={5}       // limit zooming in too far
        style={{ height: '100vh', width: '100%' }}
        crs={L.CRS.Simple}  // use a simple CRS for non-geographic maps
      >
        <ImageOverlay url={mapImage} bounds={bounds} />
        <Marker position={center} icon={markerIcons['GoAllons']}>
          <Popup>This is the center marker with a custom icon!</Popup>
        </Marker>
        <CoordinateDisplay />
        <ClickMarker />
      </MapContainer>
    </div>
  );
}

export default App;
