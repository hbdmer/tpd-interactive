import React, { useRef } from 'react';

const MapSwitcher = ({
  current,
  onChange,
  MAPS,
  TURN_MAPS,
  importedMaps,
  onImport,
  onDeleteImport
}) => {
  const fileInputRef = useRef();

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        onImport({
          name: file.name.replace(/\.[^/.]+$/, ''),
          url: reader.result
        });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="map-switcher">
      <div className="import-controls">
        <button className="import-btn" onClick={handleImportClick}>+ Import Map</button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {importedMaps.length > 0 && (
        <div className="imported-group">
          <h4>Imported Maps</h4>
          {importedMaps.map(({ name, url }) => (
            <div key={name} className="imported-btn-wrapper">
              <button
                className={current === name ? 'active' : ''}
                onClick={() => onChange(name)}
              >{name}</button>
              <button
                className="delete-btn"
                onClick={() => onDeleteImport(name)}
              >×</button>
            </div>
          ))}
        </div>
      )}

      <div className="turnmap-group">
        <h4>Turn Maps</h4>
        <div className="turnmap-list">
          {Object.entries(TURN_MAPS).map(([name]) => (
            <button
              key={name}
              onClick={() => onChange(name)}
              className={current === name ? 'active' : ''}
            >{name}</button>
          ))}
        </div>
      </div>

      <div className="base-map-group">
        <h4>Base Maps</h4>
        {Object.keys(MAPS).filter(k => !TURN_MAPS[k] && !importedMaps.some(m => m.name === k)).map(k => (
          <button
            key={k}
            className={current === k ? 'active' : ''}
            onClick={() => onChange(k)}
          >{k}</button>
        ))}
      </div>
    </div>
  );
};

export default MapSwitcher;
