# UI/UX Design & Frontend Specification Document
## AeroTwin-GCS: Tactical Defense Ground Control Station User Interface

**Document Version:** 1.0.0  
**Project ID:** SIH26054  
**Design System:** Cyber-Avionics Glassmorphism (Gen-7 Military Standard)  
**Target Platform:** Ground Control Station High-Resolution Desktop Displays (1080p, 2K, 4K)  
**Author:** Team CodeCrew  

---

## 1. Design Philosophy & Visual Aesthetic

The AeroTwin-GCS user interface is crafted to meet the stringent visual and ergonomics demands of military aerospace ground operations. It replaces cluttered legacy software with a **high-contrast, dark-mode cyber-avionics HUD** characterized by:
1. **Zero Eye Strain during 24-Hour Shifts:** Deep cyber-navy background (`#060b14`) preventing visual fatigue during nocturnal Combat Air Patrols (CAP).
2. **Instant Cognitive Triage:** Standardized military color coding where **Emerald Green** denotes nominal health, **Cyber-Teal** denotes active data links, **Amber** highlights early thermal warnings, and **Crimson Red** commands immediate emergency pilot attention.
3. **Glassmorphism & Depth Hierarchy:** Multi-layered semi-transparent cards (`rgba(13, 27, 42, 0.75)`) with subtle cyan border glows (`rgba(0, 240, 255, 0.15)`) separating telemetry data streams into distinct functional domains.
4. **60 FPS Hardware-Accelerated Rendering:** High-frequency animations, 3D WebGL rotations, exploded view translations, and canvas graph redraws execute smoothly without UI lag or frame drops.

---

## 2. Color Palette & Typography Specifications

### 2.1 Color Tokens
```css
:root {
    /* Background & Structural Layers */
    --bg-deep:         #060b14; /* Void Black-Navy Base */
    --bg-card:         rgba(13, 27, 42, 0.75); /* Frosted Glass Container */
    --bg-card-hover:   rgba(20, 40, 65, 0.85);
    --border-card:     rgba(0, 240, 255, 0.15); /* Cyber-Teal Rim */
    --border-active:   rgba(0, 240, 255, 0.50);

    /* Tactical Avionics Accents */
    --cyan-primary:    #00f0ff; /* Primary Telemetry & Accents */
    --green-normal:    #00e5a3; /* Nominal System Health */
    --amber-warn:      #ffb703; /* Advisory Thermal Deviation */
    --red-critical:    #ff0055; /* Emergency Exceedance / Fault */
    --purple-quantum:  #b5179e; /* Post-Quantum Cryptography */
    
    /* Text Hierarchy */
    --text-primary:    #ffffff; /* Primary Numeric Readouts */
    --text-secondary:  #8ea2be; /* Parameter Labels */
    --text-muted:      #546a8a; /* Timestamps & Units */
    --text-dim:        #384860; /* Borders & Grid Lines */
}
```

### 2.2 Typography Hierarchy
- **Brand & Headings:** `'Rajdhani', sans-serif` (Weights: 600, 700) — Bold, angular military display typeface.
- **Body & Subtitles:** `'Outfit', 'Inter', sans-serif` (Weights: 400, 500, 600) — Ultra-clean, modern geometric sans-serif for rapid readability.
- **Avionics Values & Code:** `'Share Tech Mono', monospace` — Fixed-width font preventing layout jitter as live numeric values fluctuate.

---

## 3. Comprehensive Layout & Component Breakdown

```
+-------------------------------------------------------------------------------------------------------+
| TOP HEADER: Brand Logo | Twin GCS Title | DRDO & Atmanirbhar Emblems | Live Dot | Clock IST | Voice HUD|
+-------------------------------------------------------------------------------------------------------+
| [SIDEBAR] | QUICK AVIONICS RIBBON: [RPM: 2,450] [EGT: 685°C] [Oil: 3.2b] [Fuel: 28.5k] [CHT: 182°]...|
|           +-------------------------------------------------------------------------------------------+
| 🏠 Dash   | [CARD 1: LIVE UAV & MISSION STATUS]          | [CARD 2: 3D DIGITAL TWIN ENGINE]           |
| 🧬 Twin   |  - Tapas BH-201 Altitude 18,500 ft / 220 km/h|  - Three.js Rotax 912 iS Boxer Engine      |
| ⚙️ Health |  - Lat/Long, Endurance, Bus Integrity (100%) |  - 0-100% Exploded View Disassembly Slider |
| 📡 Stream |  - Sector: Northern Border                   |  - FLIR Thermal False-Color Mode Toggle    |
| 🧠 AI     +----------------------------------------------+--------------------------------------------+
| 🗺️ Map    | [CARD 3: ENGINE HEALTH] | [CARD 4: LIVE TELEMETRY GRAPH]  | [CARD 5: AI FAULT PREDICTION] |
| 📋 Logs   |  - 92% Radial Arc Gauge |  - 60 FPS Multi-Line Stream     |  - No Immediate Fault Detected|
| 📄 Report |  - 6 Subsystem Statuses |  - Temp (Red), RPM (Cyan), Vib  |  - Residual Loss: 0.0731      |
| ⚙️ Sett.  |    (Temp, Vib, Oil...)  |    (Green) with Grid Lines      |  - Est. RUL: ~320 Flight Hours|
|           +-------------------------------------------------------------------------------------------+
| [MOTTO]   | [CARD 6: GEOSPATIAL MAP]  | [CARD 7: ALERTS & RECOMMENDATIONS] | [CARD 8: MISSION SUMMARY] |
| Longer    |  - Sat Radar Canvas       |  - Color-Coded Log Badges          |  - Mission TGCS-2026-0918 |
| Endurance |  - Green Flight Spline    |    [INFO] 14:28 Nominal parameters |  - Flight Duration: 06h12m|
| Greater   |  - Animated Drone Icon    |    [WARN] 13:45 Cyl 2 temp rise    |  - [Generate DRDO Form-24]|
| Nation    +-------------------------------------------------------------------------------------------+
|           | TACTICAL FAULT INJECTION: [💧 COOLANT LEAK] [⛽ INJECTOR CLOG] [⚡ MISFIRE] [🛡️ RESTORE]...|
+-------------------------------------------------------------------------------------------------------+
| FOOTER STRIP: Twin GCS | Built for a Safer, Stronger India | JAI HIND | JAI VIGYAN                     |
+-------------------------------------------------------------------------------------------------------+
```

---

## 4. Key Interactive Components & Micro-Interactions

### 4.1 3D Engine Digital Twin (`engine_3d_exploded.js`)
- **Procedural Geometry:** High-fidelity geometric reconstruction of the 4-cylinder horizontally opposed Rotax engine (Crankcase core, 4 Boxer Cylinders, 2 Pistons, Turbocharger assembly, Dual Spark Ignition harness).
- **Exploded View Disassembly Slider:**
  - Range: `0%` (Fully assembled operational block) to `100%` (Full component separation along calibrated 3D vectors).
  - Smooth linear interpolation (`lerp`) ensures zero visual stutter during slider adjustment.
- **FLIR Thermal False-Color Shader:**
  - Standard EO Realistic Mode: Metallic dark-slate crankcase with polished chrome pistons.
  - FLIR Ironbow Mode: Dark background with dynamic false-color emissive gradients mapped to real-time CHT ($<115^\circ\text{C}$ cyan, $115\text{--}130^\circ\text{C}$ amber, $>130^\circ\text{C}$ glowing white-hot red).
- **Subsystem Isolation Matrix:** Interactive checkboxes allow toggling visibility of the Engine Block, Pistons, Crankshaft, Turbocharger, and Exhaust.

### 4.2 Quick Avionics Ribbon & Radial Gauges (`gauges_avionics.js`)
- 6 compact avionics pills displaying real-time parameter readouts with animated circular SVG stroke rings.
- Circumference stroke-dashoffset interpolation calculated via:
  $$\text{offset} = \text{circumference} \cdot \left(1.0 - \frac{\text{value}}{\text{max\_value}}\right)$$
- Color-coded threshold alarms that pulse amber or red upon limit exceedance.

### 4.3 Master Radial Health Score Arc (`mainHealthArc`)
- Prominent circular health gauge with a large numerical readout (`92%`) in the center.
- Dynamic color grading:
  - $\text{Score} \ge 85\%$: Emerald Green (`#00e5a3`) — Normal.
  - $70\% \le \text{Score} < 85\%$: Amber Glow (`#ffb703`) — Minor Degradation.
  - $\text{Score} < 70\%$: Pulsing Red (`#ff0055`) — Emergency Condition.

### 4.4 Real-Time Multi-Line Canvas Stream (`liveTelemetryCanvas`)
- Pure HTML5 Canvas 2D context drawing 3 continuous live sensor signals at 60 FPS:
  1. Exhaust Gas Temp / Engine Temp (Red line).
  2. Engine RPM scaled by 1/100 (Cyan line).
  3. 3-Axis Vibration RMS in g-force (Green line).
- Automatic ring-buffer storage of the last 30 time steps with time axis timestamps (`14:20`, `14:26`, `14:32 (NOW)`).

### 4.5 Tactical Geospatial Radar Map (`tactical_map.js`)
- Topographic radar canvas rendering dark terrain elevation contours.
- Animated green bezier flight spline connecting waypoints (`BASE: ATR CHALLAKERE`, `WP-01`, `WP-02`, `SECTOR-NORTH`, `PATROL-ORBIT`).
- Animated UAV drone position marker with pulsing circular radar sweep ring.

### 4.6 DRDO Form-24 Work Order Modal (`workOrderModal`)
- Styled after official Defense Research & Development Organisation (DRDO) and Aeronautical Research & Development Board (AR&DB) maintenance directives.
- Displays:
  - Unique Work Order ID (e.g., `DRDO-AR&DB-WO-2026-01043`).
  - UAV Tail Number & Engine Serial.
  - Predicted Failure Diagnosis and Remaining Useful Life (RUL).
  - Mil-Spec Replacement Part Numbers, Descriptions, Quantities, and Replacement Lead Times.
  - NIST Post-Quantum Cryptographic Token & SHA3-512 Merkle Leaf Hash.
  - 1-Click Print / PDF Export button utilizing clean `@media print` CSS rules.

### 4.7 Tactical Fault Injection Panel
- 1-Click quick simulation buttons for live demonstrations:
  - **💧 COOLANT LEAK:** Triggers thermal runaway on Cylinder 2, elevates CHT to $147^\circ\text{C}$, drops health score to $64\%$, turns 3D cylinder glowing red, and triggers voice alert.
  - **⛽ INJECTOR CLOG (CYL 2):** Triggers severe lean burn and power loss.
  - **⚡ SPARK MISFIRE:** Injects ignition drop and elevates vibration FFT.
  - **🛢️ OIL PRESSURE DROP:** Simulates lubrication pump degradation.
  - **🌀 TURBO DROP:** Simulates high-altitude boost loss.
  - **🛡️ RESTORE NOMINAL (CLEAR):** Instantly restores all parameters to nominal equilibrium.

---

## 5. Front-End Performance & Accessibility Standards
1. **Zero External CSS Framework Bloat:** Custom responsive CSS Grid and Flexbox architecture without massive third-party UI libraries (Bootstrap, Tailwind).
2. **GPU Rasterization:** Uses CSS `transform: translate3d()` and `will-change` properties on animated elements to leverage GPU acceleration.
3. **Graceful Fallbacks:** If the live FastAPI backend WebSocket is offline during initial frontend preview, `app.js` automatically engages an internal high-fidelity procedural simulation loop to ensure zero broken UI states.
