import { useCallback, useEffect, useRef } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';

function MapEventHandler({
  activeTool,
  handleCopy,
  setCoords,
  drawStart,
  setDrawStart,
  setLines,
  eraseRadius,
  isMultiDraw
}) {
  const map = useMap();
  const previewLine = useRef(null);
  const eraseCircle = useRef(null);
  const drawPoints = useRef([]);

  const handleDrawAction = useCallback(latlng => {
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
  }, [drawStart, map, setDrawStart, setLines, isMultiDraw]);

  const closestDist = (latlng, start, end) => {
    const Cx = end.lng - start.lng, Cy = end.lat - start.lat;
    const t = ((latlng.lng - start.lng) * Cx + (latlng.lat - start.lat) * Cy) / (Cx * Cx + Cy * Cy);
    const clamped = Math.max(0, Math.min(1, t));
    const xx = start.lng + clamped * Cx;
    const yy = start.lat + clamped * Cy;
    return Math.hypot(latlng.lng - xx, latlng.lat - yy);
  };

  const handleEraseAction = useCallback(latlng => {
    setLines(prev => prev.filter(line => {
      const [start, end] = Array.isArray(line) ? line : line.positions;
      return closestDist(latlng, start, end) > eraseRadius;
    }));
  }, [setLines, eraseRadius]);

  const onMouseMove = useCallback(({ latlng }) => {
    setCoords({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) });

    if (activeTool === 'draw' && drawStart) {
      if (!previewLine.current) {
        previewLine.current = L.polyline([drawStart, latlng], { interactive: false }).addTo(map);
      } else {
        previewLine.current.setLatLngs([drawStart, latlng]);
      }
    }

    if (activeTool === 'erase') {
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
    } else if (eraseCircle.current) {
      map.removeLayer(eraseCircle.current);
      eraseCircle.current = null;
    }
  }, [activeTool, drawStart, eraseRadius, map, setCoords]);

  const onMapClick = useCallback(({ latlng }) => {
    if (activeTool === 'copy') handleCopy();
    else if (activeTool === 'draw') handleDrawAction(latlng);
    else if (activeTool === 'erase') handleEraseAction(latlng);
  }, [activeTool, handleCopy, handleDrawAction, handleEraseAction]);

  useEffect(() => () => {
    if (previewLine.current) map.removeLayer(previewLine.current);
    if (eraseCircle.current) map.removeLayer(eraseCircle.current);
  }, [map]);

  useEffect(() => {
    if (activeTool !== 'draw') {
      setDrawStart(null);
      drawPoints.current = [];
      if (previewLine.current) {
        map.removeLayer(previewLine.current);
        previewLine.current = null;
      }
    }
  }, [activeTool, map, setDrawStart]);

  useMapEvent('mousemove', onMouseMove);
  useMapEvent('click', onMapClick);

  return null;
}

export default MapEventHandler;