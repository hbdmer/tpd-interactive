// src/components/Sidebar/SidebarTabs.jsx
import './SidebarTabs.css';
import Logo from '../..//assets/icon/favicon.ico';

export default function SidebarTabs({ active, onChange }) {
  return (
    <div className="sidebar-tabs">
      <button
        className={`sidebar-tab-btn ${active === 'tab1' ? 'active' : ''}`}
        onClick={() => onChange('tab1')}
      >
        <img src={Logo} alt="TPD" className="tab-icon" />
      </button>
      <button
        className={`sidebar-tab-btn ${active === 'tab2' ? 'active' : ''}`}
        onClick={() => onChange('tab2')}
      >
        ⛭
      </button>
    </div>
  );
}
