// src/components/Map/hooks/useMapEventsHandler.js
import { useMapEvents } from 'react-leaflet';

/**
 * Registers desktop click + move.
 */
export default function useMapEventsHandler({ onClick, onMouseMove }) {
  useMapEvents({
    click:     onClick,
    mousemove: onMouseMove,
  });
}
