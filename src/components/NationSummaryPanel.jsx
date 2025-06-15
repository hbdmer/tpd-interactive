// src/components/NationSummaryPanel.jsx
import React from 'react';
import slideMap from './nationSlideMap';

const formatName = (fullName) => {
  const nameMap = {
    'Auldric Crown': 'auldric',
    'Dust Bunnies': 'bnuuy',
    'The Chorus Collective': 'chorus',
    'Federated Commonwealth of Merland and Romaine': 'commonwealth',
    'EoN Hive': 'eon',
    'Erewhon': 'erewhon',
    'Fissionistic Contingence': 'fission',
    'Ionian Kingdom': 'ionia',
    'Provisional Government of Karbarov (Krasnar)': 'krasnar',
    'Eternal City, Mabarrabha': 'mababa',
    'Mandate From Heaven': 'mandate',
    'Eternal Kingdom of Mjalltir': 'mjalltir',
    'R.E.L.I.C': 'relic',
    'Rumo Kayan Empire': 'RumoKaya',
    'Sector 7': 's7',
    'BlueRock Investment Company (BRIC)': 'bric',
    'Sandstorm Horde': 'sandstorm',
    'Sea Dogs Fellowship': 'sdf',
    'Sword of the Ecclesiarch': 'sote',
    'Starved Coalition': 'starved',
    'Federacion Tehuapec': 'tehuapec',
    'Umamusume Regional Accord': 'uma',
    'Vltavan Brotherhood': 'vltavan',
    'Confederated States of Zaftra': 'zaftra',
    'Zanicxl, the River Kingdom': 'zanicxl',
  };
  return nameMap[fullName];
};

const NationSummaryPanel = ({ nationName }) => {
  const formatted = formatName(nationName);
  const slidePath = slideMap[formatted];

  return (
    <div className="nation-summary-content">
      {slidePath && <img src={slidePath} alt={nationName} className="nation-slide" />}
    </div>
  );
};

export default NationSummaryPanel;
