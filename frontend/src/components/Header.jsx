import React from 'react';

const Header = ({ activeTab, setActiveTab }) => {
  return (
    <header>
      <div className="header-logo">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}>
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
        <span>AUTONAV.HUD v1.0</span>
      </div>
      
      <nav>
        <ul className="nav-links">
          <li 
            className={`nav-link ${activeTab === 'visualizer' ? 'active' : ''}`}
            onClick={() => setActiveTab('visualizer')}
          >
            Visualizer
          </li>
          <li 
            className={`nav-link ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            About
          </li>
          <li 
            className={`nav-link ${activeTab === 'theory' ? 'active' : ''}`}
            onClick={() => setActiveTab('theory')}
          >
            Theory
          </li>
          <li 
            className={`nav-link ${activeTab === 'comparison' ? 'active' : ''}`}
            onClick={() => setActiveTab('comparison')}
          >
            Comparison
          </li>
          <li 
            className={`nav-link ${activeTab === 'docs' ? 'active' : ''}`}
            onClick={() => setActiveTab('docs')}
          >
            Documentation
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
