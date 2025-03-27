import L from 'leaflet';

// Dynamically require all images in the markers folder
const requireMarkerImages = require.context('./assets/markers', false, /\.(png|jpe?g|svg)$/);

// Create an object mapping filenames (without extension) to Leaflet icon instances
const markerIcons = {};

requireMarkerImages.keys().forEach((fileName) => {
  // Remove the "./" at the beginning and the file extension
  const key = fileName.replace('./', '').replace(/\.(png|jpe?g|svg)$/, '');
  markerIcons[key] = L.icon({
    iconUrl: requireMarkerImages(fileName).default || requireMarkerImages(fileName),
    iconSize: [50.1, 30],
    iconAnchor: [25, 30],
    popupAnchor: [0, -30],
  });
});

export default markerIcons;
