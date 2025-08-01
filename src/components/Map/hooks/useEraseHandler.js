import { useCallback, useRef } from 'react';
import L from 'leaflet';

export default function useEraseHandler(eraseRadius, setLines, map) {
  const eraseCircle = useRef(null);

  const closestDist = (pt, start, end) => {
    const Cx = end.lng - start.lng, Cy = end.lat - start.lat;
    const t = ((pt.lng - start.lng) * Cx + (pt.lat - start.lat) * Cy) / (Cx * Cx + Cy * Cy);
    const clamped = Math.max(0, Math.min(1, t));
    const xx = start.lng + clamped * Cx;
    const yy = start.lat + clamped * Cy;
    return Math.hypot(pt.lng - xx, pt.lat - yy);
  };

  const handleErase = useCallback(latlng => {
    setLines(prev =>
      prev.filter(({ positions: [start, end] }) => closestDist(latlng, start, end) > eraseRadius)
    );
  }, [eraseRadius, setLines]);

  const updateCircle = useCallback(latlng => {
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
  }, [eraseRadius, map]);

  const removeCircle = useCallback(() => {
    if (eraseCircle.current) {
      map.removeLayer(eraseCircle.current);
      eraseCircle.current = null;
    }
  }, [map]);

  return { handleErase, updateCircle, removeCircle };
}
