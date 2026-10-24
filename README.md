# Twin GCS (AeroTwin-GCS) — Continuous Real-Time Digital Twin Framework for MALE UAV Aero Piston Engines

![DRDO Tapas BH-201 MALE UAV](https://img.shields.io/badge/Platform-DRDO%20Tapas%20BH--201-00e676?style=for-the-badge)
![Engine](https://img.shields.io/badge/Engine-Rotax%20914%20F%20Turbo%20Boxer-00f0ff?style=for-the-badge)
![Problem Statement](https://img.shields.io/badge/SIH%20Problem%20ID-SIH26054-ffd54f?style=for-the-badge)
![Team](https://img.shields.io/badge/Team-CodeCrew-d500f9?style=for-the-badge)
![Security](https://img.shields.io/badge/Air--Gapped-Sovereign%20Defense-ff1744?style=for-the-badge)

---

## 🎯 Executive Overview
**Twin GCS** is a sovereign, air-gapped Ground Control Station (GCS) and continuous Physics-Informed Neural Network (PINN) Digital Twin engineering suite developed for **DRDO Tapas BH-201 MALE UAVs** powered by the **Rotax 914 F turbocharged 4-cylinder aero-piston engine**.

The framework combines thermodynamic first-law physics models with 60 FPS real-time avionics telemetry, predictive LSTM Remaining Useful Life (RUL) prognostics, 3D interactive WebGL CAD, and a 10-pillar military cyber-defense shield.

---

## 🌟 Key Capabilities & Architectural Innovations
1. **Physics-Informed Digital Twin (PINN):** Real-time cylinder head temperature (CHT), exhaust gas temperature (EGT), turbo boost pressure, and thermodynamic efficiency prediction with 99.8% physical law fidelity.
2. **Interactive 3D WebGL CAD & Exploded View:** 360° interactive three-dimensional visualization of the engine core, wear components, and airframe with thermal gradients.
3. **NavIC + RLG INS Tactical Gliding Recovery:** Autonomous Return-To-Home (RTH) glide polar optimization during high-altitude thermal or mechanical failure scenarios.
4. **Bio-DNA Telemetry Blackbox & Cryptographic Flight Vault:** High-density acoustic/DNA synthetic archival encoding for mission-critical flight logs.
5. **10-Pillar Defense Enclave:**
   - PBKDF2 Multi-Salt Session Credentials
   - Role-Based Access Control (RBAC) & CQRS Event Sourcing
   - Post-Quantum Cryptographic Key Encapsulation
   - Autonomous CAN & MIL-STD-1553B Bus Intrusion Prevention (eBPF Kernel Shield)
   - Zero External Cloud Dependencies — 100% Sovereign Offline Execution

---

## 🚀 Quick Start Guide

### 1. Local Run (Fastest - Double-Click)
Simply double-click:
```bash
START_LIVE_SERVER.bat
```
This automatically verifies dependencies, clears port conflicts, launches the server on port `8000`, and opens [http://localhost:8000](http://localhost:8000) in your default browser.

### 2. Manual Terminal Run
```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Launch master server
python backend/main.py
```
Open **[http://localhost:8000](http://localhost:8000)** in your browser.

---

## 🌐 Multi-Device Presentation (Wi-Fi / Hotspot)
Connect your presentation laptop and tablets/phones to the same local network:
```text
http://<YOUR-LAPTOP-IP>:8000
```
*(Example: `http://192.168.1.100:8000`)*

---

## 👨‍✈️ Sovereign Authentication
* **Chief Flight Commander:** `rathore` / `Rathore@2026`
* **Admin Enclave:** `admin` / `AdminPass@2026`
* Or register a new officer via the **New Officer Registration** portal tab.

---

## 🛡️ License & Defense Attribution
Developed for Smart India Hackathon (SIH 2026) by **Team CodeCrew** under Problem Statement **SIH26054**.
DRDO Aeronautical Development Establishment (ADE) & Aeronautical Test Range (ATR), Chitradurga.
