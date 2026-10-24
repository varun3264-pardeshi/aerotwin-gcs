/**
 * TWIN GCS — AVIONICS GAUGES, COMPONENT HEALTH & DUAL-AXIS TELEMETRY CHART
 * =========================================================================
 */

const chartHistory = {
    times: [],
    rpms: [],
    egts: [],
    oils: [],
    fuels: [],
    vibes: [],
    maxPoints: 36,
    hoverIndex: -1,
};

// Seed 36 points of realistic steady-state history so the chart is rich immediately on load
(function seedChartHistory() {
    const baseMin = 20;
    for (let i = 0; i < 36; i++) {
        const sec = i * 20;
        const m = baseMin + Math.floor(sec / 60);
        const s = sec % 60;
        chartHistory.times.push(`14:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`);
        chartHistory.rpms.push(2450 + Math.sin(i * 0.4) * 28);
        chartHistory.egts.push(685 + Math.cos(i * 0.35) * 8);
        chartHistory.oils.push(3.2 + Math.sin(i * 0.25) * 0.05);
        chartHistory.fuels.push(28.5 + Math.cos(i * 0.3) * 0.4);
        chartHistory.vibes.push(0.12);
    }
})();

function updateGaugesHUD(data) {
    if (!data) return;
    const t = data.telemetry || {};
    const pinn = data.pinn || {};
    const prog = data.prognostics || {};
    const m = data.mission || {};

    // 1. Update Header Date/Time
    if (data.date_header && data.time_header) {
        setText("headerDateTime", `${data.date_header} | ${data.time_header}`);
    }

    // 2. Top 6 Avionics Gauges
    const rpm = t.rpm || 2450;
    const egt = t.egt_c || 685;
    const oilPress = t.oil_press_bar !== undefined ? t.oil_press_bar : 3.2;
    const fuelFlow = t.fuel_flow_kgh !== undefined ? t.fuel_flow_kgh : 28.5;
    const cht = t.cht_c || 182;
    const vibe = t.vibration_g !== undefined ? t.vibration_g : 0.12;

    setText("valRPM", Math.round(rpm).toLocaleString());
    setText("valEGT", Math.round(egt));
    setText("valOilPress", oilPress.toFixed(1));
    setText("valFuelFlow", fuelFlow.toFixed(1));
    setText("valCHT", Math.round(cht));
    setText("valVib", vibe.toFixed(2));

    updateRing("dialRingRPM", rpm, 3200, 119.4, rpm < 2200 ? "#ffb300" : "#00e676");
    updateRing("dialRingEGT", egt, 880, 119.4, egt > 730 ? "#ff1744" : "#ffb300");
    updateRing("dialRingOilPress", oilPress, 5.5, 119.4, oilPress < 2.2 ? "#ff1744" : "#00e676");
    updateRing("dialRingFuelFlow", fuelFlow, 48.0, 119.4, "#00d4ff");
    updateRing("dialRingCHT", cht, 250, 119.4, cht > 205 ? "#ff1744" : "#00e676");
    updateRing("dialRingVibe", vibe, 0.8, 119.4, vibe > 0.3 ? "#ff1744" : "#00e676");

    // 3. Center Hero Engine Callouts & Bottom Bar
    setText("tagInletFlow", `${Math.round(t.air_inlet_flow_kgh || 419)} kg/hr`);
    setText("tagMAP", `${Math.round(t.map_hpa || 1185).toLocaleString()} hPa`);
    setText("tagChargeTemp", `${Math.round(42 + (cht - 182) * 0.35)} °C`);
    setText("tagExhaustTemp", `${Math.round(egt)} °C`);
    setText("tagTurbineRPM", `${Math.round(t.turbine_rpm || 18200).toLocaleString()} RPM`);
    setText("tagCHT", `${Math.round(cht)} °C`);
    setText("tagFuelFlow", `${fuelFlow.toFixed(1)} kg/hr`);
    setText("tagOilPress", `${oilPress.toFixed(1)} bar`);

    if (pinn.p_brake_kw) {
        const hp = Math.round(pinn.p_brake_kw * 1.341);
        setText("valBrakePower", `${pinn.p_brake_kw.toFixed(1)} kW (${hp} HP)`);
        setText("valHeroResidual", pinn.residual_loss.toFixed(4));
    }

    // 4. Right 3D Digital Twin Mini Overlay
    setText("twinTemp", `${t.engine_temp_c || 612} °C`);
    setText("twinTurbine", `${Math.round(t.turbine_rpm || 18200).toLocaleString()} RPM`);
    setText("twinEGT", `${t.exhaust_temp_c || 635} °C`);

    // 5. Left UAV & Mission Status Card
    if (m.altitude_ft) setText("valAltitude", `${m.altitude_ft.toLocaleString()} ft`);
    if (m.speed_kmh) setText("valSpeed", `${m.speed_kmh} km/h`);
    if (m.endurance_est) setText("valEndurance", m.endurance_est);
    if (m.mission_type) setText("valMissionType", m.mission_type);
    if (m.lat && m.lon) setText("valCoords", `${m.lat.toFixed(4)}° N, ${m.lon.toFixed(4)}° E`);
    if (m.flight_status) {
        setText("valFlightStatus", m.flight_status);
        setText("hudStatusBadge", `● ${m.flight_status}`);
        const stEl = document.getElementById("valFlightStatus");
        if (stEl) stEl.style.color = data.active_fault === "NOMINAL" ? "#00e676" : "#ffb300";
    }
    if (m.flight_duration) setText("missionDuration", m.flight_duration);
    if (m.distance_covered_km) setText("valDistance", `${m.distance_covered_km.toLocaleString()} km`);

    // 6. AI Fault Prediction & Health Score Arc (Circumference = 289)
    const healthScore = prog.health_score !== undefined ? prog.health_score : 92;
    setText("mainHealthNum", `${healthScore}%`);
    setText("valSummaryHealth", `${healthScore}%`);

    const healthArc = document.getElementById("mainHealthArc");
    if (healthArc) {
        const offset = 289 - (289 * (healthScore / 100.0));
        healthArc.style.strokeDashoffset = offset;
        healthArc.style.stroke = healthScore < 70 ? "#ff1744" : (healthScore < 85 ? "#ffb300" : "#00e676");
    }

    const aiBanner = document.getElementById("aiStatusBanner");
    const aiIcon = document.getElementById("aiCheckIcon");
    const aiTitle = document.getElementById("aiPredictionTitle");
    const aiDesc = document.getElementById("aiPredictionDesc");

    if (data.active_fault && data.active_fault !== "NOMINAL") {
        if (aiBanner) aiBanner.classList.add("critical");
        if (aiIcon) {
            aiIcon.innerText = "⚠";
            aiIcon.style.borderColor = "#ff1744";
            aiIcon.style.color = "#ff1744";
            aiIcon.style.background = "rgba(255,23,68,0.2)";
        }
        if (aiTitle) {
            aiTitle.innerText = prog.title || "Propulsion Anomaly Detected";
            aiTitle.style.color = "#ff1744";
        }
        if (aiDesc) aiDesc.innerText = prog.description || "";
        setText("valSummaryPred", prog.title || "Immediate maintenance advised");
        setText("valSummaryStatus", "Advisory Derate");
    } else {
        if (aiBanner) aiBanner.classList.remove("critical");
        if (aiIcon) {
            aiIcon.innerText = "✔";
            aiIcon.style.borderColor = "#00e676";
            aiIcon.style.color = "#00e676";
            aiIcon.style.background = "rgba(0,230,118,0.2)";
        }
        if (aiTitle) {
            aiTitle.innerText = "No Immediate Fault Detected";
            aiTitle.style.color = "#00e676";
        }
        if (aiDesc) aiDesc.innerText = "Engine is operating within normal parameters.";
        setText("valSummaryPred", "No fault expected (next 12h)");
        setText("valSummaryStatus", "On Track");
    }

    // Update AI Insights List
    if (prog.insights && Array.isArray(prog.insights)) {
        const listEl = document.getElementById("aiInsightsList");
        if (listEl) {
            listEl.innerHTML = prog.insights.map(line => {
                if (line.includes("Remaining Useful Life")) {
                    const parts = line.split(":");
                    const clr = healthScore < 75 ? "#ff1744" : "#00e676";
                    return `<li>${parts[0]}: <strong style="color:${clr};">${parts.slice(1).join(":")}</strong></li>`;
                }
                return `<li>${line}</li>`;
            }).join("");
        }
    }

    // 7. Update 7 Component Health Progress Bars
    const ch = prog.component_health || {};
    updateComponentBar("Pistons", ch.pistons !== undefined ? ch.pistons : 95);
    updateComponentBar("Turbo", ch.turbocharger !== undefined ? ch.turbocharger : 90);
    updateComponentBar("Fuel", ch.fuel_system !== undefined ? ch.fuel_system : 92);
    updateComponentBar("Oil", ch.oil_system !== undefined ? ch.oil_system : 88);
    updateComponentBar("Cooling", ch.cooling_system !== undefined ? ch.cooling_system : 94);
    updateComponentBar("Exhaust", ch.exhaust_system !== undefined ? ch.exhaust_system : 91);
    updateComponentBar("Sensors", ch.sensors !== undefined ? ch.sensors : 96);

    // 8. Sync 3D Engine Thermal Shader State
    if (typeof updateEngineThermals === "function") {
        const cylChts = t.cht_cylinders || [178, 182, 179, 181];
        updateEngineThermals(cylChts[0], cylChts[1], cylChts[2], cylChts[3], rpm, egt, data.active_fault || "NOMINAL");
    }

    // 9. Push point to Dual-Axis Live Telemetry Chart
    pushTelemetryPoint(data.iso_time || "14:32:18", rpm, egt, oilPress, fuelFlow, vibe);
}

function updateComponentBar(suffix, pct) {
    const bar = document.getElementById(`bar${suffix}`);
    const label = document.getElementById(`pct${suffix}`);
    if (label) label.innerText = `${pct}%`;
    if (bar) {
        bar.style.width = `${pct}%`;
        bar.className = "comp-bar-fill" + (pct < 65 ? " crit" : (pct < 89 ? " warn" : ""));
    }
}

function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = val;
}

function updateRing(id, val, maxVal, circumference, color) {
    const el = document.getElementById(id);
    if (!el) return;
    const ratio = Math.min(1, Math.max(0.05, val / maxVal));
    el.style.strokeDashoffset = (circumference * (1 - ratio)).toFixed(1);
    if (color) el.style.stroke = color;
}

/**
 * Dual-Axis Real-Time Telemetry Chart (Left Y: RPM 0-4000, Right Y: EGT °C 0-700+)
 */
function pushTelemetryPoint(timeLabel, rpm, egt, oil, fuel, vibe) {
    chartHistory.times.push(timeLabel);
    chartHistory.rpms.push(rpm);
    chartHistory.egts.push(egt);
    chartHistory.oils.push(oil);
    chartHistory.fuels.push(fuel);
    chartHistory.vibes.push(vibe);

    if (chartHistory.times.length > chartHistory.maxPoints) {
        chartHistory.times.shift();
        chartHistory.rpms.shift();
        chartHistory.egts.shift();
        chartHistory.oils.shift();
        chartHistory.fuels.shift();
        chartHistory.vibes.shift();
    }

    drawDualAxisChart();
}

function drawDualAxisChart() {
    const canvas = document.getElementById("liveTelemetryCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const padLeft = 36;
    const padRight = 34;
    const padTop = 12;
    const padBottom = 22;
    const plotW = w - padLeft - padRight;
    const plotH = h - padTop - padBottom;

    ctx.clearRect(0, 0, w, h);

    // 1. Horizontal Grid Lines & Dual Y-Axis Labels
    ctx.strokeStyle = "rgba(0, 212, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.font = "9.5px 'Share Tech Mono', monospace";

    const ySteps = 4;
    for (let i = 0; i <= ySteps; i++) {
        const y = padTop + (plotH / ySteps) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();

        // Left Y-axis: RPM (4000 down to 0)
        const rpmLabel = Math.round(4000 - (4000 / ySteps) * i);
        ctx.fillStyle = "#8ea2be";
        ctx.textAlign = "right";
        ctx.fillText(rpmLabel, padLeft - 5, y + 3);

        // Right Y-axis: EGT °C (800 down to 100)
        const egtLabel = Math.round(800 - (700 / ySteps) * i);
        ctx.fillStyle = "#ffb300";
        ctx.textAlign = "left";
        ctx.fillText(egtLabel, w - padRight + 5, y + 3);
    }

    // 2. Helper to plot smooth curve
    function plotCurve(arr, minV, maxV, strokeColor, fillAlpha = 0.0) {
        if (arr.length < 2) return;
        ctx.save();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2.0;
        ctx.beginPath();

        const stepX = plotW / (chartHistory.maxPoints - 1);
        arr.forEach((v, idx) => {
            const x = padLeft + idx * stepX;
            const norm = Math.min(1.05, Math.max(-0.05, (v - minV) / (maxV - minV)));
            const y = padTop + plotH - norm * plotH;
            if (idx === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();

        if (fillAlpha > 0) {
            ctx.lineTo(padLeft + (arr.length - 1) * stepX, padTop + plotH);
            ctx.lineTo(padLeft, padTop + plotH);
            ctx.closePath();
            ctx.fillStyle = strokeColor + "18";
            ctx.fill();
        }
        ctx.restore();
    }

    // Plot 4 Series matching Reference Image 1 & 2
    plotCurve(chartHistory.egts, 100, 850, "#ffb300", 0.12);   // EGT (Amber)
    plotCurve(chartHistory.rpms, 0, 4000, "#00d4ff", 0.08);    // RPM (Cyan/Red)
    plotCurve(chartHistory.fuels, 0, 50, "#ff3b5c", 0.0);      // Fuel Flow
    plotCurve(chartHistory.oils, 0, 8.0, "#00e676", 0.0);      // Oil Pressure

    // 3. Bottom Time Axis Labels (14:20 .. 14:32)
    ctx.fillStyle = "#7c93b2";
    ctx.textAlign = "center";
    const timeLabels = ["14:20", "14:22", "14:24", "14:26", "14:28", "14:30", "14:32"];
    timeLabels.forEach((lbl, idx) => {
        const x = padLeft + (plotW / (timeLabels.length - 1)) * idx;
        ctx.fillText(lbl, x, h - 5);
    });

    // 4. Interactive Crosshair Readout Callout (Like Image 2 at 14:30:12)
    const idx = chartHistory.hoverIndex >= 0 ? chartHistory.hoverIndex : chartHistory.rpms.length - 5;
    if (idx >= 0 && idx < chartHistory.rpms.length) {
        const stepX = plotW / (chartHistory.maxPoints - 1);
        const cx = padLeft + idx * stepX;

        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.45)";
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(cx, padTop);
        ctx.lineTo(cx, padTop + plotH);
        ctx.stroke();

        // Floating tooltip box
        const boxW = 104;
        const boxH = 48;
        const bx = Math.min(w - padRight - boxW - 4, Math.max(padLeft + 4, cx + 6));
        const by = padTop + 6;

        ctx.fillStyle = "rgba(5, 13, 26, 0.92)";
        ctx.strokeStyle = "rgba(0, 212, 255, 0.45)";
        ctx.setLineDash([]);
        ctx.lineWidth = 1;
        ctx.fillRect(bx, by, boxW, boxH);
        ctx.strokeRect(bx, by, boxW, boxH);

        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.font = "9.5px 'Share Tech Mono', monospace";
        ctx.fillText(chartHistory.times[idx] || "14:30:12", bx + 6, by + 12);
        ctx.fillStyle = "#ffb300";
        ctx.fillText(`EGT: ${Math.round(chartHistory.egts[idx])} °C`, bx + 6, by + 25);
        ctx.fillStyle = "#00d4ff";
        ctx.fillText(`RPM: ${Math.round(chartHistory.rpms[idx])}`, bx + 6, by + 37);
        ctx.restore();
    }
}

window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("liveTelemetryCanvas");
    if (canvas) {
        canvas.addEventListener("mousemove", (e) => {
            const rect = canvas.getBoundingClientRect();
            const relX = e.clientX - rect.left - 36;
            const plotW = rect.width - 70;
            const ratio = Math.min(1, Math.max(0, relX / plotW));
            chartHistory.hoverIndex = Math.round(ratio * (chartHistory.rpms.length - 1));
            drawDualAxisChart();
        });
        canvas.addEventListener("mouseleave", () => {
            chartHistory.hoverIndex = -1;
            drawDualAxisChart();
        });
    }
    drawDualAxisChart();
});
