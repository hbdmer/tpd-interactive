// useGotoHandler.js
import { useEffect, useRef, useCallback } from 'react';
import L from 'leaflet';

const Icon = new L.Icon({
  iconUrl: require('../../../assets/markers/clickmarker.png'),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

export default function useGotoHandler(map) {
  const markerRef = useRef(null);

  const parseInput = useCallback((raw) => {
    if (!raw || typeof raw !== 'string') return { ok: false, error: 'Empty input.' };
    const norm = raw.trim().replace(/\s+/g, ' ').replace(/\s*,\s*/g, ',');
    const parts = norm.includes(',') ? norm.split(',') : norm.split(' ');
    if (parts.length !== 2) return { ok: false, error: 'Use two numbers like "x y" or "lat,lng".' };

    const a = Number(parts[0]);
    const b = Number(parts[1]);
    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      return { ok: false, error: 'Both values must be valid numbers.' };
    }

    // Heuristic:
    // - If |a| <= 90 and |b| <= 180, treat as lat,lng
    // - Else treat as x,y (your app: x=lng, y=lat)
    let lat, lng;
    if (Math.abs(a) <= 90 && Math.abs(b) <= 180) {
      lat = a; lng = b;               // lat,lng
    } else {
      lng = a; lat = b;               // x,y  -> lng,lat
    }

    // bounds check (works fine with CRS.Simple coordinates you use)
    if (lat < -90 || lat > 999999 || lng < -180 || lng > 999999) {
      // relaxed upper bound since your image coords are large
      return { ok: true, lat, lng };  // allow big map coords (e.g., 4000 3000)
    }
    return { ok: true, lat, lng };
  }, []);

  const placeMarker = useCallback(({ lat, lng }) => {
  if (!map) return;
  const latlng = L.latLng(lat, lng);

  const makeInteractive = (m) => {
    // show coords on hover + click
    const label = `(${Math.round(lng)}, ${Math.round(lat)})`;
    m.bindTooltip(label, { sticky: true, direction: 'top' });
    m.bindPopup(`<b>Coords</b><br/>X: ${Math.round(lng)}<br/>Y: ${Math.round(lat)}`);

    // stop events from bubbling to the map tools
    ['click', 'mousedown', 'dblclick', 'contextmenu'].forEach(ev => {
      m.on(ev, e => {
        e.originalEvent?.stopPropagation();
        e.originalEvent?.preventDefault?.();
      });
    });

    // optional niceties
    m.on('mouseover', () => m.openTooltip());
    m.on('click', () => m.openPopup());
    m.setZIndexOffset(1000); // keep above overlays
  };

  if (!markerRef.current) {
    markerRef.current = L.marker(latlng, {
      icon: Icon,   // your clickmarker icon
      isGoto: true,        // so erase tool can remove it
      interactive: true,
    }).addTo(map);
    makeInteractive(markerRef.current);
  } else {
    markerRef.current.setLatLng(latlng);
    // update tooltip/popup text when coords change
    const label = `(${Math.round(lng)}, ${Math.round(lat)})`;
    markerRef.current.setTooltipContent?.(label);
    markerRef.current.setPopupContent?.(`<b>Coords</b><br/>X: ${Math.round(lng)}<br/>Y: ${Math.round(lat)}`);
  }

  map.panTo(latlng);
}, [map]);

  const clearMarker = useCallback(() => {
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
  }, []);

  useEffect(() => () => { clearMarker(); }, [clearMarker]);

  return { parseInput, placeMarker, clearMarker };
}
