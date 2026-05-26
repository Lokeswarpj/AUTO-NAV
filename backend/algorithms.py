import heapq
import math
import time

def get_neighbors(row, col, rows, cols, allow_diagonals=True):
    """
    Returns valid neighboring coordinates and their transition costs.
    Orthogonal movements have a cost of 1.0.
    Diagonal movements have a cost of ~1.414 (sqrt(2)).
    """
    neighbors = []
    
    # 4-way orthogonal directions
    orthogonal_directions = [
        (-1, 0, 1.0),  # Up
        (1, 0, 1.0),   # Down
        (0, -1, 1.0),  # Left
        (0, 1, 1.0)    # Right
    ]
    
    # 4-way diagonal directions
    diagonal_directions = [
        (-1, -1, 1.414), # Up-Left
        (-1, 1, 1.414),  # Up-Right
        (1, -1, 1.414),  # Down-Left
        (1, 1, 1.414)    # Down-Right
    ]
    
    directions = orthogonal_directions
    if allow_diagonals:
        directions = orthogonal_directions + diagonal_directions
        
    for dr, dc, cost in directions:
        nr, nc = row + dr, col + dc
        if 0 <= nr < rows and 0 <= nc < cols:
            neighbors.append((nr, nc, cost))
            
    return neighbors

def heuristic(r1, c1, r2, c2, allow_diagonals=True):
    """
    Computes heuristic cost from node 1 to node 2.
    - Octile distance if diagonals are allowed.
    - Manhattan distance if diagonals are not allowed.
    """
    dr = abs(r1 - r2)
    dc = abs(c1 - c2)
    
    if allow_diagonals:
        # Octile distance
        return min(dr, dc) * 1.414 + abs(dr - dc)
    else:
        # Manhattan distance
        return dr + dc

def run_dijkstra(start, end, grid_rows, grid_cols, obstacles, allow_diagonals=True):
    """
    Computes the shortest path using Dijkstra's Algorithm.
    Returns: (path, explored_nodes, execution_time_ms)
    """
    start_time = time.perf_counter()
    
    start_r, start_c = start
    end_r, end_c = end
    obstacle_set = set((r, c) for r, c in obstacles)
    
    # Priority Queue elements: (g_score, row, col)
    pq = []
    heapq.heappush(pq, (0.0, start_r, start_c))
    
    # Track g_score (minimum cost to reach each node)
    g_score = {(start_r, start_c): 0.0}
    
    # Parent mapping to reconstruct the path
    parent = {}
    
    # Ordered list of nodes visited during exploration (for animation)
    explored = []
    explored_set = set()
    
    path_found = False
    
    while pq:
        current_g, r, c = heapq.heappop(pq)
        
        # If this node has already been processed with a lower cost, skip
        if current_g > g_score.get((r, c), float('inf')):
            continue
            
        explored.append({'row': r, 'col': c})
        explored_set.add((r, c))
        
        if (r, c) == (end_r, end_c):
            path_found = True
            break
            
        for nr, nc, cost in get_neighbors(r, c, grid_rows, grid_cols, allow_diagonals):
            if (nr, nc) in obstacle_set:
                continue
                
            tentative_g = current_g + cost
            if tentative_g < g_score.get((nr, nc), float('inf')):
                g_score[(nr, nc)] = tentative_g
                parent[(nr, nc)] = (r, c)
                heapq.heappush(pq, (tentative_g, nr, nc))
                
    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000.0  # convert to ms
    
    # Reconstruct path
    path = []
    if path_found:
        curr = (end_r, end_c)
        while curr in parent:
            path.append({'row': curr[0], 'col': curr[1]})
            curr = parent[curr]
        path.append({'row': start_r, 'col': start_c})
        path.reverse()
        
    return path, explored, execution_time

def run_a_star(start, end, grid_rows, grid_cols, obstacles, allow_diagonals=True):
    """
    Computes the optimal path using A* Search Algorithm.
    Returns: (path, explored_nodes, execution_time_ms)
    """
    start_time = time.perf_counter()
    
    start_r, start_c = start
    end_r, end_c = end
    obstacle_set = set((r, c) for r, c in obstacles)
    
    # Priority Queue elements: (f_score, g_score, row, col)
    # Adding g_score as a tie-breaker favors nodes deeper along the route
    pq = []
    h_start = heuristic(start_r, start_c, end_r, end_c, allow_diagonals)
    heapq.heappush(pq, (h_start, 0.0, start_r, start_c))
    
    g_score = {(start_r, start_c): 0.0}
    f_score = {(start_r, start_c): h_start}
    
    parent = {}
    explored = []
    explored_set = set()
    path_found = False
    
    while pq:
        current_f, current_g, r, c = heapq.heappop(pq)
        
        if current_g > g_score.get((r, c), float('inf')):
            continue
            
        explored.append({'row': r, 'col': c})
        explored_set.add((r, c))
        
        if (r, c) == (end_r, end_c):
            path_found = True
            break
            
        for nr, nc, cost in get_neighbors(r, c, grid_rows, grid_cols, allow_diagonals):
            if (nr, nc) in obstacle_set:
                continue
                
            tentative_g = current_g + cost
            if tentative_g < g_score.get((nr, nc), float('inf')):
                g_score[(nr, nc)] = tentative_g
                h_val = heuristic(nr, nc, end_r, end_c, allow_diagonals)
                f_val = tentative_g + h_val
                f_score[(nr, nc)] = f_val
                parent[(nr, nc)] = (r, c)
                heapq.heappush(pq, (f_val, tentative_g, nr, nc))
                
    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000.0
    
    path = []
    if path_found:
        curr = (end_r, end_c)
        while curr in parent:
            path.append({'row': curr[0], 'col': curr[1]})
            curr = parent[curr]
        path.append({'row': start_r, 'col': start_c})
        path.reverse()
        
    return path, explored, execution_time

def run_greedy_bfs(start, end, grid_rows, grid_cols, obstacles, allow_diagonals=True):
    """
    Computes a path using Greedy Best-First Search (purely heuristic-based).
    Note: Greedy BFS is fast but does not guarantee the shortest/optimal path.
    Returns: (path, explored_nodes, execution_time_ms)
    """
    start_time = time.perf_counter()
    
    start_r, start_c = start
    end_r, end_c = end
    obstacle_set = set((r, c) for r, c in obstacles)
    
    # Priority Queue elements: (h_score, row, col)
    pq = []
    h_start = heuristic(start_r, start_c, end_r, end_c, allow_diagonals)
    heapq.heappush(pq, (h_start, start_r, start_c))
    
    # Track visited states to prevent loops
    visited = {(start_r, start_c)}
    parent = {}
    explored = []
    path_found = False
    
    while pq:
        current_h, r, c = heapq.heappop(pq)
        
        explored.append({'row': r, 'col': c})
        
        if (r, c) == (end_r, end_c):
            path_found = True
            break
            
        for nr, nc, cost in get_neighbors(r, c, grid_rows, grid_cols, allow_diagonals):
            if (nr, nc) in obstacle_set or (nr, nc) in visited:
                continue
                
            visited.add((nr, nc))
            parent[(nr, nc)] = (r, c)
            h_val = heuristic(nr, nc, end_r, end_c, allow_diagonals)
            heapq.heappush(pq, (h_val, nr, nc))
            
    end_time = time.perf_counter()
    execution_time = (end_time - start_time) * 1000.0
    
    path = []
    if path_found:
        curr = (end_r, end_c)
        while curr in parent:
            path.append({'row': curr[0], 'col': curr[1]})
            curr = parent[curr]
        path.append({'row': start_r, 'col': start_c})
        path.reverse()
        
    return path, explored, execution_time

def optimize_speed_profile(path, hazards=None, max_speed=50.0, turn_speed=20.0, hazard_speed=15.0, max_accel=3.0, max_decel=4.0):
    """
    Computes an optimal velocity profile along a pre-computed route using Dynamic Programming.
    
    State Formulation:
      - S = [0, 1, 2, ..., N-1] indexes of nodes along the path
      - State at node i: v_i (velocity at node i)
      - Goal: Compute optimal v_i for all i such that:
        1. Safety limit: v_i <= limit_i
        2. Deceleration dynamics limit: v_i^2 <= v_{i+1}^2 + 2 * a_decel * delta_x (backward pass)
        3. Acceleration dynamics limit: v_i^2 <= v_{i-1}^2 + 2 * a_accel * delta_x (forward pass)
      
    Args:
      path: List of coordinates [{'row': r, 'col': c}, ...]
      hazards: Set or list of coordinates of dynamic hazard areas [(r, c), ...]
      max_speed: Normal speed on straights (km/h) -> converted internally to m/s
      turn_speed: Safe speed during a turn (km/h) -> converted internally to m/s
      hazard_speed: Safe speed in proximity to hazards (km/h) -> converted internally to m/s
      max_accel: Max acceleration (m/s^2)
      max_decel: Max deceleration (m/s^2)
      
    Returns:
      List of speed profiles (km/h) and acceleration profiles at each node.
    """
    if not path:
        return []
        
    N = len(path)
    hazard_set = set((r, c) for r, c in hazards) if hazards else set()
    
    # Scale velocities to m/s for kinematic calculations (1 km/h = 1/3.6 m/s)
    v_max = max_speed / 3.6
    v_turn = turn_speed / 3.6
    v_hazard = hazard_speed / 3.6
    
    # Step 1: Detect curvature/turns and hazard proximity to build local speed limits
    speed_limits = [v_max] * N
    
    # Destination node velocity is always 0.0 (stopping condition)
    speed_limits[-1] = 0.0
    
    # Curvature detection (change in direction between three consecutive nodes)
    for i in range(1, N - 1):
        prev = path[i - 1]
        curr = path[i]
        nxt = path[i + 1]
        
        # Direction vectors
        v1 = (curr['row'] - prev['row'], curr['col'] - prev['col'])
        v2 = (nxt['row'] - curr['row'], nxt['col'] - curr['col'])
        
        # Dot product
        dot = v1[0] * v2[0] + v1[1] * v2[1]
        mag1 = math.sqrt(v1[0]**2 + v1[1]**2)
        mag2 = math.sqrt(v2[0]**2 + v2[1]**2)
        
        # Calculate angle of turning in radians
        if mag1 > 0 and mag2 > 0:
            val = max(-1.0, min(1.0, dot / (mag1 * mag2)))
            angle = math.acos(val)
            if angle > 0.1:  # Significant direction change (turning)
                # The sharper the angle, the slower we drive
                factor = max(0.0, 1.0 - (angle / (math.pi / 2.0)))
                speed_limits[i] = v_turn + (v_max - v_turn) * factor
                
    # Proximity safety zone calculation (if a node is adjacent to a hazard/obstacle)
    for i in range(N - 1):
        curr_node = (path[i]['row'], path[i]['col'])
        
        # Check standard 8 directions around the node for hazard presence
        is_near_hazard = False
        for dr in [-1, 0, 1]:
            for dc in [-1, 0, 1]:
                check_node = (curr_node[0] + dr, curr_node[1] + dc)
                if check_node in hazard_set:
                    is_near_hazard = True
                    break
            if is_near_hazard:
                break
                
        if is_near_hazard:
            # Enforce safety-slowdown constraint
            speed_limits[i] = min(speed_limits[i], v_hazard)
            
    # Node spacing in meters (assume each grid cell represents 2.0 meters of physical road)
    dx = 2.0
    
    # State Array for DP (velocities initialized to max constraints)
    dp_velocities = list(speed_limits)
    
    # --- DYNAMIC PROGRAMMING BACKWARD PASS (Deceleration Constraint) ---
    # We work backwards from N-2 down to 0, bounding the velocity at node i based on the next node's velocity:
    # v_i <= sqrt(v_{i+1}^2 + 2 * a_decel * dx)
    for i in range(N - 2, -1, -1):
        limit = dp_velocities[i]
        next_vel = dp_velocities[i + 1]
        safe_decel_vel = math.sqrt(next_vel**2 + 2.0 * max_decel * dx)
        dp_velocities[i] = min(limit, safe_decel_vel)
        
    # --- DYNAMIC PROGRAMMING FORWARD PASS (Acceleration Constraint) ---
    # We work forwards from 1 to N-1, bounding velocity based on starting speed and acceleration capability:
    # v_i <= sqrt(v_{i-1}^2 + 2 * a_accel * dx)
    # The starting velocity is set to a safe value or 0 if starting from stationary.
    dp_velocities[0] = min(dp_velocities[0], 5.0 / 3.6) # Start slow, e.g. 5 km/h
    for i in range(1, N):
        limit = dp_velocities[i]
        prev_vel = dp_velocities[i - 1]
        safe_accel_vel = math.sqrt(prev_vel**2 + 2.0 * max_accel * dx)
        dp_velocities[i] = min(limit, safe_accel_vel)
        
    # Compute accelerations along the path (m/s^2) for HUD visualization
    accelerations = [0.0] * N
    for i in range(N - 1):
        v_curr = dp_velocities[i]
        v_next = dp_velocities[i + 1]
        # v^2 = u^2 + 2ad -> a = (v^2 - u^2) / 2d
        accelerations[i] = (v_next**2 - v_curr**2) / (2.0 * dx)
        
    # Scale speeds back to km/h for standard display logs, rounded to 2 decimals
    speeds_kmh = [round(v * 3.6, 2) for v in dp_velocities]
    accels_ms2 = [round(a, 2) for a in accelerations]
    
    # Structure telemetry profile data
    profile = []
    for i in range(N):
        profile.append({
            'row': path[i]['row'],
            'col': path[i]['col'],
            'speed': speeds_kmh[i],
            'acceleration': accels_ms2[i]
        })
        
    return profile
