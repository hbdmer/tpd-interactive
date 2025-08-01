// src/hooks/useMapEvents.js
import { useMapEvents } from 'react-leaflet';

/**
 * A custom hook that registers map event handlers.
 *
 * @param {Object} handlers
 * @param {function} handlers.onClick    called with ({ latlng }) when the map is clicked
 * @param {function} handlers.onMouseMove called with ({ latlng }) on mouse move
 */
export default function useMapEventsHandler({ onClick, onMouseMove }) {
  // useMapEvents both returns the map instance and registers handlers for you
  useMapEvents({
    click: onClick,
    mousemove: onMouseMove,
  });
}
