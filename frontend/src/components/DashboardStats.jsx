import React from 'react';

const DashboardStats = ({ stats, telemetry }) => {
  const { pathLength, exploredCount, timeMs, algorithmName } = stats;
  const { currentSpeed, currentAccel, statusMsg, stepIndex, totalSteps } = telemetry;
  
  // Format algorithm name nicely
  const getAlgoName = (slug) => {
    switch (slug) {
      case 'dijkstra': return 'Dijkstra (Optimal)';
      case 'greedy_bfs': return 'Greedy BFS (Sub-optimal)';
      case 'a_star':
      default:
        return 'A* Search (Optimal)';
    }
  };

  // Speed bar width calculation
  const speedPercentage = Math.min(100, (currentSpeed / 50.0) * 100);

  return (
    <div className="controls-layout">
      {/* Telemetry Panel */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-amber)' }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><line x1="9" y1="3" x2="9" y2="21"/></svg>
            VEHICLE TELEMETRY
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--accent-green)', fontFamily: 'var(--font-hud)', letterSpacing: '1px' }}>
            ONLINE
          </span>
        </div>
        
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <span className="telemetry-label">Velocity</span>
            <span className="hud-value">
              {currentSpeed.toFixed(1)}
              <span className="hud-unit">km/h</span>
            </span>
          </div>
          <div className="telemetry-card">
            <span className="telemetry-label">Acceleration</span>
            <span className="hud-value" style={{ color: currentAccel > 0 ? 'var(--accent-green)' : currentAccel < 0 ? 'var(--accent-crimson)' : 'var(--text-main)' }}>
              {currentAccel > 0 ? `+${currentAccel.toFixed(2)}` : currentAccel.toFixed(2)}
              <span className="hud-unit">m/s²</span>
            </span>
          </div>
        </div>

        <div className="speed-profile-container">
          <span className="telemetry-label">Throttle Profile Indicator</span>
          <div className="speed-bar-wrapper">
            <span className="speed-bar-label">DRIVE</span>
            <div className="speed-bar-container">
              <div className="speed-bar-fill" style={{ width: `${speedPercentage}%` }} />
            </div>
            <span className="speed-value-text">{Math.round(currentSpeed)} km/h</span>
          </div>
        </div>

        <div style={{ marginTop: '1rem', background: '#090d16', padding: '0.75rem', borderRadius: '4px', border: '1px solid rgba(46,59,85,0.4)', fontFamily: 'var(--font-hud)', fontSize: '0.85rem' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', fontSize: '0.75rem' }}>HUD STATUS FEED:</div>
          <div style={{ 
            color: statusMsg.includes('DANGER') || statusMsg.includes('OBSTACLE') ? 'var(--accent-crimson)' : 
                   statusMsg.includes('SLOW') || statusMsg.includes('TURN') ? 'var(--accent-amber)' : 'var(--accent-cyan)',
            fontWeight: '600'
          }}>
            &gt; {statusMsg}
          </div>
          {totalSteps > 0 && (
            <div style={{ color: 'var(--text-muted)', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span>Traversing:</span>
              <span>{stepIndex} / {totalSteps} coordinates</span>
            </div>
          )}
        </div>
      </div>

      {/* Pathfinding Performance Statistics Panel */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-cyan)' }}><polygon points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            ROUTE STATISTICS
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(46,59,85,0.3)', paddingBottom: '0.4rem' }}>
            <span>Active Algorithm:</span>
            <span style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', fontWeight: 'bold' }}>
              {getAlgoName(algorithmName)}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(46,59,85,0.3)', paddingBottom: '0.4rem' }}>
            <span>Path Distance:</span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-hud)' }}>
              {pathLength > 0 ? `${(pathLength * 2).toFixed(1)} meters` : '0 m'} ({pathLength} cells)
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(46,59,85,0.3)', paddingBottom: '0.4rem' }}>
            <span>Explored Nodes:</span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-hud)' }}>
              {exploredCount} nodes
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Calculation Latency:</span>
            <span style={{ color: '#fff', fontFamily: 'var(--font-hud)' }}>
              {timeMs.toFixed(3)} ms
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardStats;
