# Development, Testing & Deployment Guide
## AeroTwin-GCS: Engineering Operations & Demonstration Manual

**Document Version:** 1.0.0  
**Project ID:** SIH26054  
**Target Environment:** Local Air-Gapped Workstation / Ground Control Station (GCS)  
**Author:** Team CodeCrew  

---

## 1. Technology Stack & Prerequisites

### 1.1 Technology Matrix
| Component | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Backend Runtime** | Python | 3.10+ (tested on 3.11 / 3.12) | Core mathematical & server runtime |
| **Web & WS Framework**| FastAPI / Uvicorn | 0.100+ / 0.22+ | Async REST endpoints & 20 Hz WebSocket |
| **Mathematical Kernels**| NumPy, SciPy | 1.24+ / 1.10+ | PINN physics, FFT vibration, EKF filtering |
| **3D Graphics Engine** | Three.js | r128 | WebGL 3D Boxer engine with exploded view |
| **Voice AI Engine** | Web Speech API | Native Browser Standard | NATO audio alerts without cloud tokens |
| **Cryptography Core** | NIST ML-DSA-87 / SHA3-512 | Native Sovereign Library | Post-quantum signatures & Merkle audit |
| **Frontend Styling** | Vanilla HTML5 / CSS3 / ES6 | Custom Glassmorphism | Zero-dependency, ultra-fast 60 FPS HUD |

### 1.2 System Prerequisites
- **Operating System:** Windows 10/11, Ubuntu 22.04 LTS, or RedHat Enterprise Linux 9 (Hardened).
- **RAM:** Minimum 4 GB (8 GB recommended).
- **GPU:** Integrated Intel/AMD GPU or dedicated NVIDIA GPU with WebGL 2.0 support.
- **Browser:** Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 2. Directory Structure & File Map

```
SIH HACKATHON/
│
├── backend/                              # Master FastAPI Backend Server
│   ├── core/                             # Core configuration & routing
│   ├── models/                           # PINN & LSTM prognostic models
│   ├── simulators/                       # CAN Bus & engine telemetry simulation
│   ├── main.py                           # Backend entry point (uvicorn runner)
│   ├── requirements.txt                  # Python dependencies
│   └── test_backend.py                   # Automated backend test suite (14 modules)
│
├── frontend/                             # Tactical Glassmorphism Web GCS
│   ├── css/
│   │   └── style.css                     # Complete UI styling & glassmorphism theme
│   ├── js/
│   │   ├── app.js                        # Master controller, WebSocket & voice AI
│   │   ├── engine_3d_exploded.js         # Three.js 3D engine model & FLIR shader
│   │   ├── gauges_avionics.js            # Radial SVG dials & multi-line canvas chart
│   │   ├── tactical_map.js               # Geospatial radar map & drone spline
│   │   └── bci_neural_visualizer.js      # Neural BCI signal renderer
│   └── index.html                        # Main Tactical GCS Dashboard UI
│
├── omni_sovereign_api_engine/            # Sovereign Defense AI API Engine
│   ├── omni_engine/
│   │   ├── pillars/                      # 6 Futuristic Pillars (Self-healing, Intent bus, QKD, BCI...)
│   │   ├── powers/                       # 7 Super-Powers (PINN, Streamer, GIS, Glide, WorkOrder...)
│   │   ├── security/                     # Post-quantum ML-DSA-87, Merkle Vault, CAN IDS
│   │   ├── future/                       # 5 Genesis engines (SNN reflex, Swarm, DNA blackbox...)
│   │   ├── auth/                         # Sovereign API Key Vault
│   │   └── server.py                     # Master API FastAPI application factory
│   └── test_omni_api.py                  # Master test suite (15 verification modules)
│
├── information/                          # Project Documentation & Architecture Vault
│   ├── 1_PRD_Product_Requirements_Document.md
│   ├── 2_SRS_Software_Requirements_Specification.md
│   ├── 3_System_Architecture_Document.md
│   ├── 4_UI_UX_Design_Specification.md
│   └── 5_Development_and_Deployment_Guide.md
│
├── generate_api_key.bat                  # 1-Click Sovereign API Key Generator
├── run_omni_system.bat                   # 1-Click Master Launch Script
└── AeroTwin_System_Walkthrough.md        # System Walkthrough & Feature Summary
```

---

## 3. Installation & Local Setup Guide

### Step 1: Clone or Navigate to Project Directory
```powershell
cd "c:\Users\HP\OneDrive\Desktop\SIH HACKATHON"
```

### Step 2: Install Required Dependencies
```powershell
pip install fastapi uvicorn numpy scipy pydantic
```

*(Optional virtual environment setup)*:
```powershell
python -m venv venv
.\venv\Scripts\activate
pip install -r backend/requirements.txt
```

---

## 4. Running the System

### Method A: 1-Click Automated Batch Script (Recommended)
Simply double-click `run_omni_system.bat` or run in terminal:
```powershell
.\run_omni_system.bat
```
This automatically launches the FastAPI engine on `http://localhost:8000` and opens the live dashboard.

### Method B: Manual Command Line Launch
```powershell
python backend/main.py
```
Output:
```
=================================================================
AEROTWIN-GCS DEFENSE DIGITAL TWIN SERVER
DRDO Tapas BH-201 MALE UAV | Rotax 912 iS
=================================================================
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

Open your web browser and navigate to:
- **Live GCS Dashboard:** [http://localhost:8000/](http://localhost:8000/)
- **Interactive Swagger API Docs:** [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc Specifications:** [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 5. Automated Verification & Testing

### Running the Backend Integration Test Suite
```powershell
python backend/test_backend.py
```
Verifies:
- PINN Thermodynamic Energy Conservation ($\mathcal{L}_{\text{residual}} < 0.10$).
- LSTM Prognostics & Remaining Useful Life estimation.
- High-rate CAN Streamer ($100\text{ Hz}$ to $1,000\text{ Hz}$).
- Autonomous Emergency Glide Polar Solver & Diversion Runway reachability.
- DRDO Form-24 Work Order Generation & Mil-Spec Parts mapping.
- Post-Quantum ML-DSA-87 Signatures & SHA3-512 Merkle Tree Audit.

### Running the Omni Sovereign API Test Suite
```powershell
python omni_sovereign_api_engine/test_omni_api.py
```

---

## 6. Key API Endpoints & Usage Examples

### 6.1 Ingesting Telemetry & Evaluating PINN Thermodynamics
**Endpoint:** `POST /power1/pinn/evaluate`  
**cURL:**
```bash
curl -X POST "http://localhost:8000/power1/pinn/evaluate" \
     -H "Content-Type: application/json" \
     -d '{
       "rpm": 5200.0,
       "fuel_flow_lph": 18.5,
       "cht_c": 105.0,
       "egt_c": 740.0,
       "oil_temp_c": 92.0,
       "oil_press_bar": 4.2,
       "map_hpa": 1013.0
     }'
```
**Sample Response:**
```json
{
  "q_fuel_kw": 184.2,
  "p_brake_kw": 71.6,
  "q_coolant_kw": 38.5,
  "h_exhaust_kw": 62.4,
  "q_radiation_kw": 11.2,
  "residual_loss": 0.0731,
  "thermal_efficiency": 0.3887,
  "pinn_state": "NOMINAL_EQUILIBRIUM"
}
```

### 6.2 Generating DRDO Form-24 Maintenance Work Order
**Endpoint:** `POST /power7/workorder/generate`  
**cURL:**
```bash
curl -X POST "http://localhost:8000/power7/workorder/generate" \
     -H "Content-Type: application/json" \
     -d '{
       "uav_tail_number": "TAPAS-BH201-AF07",
       "engine_serial": "ROTAX-912iS-MIL-8942",
       "fault_type": "COOLANT_LEAK_CYL2",
       "estimated_rul_hours": 0.28,
       "priority": "AOG_CRITICAL_AIR_DEFENSE"
     }'
```

### 6.3 Computing Emergency Glide Polar & Diversion Airfield
**Endpoint:** `POST /power6/emergency/glide_polar`  
**cURL:**
```bash
curl -X POST "http://localhost:8000/power6/emergency/glide_polar" \
     -H "Content-Type: application/json" \
     -d '{
       "altitude_msl_m": 4500.0,
       "uav_lat": 14.6142,
       "uav_lon": 76.8586,
       "wind_speed_kts": 12.0,
       "wind_dir_deg": 270.0
     }'
```

---

## 7. Hackathon Live Demonstration Runbook (For Judges & Evaluators)

Follow this 5-minute step-by-step choreography to showcase the system during final evaluation:

1. **System Introduction (0:00 - 1:00):**
   - Open `http://localhost:8000/`.
   - Point out the DRDO & Atmanirbhar Bharat national emblems, live IST clock, and the NATO Voice Co-Pilot status.
   - Explain the 6 Quick Avionics Dials (RPM, EGT, Oil Press, Fuel Flow, CHT, Vibration) and the 92% Health Score Arc.

2. **3D Digital Twin & Exploded View Demo (1:00 - 2:00):**
   - Interact with the 3D Boxer 4-Cylinder engine model (Orbit, Pan, Zoom).
   - Drag the **1-Click Exploded View Disassembly Slider** from `0%` to `100%` to show full internal disassembly.
   - Click **🌡️ FLIR THERMAL MODE** to demonstrate the Ironbow infrared false-color thermal shader.

3. **Tactical Fault Injection & Predictive Alert (2:00 - 3:15):**
   - Click the **💧 COOLANT LEAK** button on the bottom tactical panel.
   - Observe:
     - Cylinder 2 turns glowing white-hot red in the 3D twin.
     - The Health Score Arc drops from 92% to 64% (Red Alarm).
     - The AI prediction card immediately warns: *"Critical Thermal Runaway (Est RUL: 16.4 min)"*.
     - The Voice Co-Pilot announces the tactical alert via audio.
     - The multi-line canvas graph shows the red temperature spike.

4. **1-Click DRDO Form-24 Work Order Generation (3:15 - 4:15):**
   - Click **📄 Generate DRDO Form-24 Work Order**.
   - Show the official military modal with exact part numbers (O-ring kit, Braided hose), repair lead times, and post-quantum NIST token.
   - Demonstrate the Print / PDF export capability.

5. **Sovereignty, Cyber Defense & Conclusion (4:15 - 5:00):**
   - Click **🛡️ CYBER SHIELD & MERKLE VAULT** and **✈️ EMERGENCY GLIDE SOLVER**.
   - Emphasize that the entire system operates **100% offline, air-gapped, zero-cost, and without foreign cloud dependencies or civilian GPS**.
   - Click **🛡️ RESTORE NOMINAL (CLEAR)** to return all systems to green nominal flight.
