import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import crossCursor from '../assets/cursor/cross.ico'

export default function CursorManager({ activeTool }) {
  const map = useMap()

  useEffect(() => {

    // update cursor on each zoom frame or end
    function updateCursor(e) {
      const container = map.getContainer()
      if (activeTool === 'erase') {
        container.style.cursor = 'none';
      } else {
        container.style.cursor = `url(${crossCursor}) 8 8, auto`
      }
    }

    // initial and bind to Leaflet's smooth zoom animation + final
    updateCursor()
    map.on('zoomanim', updateCursor)
    map.on('zoomend', updateCursor)

    return () => {
      map.off('zoomanim', updateCursor)
      map.off('zoomend', updateCursor)
    }
  }, [activeTool, map])

  return null
}
