import { memo } from 'react';

const CoordinateDisplay = memo(({ coords }) => (
  <div className="coordinate-display">Coordinates: {coords.x}, {coords.y}</div>
));

export default CoordinateDisplay;