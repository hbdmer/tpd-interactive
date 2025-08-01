import { useCallback } from 'react';

export default function useCopyHandler(coords, setToastMsg) {
  return useCallback(() => {
    navigator.clipboard.writeText(`${coords.x}\t${coords.y}`);
    setToastMsg('Copied to clipboard');
    setTimeout(() => setToastMsg(''), 2000);
  }, [coords, setToastMsg]);
}
