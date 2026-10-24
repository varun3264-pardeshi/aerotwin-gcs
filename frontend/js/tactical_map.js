/**
 * TWIN GCS — SATELLITE GEOSPATIAL TRACKING & NAVIC MISSION RADAR
 * ==============================================================
 * Renders realistic mountain topographic terrain, glowing green flight spline,
 * base stations, geo-fences, no-fly zones, and animated MALE UAV aircraft icon.
 */

let uavProgress = 0.42;
let mapZoom = 1.0;

const mapLayers = {
    uav: true,
    path: true,
    base: true,
    geofence: false,
    nfz: true,
    checkpoints: true,
};

const waypoints = [
    { x: 42,  y: 112, name: "FOB-BASE" },
    { x: 96,  y: 68,  name: "WP-01" },
    { x: 162, y: 84,  name: "WP-02" },
    { x: 228, y: 38,  name: "ISR-NORTH" },
    { x: 294, y: 54,  name: "ORBIT-ALPHA" },
    { x: 344, y: 92,  name: "CAP-EAST" },
];

function toggleMapLayer(layerKey, isVisible) {
    mapLayers[layerKey] = isVisible;
}

function adjustMapZoom(delta) {
    mapZoom = Math.min(1.6, Math.max(0.75, mapZoom + delta));
}

function resetMapZoom() {
    mapZoom = 1.0;
}

function renderTacticalSatelliteMap() {
    const canvas = document.getElementById("geoRadarCanvas");
    if (!canvas) return;

    // Smooth performance: pause loop if canvas or parent view is hidden
    if (canvas.offsetParent === null) {
        setTimeout(() => requestAnimationFrame(renderTacticalSatelliteMap), 1000);
        return;
    }

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply zoom around center
    ctx.translate(w / 2, h / 2);
    ctx.scale(mapZoom, mapZoom);
    ctx.translate(-w / 2, -h / 2);

    // 1. Satellite Mountain Terrain Base Gradient (Forest / Snow Ridge Aesthetic like Image 1)
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, "#0b1d1a");
    bgGrad.addColorStop(0.45, "#152b22");
    bgGrad.addColorStop(0.75, "#1d3328");
    bgGrad.addColorStop(1, "#0d1f26");
    ctx.fillStyle = bgGrad;
    ctx.fillRect(-60, -60, w + 120, h + 120);

    // Topographic elevation ridges & snow caps
    ctx.strokeStyle = "rgba(180, 220, 200, 0.12)";
    ctx.lineWidth = 1.2;
    for (let i = -20; i < w + 40; i += 24) {
        ctx.beginPath();
        ctx.moveTo(i, -20);
        ctx.bezierCurveTo(i + 25, h * 0.35, i - 22, h * 0.7, i + 12, h + 20);
        ctx.stroke();
    }

    // Subtle snow peak patches (bottom-right & top-center like Image 1)
    ctx.fillStyle = "rgba(226, 232, 240, 0.16)";
    ctx.beginPath();
    ctx.moveTo(210, 95);
    ctx.lineTo(245, 72);
    ctx.lineTo(275, 108);
    ctx.lineTo(235, 135);
    ctx.closePath();
    ctx.fill();

    // 2. Geo-Fence Boundary Box (if enabled)
    if (mapLayers.geofence) {
        ctx.strokeStyle = "rgba(0, 212, 255, 0.55)";
        ctx.setLineDash([5, 4]);
        ctx.lineWidth = 1.2;
        ctx.strokeRect(22, 16, w - 44, h - 32);
        ctx.setLineDash([]);
    }

    // 3. No-Fly Zone / Loiter Orbit Ring (Right side like Image 1)
    if (mapLayers.nfz) {
        ctx.strokeStyle = "rgba(0, 230, 118, 0.65)";
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(335, 74, 24, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = "rgba(0, 230, 118, 0.12)";
        ctx.fill();
    }

    // 4. Flight Path Spline (Glowing Neon Green)
    if (mapLayers.path) {
        ctx.save();
        ctx.strokeStyle = "#00e676";
        ctx.lineWidth = 2.4;
        ctx.shadowColor = "#00e676";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.moveTo(waypoints[0].x, waypoints[0].y);
        for (let i = 1; i < waypoints.length; i++) {
            ctx.lineTo(waypoints[i].x, waypoints[i].y);
        }
        ctx.stroke();
        ctx.restore();
    }

    // 5. Checkpoints & Base Station Nodes
    waypoints.forEach((wp, idx) => {
        if (idx === 0 && !mapLayers.base) return;
        if (idx > 0 && !mapLayers.checkpoints) return;

        ctx.fillStyle = idx === 0 ? "#00d4ff" : "#00e676";
        ctx.beginPath();
        ctx.arc(wp.x, wp.y, idx === 0 ? 4.5 : 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "#05101e";
        ctx.lineWidth = 1.2;
        ctx.stroke();
    });

    // 6. Animated MALE UAV Aircraft Icon along Spline
    if (mapLayers.uav) {
        uavProgress = (uavProgress + 0.0007) % 1.0;
        const totalSegs = waypoints.length - 1;
        const segFloat = uavProgress * totalSegs;
        const segIdx = Math.floor(segFloat);
        const t = segFloat - segIdx;

        const p1 = waypoints[segIdx];
        const p2 = waypoints[Math.min(totalSegs, segIdx + 1)];
        const ux = p1.x + (p2.x - p1.x) * t;
        const uy = p1.y + (p2.y - p1.y) * t;
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        // Pulsing radar ring
        ctx.strokeStyle = "rgba(0, 240, 255, 0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ux, uy, 10 + Math.sin(performance.now() * 0.006) * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Draw UAV silhouette rotated along heading
        ctx.save();
        ctx.translate(ux, uy);
        ctx.rotate(angle);
        ctx.fillStyle = "#ffffff";
        ctx.shadowColor = "#00d4ff";
        ctx.shadowBlur = 6;

        // Fuselage & High-Aspect Wings
        ctx.beginPath();
        ctx.moveTo(9, 0);
        ctx.lineTo(2, -2);
        ctx.lineTo(0, -11);
        ctx.lineTo(-3, -11);
        ctx.lineTo(-2, -2);
        ctx.lineTo(-8, -1.5);
        ctx.lineTo(-10, -5);
        ctx.lineTo(-11, -5);
        ctx.lineTo(-10, 0);
        ctx.lineTo(-11, 5);
        ctx.lineTo(-10, 5);
        ctx.lineTo(-8, 1.5);
        ctx.lineTo(-2, 2);
        ctx.lineTo(-3, 11);
        ctx.lineTo(0, 11);
        ctx.lineTo(2, 2);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(renderTacticalSatelliteMap);
}

// Export tactical map functions globally
window.toggleMapLayer = toggleMapLayer;
window.adjustMapZoom = adjustMapZoom;
window.resetMapZoom = resetMapZoom;

window.addEventListener("DOMContentLoaded", () => {
    requestAnimationFrame(renderTacticalSatelliteMap);
});
