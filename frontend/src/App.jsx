import React, { useState } from 'react';
import Header from './components/Header';
import GridVisualizer from './components/GridVisualizer';
import DashboardStats from './components/DashboardStats';
import AboutSection from './components/AboutSection';
import TheorySection from './components/TheorySection';
import ComparisonDashboard from './components/ComparisonDashboard';
import Documentation from './components/Documentation';

function App() {
  const [activeTab, setActiveTab] = useState('visualizer');
  
  // Stats calculated during the visualizer run
  const [stats, setStats] = useState({
    pathLength: 0,
    exploredCount: 0,
    timeMs: 0.0,
    algorithmName: 'a_star'
  });

  // Telemetry details while the car is navigating
  const [telemetry, setTelemetry] = useState({
    currentSpeed: 0.0,
    currentAccel: 0.0,
    statusMsg: 'HUD SYSTEM READY. WAITING FOR TRAJECTORY INSTRUCTIONS...',
    stepIndex: 0,
    totalSteps: 0
  });

  // Compare stats to show in comparison dashboard scoreboard
  const [scoreboardStats, setScoreboardStats] = useState({
    dijkstra: { time: 'Pending', explored: 'Pending', length: 'Pending' },
    a_star: { time: 'Pending', explored: 'Pending', length: 'Pending' },
    greedy_bfs: { time: 'Pending', explored: 'Pending', length: 'Pending' }
  });

  // Tracks algorithm performance from visualizer to update Comparison page scorecard
  const handleStatsUpdate = (newStats) => {
    setStats(newStats);
    
    // Update active score card data
    setScoreboardStats(prev => {
      const targetAlgo = newStats.algorithmName;
      return {
        ...prev,
        [targetAlgo]: {
          time: `${newStats.timeMs.toFixed(3)} ms`,
          explored: `${newStats.exploredCount} nodes`,
          length: `${newStats.pathLength} cells`
        }
      };
    });
  };

  const handleTelemetryUpdate = (newTelemetry) => {
    setTelemetry(newTelemetry);
  };

  return (
    <div className="app-container">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main style={{ flexGrow: 1 }}>
        {activeTab === 'visualizer' && (
          <div className="dashboard-grid">
            <DashboardStats stats={stats} telemetry={telemetry} />
            <GridVisualizer 
              onStatsUpdate={handleStatsUpdate} 
              onTelemetryUpdate={handleTelemetryUpdate}
              currentTelemetry={telemetry}
              activeTab={activeTab}
            />
          </div>
        )}

        {activeTab === 'about' && <AboutSection />}
        {activeTab === 'theory' && <TheorySection />}
        {activeTab === 'comparison' && <ComparisonDashboard stats={scoreboardStats} />}
        {activeTab === 'docs' && <Documentation />}
      </main>

      <footer style={{ 
        background: 'var(--bg-secondary)', 
        borderTop: '1px solid var(--border-color)', 
        padding: '0.8rem 1.5rem', 
        textAlign: 'center', 
        fontSize: '0.75rem', 
        color: 'var(--text-muted)',
        fontFamily: 'var(--font-hud)',
        letterSpacing: '1px'
      }}>
        ALGORITHMS CLASS MINI-PROJECT &copy; 2026 | DUAL INTEGRATION ARCHITECTURE (REACT & FLASK)
      </footer>
    </div>
  );
}

export default App;
