import { memo } from 'react';

const Toolbar = memo(({ activeTool, setActiveTool, eraseRadius, setEraseRadius }) => {
  return (
    <div className="toolbar">
      {['copy', 'draw', 'erase'].map(tool => (
        <button
          key={tool}
          className={activeTool === tool ? 'active' : ''}
          onClick={() => setActiveTool(tool)}
        >{tool.charAt(0).toUpperCase() + tool.slice(1)}</button>
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
    </div>
  );
});

export default Toolbar;
