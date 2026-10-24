# Product Requirements Document (PRD)
## AeroTwin-GCS: AI-Enabled Real-Time Digital Twin System for MALE UAV Aero-Piston Engines

**Document Version:** 1.0.0  
**Project ID:** SIH26054  
**Team Name:** CodeCrew  
**Target Platform:** DRDO Tapas BH-201 (Rustom-II) MALE UAV  
**Target Propulsion:** Rotax 912 iS / 914 Turbocharged 4-Cylinder Boxer Aero Piston Engine  
**Classification:** DEFENSE GRADE // RESTRICTED DISCLOSURE  
**Date:** October 2026  

---

## 1. Executive Summary & Problem Definition

### 1.1 Context & Operational Problem
Medium-Altitude Long-Endurance (MALE) Unmanned Aerial Vehicles (UAVs) such as the **DRDO Tapas BH-201** conduct 18-24+ hour continuous Intelligence, Surveillance, Target Acquisition, and Reconnaissance (ISTAR) and Combat Air Patrol (CAP) missions. In such long-duration operations, propulsion system health is single-point mission-critical.

Current UAV Ground Control Stations (GCS) and engine monitoring systems suffer from critical limitations:
1. **Threshold-Based & Reactive:** Existing systems only trigger audio/visual warnings *after* engine oil pressure drops, coolant temperature crosses limits, or cylinder head seizure occurs.
2. **High Asset Loss Risk:** In-flight engine failure during beyond-line-of-sight (BVLOS) operations leads to catastrophic loss of multi-crore national defense assets.
3. **No In-Flight Prognostics or RUL Estimation:** Pilots and maintenance officers lack real-time Physics-Informed estimates of Remaining Useful Life (RUL) in flight minutes/hours before failure.
4. **Heavy Cloud Dependence in Civilian Solutions:** Commercial drone telemetry tools depend on civilian cloud infrastructure and public GPS, which are unacceptable for electronic warfare (EW) contested defense operations.

### 1.2 Proposed Solution: AeroTwin-GCS
**AeroTwin-GCS** is an indigenous, 100% air-gapped, sovereign, real-time Digital Twin and Predictive Prognostics Ground Control Station designed for MALE UAV aero-piston engines.

It synchronizes high-rate CAN Bus telemetry (RPM, CHT, EGT, Oil Temp/Pressure, Fuel Flow, 3-Axis FFT Vibration) with:
- **Physics-Informed Neural Networks (PINN)** & thermodynamic combustion energy-balance models.
- **LSTM-Driven Prognostic Autoencoders** to predict thermo-mechanical anomalies **15 to 30 minutes prior to failure**.
- **3D WebGL Digital Twin** with real-time 0–100% Exploded View Disassembly and FLIR Infrared Thermal Camera Shaders.
- **Indigenous Navigation & Emergency Glide Director** using NavIC / INS Dead-Reckoning (Zero Civilian GPS reliance) and glide-polar solvers for autonomous recovery to Indian defense airfields (e.g., DRDO Chitradurga ATR).
- **Post-Quantum Cryptographic C2 Security** (NIST ML-DSA-87 signatures, SHA3-512 Merkle Flight Blackbox, CAN Bus Cyber IDS).
- **Voice AI Co-Pilot** delivering synthesized tactical NATO-standard voice alerts for pilot situational awareness.
- **Automated DRDO Form-24 Work Order Generator** for 1-click generation of digitally signed maintenance orders.

---

## 2. Product Objectives & Key Results (OKRs)

### Objective 1: Zero Unpredicted In-Flight Propulsion Failures
- **KR 1.1:** Predict thermodynamic anomalies (coolant leaks, injector clogs, misfires) with **>95% accuracy** at least **15 minutes in advance**.
- **KR 1.2:** Maintain PINN thermodynamic residual loss below **0.10** under nominal flight conditions.
- **KR 1.3:** Provide dynamic Remaining Useful Life (RUL) estimation updated at **20 Hz**.

### Objective 2: Ultra-High-Speed, Sovereign, Air-Gapped Operation
- **KR 2.1:** Zero cloud egress; 100% offline edge execution on tactical ruggedized GCS hardware.
- **KR 2.2:** Telemetry ingestion and processing latency below **10 milliseconds** at 100 Hz CAN bus sample rate.
- **KR 2.3:** Sub-second cold start with lightweight zero-cost architecture.

### Objective 3: Superior Defense-Grade Pilot & Ground Crew UX
- **KR 3.1:** 60 FPS smooth Three.js 3D engine digital twin with real-time continuous exploded view slider and FLIR thermal color mapping.
- **KR 3.2:** Sub-500ms voice alert delivery on critical condition exceedance via offline Web Speech synthesis.
- **KR 3.3:** 1-Click generation of DRDO Form-24 maintenance directive with SHA3-512 cryptographic verification.

---

## 3. User Personas & Target Stakeholders

| Persona | Role | Key Needs & Pain Points |
| :--- | :--- | :--- |
| **UAV Mission Pilot / Flight Commander** | Commands live flight from GCS during 12-24h missions. | Needs instantaneous, low-cognitive-load situational awareness; needs voice callouts when eyes are on radar/payload; needs autonomous emergency glide and RTB vectors upon propulsion degradation. |
| **GCS Telemetry & Avionics Engineer** | Monitors engine parameters, CAN bus packets, and sensor health. | Needs granular 6-dial avionics gauges, live multi-line telemetry trends, vibration FFT spectrum analysis, and cyber intrusion detection on the avionics bus. |
| **Base Maintenance Officer (DRDO/IAF)** | Manages turnaround maintenance, spare part requisition, and engine overhauls. | Needs automated DRDO Form-24 work orders, exact part replacement recommendations, fault logs, and cryptographically verified maintenance trails. |
| **Defense Cyber Security Officer** | Protects UAV command-and-control links from jamming, spoofing, and bus injection. | Needs NIST post-quantum signatures (ML-DSA-87), SHA3-512 Merkle audit blackbox, and real-time CANaerospace firewall status. |

---

## 4. Key Functional Features & Specifications

```
+-----------------------------------------------------------------------------------+
|                               AEROTWIN-GCS SUITE                                  |
+-----------------------------------------------------------------------------------+
|  1. REAL-TIME DIGITAL TWIN & 3D VISUALIZATION                                    |
|     - Procedural 3D Boxer 4-Cyl Model (Rotax 912 iS) in WebGL / Three.js          |
|     - 0-100% Continuous Exploded View Disassembly Slider                          |
|     - Dual-Mode Camera: EO Realistic vs. FLIR Ironbow Thermal False-Color Shader  |
|     - Individual Cylinder Thermal Fault Highlight (Cyl 1-4 CHT Glow)              |
|                                                                                   |
|  2. AI PREDICTIVE PROGNOSTICS & PINN MUSCLE                                      |
|     - Physics-Informed Neural Network (PINN) Thermodynamic Energy Equilibrium     |
|     - LSTM Autoencoder for Multi-Variate Anomaly Detection & Classification       |
|     - Remaining Useful Life (RUL) Regression in Flight Hours / Minutes            |
|     - Neuromorphic Spiking Neural Network (SNN) Reflex Engine (<0.2 uJ Energy)    |
|                                                                                   |
|  3. MISSION AVIONICS & TACTICAL GIS HUD                                          |
|     - 6 High-Contrast Glowing Radial Avionics Dials (RPM, EGT, Oil, Fuel, CHT, G)|
|     - 92% Master Engine Health Score Arc with Dynamic Color-Grading               |
|     - 60 FPS Multi-Line Canvas Stream (Temp, RPM, Vibration Trends)               |
|     - High-Altitude Satellite Terrain Radar (Chitradurga ATR / Northern Border)   |
|     - Autonomous Dead-Stick Glide Polar Solver & Diversion Runway Recommender     |
|     - NavIC / INS Dead-Reckoning Positioning (Zero GPS Dependency)                |
|                                                                                   |
|  4. TACTICAL FAULT INJECTION ENGINE (SIH DEMO PANEL)                              |
|     - 1-Click Simulation of Coolant Leaks, Injector Clogging, Misfires, Pressure  |
|     - Real-Time Dynamic Parameter Degradation & Automatic Recovery Clear          |
|                                                                                   |
|  5. DEFENSE WORK-ORDER & CYBER SECURITY PROTOCOLS                                 |
|     - DRDO Form-24 AR&DB Maintenance Work Order Generator with NIST QR Token     |
|     - NIST ML-DSA-87 Post-Quantum Command Signatures                              |
|     - SHA3-512 Merkle Tree Audit Blackbox Ledger                                 |
|     - CANaerospace Cyber Intrusion Detection Guard (IDS)                          |
|     - NATO-Standard Audio Co-Pilot Voice Alert System                             |
+-----------------------------------------------------------------------------------+
```

---

## 5. Non-Functional Requirements (NFRs)

### 5.1 Performance & Latency
- **Telemetry Processing Rate:** Minimum 100 Hz continuous processing (1,000 Hz batch capability).
- **UI Refresh Rate:** 60 FPS locked for 3D engine canvas, 20 Hz for avionics dial DOM updates.
- **WebSocket Streaming Latency:** `< 5 ms` on localhost / tactical LAN.
- **AI Prognostic Inference Time:** `< 8 ms` per frame on CPU (no dedicated GPU required).

### 5.2 Reliability & Fault Tolerance
- **Zero-Downtime Ring Buffer:** Sliding window of 1,024 packets with automatic sequence-based retransmission.
- **Self-Healing AST Engine:** Runtime dynamic code hotpatching without process termination or state loss.
- **Offline Resiliency:** Complete functional independence without internet connection.

### 5.3 Security & Sovereignty
- **Post-Quantum Cryptography:** NIST FIPS 203 ML-KEM-1024 / ML-DSA-87 digital signatures.
- **Tamper-Evident Blackbox:** SHA3-512 cryptographic Merkle tree verifying state continuity.
- **Electronic Warfare Hardening:** Defensive CAN bus isolation against unauthorized arbitration IDs (e.g., `0x666` threat quarantine).

---

## 6. Regulatory & Military Compliance
- **DRDO/AR&DB Guidelines:** Adheres to Aeronautical Research & Development Board standards for UAV health telemetry.
- **Mil-STD-1553B / CANaerospace Protocol:** Payload encoding aligned with aerospace CAN bus data frames.
- **Indigenous Defense Mandate (Atmanirbhar Bharat):** Complete source-code sovereignty, free of foreign API keys, proprietary commercial cloud tokens, or third-party paid subscriptions.

---

## 7. Release Roadmap & Success Criteria

| Milestone | Deliverable | Acceptance Criteria |
| :--- | :--- | :--- |
| **Phase 1: Core Physics & AI Engines** | PINN Engine, LSTM Prognostics, SNN Reflex, Telemetry Generator | 100% test pass on thermodynamic models; anomaly detection within 100ms. |
| **Phase 2: Military Cyber Suite & Power 6/7** | Post-Quantum Signer, Merkle Vault, CAN IDS, Emergency Director, Form-24 | NIST signature verification valid; Merkle root verified; Glide polar working. |
| **Phase 3: Front-End UI/UX Glassmorphism** | Three.js 3D Engine Twin, Exploded Slider, FLIR Shader, Avionics Dials | Pixel-perfect alignment with defense mockups; smooth 60 FPS animation. |
| **Phase 4: Integration & Verification** | WebSocket Live Bridge, Voice Co-Pilot, Fault Injection Demo Panel | Full end-to-end simulation verified; zero unhandled errors. |
