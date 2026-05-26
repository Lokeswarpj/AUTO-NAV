// Pathfinding Algorithms in JavaScript for interactive, real-time node-by-node visual animations.

// Helper to check valid neighbors
const getNeighbors = (row, col, rows, cols, allowDiagonals = true) => {
  const neighbors = [];
  
  // 4-way orthogonal movements: [dr, dc, cost]
  const orthogonal = [
    [-1, 0, 1.0],  // Up
    [1, 0, 1.0],   // Down
    [0, -1, 1.0],  // Left
    [0, 1, 1.0]    // Right
  ];
  
  // 4-way diagonal movements
  const diagonal = [
    [-1, -1, 1.414], // Up-Left
    [-1, 1, 1.414],  // Up-Right
    [1, -1, 1.414],  // Down-Left
    [1, 1, 1.414]    // Down-Right
  ];
  
  const directions = allowDiagonals ? [...orthogonal, ...diagonal] : orthogonal;
  
  for (const [dr, dc, cost] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      neighbors.push({ row: nr, col: nc, cost });
    }
  }
  
  return neighbors;
};

// Heuristic calculation
const heuristic = (r1, c1, r2, c2, allowDiagonals = true) => {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  
  if (allowDiagonals) {
    // Octile distance
    return Math.min(dr, dc) * 1.414 + Math.abs(dr - dc);
  } else {
    // Manhattan distance
    return dr + dc;
  }
};

// Dijkstra Algorithm
export const runDijkstraJS = (start, end, rows, cols, obstacles, allowDiagonals = true) => {
  const startTime = performance.now();
  const obstacleSet = new Set(obstacles.map(o => `${o[0]},${o[1]}`));
  const startKey = `${start[0]},${start[1]}`;
  const endKey = `${end[0]},${end[1]}`;
  
  // Queue for Dijkstra (min-heap approximation or flat array sort for visualizer simplicity)
  // Standard array sorting is very fast for typical grid sizes (e.g. 600 nodes)
  let pq = [{ row: start[0], col: start[1], g: 0.0 }];
  const gScore = { [startKey]: 0.0 };
  const parent = {};
  
  const explored = [];
  const exploredSet = new Set();
  let pathFound = false;
  
  while (pq.length > 0) {
    // Sort ascending by g
    pq.sort((a, b) => a.g - b.g);
    const curr = pq.shift();
    const currKey = `${curr.row},${curr.col}`;
    
    if (curr.g > (gScore[currKey] ?? Infinity)) continue;
    
    explored.push({ row: curr.row, col: curr.col });
    exploredSet.add(currKey);
    
    if (curr.row === end[0] && curr.col === end[1]) {
      pathFound = true;
      break;
    }
    
    const neighbors = getNeighbors(curr.row, curr.col, rows, cols, allowDiagonals);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (obstacleSet.has(neighborKey)) continue;
      
      const tentativeG = curr.g + neighbor.cost;
      if (tentativeG < (gScore[neighborKey] ?? Infinity)) {
        gScore[neighborKey] = tentativeG;
        parent[neighborKey] = { row: curr.row, col: curr.col };
        pq.push({ row: neighbor.row, col: neighbor.col, g: tentativeG });
      }
    }
  }
  
  const endTime = performance.now();
  
  // Reconstruct path
  const path = [];
  if (pathFound) {
    let curr = { row: end[0], col: end[1] };
    while (curr) {
      path.push(curr);
      const currKey = `${curr.row},${curr.col}`;
      const prnt = parent[currKey];
      if (prnt && (prnt.row !== start[0] || prnt.col !== start[1])) {
        curr = prnt;
      } else if (prnt) {
        path.push({ row: start[0], col: start[1] });
        break;
      } else {
        break;
      }
    }
    path.reverse();
  }
  
  return {
    path,
    explored,
    timeMs: endTime - startTime
  };
};

// A* Algorithm
export const runAStarJS = (start, end, rows, cols, obstacles, allowDiagonals = true) => {
  const startTime = performance.now();
  const obstacleSet = new Set(obstacles.map(o => `${o[0]},${o[1]}`));
  const startKey = `${start[0]},${start[1]}`;
  
  const startH = heuristic(start[0], start[1], end[0], end[1], allowDiagonals);
  let pq = [{ row: start[0], col: start[1], g: 0.0, f: startH }];
  
  const gScore = { [startKey]: 0.0 };
  const parent = {};
  
  const explored = [];
  const exploredSet = new Set();
  let pathFound = false;
  
  while (pq.length > 0) {
    // Sort by f-score (tie break with g-score)
    pq.sort((a, b) => a.f - b.f || b.g - a.g);
    const curr = pq.shift();
    const currKey = `${curr.row},${curr.col}`;
    
    if (curr.g > (gScore[currKey] ?? Infinity)) continue;
    
    explored.push({ row: curr.row, col: curr.col });
    exploredSet.add(currKey);
    
    if (curr.row === end[0] && curr.col === end[1]) {
      pathFound = true;
      break;
    }
    
    const neighbors = getNeighbors(curr.row, curr.col, rows, cols, allowDiagonals);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (obstacleSet.has(neighborKey)) continue;
      
      const tentativeG = curr.g + neighbor.cost;
      if (tentativeG < (gScore[neighborKey] ?? Infinity)) {
        gScore[neighborKey] = tentativeG;
        parent[neighborKey] = { row: curr.row, col: curr.col };
        const hVal = heuristic(neighbor.row, neighbor.col, end[0], end[1], allowDiagonals);
        pq.push({ 
          row: neighbor.row, 
          col: neighbor.col, 
          g: tentativeG, 
          f: tentativeG + hVal 
        });
      }
    }
  }
  
  const endTime = performance.now();
  
  const path = [];
  if (pathFound) {
    let curr = { row: end[0], col: end[1] };
    while (curr) {
      path.push(curr);
      const currKey = `${curr.row},${curr.col}`;
      const prnt = parent[currKey];
      if (prnt && (prnt.row !== start[0] || prnt.col !== start[1])) {
        curr = prnt;
      } else if (prnt) {
        path.push({ row: start[0], col: start[1] });
        break;
      } else {
        break;
      }
    }
    path.reverse();
  }
  
  return {
    path,
    explored,
    timeMs: endTime - startTime
  };
};

// Greedy Best-First Search
export const runGreedyBFSJS = (start, end, rows, cols, obstacles, allowDiagonals = true) => {
  const startTime = performance.now();
  const obstacleSet = new Set(obstacles.map(o => `${o[0]},${o[1]}`));
  const startKey = `${start[0]},${start[1]}`;
  
  const startH = heuristic(start[0], start[1], end[0], end[1], allowDiagonals);
  let pq = [{ row: start[0], col: start[1], h: startH }];
  
  const visited = new Set([startKey]);
  const parent = {};
  const explored = [];
  let pathFound = false;
  
  while (pq.length > 0) {
    pq.sort((a, b) => a.h - b.h);
    const curr = pq.shift();
    
    explored.push({ row: curr.row, col: curr.col });
    
    if (curr.row === end[0] && curr.col === end[1]) {
      pathFound = true;
      break;
    }
    
    const neighbors = getNeighbors(curr.row, curr.col, rows, cols, allowDiagonals);
    for (const neighbor of neighbors) {
      const neighborKey = `${neighbor.row},${neighbor.col}`;
      if (obstacleSet.has(neighborKey) || visited.has(neighborKey)) continue;
      
      visited.add(neighborKey);
      parent[neighborKey] = { row: curr.row, col: curr.col };
      const hVal = heuristic(neighbor.row, neighbor.col, end[0], end[1], allowDiagonals);
      pq.push({ row: neighbor.row, col: neighbor.col, h: hVal });
    }
  }
  
  const endTime = performance.now();
  
  const path = [];
  if (pathFound) {
    let curr = { row: end[0], col: end[1] };
    while (curr) {
      path.push(curr);
      const currKey = `${curr.row},${curr.col}`;
      const prnt = parent[currKey];
      if (prnt && (prnt.row !== start[0] || prnt.col !== start[1])) {
        curr = prnt;
      } else if (prnt) {
        path.push({ row: start[0], col: start[1] });
        break;
      } else {
        break;
      }
    }
    path.reverse();
  }
  
  return {
    path,
    explored,
    timeMs: endTime - startTime
  };
};
