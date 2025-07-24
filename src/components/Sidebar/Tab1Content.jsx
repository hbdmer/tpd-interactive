// src/components/Sidebar/Tab1Content.jsx

import MapSwitcher from '../Map/MapSwitcher';

export default function Tab1Content({
  selectedMap, onChange, MAPS, TURN_MAPS,
  importedMaps, onImport, onDeleteImport
}) {
  return (
    <MapSwitcher
      current={selectedMap}
      onChange={onChange}
      MAPS={MAPS}
      TURN_MAPS={TURN_MAPS}
      importedMaps={importedMaps}
      onImport={onImport}
      onDeleteImport={onDeleteImport}
    />
  );
}
