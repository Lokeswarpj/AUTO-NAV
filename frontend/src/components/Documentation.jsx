import React from 'react';

const Documentation = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Installation Manual */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            System Setup & Installation Manual
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', color: 'var(--text-muted)' }}>
          <h4 style={{ color: 'var(--text-main)' }}>Prerequisites:</h4>
          <p style={{ fontSize: '0.9rem' }}>
            Ensure you have Python 3.8+ and Node.js v18+ installed on your computer.
          </p>
          
          <h4 style={{ color: 'var(--text-main)', marginTop: '0.5rem' }}>1. Backend (Python Flask API) Setup:</h4>
          <div style={{ background: '#090e18', padding: '1rem', borderRadius: '4px', fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)' }}>
            # Navigate to the backend directory
            {"\n"}cd backend
            {"\n\n"}# Create a virtual environment (optional but recommended)
            {"\n"}python -m venv venv
            {"\n"}# Activate virtual environment:
            {"\n"}# Windows:
            {"\n"}venv\Scripts\activate
            {"\n"}# macOS/Linux:
            {"\n"}source venv/bin/activate
            {"\n\n"}# Install the dependencies
            {"\n"}pip install -r requirements.txt
            {"\n\n"}# Run the backend server (starts on localhost:5000)
            {"\n"}python app.py
          </div>

          <h4 style={{ color: 'var(--text-main)', marginTop: '0.5rem' }}>2. Frontend (React Vite) Setup:</h4>
          <div style={{ background: '#090e18', padding: '1rem', borderRadius: '4px', fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)' }}>
            # Navigate to the frontend directory
            {"\n"}cd frontend
            {"\n\n"}# Install the npm packages
            {"\n"}npm install
            {"\n\n"}# Launch the development server
            {"\n"}npm run dev
          </div>
          <p style={{ fontSize: '0.9rem' }}>
            Open your browser and navigate to the local URL (usually <code style={{ color: 'var(--accent-cyan)' }}>http://localhost:5173</code>) to view the cyber HUD dashboard!
          </p>
        </div>
      </div>

      {/* Mini Project Report Framework */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Academic Mini-Project Report Draft
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)' }}>
          <h3 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', fontSize: '1.1rem', textTransform: 'uppercase' }}>
            Title: Autonomous Vehicle Navigation and Speed Profiling System
          </h3>
          
          <h4 style={{ color: 'var(--text-main)' }}>Abstract</h4>
          <p style={{ fontSize: '0.9rem' }}>
            This project models coordinate pathfinding and kinematics profile generation for self-driving vehicles. It integrates heuristic path search (A*), baseline graph relaxation (Dijkstra), and blind heuristic targeting (Greedy BFS) on a 2D discrete grid mapping arena. Additionally, a multi-stage decision Bellman Dynamic Programming (DP) solver computes continuous speed limits and dynamic braking curves. This system enables simulated vehicles to compute collision-free, energy-efficient trajectories, demonstrating critical path planning mechanisms.
          </p>

          <h4 style={{ color: 'var(--text-main)' }}>Project Architecture & Workspace Mapping</h4>
          <p style={{ fontSize: '0.9rem' }}>
            The software utilizes a decoupled full-stack architecture. The Python Flask API handles calculations, running algorithm libraries with time and space analysis. The React Vite client displays the active cyberpunk vehicle telemetry HUD. The grid represents road spaces, allowing mouse interactions to build custom obstacle configurations.
          </p>

          <h4 style={{ color: 'var(--text-main)' }}>Conclusion & Future Scope</h4>
          <p style={{ fontSize: '0.9rem' }}>
            By combining path search algorithms with a dynamic programming speed planner, we simulated key elements of autonomous vehicle controls. While A* solves coordinates, DP translates those coordinates into safe speeds. Future extensions include expanding graph grids into 3D environments, integrating fuzzy-logic lane adjustments, and deploying neural networks for vision localization.
          </p>
        </div>
      </div>
      
    </div>
  );
};

export default Documentation;
