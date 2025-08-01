// MapEventHandler.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

import useCopyHandler from './hooks/useCopyHandler';
import useDrawHandler from './hooks/useDrawHandler';
import useEraseHandler from './hooks/useEraseHandler';
import useMapEventsHandler from './hooks/useMapEventsHandler';

export default function MapEventHandler(props) {
  const map = useMap();
  const {
    activeTool, coords, setToastMsg, setCoords,
    drawStart, setDrawStart, setLines, eraseRadius,
    isMultiDraw, setIsMultiDraw, setSelectedFleet
  } = props;

  const copy = useCopyHandler(coords, setToastMsg);
  const draw = useDrawHandler(drawStart, setDrawStart, setLines, isMultiDraw, map);
  const erase = useEraseHandler(eraseRadius, setLines, map);

  const onMouseMove = ({ latlng }) => {
    setCoords({ x: Math.round(latlng.lng), y: Math.round(latlng.lat) });
    if (activeTool === 'draw') draw.updatePreview(latlng);
    else draw.cleanupPreview();
    if (activeTool === 'erase') erase.updateCircle(latlng);
    else erase.removeCircle();
  };

  const onMapClick = ({ latlng }) => {
    setSelectedFleet(null);
    if (activeTool === 'copy')      copy();
    else if (activeTool === 'draw')  draw.handleDraw(latlng);
    else if (activeTool === 'erase') erase.handleErase(latlng);
  };

  // Touch-action gating
  useEffect(() => {
    const container = map.getContainer();
    if (activeTool === 'draw')  container.style.touchAction = 'none';
    else                        container.style.touchAction = '';
  }, [activeTool, map]);

  // Keyboard multi-draw (Ctrl)
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

  // Reset on tool change
  useEffect(() => {
    if (activeTool !== 'draw') {
      setDrawStart(null);
      draw.reset();
    }
  }, [activeTool, setDrawStart, draw]);

  // Register only click & move
  useMapEventsHandler({
    onClick:     onMapClick,
    onMouseMove: onMouseMove,
  });

  return null;
}
