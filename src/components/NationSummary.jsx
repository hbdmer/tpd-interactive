// src/components/NationSummary.jsx
import React from 'react';
import { Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

const capitalIcon = new L.Icon({
  iconUrl: require('../assets/markers/clickmarker.png'),
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

const HARD_CODED_CAPITALS = [
  { x: 4010, y: 250, name: 'Erewhon' },
  { x: 6575, y: 5157, name: 'Rumo Kayan Empire' },
  { x: 5215, y: 2200, name: 'R.E.L.I.C' },
  { x: 4000, y: 1300, name: 'Eternal City, Mabarrabha' },
  { x: 3720, y: 5450, name: 'Confederated States of Zaftra' },
  { x: 5500, y: 5725, name: 'Dust Bunnies' },
  { x: 4093, y: 4168, name: 'Provisional Government of Karbarov (Krasnar)' },
  { x: 7119, y: 3330, name: 'Eternal Kingdom of Mjalltir' },
  { x: 5690, y: 1000, name: 'BlueRock Investment Company (BRIC)' },
  { x: 1380, y: 2980, name: 'Federated Commonwealth of Merland and Romaine' },
  { x: 1566, y: 4289, name: 'The Chorus Collective' },
  { x: 5323, y: 3696, name: 'Vltavan Brotherhood' },
  { x: 569, y: 4549, name: 'Auldric Crown' },
  { x: 6000, y: 5050, name: 'Mandate From Heaven' },
  { x: 2506, y: 5230, name: 'Sea Dogs Fellowship' },
  { x: 6180, y: 5650, name: 'EoN Hive' },
  { x: 3978, y: 3556, name: 'Sector 7' },
  { x: 3032, y: 350, name: 'Starved Coalition' },
  { x: 6673, y: 1647, name: 'Fissionistic Contingence' },
  { x: 979, y: 5592, name: 'Ionian Kingdom' },
  { x: 1373, y: 835, name: 'Zanicxl, the River Kingdom' },
  { x: 2256, y: 204, name: 'Sandstorm Horde' },
  { x: 2800, y: 2450, name: 'Federacion Tehuapec' },
  { x: 7048, y: 3608, name: 'Umamusume Regional Accord' },
  { x: 4044, y: 1936, name: 'Sword of the Ecclesiarch' },
];

const NationSummary = ({ onSelectNation }) => {
  return (
    <>
      {HARD_CODED_CAPITALS.map((cap) => (
        <Marker
          key={cap.name}
          position={[cap.y, cap.x]}
          icon={capitalIcon}
          eventHandlers={{ click: () => onSelectNation(cap.name) }}
        >
          <Tooltip direction="top" offset={[0, -14]}>
            {cap.name}
          </Tooltip>
        </Marker>
      ))}
    </>
  );
};

export default NationSummary;
