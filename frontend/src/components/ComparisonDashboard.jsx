import React from 'react';

const ComparisonDashboard = ({ stats }) => {
  // Mock fallback stats if none are provided
  const activeStats = stats || {
    dijkstra: { time: '1.2 ms', explored: '245 nodes', length: '34 cells' },
    a_star: { time: '0.4 ms', explored: '78 nodes', length: '34 cells' },
    greedy_bfs: { time: '0.2 ms', explored: '42 nodes', length: '39 cells' }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      {/* Simulation Live Scorecard */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="18" y="3" width="4" height="18" rx="1"/><rect x="10" y="8" width="4" height="13" rx="1"/><rect x="2" y="13" width="4" height="8" rx="1"/></svg>
            Active Simulation Scorecard
          </div>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
          Real-time metrics compiled during your latest pathfinding run on the visualizer grid.
        </p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          
          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(0, 240, 255, 0.2)', padding: '1.25rem', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Dijkstra</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-hud)', fontSize: '0.95rem' }}>
              <div>Calculation Time: <span style={{ color: '#fff' }}>{activeStats.dijkstra.time}</span></div>
              <div>Nodes Explored: <span style={{ color: '#fff' }}>{activeStats.dijkstra.explored}</span></div>
              <div>Path Length: <span style={{ color: '#fff' }}>{activeStats.dijkstra.length}</span></div>
              <div style={{ color: 'var(--accent-green)', marginTop: '0.5rem', fontSize: '0.8rem' }}>Result: GUARANTEED OPTIMAL PATH</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(57, 255, 20, 0.2)', padding: '1.25rem', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--accent-green)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>A* Search</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-hud)', fontSize: '0.95rem' }}>
              <div>Calculation Time: <span style={{ color: '#fff' }}>{activeStats.a_star.time}</span></div>
              <div>Nodes Explored: <span style={{ color: '#fff' }}>{activeStats.a_star.explored}</span></div>
              <div>Path Length: <span style={{ color: '#fff' }}>{activeStats.a_star.length}</span></div>
              <div style={{ color: 'var(--accent-green)', marginTop: '0.5rem', fontSize: '0.8rem' }}>Result: HEURISTIC OPTIMAL (HIGHLY EFFICIENT)</div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-tertiary)', border: '1px solid rgba(255, 170, 0, 0.2)', padding: '1.25rem', borderRadius: '6px' }}>
            <h4 style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Greedy BFS</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontFamily: 'var(--font-hud)', fontSize: '0.95rem' }}>
              <div>Calculation Time: <span style={{ color: '#fff' }}>{activeStats.greedy_bfs.time}</span></div>
              <div>Nodes Explored: <span style={{ color: '#fff' }}>{activeStats.greedy_bfs.explored}</span></div>
              <div>Path Length: <span style={{ color: '#fff' }}>{activeStats.greedy_bfs.length}</span></div>
              <div style={{ color: 'var(--accent-amber)', marginTop: '0.5rem', fontSize: '0.8rem' }}>Result: SUB-OPTIMAL (FAST BUT BLIND)</div>
            </div>
          </div>

        </div>
      </div>

      {/* Analytical Comparison Table */}
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="12" y1="12" x2="12" y2="22"/><rect x="2" y="2" width="20" height="8" rx="2"/><path d="M12 2v10"/></svg>
            Analytical Comparison Matrix
          </div>
        </div>
        
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', fontFamily: 'var(--font-hud)', color: 'var(--accent-cyan)' }}>
                <th style={{ padding: '0.75rem 1rem' }}>Algorithm</th>
                <th style={{ padding: '0.75rem 1rem' }}>Time Complexity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Space Complexity</th>
                <th style={{ padding: '0.75rem 1rem' }}>Optimality</th>
                <th style={{ padding: '0.75rem 1rem' }}>Completeness</th>
                <th style={{ padding: '0.75rem 1rem' }}>Self-Driving Autonomous Application</th>
              </tr>
            </thead>
            <tbody style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <tr style={{ borderBottom: '1px solid rgba(46, 59, 85, 0.4)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Dijkstra</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O((V + E) log V)</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(V)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes (Shortest Path)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes</td>
                <td style={{ padding: '1rem' }}>Used for global navigation calculations across offline road mapping networks.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(46, 59, 85, 0.4)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>A* Search</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(b^d) / O(E log V)</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(V)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes (if h(n) is admissible)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes</td>
                <td style={{ padding: '1rem' }}>Standard online pathfinding solver for real-time intersection calculations.</td>
              </tr>
              <tr style={{ borderBottom: '1px solid rgba(46, 59, 85, 0.4)' }}>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Greedy BFS</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(b^d) / O(V log V)</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(V)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-crimson)' }}>No (Sub-optimal paths)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-amber)' }}>No (Prone to local minima loops)</td>
                <td style={{ padding: '1rem' }}>Heuristic fallback routines when calculation time budget is highly restricted.</td>
              </tr>
              <tr>
                <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-main)' }}>Dynamic Programming</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(N * M) stages</td>
                <td style={{ padding: '1rem', fontFamily: 'var(--font-hud)' }}>O(N) profiles</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes (Optimal Speed curve)</td>
                <td style={{ padding: '1rem', color: 'var(--accent-green)' }}>Yes</td>
                <td style={{ padding: '1rem' }}>Calculates speed profile parameters, dynamic safety braking curves, and turning limits.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
    </div>
  );
};

export default ComparisonDashboard;
