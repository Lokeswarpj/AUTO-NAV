// Dynamic Programming Velocity Profile Planner in JavaScript.
// Mirrors the Flask backend solver to enable full local execution fallback.

export const optimizeSpeedProfileJS = (
  path,
  hazards = [],
  maxSpeed = 50.0,
  turnSpeed = 20.0,
  hazardSpeed = 15.0,
  maxAccel = 3.0,
  maxDecel = 4.0
) => {
  if (!path || path.length === 0) return [];
  
  const N = path.length;
  const hazardSet = new Set(hazards.map(h => `${h[0]},${h[1]}`));
  
  // Scale velocities from km/h to m/s
  const vMax = maxSpeed / 3.6;
  const vTurn = turnSpeed / 3.6;
  const vHazard = hazardSpeed / 3.6;
  
  // Initialize speed limits array
  const speedLimits = Array(N).fill(vMax);
  speedLimits[N - 1] = 0.0; // Terminal condition (stop at destination)
  
  // Curvature turns detection
  for (let i = 1; i < N - 1; i++) {
    const prev = path[i - 1];
    const curr = path[i];
    const nxt = path[i + 1];
    
    const v1 = [curr.row - prev.row, curr.col - prev.col];
    const v2 = [nxt.row - curr.row, nxt.col - curr.col];
    
    const dot = v1[0] * v2[0] + v1[1] * v2[1];
    const mag1 = Math.sqrt(v1[0]**2 + v1[1]**2);
    const mag2 = Math.sqrt(v2[0]**2 + v2[1]**2);
    
    if (mag1 > 0 && mag2 > 0) {
      const val = Math.max(-1.0, Math.min(1.0, dot / (mag1 * mag2)));
      const angle = Math.acos(val);
      
      if (angle > 0.1) { // Sharp curvature turn
        const factor = Math.max(0.0, 1.0 - (angle / (Math.pi / 2.0)));
        speedLimits[i] = vTurn + (vMax - vTurn) * factor;
      }
    }
  }
  
  // Proximity safety slowdown
  for (let i = 0; i < N - 1; i++) {
    const r = path[i].row;
    const c = path[i].col;
    
    let isNearHazard = false;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (hazardSet.has(`${r + dr},${c + dc}`)) {
          isNearHazard = true;
          break;
        }
      }
      if (isNearHazard) break;
    }
    
    if (isNearHazard) {
      speedLimits[i] = Math.min(speedLimits[i], vHazard);
    }
  }
  
  const dx = 2.0; // Cell distance in meters
  const dpVelocities = [...speedLimits];
  
  // DP BACKWARD PASS: enforce safe deceleration limit
  // v_i <= sqrt(v_{i+1}^2 + 2 * a_decel * dx)
  for (let i = N - 2; i >= 0; i--) {
    const limit = dpVelocities[i];
    const nextVel = dpVelocities[i + 1];
    const safeDecelVel = Math.sqrt(nextVel**2 + 2.0 * maxDecel * dx);
    dpVelocities[i] = Math.min(limit, safeDecelVel);
  }
  
  // DP FORWARD PASS: enforce acceleration bounds from stationary
  // v_i <= sqrt(v_{i-1}^2 + 2 * a_accel * dx)
  dpVelocities[0] = Math.min(dpVelocities[0], 5.0 / 3.6); // Start speed (5 km/h)
  for (let i = 1; i < N; i++) {
    const limit = dpVelocities[i];
    const prevVel = dpVelocities[i - 1];
    const safeAccelVel = Math.sqrt(prevVel**2 + 2.0 * maxAccel * dx);
    dpVelocities[i] = Math.min(limit, safeAccelVel);
  }
  
  // Calculate accelerations (m/s^2)
  const accelerations = Array(N).fill(0.0);
  for (let i = 0; i < N - 1; i++) {
    const vCurr = dpVelocities[i];
    const vNext = dpVelocities[i + 1];
    accelerations[i] = (vNext**2 - vCurr**2) / (2.0 * dx);
  }
  
  // Map back to output objects
  return dpVelocities.map((v, idx) => ({
    row: path[idx].row,
    col: path[idx].col,
    speed: parseFloat((v * 3.6).toFixed(2)),
    acceleration: parseFloat(accelerations[idx].toFixed(2))
  }));
};
