import React from 'react';

const AboutSection = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            About Autonomous Systems
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-main)' }}>
          <p>
            An <strong>Autonomous Vehicle (AV)</strong>, commonly referred to as a self-driving car, is an intelligent system capable of sensing its surrounding environment, calculating optimal trajectories, and operating safely without human intervention.
          </p>
          <p>
            Modern autonomous systems achieve safe operations through a structured multi-layer robotic system:
          </p>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>1. Perception</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Utilizes LIDAR, RADAR, cameras, and ultrasonic sensors to identify surrounding objects, pedestrians, and dynamic obstacles.
              </p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>2. Localization</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Determines the exact position of the vehicle on a high-definition (HD) map with centimeter-level precision using GPS, IMUs, and landmark mapping.
              </p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>3. Path Planning</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Computes a collision-free path from the start to the target destination using algorithms like A*, Dijkstra, or rapidly-exploring random trees (RRT).
              </p>
            </div>
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.25rem', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
              <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>4. Speed Profiling</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Generates safety-constrained velocity profiles using Dynamic Programming, ensuring comfortable acceleration limits and early braking for hazard curves.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Why Pathfinding and DP Matter
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', color: 'var(--text-muted)' }}>
          <p>
            Pathfinding algorithms solve the <strong>global routing</strong> and <strong>local obstacle avoidance</strong> problems. In a city map representation, roads and intersections act as graph edges and vertices. In high-definition grids close to the vehicle, discrete cells model space occupancy.
          </p>
          <p>
            <strong style={{ color: 'var(--accent-cyan)' }}>Dijkstra's Algorithm</strong> guarantees the shortest path but is computationally heavy as it expands nodes uniformly in all directions. 
          </p>
          <p>
            <strong style={{ color: 'var(--accent-cyan)' }}>A* Search</strong> optimizes Dijkstra by incorporating a heuristic estimation function, reducing node exploration by prioritizing the cells closest to the destination. It serves as the industry standard for coordinate path calculations.
          </p>
          <p>
            <strong style={{ color: 'var(--accent-cyan)' }}>Dynamic Programming (DP)</strong> solves sequential multi-stage optimization problems. Path planning only yields *coordinates*. A self-driving car cannot simply snap to coordinates; it has real mass, inertia, and passenger comfort limits. DP calculates *exactly how fast* the wheels should spin at each coordinate point to respect road grip, hazard proximity, and engine limits.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutSection;
