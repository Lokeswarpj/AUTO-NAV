import React, { useState, useEffect, useRef } from 'react';
import { runAStarJS, runDijkstraJS, runGreedyBFSJS } from '../utils/pathfinding';
import { optimizeSpeedProfileJS } from '../utils/dpPlanner';

const GridVisualizer = ({ onStatsUpdate, onTelemetryUpdate, currentTelemetry, activeTab }) => {
  // Grid parameters
  const rows = 20;
  const cols = 30;

  // Key configurations
  const [startNode, setStartNode] = useState([9, 4]);
  const [targetNode, setTargetNode] = useState([9, 25]);
  const [obstacles, setObstacles] = useState([]);
  const [hazards, setHazards] = useState([]);
  const [mouseMode, setMouseMode] = useState('wall'); // 'wall' | 'hazard' | 'start' | 'target' | 'erase'
  const [allowDiagonals, setAllowDiagonals] = useState(true);
  const [selectedAlgo, setSelectedAlgo] = useState('a_star'); // 'a_star' | 'dijkstra' | 'greedy_bfs'
  const [simSpeed, setSimSpeed] = useState('normal'); // 'slow' | 'normal' | 'fast'
  const [backendActive, setBackendActive] = useState(true);
  const [dynamicObstacles, setDynamicObstacles] = useState(true);
  const [selectedMapPreset, setSelectedMapPreset] = useState('empty');

  // Simulation execution state
  const [isVisualizing, setIsVisualizing] = useState(false);
  const [isDriving, setIsDriving] = useState(false);
  
  // Track computed paths and explored sets for rendering
  const [exploredNodes, setExploredNodes] = useState([]);
  const [pathNodes, setPathNodes] = useState([]);
  const [speedProfile, setSpeedProfile] = useState([]);
  
  // Sets for fast visual grid rendering
  const [renderedExplored, setRenderedExplored] = useState(new Set());
  const [renderedPath, setRenderedPath] = useState(new Set());
  const [carPosition, setCarPosition] = useState(null); // [r, c] when driving

  const isMouseDown = useRef(false);
  const driveIntervalRef = useRef(null);
  const hudLockedRef = useRef(false);

  // Trigger emergency lock and message
  const triggerEmergencyStop = (msg) => {
    hudLockedRef.current = true;
    onTelemetryUpdate({
      currentSpeed: 0,
      currentAccel: 0,
      statusMsg: msg,
      stepIndex: 0,
      totalSteps: 0
    });
  };

  // Check backend server connection status on mount
  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/health')
      .then(res => res.json())
      .then(() => setBackendActive(true))
      .catch(() => setBackendActive(false));
  }, []);

  // Update telemetry details in the parent dashboard
  const updateTelemetry = (speed, accel, msg, stepIdx = 0, total = 0) => {
    if (hudLockedRef.current) return;
    onTelemetryUpdate({
      currentSpeed: speed,
      currentAccel: accel,
      statusMsg: msg,
      stepIndex: stepIdx,
      totalSteps: total
    });
  };

  // Handle drawing obstacles/hazards on grid mouse events
  const handleCellInteraction = (r, c) => {
    if (isVisualizing || isDriving) return;

    const key = `${r},${c}`;
    const isStart = startNode[0] === r && startNode[1] === c;
    const isTarget = targetNode[0] === r && targetNode[1] === c;

    if (isStart || isTarget) return;

    if (mouseMode === 'start') {
      setStartNode([r, c]);
      clearVisualization();
    } else if (mouseMode === 'target') {
      setTargetNode([r, c]);
      clearVisualization();
    } else if (mouseMode === 'wall') {
      // Remove from hazards if adding wall
      setHazards(prev => prev.filter(h => h[0] !== r || h[1] !== c));
      setObstacles(prev => {
        const exists = prev.some(o => o[0] === r && o[1] === c);
        if (!exists) return [...prev, [r, c]];
        return prev;
      });
    } else if (mouseMode === 'hazard') {
      // Remove from walls if adding hazard
      setObstacles(prev => prev.filter(o => o[0] !== r || o[1] !== c));
      setHazards(prev => {
        const exists = prev.some(h => h[0] === r && h[1] === c);
        if (!exists) return [...prev, [r, c]];
        return prev;
      });
    } else if (mouseMode === 'erase') {
      setObstacles(prev => prev.filter(o => o[0] !== r || o[1] !== c));
      setHazards(prev => prev.filter(h => h[0] !== r || h[1] !== c));
    }
  };

  const handleMouseDown = (r, c) => {
    isMouseDown.current = true;
    handleCellInteraction(r, c);
  };

  const handleMouseEnter = (r, c) => {
    if (isMouseDown.current) {
      handleCellInteraction(r, c);
    }
  };

  const handleMouseUp = () => {
    isMouseDown.current = false;
  };

  useEffect(() => {
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  // Map preset configurations
  const applyMapPreset = (presetName) => {
    if (isVisualizing || isDriving) return;
    
    setSelectedMapPreset(presetName);
    clearVisualization();
    
    let newObstacles = [];
    let newHazards = [];
    let newStart = [9, 4];
    let newTarget = [9, 25];
    
    if (presetName === 'manhattan') {
      newStart = [1, 2];
      newTarget = [18, 27];
      for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 30; c++) {
          const isVertCorridor = (c === 6 || c === 13 || c === 20 || c === 27);
          const isHorizCorridor = (r === 4 || r === 10 || r === 15);
          const isStartCorridor = Math.abs(r - newStart[0]) <= 1 && Math.abs(c - newStart[1]) <= 1;
          const isTargetCorridor = Math.abs(r - newTarget[0]) <= 1 && Math.abs(c - newTarget[1]) <= 1;
          
          if (!isVertCorridor && !isHorizCorridor && !isStartCorridor && !isTargetCorridor) {
            if ((r + c) % 8 !== 0) {
              newObstacles.push([r, c]);
            }
          }
        }
      }
      newHazards = [
        [4, 8], [4, 9], [10, 3], [10, 16], [15, 23], [12, 13]
      ];
      updateTelemetry(0, 0, 'HUD UPDATED: MANHATTAN CITY GRID BLOCK DESIGN LOADED.');
      
    } else if (presetName === 'tokyo') {
      newStart = [9, 1];
      newTarget = [9, 28];
      const centerR = 9;
      const centerC = 15;
      
      for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 30; c++) {
          if ((Math.abs(r - newStart[0]) <= 1 && Math.abs(c - newStart[1]) <= 1) || 
              (Math.abs(r - newTarget[0]) <= 1 && Math.abs(c - newTarget[1]) <= 1)) {
            continue;
          }
          
          const dist = Math.sqrt((r - centerR)**2 + (c - centerC)**2);
          
          if (dist > 8 && dist < 12) {
            newObstacles.push([r, c]);
          }
          if (dist < 3) {
            newObstacles.push([r, c]);
          }
          
          if (dist >= 3 && dist <= 8) {
            if (r < 6 && (c < 12 || c > 18)) newObstacles.push([r, c]);
            if (r > 12 && (c < 12 || c > 18)) newObstacles.push([r, c]);
          }
        }
      }
      newHazards = [
        [9, 12], [9, 18], [6, 15], [12, 15]
      ];
      updateTelemetry(0, 0, 'HUD UPDATED: TOKYO EXPRESSWAY AND ROUNDABOUT PRESET ACTIVE.');
      
    } else if (presetName === 'mountain') {
      newStart = [2, 2];
      newTarget = [17, 27];
      for (let c = 0; c < 30; c++) {
        const r_center = 9.5 + 6.0 * Math.sin(c * 0.35);
        for (let r = 0; r < 20; r++) {
          const isNearStart = Math.abs(r - newStart[0]) <= 1 && Math.abs(c - newStart[1]) <= 1;
          const isNearTarget = Math.abs(r - newTarget[0]) <= 1 && Math.abs(c - newTarget[1]) <= 1;
          if (isNearStart || isNearTarget) continue;
          
          const distToCenter = Math.abs(r - r_center);
          if (distToCenter > 2.0) {
            newObstacles.push([r, c]);
          } else {
            if ((c === 4 || c === 13 || c === 22) && Math.abs(distToCenter - 1) < 0.5) {
              newHazards.push([r, c]);
            }
          }
        }
      }
      updateTelemetry(0, 0, 'HUD UPDATED: MOUNTAIN S-CURVE PASS LOADED.');
      
    } else if (presetName === 'sf') {
      newStart = [3, 3];
      newTarget = [16, 26];
      for (let r = 0; r < 20; r++) {
        for (let c = 0; c < 30; c++) {
          const isNearStart = Math.abs(r - newStart[0]) <= 1 && Math.abs(c - newStart[1]) <= 1;
          const isNearTarget = Math.abs(r - newTarget[0]) <= 1 && Math.abs(c - newTarget[1]) <= 1;
          if (isNearStart || isNearTarget) continue;
          
          if (c === 7 || c === 14 || c === 21) {
            if (r > 2 && r < 17) {
              newHazards.push([r, c]);
            }
          }
          if ((r === 6 && c > 3 && c < 12) || (r === 13 && c > 16 && c < 25) || (r === 9 && c > 10 && c < 20)) {
            newObstacles.push([r, c]);
          }
        }
      }
      updateTelemetry(0, 0, 'HUD UPDATED: SAN FRANCISCO GRID AND ROAD BLOCKS ACTIVE.');
    } else {
      updateTelemetry(0, 0, 'HUD UPDATED: EMPTY TEST ARENA INITIALIZED.');
    }
    
    setObstacles(newObstacles);
    setHazards(newHazards);
    setStartNode(newStart);
    setTargetNode(newTarget);
  };

  // Erases all grid walls/obstacles & hazard points
  const clearGrid = () => {
    if (isVisualizing || isDriving) return;
    setObstacles([]);
    setHazards([]);
    clearVisualization();
    updateTelemetry(0, 0, 'HUD IDLE. GRID CLEARED.');
  };

  // Erases pathfinding drawings but keeps walls
  const clearVisualization = () => {
    if (isVisualizing || isDriving) return;
    hudLockedRef.current = false;
    setExploredNodes([]);
    setPathNodes([]);
    setSpeedProfile([]);
    setRenderedExplored(new Set());
    setRenderedPath(new Set());
    setCarPosition(null);
    updateTelemetry(0, 0, 'HUD STANDBY. Trajectory map cleared.');
  };

  // Generates randomized layout obstacles and slowdown buffers
  const generateRandomMaze = () => {
    if (isVisualizing || isDriving) return;
    
    clearVisualization();
    const newObstacles = [];
    const newHazards = [];

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Skip start/end and adjacent safety zones
        const isNearStart = Math.abs(r - startNode[0]) <= 1 && Math.abs(c - startNode[1]) <= 1;
        const isNearTarget = Math.abs(r - targetNode[0]) <= 1 && Math.abs(c - targetNode[1]) <= 1;
        if (isNearStart || isNearTarget) continue;

        const rand = Math.random();
        if (rand < 0.22) {
          newObstacles.push([r, c]);
        } else if (rand < 0.32) {
          newHazards.push([r, c]);
        }
      }
    }
    setObstacles(newObstacles);
    setHazards(newHazards);
    updateTelemetry(0, 0, 'HUD UPDATED: RANDOM OBSTACLES AND SAFETY ZONES PLACED.');
  };

  // Primary navigation logic
  const calculatePath = async () => {
    if (isVisualizing || isDriving) return null;
    
    setIsVisualizing(true);
    setRenderedExplored(new Set());
    setRenderedPath(new Set());
    setCarPosition(null);
    updateTelemetry(0, 0, 'HUD INITIALIZING GLOBAL NAVIGATION SEARCH...');

    let pathResult = null;
    
    if (backendActive) {
      // Backend Python Flask solver API call
      try {
        const response = await fetch('http://127.0.0.1:5000/api/navigate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            start: startNode,
            end: targetNode,
            grid_rows: rows,
            grid_cols: cols,
            obstacles: obstacles,
            algorithm: selectedAlgo,
            allow_diagonals: allowDiagonals
          })
        });
        
        if (response.ok) {
          const data = await response.json();
          pathResult = {
            path: data.path,
            explored: data.explored,
            timeMs: data.calculation_time_ms
          };
          updateTelemetry(0, 0, 'ROUTING DATA LOADED FROM FLASK.');
        } else {
          console.warn("Backend calculation failed. Falling back to local JS algorithms.");
        }
      } catch (err) {
        console.warn("Error communicating with backend. Using local fallbacks.", err);
      }
    }

    // Local JS execution fallback
    if (!pathResult) {
      if (selectedAlgo === 'dijkstra') {
        pathResult = runDijkstraJS(startNode, targetNode, rows, cols, obstacles, allowDiagonals);
      } else if (selectedAlgo === 'greedy_bfs') {
        pathResult = runGreedyBFSJS(startNode, targetNode, rows, cols, obstacles, allowDiagonals);
      } else {
        pathResult = runAStarJS(startNode, targetNode, rows, cols, obstacles, allowDiagonals);
      }
    }

    if (!pathResult.path || pathResult.path.length === 0) {
      updateTelemetry(0, 0, 'DANGER: NO VALID COALESCING PATH DETECTED. HIGH DANGER DECLARED.');
      setIsVisualizing(false);
      onStatsUpdate({
        pathLength: 0,
        exploredCount: pathResult.explored.length,
        timeMs: pathResult.timeMs,
        algorithmName: selectedAlgo
      });
      return null;
    }

    // Calculate speed profile using DP
    let profileResult = null;
    if (backendActive) {
      try {
        const response = await fetch('http://127.0.0.1:5000/api/speed-profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathResult.path,
            hazards: hazards,
            max_speed: 50.0,
            turn_speed: 20.0,
            hazard_speed: 15.0
          })
        });
        if (response.ok) {
          const data = await response.json();
          profileResult = data.profile;
        }
      } catch (err) {
        console.warn("Backend DP speed solver failed. Falling back to local solver.");
      }
    }

    if (!profileResult) {
      profileResult = optimizeSpeedProfileJS(pathResult.path, hazards, 50.0, 20.0, 15.0);
    }

    // Save outputs
    setExploredNodes(pathResult.explored);
    setPathNodes(pathResult.path);
    setSpeedProfile(profileResult);

    // Update stats scoreboard
    onStatsUpdate({
      pathLength: pathResult.path.length,
      exploredCount: pathResult.explored.length,
      timeMs: pathResult.timeMs,
      algorithmName: selectedAlgo
    });

    // Run step-by-step visual animation for node scan
    animateVisualization(pathResult.explored, pathResult.path, profileResult);
    return pathResult.path;
  };

  // Node visualization scheduler
  const animateVisualization = (explored, path, profile) => {
    let speedDelay = 18; // normal speed delay in ms
    if (simSpeed === 'fast') speedDelay = 4;
    if (simSpeed === 'slow') speedDelay = 45;

    let index = 0;
    const interval = setInterval(() => {
      if (index >= explored.length) {
        clearInterval(interval);
        // Completed node scans, now draw path
        animatePath(path, profile);
        return;
      }
      
      const node = explored[index];
      const key = `${node.row},${node.col}`;
      setRenderedExplored(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      
      updateTelemetry(0, 0, `SCANNING NEIGHBORS: EXPLORING CELL [${node.row}, ${node.col}]`, index, explored.length);
      index++;
    }, speedDelay);
  };

  // Shortest path tracing animation
  const animatePath = (path, profile) => {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= path.length) {
        clearInterval(interval);
        setIsVisualizing(false);
        updateTelemetry(0, 0, 'ROUTING TRAJECTORY COMPUTED SUCCESSFULLY. AUTOPILOT DRIVE ENGAGED.');
        return;
      }
      
      const node = path[index];
      const key = `${node.row},${node.col}`;
      setRenderedPath(prev => {
        const next = new Set(prev);
        next.add(key);
        return next;
      });
      index++;
    }, 25);
  };

  // Self-driving car live animation along path with obstacle re-routing
  const startAutopilotDrive = () => {
    if (isVisualizing || isDriving || pathNodes.length === 0) return;
    
    hudLockedRef.current = false;
    setIsDriving(true);
    let index = 0;
    setCarPosition([pathNodes[0].row, pathNodes[0].col]);
    
    const driveStep = () => {
      if (index >= pathNodes.length) {
        // Destination arrived
        setIsDriving(false);
        setCarPosition(null);
        updateTelemetry(0, 0, 'ARRIVED AT DESTINATION. DOCKED SAFELY.', 0, 0);
        return;
      }

      const currNode = pathNodes[index];

      // Active Collision Detection (exclude start node index 0)
      const isWall = index > 0 && obstacles.some(o => o[0] === currNode.row && o[1] === currNode.col);
      const isHazard = index > 0 && hazards.some(h => h[0] === currNode.row && h[1] === currNode.col);

      if (isWall) {
        setIsDriving(false);
        setCarPosition([currNode.row, currNode.col]);
        setStartNode([currNode.row, currNode.col]);
        if (driveIntervalRef.current) clearTimeout(driveIntervalRef.current);
        triggerEmergencyStop(`EMERGENCY CRASH: VEHICLE COLLIDED WITH WALL AT [${currNode.row}, ${currNode.col}]!`);
        return;
      }

      if (isHazard) {
        setIsDriving(false);
        setCarPosition([currNode.row, currNode.col]);
        setStartNode([currNode.row, currNode.col]);
        if (driveIntervalRef.current) clearTimeout(driveIntervalRef.current);
        triggerEmergencyStop(`EMERGENCY STOP: VEHICLE ENCOUNTERED HAZARD AT [${currNode.row}, ${currNode.col}]!`);
        return;
      }

      const speedStats = speedProfile[index] || { speed: 50.0, acceleration: 0.0 };
      
      setCarPosition([currNode.row, currNode.col]);

      // Dynamic warning message builder
      let speedWarning = "CRUISE ACTIVE - HIGHWAY VELOCITY";
      if (speedStats.speed < 20.0) {
        const isHazardNode = hazards.some(h => Math.abs(h[0]-currNode.row)<=1 && Math.abs(h[1]-currNode.col)<=1);
        if (isHazardNode) {
          speedWarning = "SAFETY WARNING: BUFFERING DECREASED HAZARD ZONE";
        } else if (index < pathNodes.length - 2) {
          speedWarning = "APPROACHING CURVATURE TURN - DECREASING VELOCITY";
        } else {
          speedWarning = "APPROACHING DESTINATION - FINAL DESTRUCTIVE BRAKING";
        }
      }
      
      updateTelemetry(speedStats.speed, speedStats.acceleration, speedWarning, index + 1, pathNodes.length);

      // --- DYNAMIC OBSTACLE RE-ROUTING ---
      // Trigger a random obstacle block along the path ahead of the car!
      const shouldTriggerObstacle = 
        dynamicObstacles && 
        index > 2 && 
        index < pathNodes.length - 4 && 
        Math.random() < 0.12;

      if (shouldTriggerObstacle) {
        // Place an obstacle in front of the vehicle along its path (e.g. 2 nodes ahead)
        const targetIndex = index + 2;
        const obstacleNode = pathNodes[targetIndex];
        
        // Ensure it doesn't overlap the start (car current) or destination
        if (obstacleNode && (obstacleNode.row !== targetNode[0] || obstacleNode.col !== targetNode[1])) {
          
          updateTelemetry(0, -4.0, "COLLISION WARNING: OBSTACLE DETECTED! COMMENCING ACTIVE BRAKING...", index + 1, pathNodes.length);
          
          // Stop drive timer
          if (driveIntervalRef.current) clearTimeout(driveIntervalRef.current);
          
          // Set new obstacle
          setObstacles(prev => [...prev, [obstacleNode.row, obstacleNode.col]]);
          
          // Wait 1.2 seconds for full stop and re-route scan
          setTimeout(async () => {
            const currentStartPos = [currNode.row, currNode.col];
            
            // Temporary variable state swap to run calculations from current location
            const oldStart = startNode;
            setStartNode(currentStartPos);
            
            setIsDriving(false);
            setIsVisualizing(true);
            setRenderedExplored(new Set());
            setRenderedPath(new Set());
            
            updateTelemetry(0, 0, 'VEHICLE BRAKED. SCANNING FOR COLLISION-FREE TRAJECTORY RE-ROUTE...');
            
            let reRouteResult = null;
            if (backendActive) {
              try {
                const response = await fetch('http://127.0.0.1:5000/api/navigate', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    start: currentStartPos,
                    end: targetNode,
                    grid_rows: rows,
                    grid_cols: cols,
                    obstacles: [...obstacles, [obstacleNode.row, obstacleNode.col]],
                    algorithm: selectedAlgo,
                    allow_diagonals: allowDiagonals
                  })
                });
                if (response.ok) {
                  const data = await response.json();
                  reRouteResult = { path: data.path, explored: data.explored, timeMs: data.calculation_time_ms };
                }
              } catch (err) {
                console.warn(err);
              }
            }
            
            if (!reRouteResult) {
              if (selectedAlgo === 'dijkstra') {
                reRouteResult = runDijkstraJS(currentStartPos, targetNode, rows, cols, [...obstacles, [obstacleNode.row, obstacleNode.col]], allowDiagonals);
              } else if (selectedAlgo === 'greedy_bfs') {
                reRouteResult = runGreedyBFSJS(currentStartPos, targetNode, rows, cols, [...obstacles, [obstacleNode.row, obstacleNode.col]], allowDiagonals);
              } else {
                reRouteResult = runAStarJS(currentStartPos, targetNode, rows, cols, [...obstacles, [obstacleNode.row, obstacleNode.col]], allowDiagonals);
              }
            }

            if (!reRouteResult.path || reRouteResult.path.length === 0) {
              setIsVisualizing(false);
              setStartNode(currentStartPos);
              triggerEmergencyStop('FATAL FAILURE: NO ESCAPE ROUTE DETECTED. VEHICLE LOCKED IN EMERGENCY STOP.');
              return;
            }

            // Calculate DP speed profile for new route
            let newProfile = null;
            if (backendActive) {
              try {
                const response = await fetch('http://127.0.0.1:5000/api/speed-profile', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    path: reRouteResult.path,
                    hazards: hazards,
                    max_speed: 50.0,
                    turn_speed: 20.0,
                    hazard_speed: 15.0
                  })
                });
                if (response.ok) {
                  const data = await response.json();
                  newProfile = data.profile;
                }
              } catch (err) {
                console.warn(err);
              }
            }
            if (!newProfile) {
              newProfile = optimizeSpeedProfileJS(reRouteResult.path, hazards, 50.0, 20.0, 15.0);
            }

            setExploredNodes(reRouteResult.explored);
            setPathNodes(reRouteResult.path);
            setSpeedProfile(newProfile);
            
            onStatsUpdate({
              pathLength: reRouteResult.path.length,
              exploredCount: reRouteResult.explored.length,
              timeMs: reRouteResult.timeMs,
              algorithmName: selectedAlgo
            });

            // Animate re-routing
            animateVisualization(reRouteResult.explored, reRouteResult.path, newProfile);
            
            // Reset standard start marker location back visually
            setStartNode(oldStart);

          }, 1200);

          return;
        }
      }

      // Live kinematic time step interval calculation:
      // Time step delta = (Distance / speed) * scale_factor
      // If speed is slow (e.g. 10 km/h = 2.7 m/s), time step is long (e.g. 500ms)
      // If speed is fast (e.g. 50 km/h = 13.8 m/s), time step is short (e.g. 100ms)
      const currentSpeedMS = Math.max(2.0, speedStats.speed / 3.6); // cap min speed to prevent infinite wait
      const timeInterval = (2.0 / currentSpeedMS) * 1000 * 0.7; // scaled for pleasing animation
      
      index++;
      driveIntervalRef.current = setTimeout(driveStep, timeInterval);
    };

    driveStep();
  };

  // Generate downloadable telemetry CSV file for academic deliverables
  const downloadTelemetryCSV = () => {
    if (speedProfile.length === 0) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Node_Index,Row,Col,Velocity_KMH,Acceleration_MS2\n";
    
    speedProfile.forEach((node, idx) => {
      csvContent += `${idx},${node.row},${node.col},${node.speed},${node.acceleration}\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `autonav_telemetry_${selectedAlgo}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Render dynamic SVG car/target icon indicators
  const renderCarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-green)', filter: 'drop-shadow(0 0 4px var(--accent-green))' }}>
      <rect x="5" y="2" width="14" height="20" rx="3" />
      <rect x="7" y="5" width="10" height="4" rx="1" fill="rgba(57, 255, 20, 0.2)" />
      <circle cx="8" cy="20" r="1.5" />
      <circle cx="16" cy="20" r="1.5" />
    </svg>
  );

  const renderTargetIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-crimson)', filter: 'drop-shadow(0 0 4px var(--accent-crimson))' }}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );

  return (
    <div className="cyber-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div className="cyber-panel-header">
        <div className="cyber-panel-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="12 8 8 12 12 16 16 12 12 8"/></svg>
          Interactive Vehicle Map Cockpit
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="hud-text" style={{ fontSize: '0.8rem', color: backendActive ? 'var(--accent-green)' : 'var(--accent-amber)' }}>
            [FLASK: {backendActive ? 'ACTIVE' : 'FALLBACK_LOCAL_JS'}]
          </span>
        </div>
      </div>

      {/* Grid Settings toolbar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', background: 'var(--bg-tertiary)', padding: '0.75rem', borderRadius: '6px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)' }}>SELECT PATHFINDER</label>
          <select className="cyber-select" value={selectedAlgo} onChange={e => { setSelectedAlgo(e.target.value); clearVisualization(); }} disabled={isVisualizing || isDriving}>
            <option value="a_star">A* Search (Heuristic-Optimal)</option>
            <option value="dijkstra">Dijkstra's (Breadth-Optimal)</option>
            <option value="greedy_bfs">Greedy Best-First (Fast Heuristic)</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)' }}>ARENA MAP PRESET</label>
          <select className="cyber-select" value={selectedMapPreset} onChange={e => applyMapPreset(e.target.value)} disabled={isVisualizing || isDriving}>
            <option value="empty">Custom Empty Canvas</option>
            <option value="manhattan">Manhattan Block Grid</option>
            <option value="tokyo">Tokyo Roundabout Expressway</option>
            <option value="mountain">Curvy Mountain S-Pass</option>
            <option value="sf">San Francisco Obstacle Grid</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)' }}>DRAW BRUSH TYPE</label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            <button className={`cyber-btn ${mouseMode === 'wall' ? 'cyber-btn-active' : ''}`} style={{ padding: '0.4rem 0.6rem', borderStyle: mouseMode === 'wall' ? 'solid' : 'dashed', borderColor: mouseMode === 'wall' ? 'var(--accent-cyan)' : 'var(--border-color)' }} onClick={() => setMouseMode('wall')} disabled={isVisualizing || isDriving}>Wall</button>
            <button className={`cyber-btn ${mouseMode === 'hazard' ? 'cyber-btn-active' : ''}`} style={{ padding: '0.4rem 0.6rem', borderStyle: mouseMode === 'hazard' ? 'solid' : 'dashed', borderColor: mouseMode === 'hazard' ? 'var(--accent-amber)' : 'var(--border-color)' }} onClick={() => setMouseMode('hazard')} disabled={isVisualizing || isDriving}>Hazard</button>
            <button className={`cyber-btn ${mouseMode === 'start' ? 'cyber-btn-active' : ''}`} style={{ padding: '0.4rem 0.6rem', borderStyle: mouseMode === 'start' ? 'solid' : 'dashed', borderColor: mouseMode === 'start' ? 'var(--accent-green)' : 'var(--border-color)' }} onClick={() => setMouseMode('start')} disabled={isVisualizing || isDriving}>Car</button>
            <button className={`cyber-btn ${mouseMode === 'target' ? 'cyber-btn-active' : ''}`} style={{ padding: '0.4rem 0.6rem', borderStyle: mouseMode === 'target' ? 'solid' : 'dashed', borderColor: mouseMode === 'target' ? 'var(--accent-crimson)' : 'var(--border-color)' }} onClick={() => setMouseMode('target')} disabled={isVisualizing || isDriving}>Goal</button>
            <button className={`cyber-btn ${mouseMode === 'erase' ? 'cyber-btn-active' : ''}`} style={{ padding: '0.4rem 0.6rem', borderStyle: mouseMode === 'erase' ? 'solid' : 'dashed', borderColor: mouseMode === 'erase' ? 'var(--accent-cyan)' : 'var(--border-color)' }} onClick={() => setMouseMode('erase')} disabled={isVisualizing || isDriving}>Eraser</button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)' }}>ANIMATION SPEED</label>
          <select className="cyber-select" value={simSpeed} onChange={e => setSimSpeed(e.target.value)} disabled={isVisualizing || isDriving}>
            <option value="slow">Slow Scan</option>
            <option value="normal">Normal Scan</option>
            <option value="fast">Fast Scan</option>
          </select>
        </div>

        <div className="cyber-switch-container" onClick={() => { if (!isVisualizing && !isDriving) setAllowDiagonals(!allowDiagonals); }}>
          <div className={`cyber-switch ${allowDiagonals ? 'cyber-switch-active' : ''}`} />
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)' }}>8-WAY DIAGONALS</span>
        </div>

        <div className="cyber-switch-container" onClick={() => { if (!isVisualizing && !isDriving) setDynamicObstacles(!dynamicObstacles); }}>
          <div className={`cyber-switch ${dynamicObstacles ? 'cyber-switch-active' : ''}`} />
          <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-hud)' }}>DYNAMIC RE-ROUTE</span>
        </div>

      </div>

      {/* Grid Canvas */}
      <div 
        className="grid-container" 
        style={{ gridTemplateColumns: `repeat(${cols}, 22px)` }}
      >
        {Array.from({ length: rows }).map((_, r) =>
          Array.from({ length: cols }).map((_, c) => {
            const isStart = startNode[0] === r && startNode[1] === c;
            const isTarget = targetNode[0] === r && targetNode[1] === c;
            const isCar = carPosition && carPosition[0] === r && carPosition[1] === c;
            
            const key = `${r},${c}`;
            const isWall = obstacles.some(o => o[0] === r && o[1] === c);
            const isHazard = hazards.some(h => h[0] === r && h[1] === c);
            const isExplored = renderedExplored.has(key);
            const isPath = renderedPath.has(key);

            let cellClass = 'grid-cell';
            if (isWall) cellClass += ' cell-wall';
            else if (isHazard) cellClass += ' cell-hazard';
            else if (isPath) cellClass += ' cell-path';
            else if (isExplored) cellClass += ' cell-explored';

            return (
              <div
                key={key}
                className={cellClass}
                style={{ width: '22px', height: '22px' }}
                onMouseDown={() => handleMouseDown(r, c)}
                onMouseEnter={() => handleMouseEnter(r, c)}
              >
                {isCar ? renderCarIcon() : isStart && !carPosition ? renderCarIcon() : null}
                {isTarget ? renderTargetIcon() : null}
              </div>
            );
          })
        )}
      </div>

      {/* Actions toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.5rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="cyber-btn btn-green" onClick={calculatePath} disabled={isVisualizing || isDriving}>
            Plan Trajectory
          </button>
          <button className="cyber-btn btn-amber" onClick={startAutopilotDrive} disabled={isVisualizing || isDriving || pathNodes.length === 0}>
            Simulate Autopilot Drive
          </button>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="cyber-btn" onClick={downloadTelemetryCSV} disabled={speedProfile.length === 0 || isVisualizing || isDriving}>
            Export Telemetry Log
          </button>
          <button className="cyber-btn" onClick={generateRandomMaze} disabled={isVisualizing || isDriving}>
            Randomize Arena
          </button>
          <button className="cyber-btn btn-crimson" onClick={clearGrid} disabled={isVisualizing || isDriving}>
            Reset Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default GridVisualizer;
