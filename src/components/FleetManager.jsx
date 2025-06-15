import { useEffect, useState } from "react";
import { Circle, Marker, Popup, Polyline } from "react-leaflet";
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import fleetIconUrl from '../assets/markers/fleet_marker.png';
import fleetIconUrl2 from '../assets/markers/fleet_marker2.png';

const fleetIcon = new L.Icon({
  iconUrl: fleetIconUrl,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -32],
});

const fleetIcon2 = new L.Icon({
    iconUrl: fleetIconUrl2,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -32],
  });

const parseFleetData = (raw) => {
  const lines = raw.trim().split(/\n+/);
  const fleets = [];

  for (let line of lines) {
    if (/Name\s+Type\s+Health/i.test(line)) continue;
    const parts = line.split('\t');
    if (parts.length === 19) parts.splice(3, 0, "");
    while (parts.length < 20) parts.push("");

    const [
      name, type, health, officers, place,
      stance, range, xNow, yNow,,,
      endX, endY, pathfind, cost,
      fuel, rRange, mat, repairCost
    ] = parts;

    const x = parseFloat(xNow);
    const y = parseFloat(yNow);
    const parsedRange = parseFloat(rRange);
    const validRange = isNaN(parsedRange) ? 0 : parsedRange;

    if (isNaN(x) || isNaN(y)) continue;

    fleets.push({
      name, type, health, officers, place, stance,
      range: validRange,
      x, y,
      xStart: x, yStart: y,
      xMid: null,
      yMid: null,
      xEnd: x,
      yEnd: y,
      midpointActive: false,
      cost, fuel, mat, repairCost
    });
  }

  return fleets;
};

const FleetMarker = ({ fleet, onDrag, onDelete, selectedFleet, setSelectedFleet, activeTool }) => {
    const isSelected = selectedFleet?.name === fleet.name;
  
    const [endPos, setEndPos] = useState([fleet.y, fleet.x]);
    const [midPos, setMidPos] = useState(
      fleet.midpointActive && fleet.xMid !== null && fleet.yMid !== null
        ? [fleet.yMid, fleet.xMid]
        : null
    );
  
    useEffect(() => {
      setEndPos([fleet.y, fleet.x]);
      setMidPos(
        fleet.midpointActive && fleet.xMid !== null && fleet.yMid !== null
          ? [fleet.yMid, fleet.xMid]
          : null
      );
    }, [fleet]);
  
    const distance = (a, b) => Math.hypot(b[1] - a[1], b[0] - a[0]);
    
    const handleClick = () => {
      if (activeTool === 'delete') {
        onDelete(fleet.name);
      } else {
        setSelectedFleet(fleet);
      }
    };
    
    const handleEndDrag = (e) => {
      const { lat, lng } = e.target.getLatLng();
      const anchor = midPos || [fleet.yStart, fleet.xStart];
      const used = midPos ? distance([fleet.yStart, fleet.xStart], midPos) : 0;
      const maxDist = fleet.range - used;
      const distFromAnchor = distance(anchor, [lat, lng]);
  
      let final = [lat, lng];
      if (distFromAnchor > maxDist) {
        const angle = Math.atan2(lat - anchor[0], lng - anchor[1]);
        final = [
          anchor[0] + Math.sin(angle) * maxDist,
          anchor[1] + Math.cos(angle) * maxDist,
        ];
      }
  
      setEndPos(final);
      onDrag(fleet.name, final[0], final[1], midPos?.[0] ?? null, midPos?.[1] ?? null);
    };
    
    const pathPoints = midPos
      ? [[fleet.yStart, fleet.xStart], midPos, endPos]
      : [[fleet.yStart, fleet.xStart], endPos];
  
    const remainingRange = fleet.range - (midPos ? distance([fleet.yStart, fleet.xStart], midPos) : 0);
  
    return (
      <>
        {/* END Marker */}
        <Marker
          position={endPos}
          icon={fleetIcon}
          draggable={activeTool !== 'delete'}
          eventHandlers={{
            click: () => {
              if (activeTool === 'erase') onDelete(fleet.name);
              else setSelectedFleet(fleet);
            },
            dragstart: () => setSelectedFleet(fleet),
            dragend: handleEndDrag,
          }}
        >
          <Popup>
            <strong>{fleet.name}</strong><br />
            End: ({endPos[1].toFixed(0)}, {endPos[0].toFixed(0)})
          </Popup>
        </Marker>
    
        {/* MIDPOINT Marker */}
        {fleet.midpointActive && midPos && (
          <Marker
            position={midPos}
            icon={fleetIcon2}
            draggable={activeTool !== 'delete'}
            eventHandlers={{
              click: () => {
                if (activeTool === 'erase') onDelete(fleet.name);
                else setSelectedFleet(fleet);
              },
              dragend: (e) => {
                const { lat, lng } = e.target.getLatLng();
                const dist = distance([fleet.yStart, fleet.xStart], [lat, lng]);
    
                let midLat = lat;
                let midLng = lng;
    
                if (dist > fleet.range) {
                  const angle = Math.atan2(lat - fleet.yStart, lng - fleet.xStart);
                  midLat = fleet.yStart + Math.sin(angle) * fleet.range;
                  midLng = fleet.xStart + Math.cos(angle) * fleet.range;
                }
    
                setMidPos([midLat, midLng]);
    
                const remaining = fleet.range - distance([fleet.yStart, fleet.xStart], [midLat, midLng]);
                const distToEnd = distance([midLat, midLng], endPos);
                let newEnd = [...endPos];
    
                if (distToEnd > remaining) {
                  const angle = Math.atan2(endPos[0] - midLat, endPos[1] - midLng);
                  newEnd = [
                    midLat + Math.sin(angle) * remaining,
                    midLng + Math.cos(angle) * remaining,
                  ];
                  setEndPos(newEnd);
                }
    
                onDrag(fleet.name, newEnd[0], newEnd[1], midLat, midLng);
                setSelectedFleet((prev) =>
                  prev?.name === fleet.name
                    ? { ...prev, xMid: midLng, yMid: midLat, x: newEnd[1], y: newEnd[0] }
                    : prev
                );
              },
            }}
          >
            <Popup>
              <strong>{fleet.name}</strong><br />
              Mid: ({midPos[1].toFixed(0)}, {midPos[0].toFixed(0)})
            </Popup>
          </Marker>
        )}
    
        {/* Path Line */}
        <Polyline
          positions={pathPoints}
          pathOptions={{ color: 'white', dashArray: '4', weight: 1 }}
        />
    
        {/* Range Circles */}
        {isSelected && (
          <Circle
            center={[fleet.yStart, fleet.xStart]}
            radius={fleet.range}
            pathOptions={{ color: 'lightblue', fillOpacity: 0.1 }}
          />
        )}
        {isSelected && midPos && (
          <Circle
            center={midPos}
            radius={remainingRange}
            pathOptions={{ color: 'deepskyblue', fillOpacity: 0.1 }}
          />
        )}
      </>
    );    
  };

export default function FleetMapApp({ importText, selectedFleet, setSelectedFleet, activeTool, onFleetUpdate}) {
  const [fleets, setFleets] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("fleets");
    if (saved) setFleets(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("fleets", JSON.stringify(fleets));
  }, [fleets]);

  useEffect(() => {
    if (importText) {
      const newFleets = parseFleetData(importText);
      setFleets(prev => {
        const existing = new Map(prev.map(f => [f.name, f]));
        return newFleets.map(f => {
          const old = existing.get(f.name);
          return old
            ? { ...f, x: old.x, y: old.y, xMid: old.xMid, yMid: old.yMid }
            : f;
        });
      });
    }
  }, [importText]);

  useEffect(() => {
    if (selectedFleet) {
      setFleets(prev =>
        prev.map(f => f.name === selectedFleet.name ? { ...f, ...selectedFleet } : f)
      );
    }
  }, [selectedFleet]);

  useEffect(() => {
    onFleetUpdate?.(fleets); // optional chaining in case prop is not passed
  }, [fleets, onFleetUpdate]);

  const handleDelete = (name) => {
    setFleets(prev => prev.filter(f => f.name !== name));
    setSelectedFleet(prev => (prev?.name === name ? null : prev));
  };

  const handleDragUpdate = (name, lat, lng, yMid = null, xMid = null) => {
    setFleets(prev =>
      prev.map(f => {
        if (f.name !== name) return f;
        return {
          ...f,
          x: lng,
          y: lat,
          ...(xMid !== null && yMid !== null
            ? {
                midpointActive: true,
                xMid,
                yMid,
              }
            : f.midpointActive
            ? { xMid: f.xMid, yMid: f.yMid }
            : { xMid: null, yMid: null }
          ),
        };
      })
    );
  
    setSelectedFleet(prev =>
      prev?.name === name
        ? {
            ...prev,
            x: lng,
            y: lat,
            ...(xMid !== null && yMid !== null
              ? {
                  midpointActive: true,
                  xMid,
                  yMid,
                }
              : prev.midpointActive
              ? { xMid: prev.xMid, yMid: prev.yMid }
              : { xMid: null, yMid: null }
            ),
          }
        : prev
    );
  };

  return (
    <>
      {fleets.map(f => (
        <FleetMarker
          key={f.name}
          fleet={f}
          onDrag={handleDragUpdate}
          onDelete={handleDelete}
          selectedFleet={selectedFleet}
          setSelectedFleet={setSelectedFleet}
          activeTool={activeTool}
        />
      ))}
    </>
  );
}
