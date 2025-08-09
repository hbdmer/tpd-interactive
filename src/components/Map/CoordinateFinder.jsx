// CoordinateFinder.jsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import useGotoHandler from './hooks/useGotoHandler';

export default function CoordinateFinder({ gotoValue, onResult, toast }) {
  const map = useMap();
  const { parseInput, placeMarker } = useGotoHandler(map);

  useEffect(() => {
    if (!gotoValue) return;
    const parsed = parseInput(gotoValue);
    if (!parsed.ok) {
      toast?.(parsed.error);
      onResult?.({ ok: false, error: parsed.error });
      return;
    }
    placeMarker(parsed);
    toast?.(`Placed at (${parsed.lng?.toFixed?.(0)}, ${parsed.lat?.toFixed?.(0)})`);
    onResult?.({ ok: true, ...parsed });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gotoValue]);

  return null;
}
