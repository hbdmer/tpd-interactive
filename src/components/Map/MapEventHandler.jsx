// src/components/Map/MapEventHandler.jsx

import { useCallback, useEffect, useRef } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import L from 'leaflet';

export default function MapEventHandler({
  activeTool,
  coords,             // ← new
  setToastMsg,        // ← new
  setCoords,
  drawStart,
  setDrawStart,
  setLines,
  eraseRadius,
  isMultiDraw,
  setIsMultiDraw,
  setSelectedFleet,
}) {
  const map = useMap();
  const previewLine = useRef(null);
  const eraseCircle  = useRef(null);
  const drawPoints   = useRef([]);

  // COPY HANDLER
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${coords.x}\t${coords.y}`);
    setToastMsg('Copied to clipboard');
    setTimeout(() => setToastMsg(''), 2000);
  }, [coords, setToastMsg]);

  // DRAW ACTION
  const handleDrawAction = useCallback(latlng => {
    drawPoints.current.push(latlng);

    if (!drawStart) {
      setDrawStart(latlng);
    } else {
      const dist = Math.hypot(
        latlng.lng - drawStart.lng,
        latlng.lat - drawStart.lat
      );
      setLines(prev => [
        ...prev,
        { id: crypto.randomUUID(), positions: [drawStart, latlng], dist }
      ]);

      if (!isMultiDraw) {
        setDrawStart(null);
        const text = drawPoints.current
          .map(p => `${Math.round(p.lng)}\t${Math.round(p.lat)}`)
          .join('\n');
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
  }, [drawStart, isMultiDraw, map, setDrawStart, setLines]);

  // ERASE ACTION
  const closestDist = (pt, start, end) => {
    const Cx = end.lng - start.lng, Cy = end.lat - start.lat;
    const t = ((pt.lng - start.lng) * Cx + (pt.lat - start.lat) * Cy) /
              (Cx * Cx + Cy * Cy);
    const clamped = Math.max(0, Math.min(1, t));
    const xx = start.lng + clamped * Cx;
    const yy = start.lat + clamped * Cy;
    return Math.hypot(pt.lng - xx, pt.lat - yy);
  };

  const handleEraseAction = useCallback(latlng => {
    setLines(prev =>
      prev.filter(line => {
        const [start, end] = line.positions;
        return closestDist(latlng, start, end) > eraseRadius;
      })
    );
  }, [eraseRadius, setLines]);

  // MOUSE MOVE: update coords + preview draw/erase
  const onMouseMove = useCallback(({ latlng }) => {
    setCoords({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) });

    if (activeTool === 'draw' && drawStart) {
      if (!previewLine.current) {
        previewLine.current = L.polyline([drawStart, latlng], {
          interactive: false
        }).addTo(map);
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

  // MAP CLICK: deselect fleet, then copy/draw/erase
  const onMapClick = useCallback(({ latlng }) => {
    setSelectedFleet(null);

    if (activeTool === 'copy') {
      handleCopy();
    } else if (activeTool === 'draw') {
      handleDrawAction(latlng);
    } else if (activeTool === 'erase') {
      handleEraseAction(latlng);
    }
  }, [
    activeTool,
    handleCopy,
    handleDrawAction,
    handleEraseAction,
    setSelectedFleet,
  ]);

  // KEYBOARD: hold Control for multi‑draw
  useEffect(() => {
    const down = e => e.key === 'Control' && setIsMultiDraw(true);
    const up   = e => e.key === 'Control' && setIsMultiDraw(false);

    window.addEventListener('keydown', down);
    window.addEventListener('keyup',   up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup',   up);
    };
  }, [setIsMultiDraw]);

  // CLEANUP on unmount
  useEffect(() => () => {
    previewLine.current && map.removeLayer(previewLine.current);
    eraseCircle.current  && map.removeLayer(eraseCircle.current);
  }, [map]);

  // RESET draw state when tool changes
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

  // REGISTER leaflet events
  useMapEvent('mousemove', onMouseMove);
  useMapEvent('click',     onMapClick);

  return null;
}
