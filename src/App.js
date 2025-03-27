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
    //setPosition(pos);

    // Prepare text and copy to clipboard
    const textToCopy = `${Math.round(pos.lng)}, ${Math.round(pos.lat)}`;
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        console.log('Copied to clipboard:', textToCopy);
      })
      .catch((err) => {
        console.error('Clipboard copy failed:', err);
      });
  });

  // return position === null ? null : (
  //   <Marker position={position} icon={markerIcons['clickmarker']}>
  //     <Popup>
  //       Coordinates: {Math.round(position.lng)}, {Math.round(position.lat)}
  //     </Popup>
  //   </Marker>
  // );
}


function App() {
  // With our custom CRS:
  // - The x coordinate (stored in lng) ranges from 0 to 8000.
  // - The y coordinate (stored in lat) ranges from 0 to 6000.
  // Thus, top left is (0,0) and bottom right is (8000,6000) when displayed as (lng, lat).
  const bounds = [[0, 0], [6000, 8000]];
  // Center: half of height = 3000, half of width = 4000 (i.e. marker will show as (4000,3000) in (x,y))
  const center = [3000, 4000];

  return (
    <div className="App">
      <MapContainer
        center={center}
        zoom={-2}         // initial zoom level (negative to zoom out further)
        minZoom={-5}      // allow zooming out even more
        maxZoom={5}       // limit zooming in too far
        style={{ height: '100vh', width: '100%' }}
        crs={TopLeftCRS}  // use our custom CRS
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
