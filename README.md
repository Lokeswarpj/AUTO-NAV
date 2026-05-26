# Autonomous Vehicle Navigation & Safety Profile Visualizer
### Algorithms Subject Mini-Project

This academic mini-project titled **“Self-Driving Cars (Autonomous Systems): Making Real-Time Decisions for Navigation and Obstacle Avoidance using A*, Dijkstra, Greedy Algorithms, and Dynamic Programming”** visually and mathematically simulates how self-driving cars calculate collision-free trajectories and optimal speed adjustments in real time.

---

## 🌟 Core Features & Concepts Simulated

1. **Interactive Pathfinding Arena (20x30 Grid)**
   - Allows users to place/drag start nodes (represented by a **Self-Driving Car**) and target nodes (**Destination**).
   - Interactive drawing controls for solid **Road Obstacles** and friction-laden **Hazard slowdown zones**.
   - Choice of 4-way orthogonal grid search or **8-way diagonal steering path calculations**.

2. **Algorithm Visualizations**
   - **A* Search (Optimal & Fast):** Heuristic-driven shortest path selection utilizing Manhattan/Octile heuristics to minimize explored nodes.
   - **Dijkstra's Algorithm (Guaranteed Shortest):** Exhaustive uniform exploration for single-source shortest path planning.
   - **Greedy Best-First Search (Sub-optimal Speed):** Direct heuristic scanning, demonstrating low execution delay but high obstacle vulnerability.

3. **Dynamic Programming Velocity Profile Optimizer**
   - Implements a continuous **speed-profiling planner** along coordinates using a Bellman recurrence formulation.
   - Models motor acceleration constraints ($V_{next} = \sqrt{V_{curr}^2 + 2 a_{acc} dx}$) and safety braking requirements ($V_{curr} = \sqrt{V_{next}^2 + 2 a_{dec} dx}$).
   - Enforces speed drops at sharp curvature corners and when adjacent to dynamic obstacle bounds.

4. **Dynamic Mid-Drive Obstacle Avoidance**
   - While the vehicle is moving along its path, obstacles can dynamically appear ahead on the road.
   - The car senses the obstacle, performs an **Emergency Brake (decelerating live on HUD)**, triggers an active re-route computation, animates the new search, and safely navigates around the hazard!

5. **Analytical Dashboards & Deliverables**
   - **Active Scorecard HUD:** Displays calculation latency (ms), node exploration count, physical path length, and active velocity/acceleration parameters.
   - **Comparison Matrix:** Outlines computational complexities, optimality, and real-world industrial self-driving applications.
   - **Theory Core:** Detailed equations, mathematical formulations, and pseudocodes.
   - **Export Feature:** Downloads simulation telemetry details as a `.csv` log representing the black-box vehicle data.

---

## 🛠️ Workspace & Codebase Structure

The codebase is modularly divided into a decoupled front-end interactive interface and back-end calculation brain:

```
workspace/
├── backend/
│   ├── app.py                # Main Flask entry point (CORS, REST API router)
│   ├── algorithms.py         # Dijkstra, A*, Greedy BFS, and DP speed profile implementations
│   ├── requirements.txt      # Python backend packages (Flask, Flask-Cors)
│   └── README.md             # Backend setup logs
├── frontend/
│   ├── package.json          # Node modules details (Vite, React)
│   ├── index.html            # Main SPA wrapper with optimized SEO tags
│   └── src/
│       ├── main.jsx          # React app mounter
│       ├── App.jsx           # Global state router and layouts
│       ├── index.css         # Immersive cyberpunk digital HUD CSS variables
│       ├── components/
│       │   ├── Header.jsx              # Navigation layout
│       │   ├── GridVisualizer.jsx      # Simulation canvas, timers, mouse painters
│       │   ├── DashboardStats.jsx      # Telemetry gauges, status feeds, scorecard
│       │   ├── AboutSection.jsx        # Autonomous robotics layers introduction
│       │   ├── TheorySection.jsx       # Academic equations and mathematical proofs
│       │   ├── ComparisonDashboard.jsx # Complexity grid matrix and active scorers
│       │   └── Documentation.jsx       # Academic project framework and setup guidelines
│       └── utils/
│           ├── pathfinding.js          # Local JS algorithms (Zero-latency fallback)
│           └── dpPlanner.js            # Local JS speed optimization fallback
```

---

## 🚀 Execution & Setup Instructions

### 1. Start the Flask Backend
Navigate to the `/backend` folder:
```bash
cd backend
```
Create a python virtual environment:
```bash
python -m venv venv
```
Activate the virtual environment:
- **Windows (PowerShell):** `venv\Scripts\activate`
- **macOS/Linux:** `source venv/bin/activate`

Install dependencies:
```bash
pip install -r requirements.txt
```
Run the Python Flask server:
```bash
python app.py
```
*The server will start running on `http://127.0.0.1:5000/`. A diagnostic GET endpoint is available at `http://127.0.0.1:5000/api/health`.*

### 2. Start the React Frontend
Open a new terminal window and navigate to the `/frontend` directory:
```bash
cd frontend
```
Install npm packages:
```bash
npm install
```
Launch the Vite React development server:
```bash
npm run dev
```
*The system will launch the local dashboard on `http://localhost:5173/` (or similar). Click the link to open the cockpit!*

---

## 🔍 Robustness: Dual Execution Engine Fallback
To ensure maximum academic robustness, this application utilizes a **Dual Execution Engine**. 
- When the Flask backend server is running and accessible, the website streams data calculation packages through the Python API endpoint.
- If the backend server is shut down, offline, or experiencing delays, the frontend visualizer seamlessly falls back to the identical **Javascript implementations** inside `/src/utils/pathfinding.js` and `dpPlanner.js`.
- This ensures that your academic presentation can run smoothly in offline lecture halls or remote presentations!
