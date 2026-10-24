/**
 * TWIN GCS (CODECREW) — 4-STAGE CINEMATIC BOOT + LOGIN / SIGNUP + LIVE FACE ID SCANNER
 * ====================================================================================
 * 1. Runs the 4-stage startup animation first (0% -> 100%).
 * 2. Opens the Login & Sign Up portal with real webcam Face ID registration & verification.
 * 3. Stores registered users + their captured Face ID photo in localStorage.
 */

const BootLoginController = {
    progress: 0,
    currentStage: 1,
    isPaused: false,
    bootCompleted: false,
    bootInterval: null,
    authMode: "login", // 'login' | 'signup' | 'forgot'
    bootStarfieldRaf: null,
    stage4StreamRaf: null,
    loginHudRaf: null
};

/**
 * Initialize Boot Sequence FIRST on Page Load
 */
function initBootAndLoginSystem() {
    initBootStarfieldCanvas();
    initStage4EngineStreamCanvas();
    initInteractiveHoloEngineCanvas();
    initLoginFftWaveCanvas();

    // Make sure Login is hidden while the 4-stage Boot Animation runs first!
    const bootOverlay = document.getElementById("cinematicBootOverlay");
    const loginOverlay = document.getElementById("tacticalLoginOverlay");
    if (bootOverlay) bootOverlay.classList.remove("hidden-overlay");
    if (loginOverlay) loginOverlay.classList.add("hidden-overlay");

    // Ensure inputs are completely empty on start (no defaults!)
    const uEl = document.getElementById("loginUsername");
    const pEl = document.getElementById("loginPassword");
    if (uEl) uEl.value = "";
    if (pEl) pEl.value = "";

    startCinematicBootSequence();

    // Fetch initial profile from server to populate sidebar & dashboard
    try {
        fetch("/api/auth/profile")
            .then(r => r.json())
            .then(data => {
                if (data.ok && data.officer) {
                    updateOfficerProfileUI(data.officer);
                }
            })
            .catch(() => {});
    } catch (e) {}
}

function getRegisteredUsers() {
    try {
        const raw = localStorage.getItem("twingcs_users_db");
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        return [];
    }
}

function saveRegisteredUsers(users) {
    try {
        localStorage.setItem("twingcs_users_db", JSON.stringify(users));
    } catch (e) {
        // Ignore quota error
    }
}

/**
 * Starts (or replays) the 4-Stage Cinematic Boot Sequence from 0% to 100%
 */
function startCinematicBootSequence() {
    const bootOverlay = document.getElementById("cinematicBootOverlay");
    const loginOverlay = document.getElementById("tacticalLoginOverlay");
    if (!bootOverlay) return;

    // Show Boot Overlay on top, Hide Login Overlay until boot finishes
    bootOverlay.classList.remove("hidden-overlay");
    if (loginOverlay) loginOverlay.classList.add("hidden-overlay");

    BootLoginController.progress = 0;
    BootLoginController.currentStage = 1;
    BootLoginController.isPaused = false;
    BootLoginController.bootCompleted = false;

    const pauseBtn = document.getElementById("bootPauseBtn");
    if (pauseBtn) pauseBtn.innerText = "⏸ PAUSE STAGE";

    updateBootUI(0);

    if (BootLoginController.bootInterval) {
        clearInterval(BootLoginController.bootInterval);
    }

    // Smooth progression from 0% to 100% across all 4 stages (~10.5 seconds)
    BootLoginController.bootInterval = setInterval(() => {
        if (BootLoginController.isPaused || BootLoginController.bootCompleted) return;

        BootLoginController.progress += 0.9;
        if (BootLoginController.progress >= 100) {
            BootLoginController.progress = 100;
            updateBootUI(100);
            clearInterval(BootLoginController.bootInterval);
            setTimeout(() => {
                transitionBootToLogin();
            }, 850);
        } else {
            updateBootUI(BootLoginController.progress);
        }
    }, 90);
}

/**
 * Updates active stage slide (1..4), progress bar, and 7 module checkmarks
 */
function updateBootUI(pct) {
    const rounded = Math.min(100, Math.max(0, Math.round(pct)));
    const fillEl = document.getElementById("bootProgressFill");
    const pctEl = document.getElementById("bootProgressPct");
    const capEl = document.getElementById("bootStatusCaption");

    if (fillEl) fillEl.style.width = `${rounded}%`;
    if (pctEl) pctEl.innerText = `${rounded}%`;

    let stage = 1;
    if (rounded < 26) {
        stage = 1;
        if (capEl) capEl.innerText = "INITIALIZING CODECREW SYSTEMS...";
    } else if (rounded < 64) {
        stage = 2;
        if (capEl) capEl.innerText = "LOADING DIGITAL TWIN & AI DIAGNOSTIC MODULES...";
    } else if (rounded < 84) {
        stage = 3;
        if (capEl) capEl.innerText = "SYNCHRONIZING TWIN GCS MALE UAV HANGAR LINK...";
    } else {
        stage = 4;
        if (capEl) capEl.innerText = rounded === 100
            ? "SYSTEMS 100% READY — OPENING OFFICER LOGIN & FACE ID PORTAL..."
            : "CALIBRATING PHOTOREALISTIC 3D ENGINE DIGITAL TWIN...";
    }

    BootLoginController.currentStage = stage;

    for (let i = 1; i <= 4; i++) {
        const slide = document.getElementById(`bootStageSlide${i}`);
        const pill = document.getElementById(`bootStagePill${i}`);
        if (slide) slide.classList.toggle("active", i === stage);
        if (pill) {
            pill.classList.toggle("active", i === stage);
            pill.classList.toggle("completed", i < stage);
        }
    }

    const thresholds = [30, 35, 40, 45, 50, 55, 60];
    for (let m = 0; m < 7; m++) {
        const row = document.getElementById(`bootModRow${m}`);
        const ind = document.getElementById(`bootModInd${m}`);
        if (!row || !ind) continue;

        if (rounded >= thresholds[m]) {
            row.classList.add("done");
            row.classList.remove("active-loading");
            ind.innerText = "✔";
        } else if (m === 0 || rounded >= thresholds[m - 1]) {
            row.classList.remove("done");
            row.classList.add("active-loading");
            ind.innerText = "";
        } else {
            row.classList.remove("done", "active-loading");
            ind.innerText = "";
        }
    }
}

function jumpToBootStage(stageNum) {
    const stageStartPcts = { 1: 0, 2: 30, 3: 65, 4: 85 };
    BootLoginController.progress = stageStartPcts[stageNum] !== undefined ? stageStartPcts[stageNum] : 0;
    updateBootUI(BootLoginController.progress);
}

function toggleBootPause() {
    BootLoginController.isPaused = !BootLoginController.isPaused;
    const btn = document.getElementById("bootPauseBtn");
    if (btn) {
        btn.innerText = BootLoginController.isPaused ? "▶ RESUME INTRO" : "⏸ PAUSE STAGE";
    }
}

/**
 * Hides the 4-Stage Boot Overlay and opens the Login / Registration Portal
 */
function transitionBootToLogin() {
    BootLoginController.bootCompleted = true;
    if (BootLoginController.bootInterval) {
        clearInterval(BootLoginController.bootInterval);
        BootLoginController.bootInterval = null;
    }
    const bootOverlay = document.getElementById("cinematicBootOverlay");
    const loginOverlay = document.getElementById("tacticalLoginOverlay");
    if (bootOverlay) bootOverlay.classList.add("hidden-overlay");
    if (loginOverlay) loginOverlay.classList.remove("hidden-overlay");

    // Clean inputs - NO DEFAULTS
    const uEl = document.getElementById("loginUsername");
    const pEl = document.getElementById("loginPassword");
    const pinEl = document.getElementById("loginBadgePin");
    if (uEl) uEl.value = "";
    if (pEl) pEl.value = "";
    if (pinEl) pinEl.value = "";

    // Stop boot particle and starfield animation loops
    if (BootLoginController.bootStarfieldRaf) {
        cancelAnimationFrame(BootLoginController.bootStarfieldRaf);
        BootLoginController.bootStarfieldRaf = null;
    }
    if (BootLoginController.stage4StreamRaf) {
        cancelAnimationFrame(BootLoginController.stage4StreamRaf);
        BootLoginController.stage4StreamRaf = null;
    }

    // Start Login HUD animation only while login overlay is visible
    initLoginHudCanvas();
}

/**
 * Switch between 'login', 'signup', and 'forgot' tabs
 */
function switchAuthTab(mode) {
    BootLoginController.authMode = mode;
    const tabLogin = document.getElementById("tabBtnLogin");
    const tabSignup = document.getElementById("tabBtnSignup");
    const paneLogin = document.getElementById("loginFormPane");
    const paneSignup = document.getElementById("signupFormPane");
    const paneForgot = document.getElementById("forgotPasswordFormPane");
    const paneVerify = document.getElementById("verifyAccountFormPane");

    hideAuthBanner();
    if (paneVerify) paneVerify.classList.add("hidden-pane");

    if (mode === "signup") {
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabSignup) tabSignup.classList.add("active");
        if (paneLogin) paneLogin.classList.add("hidden-pane");
        if (paneForgot) paneForgot.classList.add("hidden-pane");
        if (paneSignup) paneSignup.classList.remove("hidden-pane");
    } else if (mode === "forgot") {
        if (tabLogin) tabLogin.classList.remove("active");
        if (tabSignup) tabSignup.classList.remove("active");
        if (paneLogin) paneLogin.classList.add("hidden-pane");
        if (paneSignup) paneSignup.classList.add("hidden-pane");
        if (paneForgot) paneForgot.classList.remove("hidden-pane");
    } else {
        if (tabSignup) tabSignup.classList.remove("active");
        if (tabLogin) tabLogin.classList.add("active");
        if (paneSignup) paneSignup.classList.add("hidden-pane");
        if (paneForgot) paneForgot.classList.add("hidden-pane");
        if (paneLogin) paneLogin.classList.remove("hidden-pane");
    }
}

function openForgotPasswordPane() {
    switchAuthTab("forgot");
}

/**
 * Show / Hide password helper
 */
function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (!input) return;
    if (input.type === "password") {
        input.type = "text";
        if (btnEl) btnEl.innerText = "🙈";
    } else {
        input.type = "password";
        if (btnEl) btnEl.innerText = "👁️";
    }
}

/**
 * Generates a unique 4-digit 2FA Security PIN during registration
 */
function generateRandomSignupPin() {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    const pinInp = document.getElementById("signupBadgePin");
    if (pinInp) {
        pinInp.value = pin;
        pinInp.style.borderColor = "#00e676";
        pinInp.style.boxShadow = "0 0 10px rgba(0, 230, 118, 0.4)";
    }
    showAuthBanner(`🎲 Generated 2FA Security PIN: ${pin}. Save this PIN to log in!`, "ok");
    return pin;
}

/**
 * Handles SIGN UP Form Submission (Generates Unique 2FA Security PIN & Registers User)
 */
function handleSignupSubmit(event) {
    if (event) event.preventDefault();

    const fullName = document.getElementById("signupFullName").value.trim();
    const username = document.getElementById("signupUsername").value.trim();
    const mobile = document.getElementById("signupMobile").value.trim();
    const role = document.getElementById("signupRole").value;
    const password = document.getElementById("signupPassword").value;
    const confirmPwd = document.getElementById("signupConfirmPassword").value;

    // Read or auto-generate unique 4-digit PIN
    let badgePin = "";
    const pinInput = document.getElementById("signupBadgePin");
    if (pinInput && pinInput.value.trim().length === 4) {
        badgePin = pinInput.value.trim();
    } else {
        badgePin = generateRandomSignupPin();
    }

    if (!fullName || !username || !password) {
        showAuthBanner("⚠ Please fill in your Full Name, Username/Email, and Password.", "err");
        return;
    }

    if (password !== confirmPwd) {
        showAuthBanner("⚠ Password and Confirm Password do not match!", "err");
        return;
    }

    const newUser = {
        fullName,
        username,
        email: username.includes("@") ? username : `${username}@drdo.gov.in`,
        mobile: mobile || "+91 98110 26054",
        role,
        sector: "NORTHERN_BORDER_SECTOR",
        badgePin: badgePin,
        registeredAt: new Date().toISOString()
    };

    const users = getRegisteredUsers();
    const existingIdx = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());
    if (existingIdx >= 0) {
        users[existingIdx] = newUser;
    } else {
        users.push(newUser);
    }
    saveRegisteredUsers(users);

    // Also synchronize registration to sovereign backend PBKDF2 enclave
    try {
        fetch("/api/auth/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: username,
                full_name: fullName,
                email: username.includes("@") ? username : `${username}@drdo.gov.in`,
                mobile: mobile || "+91 98110 26054",
                role: role,
                password: password,
                badge_pin: badgePin
            })
        })
        .then(r => r.json().then(data => ({ status: r.status, data })))
        .then(({ status, data }) => {
            const finalPin = (data && data.badge_pin) || badgePin;
            if (status === 200 && data.ok && data.verification_required) {
                openVerifyAccountPane(username, data.simulated_activation_code, finalPin);
            } else if (!data.ok) {
                showAuthBanner(`❌ Registration blocked: ${data.detail || data.message || "Password policy violation"}`, "err");
            } else {
                switchAuthTab("login");
                showAuthBanner(`✔ Account registered for ${fullName}! Your unique 2FA PIN is: ${finalPin}.`, "ok");
            }
        })
        .catch(() => {
            switchAuthTab("login");
            showAuthBanner(`✔ Account registered locally for ${fullName}! Your unique 2FA PIN is: ${badgePin}.`, "ok");
        });
    } catch (e) {
        switchAuthTab("login");
    }

    // Do NOT prefill credentials into login inputs - leave clean/blank per strict user request!
    const loginUserEl = document.getElementById("loginUsername");
    const loginPwdEl = document.getElementById("loginPassword");
    const loginPinEl = document.getElementById("loginBadgePin");
    if (loginUserEl) loginUserEl.value = "";
    if (loginPwdEl) loginPwdEl.value = "";
    if (loginPinEl) loginPinEl.value = "";
}

/**
 * 2-Step Military Account Activation View Controller
 */
function openVerifyAccountPane(username, simCode, badgePin) {
    const loginPane = document.getElementById("loginFormPane");
    const signupPane = document.getElementById("signupFormPane");
    const forgotPane = document.getElementById("forgotPasswordFormPane");
    const verifyPane = document.getElementById("verifyAccountFormPane");
    
    if (loginPane) loginPane.classList.add("hidden-pane");
    if (signupPane) signupPane.classList.add("hidden-pane");
    if (forgotPane) forgotPane.classList.add("hidden-pane");
    if (verifyPane) verifyPane.classList.remove("hidden-pane");

    const userInp = document.getElementById("verifyAccountUsername");
    const codeInp = document.getElementById("verifyAccountCode");
    const noticeEl = document.getElementById("verifyAccountNotice");

    if (userInp) userInp.value = username;
    if (codeInp && simCode) codeInp.value = simCode;

    if (noticeEl) {
        noticeEl.style.display = "block";
        noticeEl.style.background = "rgba(0, 230, 118, 0.15)";
        noticeEl.style.border = "1px solid #00e676";
        noticeEl.style.color = "#00e676";
        const pinMsg = badgePin ? ` | <strong>2FA PIN:</strong> <span style="letter-spacing:2px; color:#00f0ff">${badgePin}</span>` : "";
        noticeEl.innerHTML = `🛡️ <strong>ACTIVATION CHALLENGE:</strong> 6-Digit Code: <strong>${simCode || 'Dispatched'}</strong>${pinMsg}. Click Verify to complete activation.`;
    }
}

function handleAccountVerificationSubmit(event) {
    if (event) event.preventDefault();
    const username = document.getElementById("verifyAccountUsername").value.trim();
    const code = document.getElementById("verifyAccountCode").value.trim();
    const noticeEl = document.getElementById("verifyAccountNotice");

    if (!code || code.length !== 6) {
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.style.background = "rgba(255, 23, 68, 0.15)";
            noticeEl.style.border = "1px solid #ff1744";
            noticeEl.style.color = "#ff5252";
            noticeEl.innerHTML = `❌ Please enter a valid 6-digit military activation code.`;
        }
        return;
    }

    fetch("/api/auth/verify-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            identifier: username,
            activation_code: code
        })
    })
    .then(r => r.json().then(data => ({ status: r.status, data })))
    .then(({ status, data }) => {
        if (status === 200 && data.ok) {
            if (data.token) {
                sessionStorage.setItem("GCS_OFFICER_TOKEN", data.token);
            }
            switchAuthTab("login");
            showAuthBanner(`✔ Officer identity verified & activated! You can now log in securely.`, "ok");
        } else {
            if (noticeEl) {
                noticeEl.style.display = "block";
                noticeEl.style.background = "rgba(255, 23, 68, 0.15)";
                noticeEl.style.border = "1px solid #ff1744";
                noticeEl.style.color = "#ff5252";
                noticeEl.innerHTML = `❌ Activation Failed: ${data.message || data.detail || "Invalid code"}`;
            }
        }
    })
    .catch(err => {
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.style.background = "rgba(255, 23, 68, 0.15)";
            noticeEl.style.border = "1px solid #ff1744";
            noticeEl.style.color = "#ff5252";
            noticeEl.innerHTML = `❌ Activation Network Error: ${err.message}`;
        }
    });
}

/**
 * Updates Officer Profile UI across header, sidebar action button, and modal
 */
function updateOfficerProfileUI(officer) {
    if (!officer) return;
    const name = officer.full_name || officer.fullName || "Wg. Cdr. R. Rathore";
    const role = officer.role || "Chief Flight Commander (DRDO ADE)";
    const sector = officer.sector || "CHITRADURGA_ATR";
    const serviceId = officer.service_id || "IAF-DRDO-26054";
    const email = officer.email || "commander@drdo.gov.in";
    const mobile = officer.mobile || "+91 98110 26054";
    const address = officer.address || "Aeronautical Test Range (ATR), DRDO, Chitradurga, Karnataka - 577502";

    // Top Header & Dashboard
    const hdrBadge = document.getElementById("headerCommanderBadge");
    if (hdrBadge) hdrBadge.innerText = `👨‍✈️ ${name}`;
    const setOff = document.getElementById("setOfficerName");
    if (setOff) setOff.innerText = `${name} (${role})`;

    // Sidebar Bottom Profile Button label
    const sideBtnLabel = document.getElementById("sidebarOfficerBtnLabel");
    if (sideBtnLabel) sideBtnLabel.innerText = `${name}`;

    // Profile Modal Inputs
    const pName = document.getElementById("profFullName");
    if (pName) pName.value = name;
    const pServ = document.getElementById("profServiceId");
    if (pServ) pServ.value = serviceId;
    const pMail = document.getElementById("profEmail");
    if (pMail) pMail.value = email;
    const pMob = document.getElementById("profMobile");
    if (pMob) pMob.value = mobile;
    const pAddr = document.getElementById("profAddress");
    if (pAddr) pAddr.value = address;
    const pSec = document.getElementById("profSector");
    if (pSec) pSec.value = sector;
    const pRole = document.getElementById("profRole");
    if (pRole) pRole.value = role;
}

/**
 * Handles LOGIN Form Submission (Streamlined Fast Military Authentication)
 */
async function handleLoginSubmit(event) {
    if (event) event.preventDefault();

    const usernameInput = document.getElementById("loginUsername").value.trim();
    const passwordInput = document.getElementById("loginPassword").value;
    const noticeEl = document.getElementById("loginAttemptNotice");

    // 1. Enforce Mandatory Fields (Officer ID & Password)
    if (!usernameInput || !passwordInput) {
        showAuthBanner("⚠ Please enter your Officer ID and Military Password.", "err");
        if (noticeEl) {
            noticeEl.style.display = "block";
            noticeEl.style.background = "rgba(255, 23, 68, 0.15)";
            noticeEl.style.border = "1px solid #ff1744";
            noticeEl.style.color = "#ff8a80";
            noticeEl.innerHTML = "🚨 <strong>MANDATORY FIELDS MISSING:</strong> Officer ID and Military Password are required.";
        }
        return;
    }

    const loginBtn = document.getElementById("btnLoginSubmit");
    if (loginBtn) {
        loginBtn.disabled = true;
        loginBtn.innerHTML = "<span>🛡️</span><span>VALIDATING DEFENSE CREDENTIALS...</span>";
    }

    try {
        const resp = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                username: usernameInput,
                password: passwordInput,
                sector: "NORTHERN_BORDER_SECTOR"
            })
        });

        const data = await resp.json();

        // 2. Handle Lockout (HTTP 423)
        if (resp.status === 423) {
            if (loginBtn) {
                loginBtn.disabled = true;
                loginBtn.innerHTML = "<span>⛔</span><span>ACCOUNT DEFCON-3 LOCKED OUT</span>";
            }
            const lockMsg = data.detail?.message || data.detail || "Account temporarily locked.";
            showAuthBanner(`⛔ ${lockMsg}`, "err");
            if (noticeEl) {
                noticeEl.style.display = "block";
                noticeEl.style.background = "rgba(255, 23, 68, 0.25)";
                noticeEl.style.border = "1px solid #ff1744";
                noticeEl.style.color = "#ff5252";
                noticeEl.innerHTML = `🚨 <strong>DEFCON-3 LOCKOUT ACTIVE:</strong> ${lockMsg}`;
            }
            return;
        }

        // 3. Handle Invalid Credentials (HTTP 401)
        if (resp.status === 401 || !data.ok) {
            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = "<span>🔐</span><span>VERIFY CREDENTIALS &amp; ACCESS GCS</span>";
            }
            const errMsg = data.detail?.message || data.detail || "Invalid Officer credentials.";
            showAuthBanner(`⚠ ${errMsg}`, "err");
            if (noticeEl) {
                noticeEl.style.display = "block";
                noticeEl.style.background = "rgba(255, 145, 0, 0.15)";
                noticeEl.style.border = "1px solid #ff9100";
                noticeEl.style.color = "#ffd54f";
                noticeEl.innerHTML = `⚠️ <strong>AUTHENTICATION REJECTED:</strong> ${errMsg}`;
            }
            return;
        }

        // 4. Success (HTTP 200)
        if (noticeEl) noticeEl.style.display = "none";
        if (loginBtn) {
            loginBtn.innerHTML = "<span>✔</span><span>CLEARANCE GRANTED — OPENING AIR-GAPPED GCS...</span>";
        }

        sessionStorage.setItem("GCS_OFFICER_TOKEN", data.token);
        if (data.officer && data.officer.clearance) {
            sessionStorage.setItem("GCS_CLEARANCE", data.officer.clearance);
        }

        showAuthBanner(`✔ Password Verified! Welcome, ${data.officer.full_name}.`, "ok");

        // Update UI across dashboard and profile modal
        updateOfficerProfileUI(data.officer);

        setTimeout(() => {
            const loginOverlay = document.getElementById("tacticalLoginOverlay");
            const bootOverlay = document.getElementById("cinematicBootOverlay");
            if (loginOverlay) loginOverlay.classList.add("hidden-overlay");
            if (bootOverlay) bootOverlay.classList.add("hidden-overlay");

            if (loginBtn) {
                loginBtn.disabled = false;
                loginBtn.innerHTML = "<span>🔐</span><span>VERIFY CREDENTIALS &amp; ACCESS GCS</span>";
            }
        }, 250);

    } catch (err) {
        console.error("Login request failed:", err);
        if (loginBtn) {
            loginBtn.disabled = false;
            loginBtn.innerHTML = "<span>🔐</span><span>VERIFY CREDENTIALS &amp; ACCESS GCS</span>";
        }
        showAuthBanner("⚠ Unable to connect to DRDO Enclave Security Shield. Check backend status.", "err");
    }
}

/**
 * Handles Tactical Forgot Password Recovery (2-Step OTP Verification)
 */
let forgotRecoveryStep = 1;

async function handleForgotPasswordSubmit(event) {
    if (event) event.preventDefault();
    const btnSubmit = document.getElementById("btnForgotSubmit");
    const step1Grid = document.getElementById("forgotStep1Grid");
    const step2Grid = document.getElementById("forgotStep2Grid");

    if (forgotRecoveryStep === 1) {
        const email = document.getElementById("forgotEmail").value.trim();
        const serviceId = document.getElementById("forgotServiceId").value.trim();

        if (!email || !serviceId) {
            showAuthBanner("⚠ Please provide both your Registered Email and Officer Service ID.", "err");
            return;
        }

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>⏳</span><span>VALIDATING CREDENTIALS & GENERATING OTP...</span>";
        }

        try {
            const resp = await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, service_id: serviceId })
            });
            const data = await resp.json();
            if (btnSubmit) btnSubmit.disabled = false;

            if (data.ok) {
                forgotRecoveryStep = 2;
                if (step1Grid) step1Grid.style.display = "none";
                if (step2Grid) step2Grid.style.display = "grid";
                if (btnSubmit) {
                    btnSubmit.innerHTML = "<span>🛡️</span><span>CONFIRM RESET & UPDATE PASSWORD</span>";
                }
                const otpNotice = data.simulated_otp ? ` (Tactical OTP: ${data.simulated_otp})` : "";
                showAuthBanner(`✔ ${data.message}${otpNotice}. Enter the 6-digit code and your new password below.`, "ok");
                const otpInput = document.getElementById("forgotOtp");
                if (otpInput && data.simulated_otp) otpInput.value = data.simulated_otp;
            } else {
                showAuthBanner(`⚠ ${data.detail || "Authentication challenge failed. Verify Service ID."}`, "err");
            }
        } catch (e) {
            if (btnSubmit) btnSubmit.disabled = false;
            showAuthBanner("⚠ Server communication error during OTP request.", "err");
        }
    } else {
        const email = document.getElementById("forgotEmail").value.trim();
        const otp = document.getElementById("forgotOtp").value.trim();
        const newPwd = document.getElementById("forgotNewPwd").value;

        if (!otp || !newPwd) {
            showAuthBanner("⚠ Please enter both the 6-digit OTP and your new password.", "err");
            return;
        }

        if (newPwd.length < 6) {
            showAuthBanner("⚠ Password complexity requirement: Minimum 6 characters.", "err");
            return;
        }

        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.innerHTML = "<span>🔐</span><span>ENCRYPTING & RE-HASHING PASSWORD...</span>";
        }

        try {
            const resp = await fetch("/api/auth/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, new_password: newPwd })
            });
            const data = await resp.json();
            if (btnSubmit) btnSubmit.disabled = false;

            if (data.ok) {
                showAuthBanner(`✔ ${data.message} You can now log in with your new password.`, "ok");
                // Reset recovery state
                forgotRecoveryStep = 1;
                if (step1Grid) step1Grid.style.display = "grid";
                if (step2Grid) step2Grid.style.display = "none";
                if (btnSubmit) btnSubmit.innerHTML = "<span>📩</span><span>REQUEST TACTICAL RESET OTP</span>";

                // Pre-fill login
                const loginUser = document.getElementById("loginUsername");
                const loginPwd = document.getElementById("loginPassword");
                if (loginUser) loginUser.value = email;
                if (loginPwd) loginPwd.value = newPwd;

                setTimeout(() => {
                    switchAuthTab("login");
                }, 1200);
            } else {
                showAuthBanner(`⚠ ${data.detail || "Invalid or expired OTP token."}`, "err");
            }
        } catch (e) {
            if (btnSubmit) btnSubmit.disabled = false;
            showAuthBanner("⚠ Failed to connect to authentication enclave.", "err");
        }
    }
}

/**
 * Officer Profile Modal Controllers
 */
async function openOfficerProfileModal() {
    if (typeof openOfficerProfilePage === "function") {
        openOfficerProfilePage();
        return;
    }
    if (typeof activateWorkspacePage === "function") {
        activateWorkspacePage("officer-profile");
        return;
    }
}

function closeOfficerProfileModal() {
    if (typeof activateWorkspacePage === "function") {
        activateWorkspacePage("dashboard");
    }
}

function switchProfileTab(tab) {
    const infoForm = document.getElementById("profileInfoForm");
    const secForm = document.getElementById("profileSecurityForm");
    const auditPane = document.getElementById("profileAuditPane");
    const tabInfo = document.getElementById("tabBtnProfileInfo");
    const tabSec = document.getElementById("tabBtnProfileSecurity");
    const tabAudit = document.getElementById("tabBtnProfileAudit");
    const banner = document.getElementById("profileModalStatusBanner");
    if (banner) banner.style.display = "none";

    [tabInfo, tabSec, tabAudit].forEach(btn => {
        if (btn) {
            btn.classList.remove("active");
            btn.style.background = "transparent";
            btn.style.borderBottom = "2px solid transparent";
            btn.style.color = "#94a3b8";
        }
    });

    if (infoForm) infoForm.style.display = "none";
    if (secForm) secForm.style.display = "none";
    if (auditPane) auditPane.style.display = "none";

    if (tab === "security") {
        if (secForm) secForm.style.display = "block";
        if (tabSec) {
            tabSec.classList.add("active");
            tabSec.style.background = "#03142e";
            tabSec.style.borderBottom = "2px solid #00f0ff";
            tabSec.style.color = "#00f0ff";
        }
    } else if (tab === "audit") {
        if (auditPane) auditPane.style.display = "block";
        if (tabAudit) {
            tabAudit.classList.add("active");
            tabAudit.style.background = "#03142e";
            tabAudit.style.borderBottom = "2px solid #ffd54f";
            tabAudit.style.color = "#ffd54f";
        }
        loadProfileAuditJournal();
    } else {
        if (infoForm) infoForm.style.display = "block";
        if (tabInfo) {
            tabInfo.classList.add("active");
            tabInfo.style.background = "#03142e";
            tabInfo.style.borderBottom = "2px solid #00f0ff";
            tabInfo.style.color = "#00f0ff";
        }
    }
}

async function loadProfileAuditJournal() {
    const roleEl = document.getElementById("auditOfficerRoleDisplay");
    const clrEl = document.getElementById("auditOfficerClearanceDisplay");
    const scopesEl = document.getElementById("auditScopesList");
    const tableBody = document.getElementById("auditJournalTableBody");

    const token = sessionStorage.getItem("GCS_OFFICER_TOKEN");
    const headers = token ? { "Authorization": `Bearer ${token}` } : {};

    // 1. Fetch live RBAC clearance & profile
    try {
        const pResp = await fetch("/api/auth/profile", { headers });
        const pData = await pResp.json();
        if (pData.ok && pData.officer) {
            const off = pData.officer;
            if (roleEl) roleEl.innerText = (off.role || "CHIEF FLIGHT COMMANDER").toUpperCase();
            if (clrEl) clrEl.innerText = off.clearance || "LEVEL 5 COSMIC TOP SECRET";
        }
    } catch (e) {}

    // 2. Fetch CQRS audit log journal
    try {
        const jResp = await fetch("/api/cqrs/audit-log?limit=15");
        const jData = await jResp.json();
        if (jData.ok && Array.isArray(jData.journal) && jData.journal.length > 0) {
            if (tableBody) {
                tableBody.innerHTML = jData.journal.map(entry => {
                    const statusColor = entry.status === "COMMITTED_SUCCESS" ? "#00e676" : "#ff5252";
                    return `
                        <tr style="border-bottom:1px solid rgba(255,255,255,0.05); transition:background 0.2s;" onmouseover="this.style.background='rgba(0,212,255,0.05)'" onmouseout="this.style.background='transparent'">
                            <td style="padding:6px 8px; color:#00f0ff; font-weight:700;">${entry.command_id || entry.timestamp_utc}</td>
                            <td style="padding:6px 8px; color:#ffd54f;">${entry.command_type}</td>
                            <td style="padding:6px 8px; color:#cbd5e1;">${entry.issuer} <span style="font-size:9px; color:#64748b;">(${entry.role})</span></td>
                            <td style="padding:6px 8px; color:#94a3b8;">${entry.latency_ms} ms</td>
                            <td style="padding:6px 8px; color:${statusColor}; font-weight:700;">✔ ${entry.status}</td>
                        </tr>
                    `;
                }).join("");
            }
        } else {
            if (tableBody) {
                tableBody.innerHTML = `<tr><td colspan="5" style="padding:10px; text-align:center; color:#64748b;">No CQRS mutation records yet. Run a command (e.g. inject fault, clear faults) to populate the journal.</td></tr>`;
            }
        }
    } catch (err) {
        if (tableBody) {
            tableBody.innerHTML = `<tr><td colspan="5" style="padding:10px; text-align:center; color:#ff5252;">Failed to load CQRS audit journal: ${err.message}</td></tr>`;
        }
    }
}

async function handleProfileUpdateSubmit(event) {
    if (event) event.preventDefault();
    const banner = document.getElementById("profileModalStatusBanner");
    const token = sessionStorage.getItem("GCS_OFFICER_TOKEN");

    const payload = {
        full_name: document.getElementById("profFullName").value.trim(),
        email: document.getElementById("profEmail").value.trim(),
        mobile: document.getElementById("profMobile").value.trim(),
        address: document.getElementById("profAddress").value.trim(),
        sector: document.getElementById("profSector").value
    };

    try {
        const resp = await fetch("/api/auth/profile/update", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || "DEMO_OFFICER_SESSION_TOKEN"}`
            },
            body: JSON.stringify(payload)
        });
        const data = await resp.json();
        if (banner) {
            banner.style.display = "block";
            if (data.ok) {
                banner.style.background = "rgba(0, 230, 118, 0.15)";
                banner.style.border = "1px solid #00e676";
                banner.style.color = "#00e676";
                banner.innerHTML = `✔ ${data.message}`;
                updateOfficerProfileUI(data.officer);
            } else {
                banner.style.background = "rgba(255, 23, 68, 0.15)";
                banner.style.border = "1px solid #ff1744";
                banner.style.color = "#ff8a80";
                banner.innerHTML = `⚠ ${data.detail || "Profile update failed."}`;
            }
        }
    } catch (e) {
        if (banner) {
            banner.style.display = "block";
            banner.style.background = "rgba(0, 230, 118, 0.15)";
            banner.style.border = "1px solid #00e676";
            banner.style.color = "#00e676";
            banner.innerHTML = "✔ Local Profile updated (Air-gapped offline state).";
            updateOfficerProfileUI({
                full_name: payload.full_name,
                email: payload.email,
                mobile: payload.mobile,
                address: payload.address,
                sector: payload.sector,
                role: document.getElementById("profRole").value
            });
        }
    }
}

async function handleProfilePasswordSubmit(event) {
    if (event) event.preventDefault();
    const banner = document.getElementById("profileModalStatusBanner");
    const currentPassword = document.getElementById("profCurrentPwd").value;
    const newPassword = document.getElementById("profNewPwd").value;
    const confirmPassword = document.getElementById("profConfirmPwd").value;

    if (newPassword !== confirmPassword) {
        if (banner) {
            banner.style.display = "block";
            banner.style.background = "rgba(255, 23, 68, 0.15)";
            banner.style.border = "1px solid #ff1744";
            banner.style.color = "#ff8a80";
            banner.innerHTML = "⚠ New password and Confirm password do not match.";
        }
        return;
    }

    if (newPassword.length < 6) {
        if (banner) {
            banner.style.display = "block";
            banner.style.background = "rgba(255, 23, 68, 0.15)";
            banner.style.border = "1px solid #ff1744";
            banner.style.color = "#ff8a80";
            banner.innerHTML = "⚠ Password complexity requirement: Minimum 6 characters required.";
        }
        return;
    }

    const token = sessionStorage.getItem("GCS_OFFICER_TOKEN");

    try {
        const resp = await fetch("/api/auth/change-password", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || "DEMO_OFFICER_SESSION_TOKEN"}`
            },
            body: JSON.stringify({
                current_password: currentPassword,
                new_password: newPassword
            })
        });
        const data = await resp.json();
        if (banner) {
            banner.style.display = "block";
            if (data.ok) {
                banner.style.background = "rgba(0, 230, 118, 0.15)";
                banner.style.border = "1px solid #00e676";
                banner.style.color = "#00e676";
                banner.innerHTML = `✔ ${data.message} Defense credentials cipher updated successfully!`;
                document.getElementById("profCurrentPwd").value = "";
                document.getElementById("profNewPwd").value = "";
                document.getElementById("profConfirmPwd").value = "";
                document.getElementById("pwdStrengthFill").style.width = "0%";
            } else {
                banner.style.background = "rgba(255, 23, 68, 0.15)";
                banner.style.border = "1px solid #ff1744";
                banner.style.color = "#ff8a80";
                banner.innerHTML = `⚠ ${data.detail || "Password update failed."}`;
            }
        }
    } catch (e) {
        if (banner) {
            banner.style.display = "block";
            banner.style.background = "rgba(255, 23, 68, 0.15)";
            banner.style.border = "1px solid #ff1744";
            banner.style.color = "#ff8a80";
            banner.innerHTML = "⚠ Network or server communication error.";
        }
    }
}

function checkPasswordStrength(pwd) {
    const fill = document.getElementById("pwdStrengthFill");
    if (!fill) return;
    if (!pwd) {
        fill.style.width = "0%";
        return;
    }
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) score += 25;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;

    fill.style.width = `${score}%`;
    if (score <= 25) {
        fill.style.background = "#ff1744";
    } else if (score <= 50) {
        fill.style.background = "#ff9100";
    } else if (score <= 75) {
        fill.style.background = "#ffd600";
    } else {
        fill.style.background = "#00e676";
    }
}

function handleOfficerLogout() {
    const token = sessionStorage.getItem("GCS_OFFICER_TOKEN");
    if (token) {
        fetch("/api/auth/logout", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => {});
    }
    sessionStorage.removeItem("GCS_OFFICER_TOKEN");
    sessionStorage.removeItem("GCS_CLEARANCE");
    closeOfficerProfileModal();
    openLoginScreen();
    showAuthBanner("🔒 Officer session securely terminated. Cryptographic keys revoked on server enclave.", "ok");
}

function showAuthBanner(msg, type) {
    const el = document.getElementById("authStatusBanner");
    if (!el) return;
    el.innerText = msg;
    el.className = `auth-status-banner show ${type === "err" ? "err" : "ok"}`;
}

function hideAuthBanner() {
    const el = document.getElementById("authStatusBanner");
    if (el) el.className = "auth-status-banner";
}

/**
 * Re-opens the Login / Sign Up Portal from the Dashboard Header
 */
function openLoginScreen() {
    const bootOverlay = document.getElementById("cinematicBootOverlay");
    const loginOverlay = document.getElementById("tacticalLoginOverlay");
    if (bootOverlay) bootOverlay.classList.add("hidden-overlay");
    if (loginOverlay) loginOverlay.classList.remove("hidden-overlay");
}

/**
 * 60 FPS Starfield Canvas for the 4-Stage Boot Sequence (Throttled when hidden)
 */
function initBootStarfieldCanvas() {
    const canvas = document.getElementById("bootStarfieldCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const stars = Array.from({ length: 80 }, () => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        r: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.75 + 0.2,
        speed: Math.random() * 0.35 + 0.08
    }));

    function draw() {
        const bootOverlay = document.getElementById("cinematicBootOverlay");
        if (bootOverlay && !bootOverlay.classList.contains("hidden-overlay")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            stars.forEach(s => {
                s.y -= s.speed;
                if (s.y < 0) {
                    s.y = canvas.height;
                    s.x = Math.random() * canvas.width;
                }
                ctx.fillStyle = `rgba(165, 235, 255, ${s.alpha})`;
                ctx.beginPath();
                ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(draw);
        } else {
            setTimeout(() => requestAnimationFrame(draw), 1000);
        }
    }
    requestAnimationFrame(draw);
}

/**
 * 60 FPS Laminar Intake Stream & Fiery Exhaust Plume on Stage 4 Engine (Throttled when hidden)
 */
function initStage4EngineStreamCanvas() {
    const canvas = document.getElementById("stage4EngineParticleCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const particles = Array.from({ length: 40 }, (_, i) => ({
        type: i < 20 ? "intake" : "exhaust",
        x: Math.random() * canvas.width,
        y: 135 + (Math.random() - 0.5) * 90,
        vx: Math.random() * 4.5 + 3.0,
        size: Math.random() * 2.8 + 1.2,
        alpha: Math.random() * 0.75 + 0.25
    }));

    function render() {
        const bootOverlay = document.getElementById("cinematicBootOverlay");
        if (bootOverlay && !bootOverlay.classList.contains("hidden-overlay") && BootLoginController.currentStage === 4) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.x += p.vx;
                if (p.type === "intake") {
                    if (p.x > 210) p.x = 10;
                    ctx.fillStyle = `rgba(0, 225, 255, ${p.alpha})`;
                    ctx.shadowColor = "#00f0ff";
                } else {
                    if (p.x > canvas.width - 10 || p.x < 430) p.x = 435;
                    ctx.fillStyle = `rgba(255, 110, 20, ${p.alpha})`;
                    ctx.shadowColor = "#ff4500";
                }
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            });
            requestAnimationFrame(render);
        } else {
            setTimeout(() => requestAnimationFrame(render), 1000);
        }
    }
    requestAnimationFrame(render);
}

function initLoginHudCanvas() {
    const canvas = document.getElementById("loginHudCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    let angle = 0;
    function render() {
        const loginOverlay = document.getElementById("tacticalLoginOverlay");
        if (loginOverlay && !loginOverlay.classList.contains("hidden-overlay")) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const cx = canvas.width / 2;
            const cy = canvas.height / 2;
            angle += 0.003;

            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(angle);
            ctx.strokeStyle = "rgba(0, 212, 255, 0.1)";
            ctx.lineWidth = 1.5;
            ctx.setLineDash([14, 10]);
            ctx.beginPath();
            ctx.arc(0, 0, Math.min(canvas.width, canvas.height) * 0.45, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
            requestAnimationFrame(render);
        } else {
            setTimeout(() => requestAnimationFrame(render), 1000);
        }
    }
    requestAnimationFrame(render);
}

/**
 * ---------------------------------------------------------------------------
 * INTERACTIVE 3D HOLOGRAPHIC DRDO TAPAS BH-201 UAV & AERO ENGINE TWIN
 * ---------------------------------------------------------------------------
 */
const HoloEngineState = {
    mode: "drone", // "drone" (default) | "cyber" | "thermal"
    orbitActive: true,
    yaw: 0.35,
    pitch: 0.22,
    targetYaw: 0.35,
    targetPitch: 0.22,
    isMouseOver: false,
    pulseRadius: 0,
    pulseActive: false,
    pulseAlpha: 0,
    fftPhase: 0
};

function handleHoloMouseMove(event) {
    const wrap = document.getElementById("showcaseCanvasWrapper");
    if (!wrap) return;
    const rect = wrap.getBoundingClientRect();
    const mx = (event.clientX - rect.left) / rect.width;
    const my = (event.clientY - rect.top) / rect.height;

    HoloEngineState.isMouseOver = true;
    HoloEngineState.targetYaw = (mx - 0.5) * 2.2;
    HoloEngineState.targetPitch = 0.22 + (my - 0.5) * 1.1;
}

function handleHoloMouseLeave() {
    HoloEngineState.isMouseOver = false;
}

function setHoloEngineMode(mode) {
    HoloEngineState.mode = mode;
    const btnD = document.getElementById("btnHoloModeDrone");
    const btnC = document.getElementById("btnHoloModeCyber");
    const btnT = document.getElementById("btnHoloModeThermal");
    if (btnD) btnD.classList.toggle("active", mode === "drone");
    if (btnC) btnC.classList.toggle("active", mode === "cyber");
    if (btnT) btnT.classList.toggle("active", mode === "thermal");

    const titleEl = document.getElementById("holoShowcaseTitle");
    const subEl = document.getElementById("holoShowcaseSub");
    const tag1 = document.getElementById("holoTagCyl1");
    const tag2 = document.getElementById("holoTagCyl2");
    const tag3 = document.getElementById("holoTagCyl3");
    const tag4 = document.getElementById("holoTagCyl4");
    const tagTurbo = document.getElementById("holoTagTurbo");

    if (mode === "drone") {
        if (titleEl) titleEl.innerText = "DRDO TAPAS BH-201 // 3D UAV ROTATING HOLOGRAPHIC TWIN";
        if (subEl) subEl.innerText = "Tactical Airborne Platform Digital Twin • Indian Defense MALE UAV";
        if (tag1) tag1.innerText = "ALT: 28,500 FT";
        if (tag2) tag2.innerText = "IAS: 142 KTS";
        if (tag3) tag3.innerText = "NavIC: 12 SATS LOCK";
        if (tag4) tag4.innerText = "EO/IR: ACTIVE";
        if (tagTurbo) tagTurbo.innerText = "PUSHER: 2,450 RPM";
    } else if (mode === "cyber") {
        if (titleEl) titleEl.innerText = "ROTAX 914 F // 3D AERO ENGINE CYBER CORE";
        if (subEl) subEl.innerText = "Horizontally Opposed 4-Cylinder Turbocharged Twin • FADEC 2.0";
        if (tag1) tag1.innerText = "CYL-1: 182°C";
        if (tag2) tag2.innerText = "CYL-2: 179°C";
        if (tag3) tag3.innerText = "CYL-3: 185°C";
        if (tag4) tag4.innerText = "CYL-4: 181°C";
        if (tagTurbo) tagTurbo.innerText = "TURBO: 1.35 bar";
    } else if (mode === "thermal") {
        if (titleEl) titleEl.innerText = "THERMAL FLIR // INFRARED THERMODYNAMIC HEATMAP";
        if (subEl) subEl.innerText = "Physics-Informed CHT / EGT Combustion Flamefront Gradient";
        if (tag1) tag1.innerText = "CYL-1: 182°C (OK)";
        if (tag2) tag2.innerText = "CYL-2: 179°C (OK)";
        if (tag3) tag3.innerText = "CYL-3: 185°C (OK)";
        if (tag4) tag4.innerText = "CYL-4: 181°C (OK)";
        if (tagTurbo) tagTurbo.innerText = "TURBINE: 920°C";
    }
}

function triggerHoloPulseScan() {
    HoloEngineState.pulseActive = true;
    HoloEngineState.pulseRadius = 8;
    HoloEngineState.pulseAlpha = 1.0;

    const overlay = document.getElementById("holoScanOverlay");
    if (overlay) {
        overlay.style.background = "radial-gradient(circle, rgba(0, 255, 180, 0.3) 0%, transparent 70%)";
        overlay.style.opacity = "1";
        setTimeout(() => { overlay.style.opacity = "0"; }, 400);
    }
}

function quickFillEnclaveDemo() {
    // Production Mode: Instant bypass & demo auto-fill permanently disabled
}

function initInteractiveHoloEngineCanvas() {
    const canvas = document.getElementById("loginInteractiveHoloCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = (rect.width || 560) * dpr;
        canvas.height = (rect.height || 300) * dpr;
        ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    // Engine Model Vertices (for engine/thermal modes)
    const baseCrankcase = [
        [-52, -26, -36], [52, -26, -36], [52, 26, -36], [-52, 26, -36],
        [-52, -26, 36], [52, -26, 36], [52, 26, 36], [-52, 26, 36]
    ];
    const crankcaseEdges = [
        [0,1],[1,2],[2,3],[3,0],
        [4,5],[5,6],[6,7],[7,4],
        [0,4],[1,5],[2,6],[3,7]
    ];
    const cylinders = [
        { id: 1, cx: -95, cy: -15, cz: -16, rad: 22, temp: 182 },
        { id: 2, cx: 95, cy: -15, cz: 16, rad: 22, temp: 179 },
        { id: 3, cx: -95, cy: 15, cz: 16, rad: 22, temp: 185 },
        { id: 4, cx: 95, cy: 15, cz: -16, rad: 22, temp: 181 }
    ];
    const turboCenter = [0, -68, 0];

    // DRDO Tapas BH-201 MALE UAV 3D Mesh Geometry
    const droneFuselageRings = [
        { z: 118, cx: 0, cy: -1, rx: 1.5, ry: 1.5 },   // 0. Nose tip
        { z: 95,  cx: 0, cy: -3, rx: 11,  ry: 9 },     // 1. SATCOM radome bulb
        { z: 62,  cx: 0, cy: -4, rx: 14,  ry: 12 },    // 2. Forward avionics
        { z: 15,  cx: 0, cy: -5, rx: 17,  ry: 13 },    // 3. Wing root carry-through
        { z: -20, cx: 0, cy: -4, rx: 15,  ry: 12 },    // 4. Fuel cell midbody
        { z: -52, cx: 0, cy: -3, rx: 13,  ry: 10 },    // 5. Rotax engine cowling
        { z: -68, cx: 0, cy: -4, rx: 7,   ry: 7 }      // 6. Pusher firewall
    ];

    let t = 0;

    function renderHolo() {
        const overlay = document.getElementById("tacticalLoginOverlay");
        if (overlay && overlay.classList.contains("hidden-overlay")) {
            setTimeout(() => requestAnimationFrame(renderHolo), 1000);
            return;
        }

        const rect = canvas.getBoundingClientRect();
        const cw = rect.width || 560;
        const ch = rect.height || 300;
        ctx.clearRect(0, 0, cw, ch);

        t += 0.02;

        // Smooth rotation interpolation
        if (HoloEngineState.isMouseOver) {
            HoloEngineState.yaw += (HoloEngineState.targetYaw - HoloEngineState.yaw) * 0.08;
            HoloEngineState.pitch += (HoloEngineState.targetPitch - HoloEngineState.pitch) * 0.08;
        } else if (HoloEngineState.orbitActive) {
            HoloEngineState.yaw += 0.012; // Continuous elegant 360 rotating drone hologram
            HoloEngineState.pitch = 0.22 + Math.sin(t * 0.6) * 0.04;
        }

        const cosY = Math.cos(HoloEngineState.yaw);
        const sinY = Math.sin(HoloEngineState.yaw);
        const cosP = Math.cos(HoloEngineState.pitch);
        const sinP = Math.sin(HoloEngineState.pitch);

        function project(x, y, z) {
            const x1 = x * cosY + z * sinY;
            const z1 = -x * sinY + z * cosY;
            const y1 = y * cosP - z1 * sinP;
            const z2 = y * sinP + z1 * cosP;
            const fov = 380;
            const scale = fov / (fov + z2 + 95);
            return [cw / 2 + x1 * scale, ch / 2 + y1 * scale, z2, scale];
        }

        const isThermal = HoloEngineState.mode === "thermal";
        const isDrone = HoloEngineState.mode === "drone";
        const primaryColor = isThermal ? "#ff6b00" : (isDrone ? "#00f0ff" : "#00e5ff");
        const secondaryColor = isThermal ? "#ff0055" : (isDrone ? "#00e676" : "#0077ff");
        const gridColor = isThermal ? "rgba(255, 107, 0, 0.16)" : "rgba(0, 212, 255, 0.18)";

        // 1. Holographic Base Radar Ring with Compass & Altitude Plane
        ctx.save();
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);

        const [gcx, gcy] = project(0, 42, 0);
        const ringScale = cosP * 0.55 + 0.45;
        // Outer Radar Range Ring
        ctx.beginPath();
        ctx.ellipse(gcx, gcy, 180 * ringScale, 75 * ringScale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Range Ring
        ctx.beginPath();
        ctx.ellipse(gcx, gcy, 110 * ringScale, 46 * ringScale, 0, 0, Math.PI * 2);
        ctx.stroke();

        // Radial Heading Spokes (000°, 090°, 180°, 270°)
        ctx.setLineDash([2, 8]);
        const spokeAngles = [0, Math.PI * 0.5, Math.PI, Math.PI * 1.5];
        spokeAngles.forEach(ang => {
            const sx = Math.cos(ang + HoloEngineState.yaw) * 180;
            const sz = Math.sin(ang + HoloEngineState.yaw) * 180;
            const pSpoke = project(sx, 42, sz);
            ctx.beginPath();
            ctx.moveTo(gcx, gcy);
            ctx.lineTo(pSpoke[0], pSpoke[1]);
            ctx.stroke();
        });

        // Rotating Sweeping Radar Scan Ray
        const scanAng = t * 2.2;
        const scanX = Math.cos(scanAng) * 175;
        const scanZ = Math.sin(scanAng) * 175;
        const pScan = project(scanX, 42, scanZ);
        ctx.strokeStyle = isThermal ? "rgba(255, 107, 0, 0.5)" : "rgba(0, 230, 118, 0.55)";
        ctx.lineWidth = 1.6;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.moveTo(gcx, gcy);
        ctx.lineTo(pScan[0], pScan[1]);
        ctx.stroke();
        ctx.restore();

        // ===================================================================
        // MODE A: DRDO TAPAS BH-201 MALE UAV 3D ROTATING HOLOGRAPHIC AIRFRAME
        // ===================================================================
        if (isDrone) {
            ctx.save();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 1.5;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 8;

            // Project all fuselage rings
            const ringPolys = droneFuselageRings.map(r => {
                const pts = [];
                const steps = 10;
                for (let i = 0; i < steps; i++) {
                    const ang = (i / steps) * Math.PI * 2;
                    const x = r.cx + Math.cos(ang) * r.rx;
                    const y = r.cy + Math.sin(ang) * r.ry;
                    pts.push(project(x, y, r.z));
                }
                return { z: r.z, pts };
            });

            // Draw fuselage cross-section rings
            ringPolys.forEach(r => {
                ctx.beginPath();
                r.pts.forEach((p, idx) => {
                    if (idx === 0) ctx.moveTo(p[0], p[1]);
                    else ctx.lineTo(p[0], p[1]);
                });
                ctx.closePath();
                ctx.stroke();
            });

            // Longitudinal stringers (Top dorsal, Bottom belly, Left, Right)
            const stringerIndices = [0, 2, 5, 7]; // top, right, bottom, left
            stringerIndices.forEach(sIdx => {
                ctx.beginPath();
                for (let k = 0; k < ringPolys.length; k++) {
                    const pt = ringPolys[k].pts[sIdx];
                    if (k === 0) ctx.moveTo(pt[0], pt[1]);
                    else ctx.lineTo(pt[0], pt[1]);
                }
                ctx.stroke();
            });

            // EO/IR Gimbal Surveillance Turret (under nose at z=88)
            const turretCenter = project(0, 10, 88);
            ctx.fillStyle = "#00e676";
            ctx.beginPath();
            ctx.arc(turretCenter[0], turretCenter[1], 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Downward Laser Designator Beam
            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = "rgba(0, 255, 180, 0.45)";
            const turretTarget = project(0, 42, 110);
            ctx.beginPath();
            ctx.moveTo(turretCenter[0], turretCenter[1]);
            ctx.lineTo(turretTarget[0], turretTarget[1]);
            ctx.stroke();
            ctx.restore();

            // ===============================================================
            // High-Aspect Ratio Wings & Winglets
            // ===============================================================
            const wingStations = [
                { x: 17,  lez: 16, tez: -14, y: -4 },
                { x: 42,  lez: 14, tez: -10, y: -4 },
                { x: 88,  lez: 10, tez: -7,  y: -5 },
                { x: 140, lez: 5,  tez: -5,  y: -6 },
                { x: 195, lez: 0,  tez: -3,  y: -8 }
            ];

            [-1, 1].forEach(side => {
                // Leading edge line
                ctx.beginPath();
                for (let i = 0; i < wingStations.length; i++) {
                    const ws = wingStations[i];
                    const p = project(ws.x * side, ws.y, ws.lez);
                    if (i === 0) ctx.moveTo(p[0], p[1]);
                    else ctx.lineTo(p[0], p[1]);
                }
                ctx.stroke();

                // Trailing edge line
                ctx.beginPath();
                for (let i = 0; i < wingStations.length; i++) {
                    const ws = wingStations[i];
                    const p = project(ws.x * side, ws.y, ws.tez);
                    if (i === 0) ctx.moveTo(p[0], p[1]);
                    else ctx.lineTo(p[0], p[1]);
                }
                ctx.stroke();

                // Wing Ribs at stations
                wingStations.forEach(ws => {
                    const ple = project(ws.x * side, ws.y, ws.lez);
                    const pte = project(ws.x * side, ws.y, ws.tez);
                    ctx.beginPath();
                    ctx.moveTo(ple[0], ple[1]);
                    ctx.lineTo(pte[0], pte[1]);
                    ctx.stroke();
                });

                // Aerodynamic Winglets (curved upwards at wingtips)
                const pTipLE = project(195 * side, -8, 0);
                const pTipTE = project(195 * side, -8, -3);
                const pWingletTop = project(204 * side, -24, -2);

                ctx.beginPath();
                ctx.moveTo(pTipLE[0], pTipLE[1]);
                ctx.lineTo(pWingletTop[0], pWingletTop[1]);
                ctx.lineTo(pTipTE[0], pTipTE[1]);
                ctx.stroke();

                // Navigation Strobe Lights on Winglets (Port Red, Starboard Green)
                const strobeCol = side === -1 ? "#ff1744" : "#00e676";
                ctx.fillStyle = strobeCol;
                ctx.shadowColor = strobeCol;
                ctx.shadowBlur = 12;
                ctx.beginPath();
                ctx.arc(pWingletTop[0], pWingletTop[1], 3.8 + Math.sin(t * 8) * 1.2, 0, Math.PI * 2);
                ctx.fill();
            });

            // ===============================================================
            // Twin Tail Booms & Inverted V-Tail
            // ===============================================================
            [-1, 1].forEach(side => {
                const bx = 42 * side;
                const pB0 = project(bx, -4, -10);
                const pB1 = project(bx, -4, -55);
                const pB2 = project(bx, -3, -95);
                const pB3 = project(bx, -3, -125);

                // Boom longitudinal beam
                ctx.beginPath();
                ctx.moveTo(pB0[0], pB0[1]);
                ctx.lineTo(pB1[0], pB1[1]);
                ctx.lineTo(pB2[0], pB2[1]);
                ctx.lineTo(pB3[0], pB3[1]);
                ctx.stroke();

                // Boom rings
                [pB1, pB2].forEach(bp => {
                    ctx.beginPath();
                    ctx.arc(bp[0], bp[1], 3.2, 0, Math.PI * 2);
                    ctx.stroke();
                });

                // Inverted V-Tail Fins
                const pFinTop = project(bx, -30, -132);
                const pFinBottom = project(bx, 10, -128);

                ctx.beginPath();
                ctx.moveTo(pB3[0], pB3[1]);
                ctx.lineTo(pFinTop[0], pFinTop[1]);
                ctx.lineTo(pB3[0], pB3[1]);
                ctx.lineTo(pFinBottom[0], pFinBottom[1]);
                ctx.stroke();

                // White Anti-Collision Strobe on Tail
                ctx.fillStyle = "#ffffff";
                ctx.shadowColor = "#ffffff";
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(pFinTop[0], pFinTop[1], 2.8, 0, Math.PI * 2);
                ctx.fill();
            });

            // Horizontal Stabilizer connecting twin boom fins
            const pStabL = project(-42, -26, -130);
            const pStabR = project(42, -26, -130);
            ctx.beginPath();
            ctx.moveTo(pStabL[0], pStabL[1]);
            ctx.lineTo(pStabR[0], pStabR[1]);
            ctx.stroke();

            // ===============================================================
            // Spinning Pusher Propeller (Behind Engine Nacelle)
            // ===============================================================
            const hubPt = project(0, -4, -72);
            ctx.fillStyle = "#ffd54f";
            ctx.beginPath();
            ctx.arc(hubPt[0], hubPt[1], 4.5, 0, Math.PI * 2);
            ctx.fill();

            // 3 Spinning Propeller Blades
            const propBlades = 3;
            const propRadius = 28;
            const propSpin = t * 18;

            for (let b = 0; b < propBlades; b++) {
                const bAng = propSpin + (b / propBlades) * Math.PI * 2;
                const bx = Math.cos(bAng) * propRadius;
                const by = -4 + Math.sin(bAng) * propRadius;
                const tipPt = project(bx, by, -72);

                ctx.strokeStyle = "#ffd54f";
                ctx.lineWidth = 2.2;
                ctx.beginPath();
                ctx.moveTo(hubPt[0], hubPt[1]);
                ctx.lineTo(tipPt[0], tipPt[1]);
                ctx.stroke();
            }

            // Holographic Propeller Blur Disc Arc
            ctx.strokeStyle = "rgba(255, 213, 79, 0.35)";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            for (let k = 0; k <= 16; k++) {
                const ang = (k / 16) * Math.PI * 2;
                const bx = Math.cos(ang) * propRadius;
                const by = -4 + Math.sin(ang) * propRadius;
                const pt = project(bx, by, -72);
                if (k === 0) ctx.moveTo(pt[0], pt[1]);
                else ctx.lineTo(pt[0], pt[1]);
            }
            ctx.stroke();

            // Tricycle Landing Gear Struts
            const pNoseStrutTop = project(0, 8, 70);
            const pNoseStrutBot = project(0, 22, 70);
            ctx.strokeStyle = "#00d4ff";
            ctx.lineWidth = 1.8;
            ctx.beginPath();
            ctx.moveTo(pNoseStrutTop[0], pNoseStrutTop[1]);
            ctx.lineTo(pNoseStrutBot[0], pNoseStrutBot[1]);
            ctx.stroke();

            [-34, 34].forEach(gx => {
                const pMainTop = project(gx, 5, -8);
                const pMainBot = project(gx, 23, -8);
                ctx.beginPath();
                ctx.moveTo(pMainTop[0], pMainTop[1]);
                ctx.lineTo(pMainBot[0], pMainBot[1]);
                ctx.stroke();
            });

            ctx.restore();

        } else {
            // ===============================================================
            // MODE B & C: ROTAX 914 F ENGINE CYBER / THERMAL HEATMAP
            // ===============================================================
            ctx.save();
            ctx.strokeStyle = primaryColor;
            ctx.lineWidth = 1.6;
            ctx.shadowColor = primaryColor;
            ctx.shadowBlur = 8;

            const projCrank = baseCrankcase.map(([x, y, z]) => project(x, y, z));
            crankcaseEdges.forEach(([i, j]) => {
                const p1 = projCrank[i];
                const p2 = projCrank[j];
                ctx.beginPath();
                ctx.moveTo(p1[0], p1[1]);
                ctx.lineTo(p2[0], p2[1]);
                ctx.stroke();
            });

            cylinders.forEach(cyl => {
                const numRings = 5;
                const dir = cyl.cx < 0 ? -1 : 1;
                const startX = dir > 0 ? 52 : -52;
                const endX = dir > 0 ? 122 : -122;

                for (let r = 0; r <= numRings; r++) {
                    const rx = startX + (endX - startX) * (r / numRings);
                    const ringCol = isThermal
                        ? (cyl.temp > 182 ? "#ff2a2a" : "#ff9100")
                        : (r === numRings ? "#00e676" : "#00d4ff");

                    ctx.strokeStyle = ringCol;
                    ctx.lineWidth = r === numRings ? 2.0 : 1.2;
                    ctx.beginPath();
                    const ringPts = 12;
                    for (let k = 0; k <= ringPts; k++) {
                        const ang = (k / ringPts) * Math.PI * 2;
                        const y = cyl.cy + Math.sin(ang) * cyl.rad;
                        const z = cyl.cz + Math.cos(ang) * cyl.rad;
                        const pt = project(rx, y, z);
                        if (k === 0) ctx.moveTo(pt[0], pt[1]);
                        else ctx.lineTo(pt[0], pt[1]);
                    }
                    ctx.stroke();
                }

                // Central Piston stroke node
                const strokeOffset = Math.sin(t * 4 + cyl.id) * 14;
                const pistonPt = project(startX + (endX - startX) * 0.5 + strokeOffset * dir, cyl.cy, cyl.cz);
                ctx.fillStyle = isThermal ? "#ff3d00" : "#00f0ff";
                ctx.beginPath();
                ctx.arc(pistonPt[0], pistonPt[1], 3.5, 0, Math.PI * 2);
                ctx.fill();

                // Spark plug head
                const headPt = project(endX, cyl.cy, cyl.cz);
                ctx.fillStyle = cyl.id === 3 ? "#ff9100" : "#00e676";
                ctx.beginPath();
                ctx.arc(headPt[0], headPt[1], 4.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Turbocharger Impeller
            const turboPt = project(turboCenter[0], turboCenter[1], turboCenter[2]);
            ctx.strokeStyle = isThermal ? "#ff1744" : "#00f0ff";
            ctx.lineWidth = 1.8;
            const blades = 8;
            const bladeLen = 22;
            for (let b = 0; b < blades; b++) {
                const bAng = t * 6 + (b / blades) * Math.PI * 2;
                const bx = turboCenter[0] + Math.cos(bAng) * bladeLen;
                const by = turboCenter[1] + Math.sin(bAng) * (bladeLen * 0.6);
                const bz = turboCenter[2] + Math.sin(bAng) * (bladeLen * 0.4);
                const pBlade = project(bx, by, bz);
                ctx.beginPath();
                ctx.moveTo(turboPt[0], turboPt[1]);
                ctx.lineTo(pBlade[0], pBlade[1]);
                ctx.stroke();
            }

            ctx.restore();
        }

        // ===================================================================
        // 5. Diagnostic Sonar Pulse Scan Wave if triggered
        // ===================================================================
        if (HoloEngineState.pulseActive) {
            HoloEngineState.pulseRadius += 5.5;
            HoloEngineState.pulseAlpha -= 0.02;

            if (HoloEngineState.pulseAlpha <= 0) {
                HoloEngineState.pulseActive = false;
            } else {
                const [cx, cy] = project(0, 0, 0);
                ctx.save();
                ctx.strokeStyle = `rgba(0, 255, 180, ${HoloEngineState.pulseAlpha})`;
                ctx.lineWidth = 2.5;
                ctx.shadowColor = "#00e676";
                ctx.shadowBlur = 16;
                ctx.beginPath();
                ctx.arc(cx, cy, HoloEngineState.pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
        }

        requestAnimationFrame(renderHolo);
    }

    requestAnimationFrame(renderHolo);
}


function initLoginFftWaveCanvas() {
    const canvas = document.getElementById("loginFftWaveCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let phase = 0;
    function renderWave() {
        const overlay = document.getElementById("tacticalLoginOverlay");
        if (overlay && overlay.classList.contains("hidden-overlay")) {
            setTimeout(() => requestAnimationFrame(renderWave), 1000);
            return;
        }

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        phase += 0.04;

        // Gradient wave
        const grad = ctx.createLinearGradient(0, 0, w, 0);
        grad.addColorStop(0, "#00d4ff");
        grad.addColorStop(0.5, "#00e676");
        grad.addColorStop(1, "#00f0ff");

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, h / 2);

        for (let x = 0; x < w; x += 4) {
            const freq1 = Math.sin((x * 0.035) + phase) * 8;
            const freq2 = Math.cos((x * 0.07) - phase * 1.5) * 4;
            const freq3 = Math.sin((x * 0.12) + phase * 2.2) * 2;
            const y = h / 2 + freq1 + freq2 + freq3;
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 6;
        ctx.stroke();

        ctx.strokeStyle = "rgba(0, 212, 255, 0.15)";
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(0, h / 2);
        ctx.lineTo(w, h / 2);
        ctx.stroke();
        ctx.restore();

        requestAnimationFrame(renderWave);
    }
    requestAnimationFrame(renderWave);
}

// Export functions globally
window.startCinematicBootSequence = startCinematicBootSequence;
window.jumpToBootStage = jumpToBootStage;
window.toggleBootPause = toggleBootPause;
window.transitionBootToLogin = transitionBootToLogin;
window.switchAuthTab = switchAuthTab;
window.openForgotPasswordPane = openForgotPasswordPane;
window.handleForgotPasswordSubmit = handleForgotPasswordSubmit;
window.togglePasswordVisibility = togglePasswordVisibility;
window.generateRandomSignupPin = generateRandomSignupPin;
window.handleSignupSubmit = handleSignupSubmit;
window.handleLoginSubmit = handleLoginSubmit;
window.openLoginScreen = openLoginScreen;
window.openOfficerProfileModal = openOfficerProfileModal;
window.closeOfficerProfileModal = closeOfficerProfileModal;
window.switchProfileTab = switchProfileTab;
window.handleProfileUpdateSubmit = handleProfileUpdateSubmit;
window.handleProfilePasswordSubmit = handleProfilePasswordSubmit;
window.checkPasswordStrength = checkPasswordStrength;
window.handleOfficerLogout = handleOfficerLogout;
window.updateOfficerProfileUI = updateOfficerProfileUI;
window.openVerifyAccountPane = openVerifyAccountPane;
window.handleAccountVerificationSubmit = handleAccountVerificationSubmit;
window.loadProfileAuditJournal = loadProfileAuditJournal;
window.quickFillEnclaveDemo = quickFillEnclaveDemo;
window.setHoloEngineMode = setHoloEngineMode;
window.triggerHoloPulseScan = triggerHoloPulseScan;
window.handleHoloMouseMove = handleHoloMouseMove;
window.handleHoloMouseLeave = handleHoloMouseLeave;

document.addEventListener("DOMContentLoaded", initBootAndLoginSystem);


/**
 * Production Hardening & Anti-Tamper Immutability Guard
 */
(function lockProductionEnvironment() {
    // Disable right-click inspection
    document.addEventListener("contextmenu", function(e) {
        e.preventDefault();
    }, { capture: true });

    // Block keyboard inspection shortcuts
    document.addEventListener("keydown", function(e) {
        if (e.key === "F12" || 
            (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
            (e.ctrlKey && (e.key === "u" || e.key === "U"))) {
            e.preventDefault();
            return false;
        }
    }, { capture: true });

    // Ensure entire workspace is immutable
    document.querySelectorAll("[contenteditable]").forEach(el => el.removeAttribute("contenteditable"));

    // Suppress console debug logging in production
    if (window.console) {
        const noop = function() {};
        window.console.debug = noop;
    }
})();
