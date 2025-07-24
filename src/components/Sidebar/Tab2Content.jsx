// src/components/Sidebar/Tab2Content.jsx
import { useCallback } from 'react';

export default function Tab2Content({
    fleetImportText,
    setFleetImportText,
    setFleetImportTrigger,
    selectedFleet,
    setSelectedFleet,
    fleetData,
}) {
    const handleCopyAll = useCallback(() => {
        // Build a line per fleet: Name, xMid, yMid, x, y
        const lines = fleetData.map(f => {
            const midX = f.midpointActive && f.xMid != null ? Math.round(f.xMid) : '';
            const midY = f.midpointActive && f.yMid != null ? Math.round(f.yMid) : '';
            const endX = Math.round(f.x);
            const endY = Math.round(f.y);
            return `${midX}\t${midY}\t${endX}\t${endY}`;
        });
        const text = lines.join('\n');
        navigator.clipboard.writeText(text).then(
            () => alert('All fleet points copied!'),
            () => alert('Failed to copy')
        );
    }, [fleetData]);

    return (
        <>
            {/* Paste area + Import button */}
            <textarea
                className="w-full h-40 border p-2 text-sm"
                value={fleetImportText}
                onChange={e => setFleetImportText(e.target.value)}
                placeholder="Paste fleet data here..."
            />
            <button
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => setFleetImportTrigger(fleetImportText)}
            >
                Import Fleets
            </button>

            {/* Selected‐fleet detail + midpoint controls */}
            {selectedFleet && (
                <div className="mt-4 text-sm bg-black bg-opacity-30 text-white p-3 border border-white rounded">
                    <strong>{selectedFleet.name}</strong><br />
                    {selectedFleet.place}<br />
                    Officer: {selectedFleet.officers}<br /><br />
                    Stance: {selectedFleet.stance}<br /><br />
                    Health: {selectedFleet.health}<br />
                    Max Range: {selectedFleet.range}<br /><br />
                    Initial Position: ({selectedFleet.xStart}, {selectedFleet.yStart})<br />

                    {/* MIDPOINT CONTROLS */}
                    <div className="mt-2">
                        <label className="block font-bold mb-1">Midpoint:</label>
                        {selectedFleet.midpointActive ? (
                            <>
                                {/* Edit/remove inputs when midpoint is active */}
                                (
                                <input
                                    className="fleet-input"
                                    type="number"
                                    value={selectedFleet.xMid}
                                    onChange={e => {
                                        const v = parseFloat(e.target.value);
                                        setSelectedFleet(prev => ({
                                            ...prev,
                                            xMid: isNaN(v) ? null : v
                                        }));
                                    }}
                                />
                                ,
                                <input
                                    className="fleet-input"
                                    type="number"
                                    value={selectedFleet.yMid}
                                    onChange={e => {
                                        const v = parseFloat(e.target.value);
                                        setSelectedFleet(prev => ({
                                            ...prev,
                                            yMid: isNaN(v) ? null : v
                                        }));
                                    }}
                                />
                                )
                                <button
                                    className="ml-2 px-2 py-1 bg-red-600 text-white text-xs rounded"
                                    onClick={() =>
                                        setSelectedFleet(prev => ({
                                            ...prev,
                                            midpointActive: false,
                                            xMid: null,
                                            yMid: null
                                        }))
                                    }
                                >
                                    Remove
                                </button>
                            </>
                        ) : (
                            /* Show “Set Midpoint” when it’s not active */
                            <button
                                className="mt-1 px-3 py-1 bg-blue-700 text-white text-xs rounded"
                                onClick={() =>
                                    setSelectedFleet(prev => ({
                                        ...prev,
                                        midpointActive: true,
                                        // old end becomes midpoint
                                        xMid: prev.x,
                                        yMid: prev.y,
                                        // and reset end back to the start
                                        x: prev.xStart,
                                        y: prev.yStart
                                    }))
                                }
                            >
                                Set Midpoint
                            </button>
                        )}
                    </div>

                    {/* Always show end‑position inputs */}
                    <div className="mt-2">
                        End Position:
                        (<input
                            className="fleet-input"
                            type="number"
                            value={Math.round(selectedFleet.x)}
                            onChange={e =>
                                setSelectedFleet(prev => ({
                                    ...prev,
                                    x: parseFloat(e.target.value)
                                }))
                            }
                        />
                        <input
                            className="fleet-input"
                            type="number"
                            value={Math.round(selectedFleet.y)}
                            onChange={e =>
                                setSelectedFleet(prev => ({
                                    ...prev,
                                    y: parseFloat(e.target.value)
                                }))
                            }
                        />)
                    </div>
                </div>
            )}

            {/* Copy‐All button */}
                <div className="mt-4">
                    <button
                    className="px-4 py-2 bg-green-600 text-white rounded"
                    onClick={handleCopyAll}
                    >
                    Copy All Fleets’ Mid & End Points
                    </button>
            </div>

            {/* Scrollable “All Fleets End Positions” Table */}
            <div className="mt-4 text-sm bg-black bg-opacity-30 text-white p-3 border border-white rounded">
                <label className="block font-bold mb-2">
                    All Fleets End Positions:
                </label>
                <div style={{
                    maxHeight: '200px',
                    overflowY: 'auto',
                    border: '1px solid white',
                    borderRadius: '4px'
                }}>
                    <table className="min-w-full text-xs">
                        <thead className="bg-gray-800 text-white">
                            <tr>
                                <th className="px-2 py-1 text-left">Name</th>
                                <th className="px-2 py-1 text-left">X</th>
                                <th className="px-2 py-1 text-left">Y</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                            {fleetData.map(f => (
                                <tr
                                    key={f.name}
                                    className="hover:bg-gray-700 cursor-pointer"
                                    onClick={() => setSelectedFleet(f)}
                                >
                                    <td className="px-2 py-1 whitespace-nowrap">{f.name}</td>
                                    <td className="px-2 py-1">{Math.round(f.x)}</td>
                                    <td className="px-2 py-1">{Math.round(f.y)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
