import { useCallback, useRef } from 'react';
import L from 'leaflet';

export default function useDrawHandler(drawStart, setDrawStart, setLines, isMultiDraw, map) {
  const previewLine = useRef(null);
  const drawPoints = useRef([]);

  const handleDraw = useCallback(latlng => {
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
  }, [drawStart, setDrawStart, setLines, isMultiDraw, map]);

  const updatePreview = useCallback(latlng => {
    if (drawStart) {
      if (!previewLine.current) {
        previewLine.current = L.polyline([drawStart, latlng], { interactive: false }).addTo(map);
      } else {
        previewLine.current.setLatLngs([drawStart, latlng]);
      }
    }
  }, [drawStart, map]);

  const cleanupPreview = useCallback(() => {
    if (previewLine.current) {
      map.removeLayer(previewLine.current);
      previewLine.current = null;
    }
  }, [map]);

  const reset = () => {
    drawPoints.current = [];
    cleanupPreview();
  };

  return { handleDraw, updatePreview, cleanupPreview, reset };
}
