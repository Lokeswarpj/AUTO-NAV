from flask import Flask, request, jsonify
from flask_cors import CORS
from algorithms import run_dijkstra, run_a_star, run_greedy_bfs, optimize_speed_profile
import sys

app = Flask(__name__)
# Enable CORS for all routes to handle React dev-server calls seamlessly
CORS(app)

@app.route('/api/health', methods=['GET'])
def health():
    """
    Health check and diagnostics endpoint.
    """
    return jsonify({
        'status': 'healthy',
        'system': 'Self-Driving Car Navigation API',
        'python_version': sys.version
    }), 200

@app.route('/api/navigate', methods=['POST'])
def navigate():
    """
    Computes pathfinding navigation coordinates using the specified algorithm.
    JSON Payload structure:
    {
        "start": [row, col],
        "end": [row, col],
        "grid_rows": 20,
        "grid_cols": 30,
        "obstacles": [[r1, c1], [r2, c2], ...],
        "algorithm": "a_star" | "dijkstra" | "greedy_bfs",
        "allow_diagonals": true | false
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing request payload'}), 400
            
        start = data.get('start')
        end = data.get('end')
        grid_rows = data.get('grid_rows', 20)
        grid_cols = data.get('grid_cols', 30)
        obstacles = data.get('obstacles', [])
        algorithm = data.get('algorithm', 'a_star')
        allow_diagonals = data.get('allow_diagonals', True)
        
        # Validation checks
        if start is None or end is None:
            return jsonify({'error': 'Start and end coordinates are required'}), 400
            
        start_coord = tuple(start)
        end_coord = tuple(end)
        
        # Calculate routes using selected algorithms
        if algorithm == 'dijkstra':
            path, explored, time_ms = run_dijkstra(start_coord, end_coord, grid_rows, grid_cols, obstacles, allow_diagonals)
        elif algorithm == 'greedy_bfs':
            path, explored, time_ms = run_greedy_bfs(start_coord, end_coord, grid_rows, grid_cols, obstacles, allow_diagonals)
        else: # Default is A* Search
            path, explored, time_ms = run_a_star(start_coord, end_coord, grid_rows, grid_cols, obstacles, allow_diagonals)
            
        return jsonify({
            'algorithm': algorithm,
            'allow_diagonals': allow_diagonals,
            'path': path,
            'explored': explored,
            'calculation_time_ms': round(time_ms, 4),
            'explored_count': len(explored),
            'path_length': len(path)
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/speed-profile', methods=['POST'])
def speed_profile():
    """
    Accepts coordinates and dynamic hazard locations, resolving a velocity and acceleration profile.
    JSON Payload structure:
    {
        "path": [{"row": r, "col": c}, ...],
        "hazards": [[r1, c1], ...],
        "max_speed": 50.0,
        "turn_speed": 20.0,
        "hazard_speed": 15.0,
        "max_accel": 3.0,
        "max_decel": 4.0
    }
    """
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Missing request payload'}), 400
            
        path = data.get('path', [])
        hazards = data.get('hazards', [])
        max_speed = data.get('max_speed', 50.0)
        turn_speed = data.get('turn_speed', 20.0)
        hazard_speed = data.get('hazard_speed', 15.0)
        max_accel = data.get('max_accel', 3.0)
        max_decel = data.get('max_decel', 4.0)
        
        if not path:
            return jsonify({'error': 'Path coordinates list is required'}), 400
            
        profile = optimize_speed_profile(
            path, 
            hazards=hazards, 
            max_speed=max_speed, 
            turn_speed=turn_speed, 
            hazard_speed=hazard_speed, 
            max_accel=max_accel, 
            max_decel=max_decel
        )
        
        return jsonify({
            'profile': profile,
            'max_speed_limit': max_speed,
            'total_stops': 1 if len(profile) > 0 else 0
        }), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Using thread-safe hot reload on port 5000
    app.run(host='127.0.0.1', port=5000, debug=True)
