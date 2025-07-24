import React from 'react';
import './NationSidebar.css';

export default function NationSidebar({
  open,
  onToggle,
  activeNation,
  onClose,
  children,
}) {
  return (
    <>
      <div
        className={`nation-tab ${open ? 'open' : ''}`}
        onClick={onToggle}
      >
        ☰
      </div>

      <div className={`nation-sidebar ${open ? 'open' : ''}`}>
        <div className="nation-sidebar-header">
          <span>{activeNation || 'Nation Summary'}</span>
          <button onClick={onClose}>×</button>
        </div>
        <div className="nation-sidebar-body">
          {children}
        </div>
      </div>
    </>
  );
}
