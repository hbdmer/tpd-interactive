import { memo, useState } from 'react';
import './Toolbar.css';

const Toolbar = memo(({ activeTool, setActiveTool, eraseRadius, setEraseRadius, onGotoSubmit }) => {
  const [coordInput, setCoordInput] = useState('');

  const submitGoto = (e) => {
    e.preventDefault();
    if (!coordInput.trim()) return;
    onGotoSubmit?.(coordInput.trim());   // Notify App -> CoordinateFinder
  };

  return (
    <div className="toolbar">
      {['copy', 'draw', 'erase'].map(tool => (
        <button
          key={tool}
          className={activeTool === tool ? 'active' : ''}
          onClick={() => setActiveTool(tool)}
        >
          {tool.charAt(0).toUpperCase() + tool.slice(1)}
        </button>
      ))}

      {activeTool === 'erase' && (
        <input
          type="range"
          min="10"
          max="200"
          step="5"
          value={eraseRadius}
          onChange={e => setEraseRadius(Number(e.target.value))}
          className="vertical-slider"
        />
      )}

      {/* Coordinate Finder */}
      <form onSubmit={submitGoto} className="coord-finder">
        <label htmlFor="coord-input">Coords:</label>
        <input
          id="coord-input"
          type="text"
          placeholder="x  y"
          value={coordInput}
          onChange={e => setCoordInput(e.target.value)}
        />
        <button type="submit">Go</button>
      </form>
    </div>
  );
});

export default Toolbar;
