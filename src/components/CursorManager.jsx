import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import crossCursor from '../assets/cursor/cross.ico'

export default function CursorManager({ activeTool }) {
  const map = useMap()

  useEffect(() => {
    const RADIUS_MAP_UNITS = 50
    const MIN_R = 8
    const MAX_R = 64
    const STROKE = 2

    // draw & return cursor CSS string for a given scale factor
    function drawCursor(scaleFactor) {
      const rawPx = RADIUS_MAP_UNITS * scaleFactor
      const r = Math.max(MIN_R, Math.min(MAX_R, Math.ceil(rawPx)))
      const size = r * 2
      const c = document.createElement('canvas')
      c.width = c.height = size
      const ctx = c.getContext('2d')
      ctx.lineWidth = STROKE
      ctx.strokeStyle = 'black'
      ctx.beginPath()
      ctx.arc(r, r, r - STROKE/2, 0, Math.PI * 2)
      ctx.stroke()
      return `url(${c.toDataURL('image/png')}) ${r} ${r}, auto`
    }

    // update cursor on each zoom frame or end
    function updateCursor(e) {
      const container = map.getContainer()
      if (activeTool === 'erase') {
        // use animated scale if provided, else fallback
        const scaleFactor = e?.scale ?? map.getZoomScale(map.getZoom(), 0)
        container.style.cursor = drawCursor(scaleFactor)
      } else if (activeTool === 'copy') {
        container.style.cursor = `url(${crossCursor}) 8 8, auto`
      } else {
        container.style.cursor = ''
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
