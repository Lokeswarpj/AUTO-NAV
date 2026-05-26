import React from 'react';

const TheorySection = () => {
  return (
    <div style={{ maxWidth: '1000px', margin: '2rem auto', padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div className="cyber-panel">
        <div className="cyber-panel-header">
          <div className="cyber-panel-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            Algorithm Theory & Equations
          </div>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          {/* Dijkstra */}
          <div>
            <h3 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              1. Dijkstra's Algorithm (Uniform Cost Search)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Dijkstra's algorithm searches a graph by maintaining a set of explored nodes and a priority queue of frontiers ordered by their exact accumulated path cost from the start node. It is highly robust and guarantees the absolute shortest path on any positive edge weight graph, but performs a circular uniform expansion.
            </p>
            <div className="math-block">
              Relaxation Equation: d(v) = min( d(v), d(u) + w(u, v) )
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Where <strong>d(v)</strong> represents the total shortest path cost to reach node <strong>v</strong>, and <strong>w(u, v)</strong> represents the transition weight between node <strong>u</strong> and neighbor <strong>v</strong>.
            </p>
          </div>

          <hr style={{ borderColor: 'rgba(46, 59, 85, 0.4)' }} />

          {/* A* Search */}
          <div>
            <h3 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              2. A* Search Algorithm (Heuristic-Optimized Pathfinder)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              A* refines Dijkstra by introducing a heuristic function <strong>h(n)</strong> which estimates the remaining distance from the current node <strong>n</strong> to the target destination. This prioritizes the search frontier directed towards the goal, drastically reducing the search space size.
            </p>
            <div className="math-block">
              Evaluation Function: f(n) = g(n) + h(n)
            </div>
            <ul style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <li><strong>g(n)</strong>: The exact cumulative transition cost from the start node to node <strong>n</strong>.</li>
              <li><strong>h(n)</strong>: Estimated cost from node <strong>n</strong> to target destination (e.g. Euclidean/Octile distance heuristic).</li>
              <li><strong>f(n)</strong>: The overall priority weight score of node <strong>n</strong>.</li>
            </ul>
          </div>

          <hr style={{ borderColor: 'rgba(46, 59, 85, 0.4)' }} />

          {/* Greedy BFS */}
          <div>
            <h3 style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              3. Greedy Best-First Search (GBFS)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              Greedy Best-First Search evaluates nodes solely based on the heuristic distance estimate to the target destination. It represents an aggressive "greedy" strategy, running rapidly towards the goal. However, it does not account for prior path obstacles or transition lengths, making it incomplete and prone to highly sub-optimal paths.
            </p>
            <div className="math-block">
              Evaluation Function: f(n) = h(n)
            </div>
          </div>

          <hr style={{ borderColor: 'rgba(46, 59, 85, 0.4)' }} />

          {/* Dynamic Programming Velocity Profile */}
          <div>
            <h3 style={{ color: 'var(--accent-amber)', fontFamily: 'var(--font-hud)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
              4. Dynamic Programming (Speed & Safety Profiler)
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '0.75rem' }}>
              To translate a raw path coordinate list into real driving control commands, the vehicle must execute a <strong>velocity profile planner</strong>. We formulate this as a multi-stage decision problem solved recursively using <strong>Dynamic Programming (DP)</strong>.
            </p>
            
            <h5 style={{ color: 'var(--text-main)', marginBottom: '0.5rem' }}>Bellman Optimization Equation:</h5>
            <div className="math-block">
              Backward Pass: v_i = min( v_limit_i,  sqrt( v_next^2 + 2 * a_decel * dx ) )
              {"\n"}Forward Pass:  v_i = min( v_i,        sqrt( v_prev^2 + 2 * a_accel * dx ) )
            </div>
            
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.75rem' }}>
              <strong>Optimization Steps:</strong>
            </p>
            <ol style={{ color: 'var(--text-muted)', fontSize: '0.9rem', paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>
                <strong>Stage Limits Estimation:</strong> We scan the coordinates to determine road constraints. Sudden changes in direction (turns) impose physical speed boundaries. We enforce a limit:
                <div style={{ color: 'var(--accent-cyan)', fontFamily: 'var(--font-hud)', margin: '0.25rem 0' }}>v_limit = turn_speed (at curves) || hazard_speed (near obstacles) || max_speed</div>
              </li>
              <li>
                <strong>Backward Dynamic Programming Pass:</strong> Starting from the destination where the car must halt (v_N = 0), we work backwards. This sets a safe braking boundary, ensuring that we begin decelerating *long before* we reach a sharp turn or obstacle.
              </li>
              <li>
                <strong>Forward Dynamic Programming Pass:</strong> We perform a forward pass starting from the vehicle's initial velocity (e.g., 5 km/h) to model the acceleration limitations of the electric/combustion motor.
              </li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
};

export default TheorySection;
