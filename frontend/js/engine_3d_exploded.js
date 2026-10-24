/**
 * TWIN GCS — 3D AERO-PISTON DIGITAL TWIN & HOLOGRAPHIC X-RAY ENGINE
 * =================================================================
 * Combines:
 * 1. Photorealistic 3D Cutaway Engine with live 60 FPS laminar airflow particles,
 *    exhaust jet plume, reciprocating combustion pulses, and thermal fault heatmaps.
 * 2. Interactive Holographic X-Ray Scanner (0% Metallic <-> 100% X-Ray Wireframe).
 * 3. 10-Subsystem X-Ray CAD Highlighter (Pistons, Crankshaft, Turbo, Exhaust, etc.).
 * 4. 360° Interactive Three.js High-Detail CAD Assembly with 0-100% Exploded View.
 */

let heroEngineMode = "photorealistic"; // 'photorealistic' | 'xray' | 'webgl'
let xrayBlendRatio = 0.0;
let currentRPM = 2450;
let currentEGT = 685;
let currentCHT = 182;
let currentChts = [178, 182, 179, 181];
let activeFaultCode = "NOMINAL";

// Active checked subsystems in Right 3D Digital Twin View
const activeSubsystems = {
    block: false,
    pistons: true,
    crankshaft: true,
    camshaft: false,
    turbo: true,
    intake: false,
    exhaust: true,
    lubrication: false,
    fuel: false,
    sensors: false,
};

let rightTwinViewMode = "internal"; // 'internal' | 'external'

// Particle pools for Center Hero Engine
const inletParticles = [];
const exhaustParticles = [];

// Three.js WebGL variables
let scene, camera, renderer, controls;
let cadParts = [];
let propellerGroup = null;
let pistonMeshes = [];
let targetExplode = 0.0;
let currentExplode = 0.0;
let threeInitialized = false;

function initHeroAndXrayEngine() {
    // Initialize inlet particles (left side flowing into compressor)
    for (let i = 0; i < 42; i++) {
        inletParticles.push({
            x: Math.random() * 175,
            y: 95 + (Math.random() - 0.5) * 65,
            vx: 2.8 + Math.random() * 2.2,
            size: 1.5 + Math.random() * 2.2,
            alpha: 0.3 + Math.random() * 0.65,
        });
    }

    // Initialize exhaust plume particles (right side exiting turbine)
    for (let i = 0; i < 48; i++) {
        exhaustParticles.push({
            x: 565 + Math.random() * 185,
            y: 120 + (Math.random() - 0.5) * 44,
            vx: 3.6 + Math.random() * 3.0,
            vy: (Math.random() - 0.5) * 0.7,
            size: 2.0 + Math.random() * 3.5,
            alpha: 0.35 + Math.random() * 0.6,
        });
    }

    requestAnimationFrame(animateHeroAndXrayLoop);
}

/**
 * Switch Center Hero Engine Mode ('photorealistic' | 'xray' | 'webgl')
 */
function setHeroEngineMode(mode) {
    heroEngineMode = mode;
    const btnPhoto = document.getElementById("btnModePhoto");
    const btnXray = document.getElementById("btnModeXrayBlend");
    const btnWebGL = document.getElementById("btnModeWebGL");
    const photoStack = document.getElementById("photoEngineStack");
    const threeStage = document.getElementById("threeContainer");
    const callouts = document.getElementById("engineCalloutsLayer");
    const xrayImg = document.getElementById("heroXrayOverlayImg");
    const slider = document.getElementById("explodeSlider");
    const pctLabel = document.getElementById("explodePctLabel");

    [btnPhoto, btnXray, btnWebGL].forEach(b => b && b.classList.remove("active"));

    if (mode === "photorealistic") {
        if (btnPhoto) btnPhoto.classList.add("active");
        if (photoStack) photoStack.style.display = "flex";
        if (threeStage) threeStage.classList.add("hidden");
        if (callouts) callouts.style.display = "block";
        xrayBlendRatio = 0.0;
        if (xrayImg) xrayImg.style.opacity = "0";
        if (slider) slider.value = 0;
        if (pctLabel) pctLabel.innerText = "0% (METALLIC)";
    } else if (mode === "xray") {
        if (btnXray) btnXray.classList.add("active");
        if (photoStack) photoStack.style.display = "flex";
        if (threeStage) threeStage.classList.add("hidden");
        if (callouts) callouts.style.display = "block";
        xrayBlendRatio = 0.88;
        if (xrayImg) xrayImg.style.opacity = "0.88";
        if (slider) slider.value = 88;
        if (pctLabel) pctLabel.innerText = "88% (X-RAY SCAN)";
    } else if (mode === "webgl") {
        if (btnWebGL) btnWebGL.classList.add("active");
        if (photoStack) photoStack.style.display = "none";
        if (threeStage) threeStage.classList.remove("hidden");
        if (callouts) callouts.style.display = "none";
        if (!threeInitialized) {
            initThreeCADEngine();
        }
        if (pctLabel) pctLabel.innerText = `${slider ? slider.value : 0}% (3D CAD)`;
    }
}

/**
 * Slider handler: controls X-Ray Scanner Blend in Photo/X-Ray mode AND 3D Explode in CAD mode
 */
function onExplodeSlider(val) {
    const num = parseFloat(val) || 0;
    const ratio = num / 100.0;
    targetExplode = ratio;
    xrayBlendRatio = ratio;

    const xrayImg = document.getElementById("heroXrayOverlayImg");
    const pctLabel = document.getElementById("explodePctLabel");

    if (heroEngineMode !== "webgl") {
        if (xrayImg) xrayImg.style.opacity = ratio.toFixed(2);
        if (pctLabel) {
            pctLabel.innerText = num === 0 ? "0% (METALLIC)" : num === 100 ? "100% (FULL X-RAY)" : `${num}% (X-RAY SCAN)`;
        }
    } else {
        if (pctLabel) {
            pctLabel.innerText = num === 0 ? "0% (ASSEMBLED)" : num === 100 ? "100% (EXPLODED)" : `${num}% (DISASSEMBLY)`;
        }
    }
}

/**
 * Switch Right Card between 'external' (UAV Airframe X-Ray) and 'internal' (Engine X-Ray)
 */
function setViewMode(mode) {
    rightTwinViewMode = mode;
    const btnExt = document.getElementById("btnExtView");
    const btnInt = document.getElementById("btnIntView");
    const img = document.getElementById("rightTwinStageImg");

    if (mode === "external") {
        if (btnExt) btnExt.classList.add("active");
        if (btnInt) btnInt.classList.remove("active");
        if (img) img.src = "assets/uav_xray_external.jpg";
    } else {
        if (btnInt) btnInt.classList.add("active");
        if (btnExt) btnExt.classList.remove("active");
        if (img) img.src = "assets/engine_xray_internal.jpg";
    }
}

/**
 * Toggle Subsystem Highlighting on Right X-Ray Twin
 */
function toggleSubsystemHighlight(subsystemKey, isChecked) {
    activeSubsystems[subsystemKey] = isChecked;
}

/**
 * Update Engine Thermal State from Live WebSocket Telemetry
 */
function updateEngineThermals(cht1, cht2, cht3, cht4, rpm = 2450, egt = 685, fault = "NOMINAL") {
    currentChts = [cht1 || 178, cht2 || 182, cht3 || 179, cht4 || 181];
    currentCHT = Math.max(...currentChts);
    currentRPM = rpm || 2450;
    currentEGT = egt || 685;
    activeFaultCode = fault || "NOMINAL";
}

/**
 * 60 FPS Animation Loop for Center Engine Particles & Right X-Ray Overlays
 */
function animateHeroAndXrayLoop() {
    const heroCanvas = document.getElementById("engineHeroParticleCanvas");
    const xrayCanvas = document.getElementById("engineXrayOverlayCanvas");
    const isHeroVisible = heroCanvas && heroCanvas.offsetParent !== null;
    const isXrayVisible = xrayCanvas && xrayCanvas.offsetParent !== null;

    if (!isHeroVisible && !isXrayVisible) {
        setTimeout(() => requestAnimationFrame(animateHeroAndXrayLoop), 1000);
        return;
    }

    renderCenterEngineParticles();
    renderRightXrayHighlights();
    if (threeInitialized && heroEngineMode === "webgl") {
        renderThreeCADFrame();
    }
    requestAnimationFrame(animateHeroAndXrayLoop);
}

function renderCenterEngineParticles() {
    const canvas = document.getElementById("engineHeroParticleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const speedFactor = Math.max(0.5, currentRPM / 2450.0);
    const now = performance.now() * 0.001;

    // 1. Animate Left Cyan Air Inlet Laminar Stream Particles
    ctx.save();
    inletParticles.forEach(p => {
        p.x += p.vx * speedFactor;
        if (p.x > 178) {
            p.x = 5;
            p.y = 118 + (Math.random() - 0.5) * 60;
        }
        // Converge slightly toward compressor inlet center (x=175, y=124)
        p.y += (124 - p.y) * 0.025;

        const grad = ctx.createLinearGradient(p.x - 18, p.y, p.x + 4, p.y);
        grad.addColorStop(0, "rgba(0, 212, 255, 0)");
        grad.addColorStop(1, `rgba(0, 240, 255, ${p.alpha})`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.size;
        ctx.beginPath();
        ctx.moveTo(p.x - 18, p.y);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
    });
    ctx.restore();

    // 2. Animate Right Fiery Orange-Red Exhaust Plume Particles
    ctx.save();
    const isHot = currentEGT > 715 || activeFaultCode !== "NOMINAL";
    exhaustParticles.forEach(p => {
        p.x += p.vx * speedFactor * (isHot ? 1.35 : 1.0);
        p.y += p.vy;
        if (p.x > w - 10) {
            p.x = 575;
            p.y = 122 + (Math.random() - 0.5) * 32;
        }
        const progress = (p.x - 575) / 180.0;
        const alpha = Math.max(0, (1 - progress) * p.alpha);
        ctx.fillStyle = isHot
            ? `rgba(255, ${Math.floor(60 + (1 - progress) * 120)}, 20, ${alpha})`
            : `rgba(255, ${Math.floor(110 + (1 - progress) * 90)}, 30, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + progress * 1.2), 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();

    // 3. Internal Cutaway Cylinder Firing Pulse & Reciprocating Glow
    const pulse = (Math.sin(now * 28.0 * speedFactor) + 1) * 0.5;
    const cylPositions = [
        { x: 356, y: 142, cht: currentChts[0], label: "CYL-1" },
        { x: 418, y: 126, cht: currentChts[1], label: "CYL-2" },
        { x: 472, y: 128, cht: currentChts[2], label: "CYL-3" },
        { x: 520, y: 132, cht: currentChts[3], label: "CYL-4" },
    ];

    cylPositions.forEach((c, idx) => {
        const isFaultCyl = c.cht > 195 || (activeFaultCode !== "NOMINAL" && idx === 1);
        const radius = isFaultCyl ? 34 + pulse * 8 : 18 + pulse * 4;
        const g = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, radius);
        if (isFaultCyl) {
            g.addColorStop(0, `rgba(255, 25, 65, ${0.55 + pulse * 0.3})`);
            g.addColorStop(0.5, "rgba(255, 110, 0, 0.35)");
            g.addColorStop(1, "rgba(255, 0, 0, 0)");
        } else {
            g.addColorStop(0, `rgba(0, 225, 255, ${0.15 + pulse * 0.12})`);
            g.addColorStop(1, "rgba(0, 212, 255, 0)");
        }
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(c.x, c.y, radius, 0, Math.PI * 2);
        ctx.fill();

        if (isFaultCyl) {
            ctx.strokeStyle = "rgba(255, 23, 68, 0.9)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(c.x, c.y, 22 + (now * 18) % 16, 0, Math.PI * 2);
            ctx.stroke();

            ctx.fillStyle = "#ffffff";
            ctx.font = "bold 10px 'Share Tech Mono', monospace";
            ctx.fillText(`⚠ ${c.label}: ${c.cht.toFixed(0)}°C`, c.x - 32, c.y - 26);
        }
    });

    // 4. If X-Ray Scanner is partially active (1% - 99%), draw vertical laser scanline
    if (xrayBlendRatio > 0.01 && xrayBlendRatio < 0.99) {
        const scanX = (w * 0.15) + ((now * 140) % (w * 0.7));
        const scanGrad = ctx.createLinearGradient(scanX - 15, 0, scanX + 15, 0);
        scanGrad.addColorStop(0, "rgba(0, 240, 255, 0)");
        scanGrad.addColorStop(0.5, "rgba(0, 240, 255, 0.65)");
        scanGrad.addColorStop(1, "rgba(0, 240, 255, 0)");
        ctx.fillStyle = scanGrad;
        ctx.fillRect(scanX - 15, 10, 30, h - 20);
    }
}

/**
 * Render Interactive Subsystem Target Highlights on Right X-Ray View
 */
function renderRightXrayHighlights() {
    const canvas = document.getElementById("xraySubsystemCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const now = performance.now() * 0.003;
    const pulse = (Math.sin(now) + 1) * 0.5;

    // Coordinates mapped for Internal Engine X-Ray vs External UAV X-Ray
    const markers = rightTwinViewMode === "internal"
        ? {
            block:       { x: 120, y: 105, r: 42, color: "#00d4ff", label: "BLOCK" },
            pistons:     { x: 112, y: 112, r: 22, color: "#ff9100", label: "PISTONS" },
            crankshaft:  { x: 96,  y: 145, r: 18, color: "#ffab00", label: "CRANK" },
            camshaft:    { x: 135, y: 92,  r: 15, color: "#00e5ff", label: "CAM" },
            turbo:       { x: 176, y: 104, r: 24, color: "#ff3d00", label: "TURBO" },
            intake:      { x: 125, y: 45,  r: 22, color: "#00e676", label: "INTERCOOLER" },
            exhaust:     { x: 145, y: 155, r: 24, color: "#ff5252", label: "EXHAUST" },
            lubrication: { x: 82,  y: 152, r: 16, color: "#ffd600", label: "OIL SUMP" },
            fuel:        { x: 130, y: 78,  r: 16, color: "#00b0ff", label: "EFI RAIL" },
            sensors:     { x: 64,  y: 102, r: 15, color: "#e040fb", label: "FADEC SENS" },
        }
        : {
            block:       { x: 148, y: 96, r: 24, color: "#00d4ff", label: "ENGINE BAY" },
            pistons:     { x: 145, y: 98, r: 16, color: "#ff9100", label: "CORE" },
            crankshaft:  { x: 160, y: 95, r: 14, color: "#ffab00", label: "DRIVETRAIN" },
            camshaft:    { x: 140, y: 92, r: 12, color: "#00e5ff", label: "VALVETRAIN" },
            turbo:       { x: 168, y: 92, r: 16, color: "#ff3d00", label: "TURBO" },
            intake:      { x: 152, y: 80, r: 14, color: "#00e676", label: "NACA INLET" },
            exhaust:     { x: 182, y: 90, r: 16, color: "#ff5252", label: "PROP & EXH" },
            lubrication: { x: 136, y: 104, r: 12, color: "#ffd600", label: "OIL COOLER" },
            fuel:        { x: 112, y: 98, r: 20, color: "#00b0ff", label: "FUEL TANK" },
            sensors:     { x: 52,  y: 132, r: 16, color: "#e040fb", label: "EO/IR & INS" },
        };

    Object.keys(activeSubsystems).forEach(key => {
        if (!activeSubsystems[key] || !markers[key]) return;
        const m = markers[key];

        // Outer dashed reticle ring
        ctx.save();
        ctx.strokeStyle = m.color;
        ctx.lineWidth = 1.3;
        ctx.globalAlpha = 0.55 + pulse * 0.35;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r + pulse * 3, 0, Math.PI * 2);
        ctx.stroke();

        // Inner glow fill
        const g = ctx.createRadialGradient(m.x, m.y, 1, m.x, m.y, m.r);
        g.addColorStop(0, m.color + "55");
        g.addColorStop(1, m.color + "00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r, 0, Math.PI * 2);
        ctx.fill();

        // Label tag
        ctx.font = "bold 8.5px 'Share Tech Mono', monospace";
        ctx.fillStyle = "#ffffff";
        ctx.fillText(m.label, m.x - m.r * 0.6, m.y - m.r - 3);
        ctx.restore();
    });
}

/**
 * 360° Interactive Three.js High-Detail PBR CAD Assembly (When user switches to 360° CAD Mode)
 */
function initThreeCADEngine() {
    const container = document.getElementById("threeContainer");
    if (!container) return;
    threeInitialized = true;

    const w = container.clientWidth || 680;
    const h = container.clientHeight || 260;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050b16);

    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(3.8, 2.6, 5.4);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    if (typeof THREE.OrbitControls !== "undefined") {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.06;
        controls.maxDistance = 12;
        controls.minDistance = 2.2;
    }

    // Multi-point studio lighting for realistic metallic specular highlights
    scene.add(new THREE.AmbientLight(0xdbeafe, 0.75));

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.8);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const cyanRim = new THREE.DirectionalLight(0x00d4ff, 1.4);
    cyanRim.position.set(-7, 4, -5);
    scene.add(cyanRim);

    const warmFill = new THREE.PointLight(0xff6d00, 1.6, 12);
    warmFill.position.set(2.5, -1.5, 2.0);
    scene.add(warmFill);

    const grid = new THREE.GridHelper(10, 24, 0x00d4ff, 0x102a45);
    grid.position.y = -1.55;
    scene.add(grid);

    buildHighDetailRotaxCAD();

    window.addEventListener("resize", () => {
        if (!container || heroEngineMode !== "webgl") return;
        const nw = container.clientWidth || 680;
        const nh = container.clientHeight || 260;
        camera.aspect = nw / nh;
        camera.updateProjectionMatrix();
        renderer.setSize(nw, nh);
    });
}

function registerCADPart(mesh, explodeVec) {
    scene.add(mesh);
    cadParts.push({
        mesh,
        basePos: mesh.position.clone(),
        explodeVec: explodeVec.clone(),
    });
}

function buildHighDetailRotaxCAD() {
    const aluCastMat = new THREE.MeshStandardMaterial({ color: 0x8a9ba8, metalness: 0.82, roughness: 0.28 });
    const cncBilletMat = new THREE.MeshStandardMaterial({ color: 0xcbd5e1, metalness: 0.92, roughness: 0.16 });
    const darkAnodizedMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.75, roughness: 0.32 });
    const bronzeMat = new THREE.MeshStandardMaterial({ color: 0xb45309, metalness: 0.85, roughness: 0.22 });
    const hotTurbineMat = new THREE.MeshStandardMaterial({
        color: 0xff5500,
        emissive: 0xff3300,
        emissiveIntensity: 0.65,
        metalness: 0.7,
        roughness: 0.3,
    });
    const cyanWireMat = new THREE.MeshStandardMaterial({
        color: 0x00d4ff,
        emissive: 0x0088cc,
        emissiveIntensity: 0.4,
    });

    // 1. Split Crankcase Halves (Left & Right) + Bolted Ribs
    const caseLeft = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.15, 2.3), aluCastMat);
    caseLeft.position.set(-0.42, 0, 0);
    registerCADPart(caseLeft, new THREE.Vector3(-0.6, 0, 0));

    const caseRight = new THREE.Mesh(new THREE.BoxGeometry(0.82, 1.15, 2.3), aluCastMat);
    caseRight.position.set(0.42, 0, 0);
    registerCADPart(caseRight, new THREE.Vector3(0.6, 0, 0));

    // 2. Internal Crankshaft + Counterweights
    const crankShaft = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 2.5, 24), bronzeMat);
    crankShaft.rotation.x = Math.PI / 2;
    registerCADPart(crankShaft, new THREE.Vector3(0, -1.1, 0));

    // 3. 4 Finned Boxer Cylinders + Liquid Heads + Reciprocating Pistons
    const cylCoords = [
        { x: -1.15, z: -0.58, dir: -1 },
        { x:  1.15, z: -0.58, dir:  1 },
        { x: -1.15, z:  0.58, dir: -1 },
        { x:  1.15, z:  0.58, dir:  1 },
    ];

    cylCoords.forEach((c, idx) => {
        const cylGroup = new THREE.Group();
        const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.75, 28), darkAnodizedMat);
        barrel.rotation.z = Math.PI / 2;
        cylGroup.add(barrel);

        // 10 Cooling Fins per Cylinder
        for (let f = -0.3; f <= 0.3; f += 0.065) {
            const fin = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.02, 28), cncBilletMat);
            fin.rotation.z = Math.PI / 2;
            fin.position.x = f;
            cylGroup.add(fin);
        }

        // Liquid-Cooled Cylinder Head & Valve Cover
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.68, 0.68), cncBilletMat.clone());
        head.position.x = c.dir * 0.48;
        cylGroup.add(head);

        // Dual Spark Plugs
        const sp = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.28, 12), cyanWireMat);
        sp.position.set(c.dir * 0.45, 0.42, 0);
        cylGroup.add(sp);

        cylGroup.position.set(c.x, 0.08, c.z);
        registerCADPart(cylGroup, new THREE.Vector3(c.dir * 1.9, 0.25, c.z * 0.5));

        // Internal Piston + Crown
        const piston = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.38, 24), bronzeMat);
        piston.rotation.z = Math.PI / 2;
        piston.position.set(c.dir * 0.85, 0.08, c.z);
        registerCADPart(piston, new THREE.Vector3(c.dir * 1.2, -0.35, c.z * 0.3));
        pistonMeshes.push({ mesh: piston, dir: c.dir, phase: idx * (Math.PI / 2) });
    });

    // 4. Top Intercooler & Charge Pipes
    const intercooler = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.42, 1.35), darkAnodizedMat);
    intercooler.position.set(0, 1.05, -0.1);
    registerCADPart(intercooler, new THREE.Vector3(0, 1.85, 0));

    // 5. Garrett T25 Turbocharger (Cold Compressor + Hot glowing Turbine)
    const compSnail = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.16, 20, 36), cncBilletMat);
    compSnail.position.set(-0.35, 0.45, 1.38);
    registerCADPart(compSnail, new THREE.Vector3(-0.8, 0.8, 1.6));

    const turbSnail = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.16, 20, 36), hotTurbineMat);
    turbSnail.position.set(0.35, 0.45, 1.38);
    registerCADPart(turbSnail, new THREE.Vector3(0.8, 0.8, 1.6));

    // 6. Reduction Gearbox & Spinning 3-Blade Scimitar Propeller (Front)
    const gearbox = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.48, 0.65, 28), aluCastMat);
    gearbox.rotation.x = Math.PI / 2;
    gearbox.position.set(0, 0.18, -1.42);
    registerCADPart(gearbox, new THREE.Vector3(0, 0.2, -1.5));

    propellerGroup = new THREE.Group();
    const spinner = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.55, 28), cncBilletMat);
    spinner.rotation.x = -Math.PI / 2;
    spinner.position.z = -0.3;
    propellerGroup.add(spinner);

    for (let b = 0; b < 3; b++) {
        const blade = new THREE.Mesh(new THREE.BoxGeometry(0.14, 1.75, 0.03), darkAnodizedMat);
        const angle = (b * Math.PI * 2) / 3;
        blade.position.set(Math.sin(angle) * 0.85, Math.cos(angle) * 0.85, -0.1);
        blade.rotation.z = -angle;
        blade.rotation.y = 0.25;
        propellerGroup.add(blade);
    }
    propellerGroup.position.set(0, 0.18, -1.8);
    registerCADPart(propellerGroup, new THREE.Vector3(0, 0.2, -2.4));
}

function renderThreeCADFrame() {
    if (!renderer || !scene || !camera) return;
    currentExplode += (targetExplode - currentExplode) * 0.08;

    cadParts.forEach(item => {
        const offset = item.explodeVec.clone().multiplyScalar(currentExplode);
        item.mesh.position.copy(item.basePos).add(offset);
    });

    if (propellerGroup) {
        propellerGroup.rotation.z += (currentRPM / 2450.0) * 0.18;
    }

    if (controls) controls.update();
    renderer.render(scene, camera);
}

// Export 3D engine & X-ray functions globally
window.setHeroEngineMode = setHeroEngineMode;
window.onExplodeSlider = onExplodeSlider;
window.setViewMode = setViewMode;
window.toggleSubsystemHighlight = toggleSubsystemHighlight;
window.updateEngineThermals = updateEngineThermals;

window.addEventListener("DOMContentLoaded", initHeroAndXrayEngine);
