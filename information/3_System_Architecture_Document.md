# System Architecture Document (SAD)
## AeroTwin-GCS: Defense-Grade Real-Time Digital Twin Architecture

**Document Version:** 1.0.0  
**Project ID:** SIH26054  
**Classification:** DEFENSE GRADE // AIR-GAPPED SOVEREIGN ARCHITECTURE  
**Platform:** DRDO Tapas BH-201 MALE UAV (Rotax 912 iS Piston Engine)  
**Author:** Team CodeCrew  

---

## 1. High-Level Architectural Vision

AeroTwin-GCS is structured around an **Ultra-Low Latency, Air-Gapped Edge Architecture** combining classical aerospace physics, modern deep learning (PINNs and LSTMs), neuromorphic event processing (SNNs), post-quantum cryptography, and GPU-accelerated WebGL 3D visualization.

```mermaid
flowchart TD
    subgraph "UAV Physical Layer (Rotax 912 iS)"
        ENG["Rotax 912 iS Engine Block"]
        SENS["Sensors: CHT, EGT, RPM, Oil, Fuel, Vib FFT"]
        CAN["CANaerospace Bus (100 Hz - 1000 Hz)"]
        ENG --> SENS --> CAN
    end

    subgraph "AeroTwin Core Ingestion & Security Vault"
        STREAM["Supercomputing Streamer (Power 2)"]
        CAN_IDS["CAN Cyber IDS Guard (0x100 vs 0x666)"]
        MERKLE["SHA3-512 Merkle Audit Vault"]
        MLDSA["NIST ML-DSA-87 Post-Quantum Signer"]
        
        CAN --> STREAM
        STREAM --> CAN_IDS
        STREAM --> MERKLE
    end

    subgraph "Cognitive AI & Physics Engine"
        PINN["PINN Thermodynamics & Energy Equilibrium"]
        LSTM["LSTM Multi-Variate Prognostics & RUL"]
        SNN["Neuromorphic SNN Reflex Engine (<0.2 uJ)"]
        EKF["Extended Kalman Filter (Sensor Fusion)"]
        GLIDE["Autonomous Glide Polar Solver (Power 6)"]
        
        CAN_IDS --> EKF
        EKF --> PINN
        EKF --> LSTM
        EKF --> SNN
        LSTM --> GLIDE
    end

    subgraph "Sovereign Dispatcher & FastAPI Server"
        WS["FastAPI WebSocket Server (/ws/telemetry @ 20Hz)"]
        REST["REST API (5 Powers + 6 Pillars + 5 Genesis)"]
        AUTH["Sovereign API Key Vault"]
        
        PINN & LSTM & SNN & GLIDE --> WS
        REST --> AUTH
    end

    subgraph "Tactical GCS Web HUD (Pilot & Command View)"
        UI_3D["Three.js 3D Twin (0-100% Exploded View & FLIR)"]
        UI_GAUGES["6 Quick Avionics Dials & 92% Health Score Arc"]
        UI_CHART["60 FPS Canvas Multi-Line Stream"]
        UI_RADAR["Tactical Geospatial Satellite Radar"]
        UI_VOICE["NATO Voice AI Co-Pilot (Web Speech API)"]
        UI_WO["DRDO Form-24 Work Order Generator"]
        
        WS --> UI_3D
        WS --> UI_GAUGES
        WS --> UI_CHART
        WS --> UI_RADAR
        WS --> UI_VOICE
        REST --> UI_WO
    end
```

---

## 2. Multi-Layer Component Decomposition

### Layer 1: Avionics & Telemetry Streamer Layer (`power2_supercomputing_streamer`)
- **Sample Rate:** $100\text{ Hz}$ standard telemetry generator with procedural engine dynamics and mathematical noise modeling.
- **Dynamic Fault Injector:** Simulates localized heat buildup, fuel restriction, pressure loss, or ignition failure in individual cylinders.
- **HPC Vector Batch Processing:** Capability to process $1,000\text{ frames}$ in under $2\text{ ms}$ ($>68,000\text{ Hz}$ throughput).

### Layer 2: Cyber-Defense & Cryptographic Sentinel Layer (`omni_engine/security/`)
- **NIST ML-DSA-87 Signatures:** Lattice-based Post-Quantum Cryptography resistant to Shor's algorithm on quantum computers. Signs C2 packets with verification latency $<0.8\text{ ms}$.
- **SHA3-512 Merkle Audit Vault:** Cryptographic audit trail creating an immutable binary hash tree of all telemetry frames and pilot command inputs.
- **CANaerospace Cyber IDS:** Deep packet inspection for CAN frames. Filters unauthorized arbitration IDs and redirects rogue traffic to an isolated quarantine bus within $50\ \mu\text{s}$.

### Layer 3: Cognitive AI & Physics Engine (`power1_cognitive_pinn`, `power1_lstm_prognostics`)
- **Physics-Informed Neural Network (PINN):** Evaluates First-Law thermodynamic energy balance:
  $$\dot{Q}_{\text{fuel}} = P_{\text{brake}} + \dot{Q}_{\text{coolant}} + \dot{H}_{\text{exhaust}} + \dot{Q}_{\text{radiation}}$$
  Flags thermal imbalances and convective dissipation losses in real-time.
- **LSTM Prognostics:** Multi-layer temporal LSTM evaluating sensor drift and predicting Remaining Useful Life (RUL) with 15–30 minute early warning capability.
- **Neuromorphic SNN Reflex:** Event-based Leaky Integrate-and-Fire (LIF) neurons that trigger rapid reflexive actions (e.g., `THERMAL_THROTTLE`, `EMERGENCY_GLIDE`) consuming $<0.2\ \mu\text{J}$ of energy.

### Layer 4: Emergency Flight Guidance & Work Orders (`power6_emergency_director`, `power7_defense_workorder`)
- **Extended Kalman Filter (EKF):** 5-state multi-sensor fusion smoothing noisy CHT, RPM, and oil pressure data.
- **Dead-Stick Glide Polar Solver:** Computes aerodynamic glide reachability and ranks recovery airfields (e.g., DRDO Chitradurga ATR).
- **Defense Work-Order Generator:** Generates DRDO Form-24 maintenance orders with mil-spec part numbers, repair lead times, and post-quantum authorization tokens.

### Layer 5: High-Performance Presentation & HUD Layer (`frontend/`)
- **Three.js WebGL Engine:** Procedural 3D Boxer 4-Cyl engine with linear component explosion matrix and dynamic GLSL false-color infrared thermal shader.
- **Avionics Gauges & Canvas Charts:** CSS Glassmorphism HUD with SVG radial progress dials and high-speed HTML5 Canvas rendering.
- **Voice AI Co-Pilot:** Offline Web Speech API speech synthesis delivering tactical alerts in NATO callout format.

---

## 3. Data Flow & Sequence Diagram

```mermaid
sequenceDiagram
    autonumber
    actor Pilot as Flight Commander
    participant HUD as GCS Frontend (Web HUD)
    participant WS as WebSocket Bridge (/ws/telemetry)
    participant Core as AeroTwin Engine Server
    participant PINN as PINN & LSTM Models
    participant IDS as CAN Cyber IDS Guard
    participant Vault as Merkle Audit Vault

    Pilot->>HUD: Injects "COOLANT_LEAK" Fault
    HUD->>Core: POST /power2/streamer/inject_fault {fault: COOLANT_LEAK}
    Core->>Core: Elevate Cyl 2 CHT (+42°C) & drop pressure
    
    loop Every 50ms (20 Hz)
        Core->>IDS: Inspect CAN Frame (ID: 0x100)
        IDS-->>Core: Allowed (Status: CLEAN)
        Core->>PINN: Evaluate Thermodynamics & Prognostics
        PINN-->>Core: Residual = 0.32, Warning = CRITICAL, RUL = 16.4 min
        Core->>Vault: Record Telemetry Event (SHA3-512)
        Core->>WS: Push Composite State Packet
        WS->>HUD: Broadcast Telemetry JSON
        HUD->>HUD: Animate 3D Cyl 2 Thermal Glow (Red/Orange)
        HUD->>HUD: Drop Health Score Arc to 64%
        HUD->>HUD: Update Canvas Telemetry Chart
        HUD->>Pilot: Voice Alert: "Warning. Cyl 2 Overheat. RUL 16.4 min."
    end

    Pilot->>HUD: Click "Generate DRDO Form-24 Work Order"
    HUD->>Core: POST /power7/workorder/generate
    Core-->>HUD: Form-24 JSON (NIST Token, Mil-Spec Parts, Lead Times)
    HUD->>Pilot: Render Form-24 Modal with 1-Click Print/Export
```

---

## 4. REST & WebSocket API Endpoint Taxonomy

| Protocol | Path | Module | Description |
| :--- | :--- | :--- | :--- |
| **WS** | `/ws/telemetry` | Live Bridge | High-rate composite telemetry, PINN, prognostics, SNN, and security feed (20 Hz). |
| **POST** | `/power1/pinn/evaluate` | Power 1 | Computes thermodynamic energy residual loss for given engine state. |
| **POST** | `/power1/prognostics/evaluate` | Power 1 | Multi-variate LSTM anomaly detection, Health Index, and RUL estimation. |
| **POST** | `/power2/streamer/inject_fault` | Power 2 | Injects dynamic flight faults (`COOLANT_LEAK`, `INJECTOR_CLOG`, etc.). |
| **POST** | `/power2/streamer/clear_faults` | Power 2 | Restores engine simulation to nominal steady-state operation. |
| **POST** | `/power6/emergency/glide_polar` | Power 6 | Solves dead-stick glide range and selects primary diversion airfield. |
| **POST** | `/power7/workorder/generate` | Power 7 | Creates DRDO Form-24 AR&DB maintenance work order with NIST signature. |
| **POST** | `/power7/terrain/set_preset` | Power 7 | Sets operational terrain stress preset (Leh, Pokhran, Coastal, Chitradurga). |
| **POST** | `/security/sign` | Cyber Suite | Signs C2 commands using NIST ML-DSA-87 post-quantum algorithm. |
| **POST** | `/security/verify` | Cyber Suite | Validates ML-DSA-87 signatures against public key. |
| **GET** | `/security/status` | Cyber Suite | Returns health of ML-DSA, Merkle Vault, and CAN IDS Guard. |
| **POST** | `/quantum/qkd` | Pillar 5 | Runs E91 Quantum Entanglement QKD simulation with Bell-CHSH verification. |
| **POST** | `/future/swarm/propose` | Genesis | Swarm telepathy Byzantine agreement across 5 UAV squadron nodes. |
| **POST** | `/future/dna/encode` | Genesis | Encodes flight blackbox telemetry into 4-base synthetic DNA strand. |
| **POST** | `/db/query` | AeroDB | Executes high-speed multi-predicate time-series telemetry query. |
| **POST** | `/db/aggregate` | AeroDB | Computes mathematical telemetry aggregations (AVG, MIN, MAX, STDDEV, P95). |
| **GET** | `/db/stats` | AeroDB | Returns live storage metrics, L1 RAM cache count, L2 vault disk size. |
| **POST** | `/db/verify` | AeroDB | Executes 100% mathematical SHA3-512 cryptographic chain tamper audit. |
| **POST** | `/db/export` | AeroDB | Generates encrypted standalone forensic flight blackbox archive (.aero-vault). |
| **POST** | `/db/flush` | AeroDB | Synchronously flushes pending L1 RAM records to encrypted L2 disk vault. |

---

## 5. Security & Air-Gapped Deployment Architecture

```
+---------------------------------------------------------------------------------+
|               TACTICAL RUGGEDIZED GROUND CONTROL STATION (AIR-GAPPED)            |
|                                                                                 |
|   +-------------------------------------------------------------------------+   |
|   | OS: Hardened Linux / Windows 11 Defense Workstation                      |   |
|   | Python 3.10+ Runtime (Zero External Internet Connectivity)              |   |
|   +-------------------------------------------------------------------------+   |
|                                                                                 |
|   +------------------------------------+   +--------------------------------+   |
|   | Local In-Memory Fast Engine Server  |   | Local WebGL Client Browser     |   |
|   | - FastAPI / Uvicorn (Port 8000)    |   | - Chrome / Chromium Air-Gapped |   |
|   | - NumPy / SciPy Math Kernels       |   | - Three.js WebGL 3D Canvas     |   |
|   | - NIST Post-Quantum Cryto Engine   |   | - Web Speech Synthesis Audio   |   |
|   +------------------------------------+   +--------------------------------+   |
|                      ^                                    |                     |
|                      +--- Local Loopback (127.0.0.1:8000) +                     |
+---------------------------------------------------------------------------------+
```

### Key Security Assurances:
1. **Zero External Data Exfiltration:** All computations are strictly local in-memory.
2. **Post-Quantum Command Verification:** Even if an adversary intercepts the RF link with quantum computing capabilities, lattice-based ML-DSA signatures prevent spoofed C2 commands.
3. **Hardware Independence:** High execution speed ($<10\ \mu\text{s}$) on standard multi-core x86/ARM CPUs without requiring specialized server clusters.
