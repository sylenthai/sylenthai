const MODULES = {
  core: {
    title: "CollatzCoreReductions.lean — Core Dynamics & Global Closure (39 decls)",
    items: [
      {
        name: "collatzIter_trajectory_identity",
        desc: "Proves exact trajectory law 2^k · F^k(n) = 3^{w_k} · n + C_k alongside universal high-seed descent."
      },
      {
        name: "target_A_and_target_B_imply_global_collatz",
        desc: "Constructive strong-induction master reduction proving Target A ∧ Target B → GlobalCollatzConjecture without Iff.rfl."
      },
      {
        name: "cylinder_measure_decay_bound",
        desc: "Establishes Mod-2^30 cylinder measure decay (6,979,657 · 153)^s ≤ (2^30)^s and zero-gap quotient contraction."
      }
    ]
  },
  targetA: {
    title: "CollatzTargetA_Asymptotic.lean — Cycle Obstructions & Dual-Adic Collapse (40 decls)",
    items: [
      {
        name: "genuine_cycle_dual_adic_collapse",
        desc: "For any genuine cycle n₀(2^K − 3^W) = S, proves the unique 2-adic root u and 3-adic root v collapse to u = v = n₀."
      },
      {
        name: "supercritical_prefix_exclusion",
        desc: "Derives unconditional 2-adic lower bounds n₀ ≥ (2^{mE} − C) / (3^p − 2^E) eliminating large cycles above Rhin–Hercher."
      },
      {
        name: "inverse_2adic_overflow_contradiction",
        desc: "Proves propagation of forward-inverse duality R_j + 3^r · 2^{a_j} · n_j = 2^K · n₀."
      }
    ]
  },
  targetB: {
    title: "CollatzTargetB_Stammering.lean — Divergence Exclusions & Carry Sandwich (25 decls)",
    items: [
      {
        name: "stammer_bit_exhaustion_lower_bound",
        desc: "Proves L consecutive supercritical repetitions force 2^{LA} | (3^p − 2^A)n_M + C and excludes eventually periodic supercritical orbits."
      },
      {
        name: "reduction_C1_carry_subcriticality_implies_contraction",
        desc: "Formalizes core-surfing carry sandwich 6144(2F(n)) ≤ 6145(3n) on odd n > 2048 forcing F^K(n₀) < n₀."
      },
      {
        name: "ridout_exponent_ceiling_integer_form",
        desc: "Proves integer 2-adic Ridout exponent ceiling 2^{a_W} n_W ≤ (n₀ + 1) H (τ_W ≤ 1)."
      }
    ]
  }
};

const navBtns = document.querySelectorAll(".nav-btn");
const sections = document.querySelectorAll(".section");
const crumb = document.getElementById("active-crumb");

function activateSection(id) {
  navBtns.forEach((b) => b.classList.toggle("active", b.dataset.section === id));
  sections.forEach((s) => s.classList.toggle("active", s.id === `sec-${id}`));
  crumb.textContent = id;
  if (history.replaceState) {
    history.replaceState(null, "", `#${id}`);
  }
}

navBtns.forEach((btn) => {
  btn.addEventListener("click", () => activateSection(btn.dataset.section));
});

document.querySelectorAll("[data-jump]").forEach((btn) => {
  btn.addEventListener("click", () => activateSection(btn.dataset.jump));
});

// Live UTC+05 Clock
const clockEl = document.getElementById("live-clock");
function updateClock() {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const uz = new Date(utc + 5 * 3600000);
  const hh = String(uz.getHours()).padStart(2, "0");
  const mm = String(uz.getMinutes()).padStart(2, "0");
  const ss = String(uz.getSeconds()).padStart(2, "0");
  clockEl.textContent = `UTC+05 ${hh}:${mm}:${ss}`;
}
updateClock();
setInterval(updateClock, 1000);

// Proof Module Switcher
const modBtns = document.querySelectorAll(".mod-btn");
const modDetail = document.getElementById("module-detail");

function renderModule(key) {
  const mod = MODULES[key];
  if (!mod) return;
  modDetail.innerHTML = `
    <h3>${mod.title}</h3>
    <ul class="theorem-list">
      ${mod.items
        .map(
          (t) => `<li><div><code>${t.name}</code></div><div style="margin-top:4px">${t.desc}</div></li>`
        )
        .join("")}
    </ul>
  `;
}
renderModule("core");
modBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    modBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    renderModule(btn.dataset.mod);
  });
});

// Toolchain Filter
const filterBtns = document.querySelectorAll(".filter-btn");
const techItems = document.querySelectorAll(".tech-item");
filterBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    techItems.forEach((item) => {
      item.classList.toggle("hidden", f !== "all" && item.dataset.cat !== f);
    });
  });
});

// Toast + Copy
const toast = document.getElementById("toast");
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 1800);
}

function copyText(text, label = "Copied to clipboard") {
  navigator.clipboard.writeText(text).then(() => showToast(label));
}

document.querySelectorAll("[data-copy]").forEach((el) => {
  el.addEventListener("click", () => copyText(el.dataset.copy, `Copied: ${el.dataset.copy}`));
});

document.querySelectorAll("[data-copy-target]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const target = document.getElementById(btn.dataset.copyTarget);
    if (target) copyText(target.textContent, "Copied to clipboard");
  });
});

// Interactive Unix Shell
const termOut = document.getElementById("term-out");
const termForm = document.getElementById("term-form");
const termInput = document.getElementById("term-input");

const SHELL_COMMANDS = {
  help: () =>
    "Available commands:\n  whoami       — print engineer profile\n  ls           — list active modules & repositories\n  cat genesis  — inspect Lean 4 Project Genesis summary\n  cat stack    — list primary languages & runtime stack\n  verify       — run kernel & adversarial audit summary\n  ssh          — print ED25519 signing fingerprint\n  doi          — print Zenodo publication DOI\n  clear        — clear terminal output",
  whoami: () => "sylenthai — Systems Software Engineer & Formal Verification Researcher (UTC+05)",
  ls: () => "project-genesis/   sylenth-codes/   EmberAndAshAndroid/   daily-practise/   sylenthai/",
  "cat genesis": () =>
    "Project Genesis (Lean 4 v4.12.0 · Zero Mathlib)\n" +
    "  CollatzCoreReductions.lean      : 39 decls\n" +
    "  CollatzTargetA_Asymptotic.lean  : 40 decls\n" +
    "  CollatzTargetB_Stammering.lean  : 25 decls\n" +
    "  Total: 104 kernel-verified declarations (0 sorry, 0 admit, 0 extra axioms)\n" +
    "  Blueprint: https://sylenthai.github.io/project-genesis/",
  "cat stack": () =>
    "Formal: Lean 4.12, Lake, Python Adversarial Auditor\n" +
    "Backend: Python 3.12, FastAPI, AsyncIO, PostgreSQL (pgvector), Redis 7, Celery\n" +
    "Client: TypeScript, React Native, CodeMirror 6, Java 17 (Android SDK 36), Three.js\n" +
    "Infra: Docker Compose, Nginx, GitHub Actions, SSH Signing",
  verify: () =>
    "[OK] lake build ProjectGenesis :: 104/104 declarations verified\n" +
    "[OK] audit_30_points_adversarial.py :: 30/30 checks passed\n" +
    "[OK] git ssh signing :: ED25519 SHA256:AwTwyq0i0pr3pBljb67zuWa+jA24IFD790xNN2ry97k",
  ssh: () => "SHA256:AwTwyq0i0pr3pBljb67zuWa+jA24IFD790xNN2ry97k (sylenthai@gmail.com)",
  doi: () => "https://doi.org/10.5281/zenodo.24422524"
};

function appendTermLine(cls, text) {
  const div = document.createElement("div");
  div.className = cls;
  div.textContent = text;
  termOut.appendChild(div);
  termOut.scrollTop = termOut.scrollHeight;
}

function runShellCommand(raw) {
  const cmd = raw.trim();
  if (!cmd) return;
  appendTermLine("t-cmd", `sylenthai@kernel:~$ ${cmd}`);
  if (cmd === "clear") {
    termOut.innerHTML = "";
    return;
  }
  const fn = SHELL_COMMANDS[cmd.toLowerCase()];
  if (fn) {
    appendTermLine(cmd.toLowerCase() === "verify" ? "t-ok" : "t-out", fn());
  } else {
    appendTermLine("t-dim", `sh: ${cmd}: command not found (try 'help')`);
  }
}

termForm.addEventListener("submit", (e) => {
  e.preventDefault();
  runShellCommand(termInput.value);
  termInput.value = "";
});

document.querySelectorAll(".chip").forEach((c) => {
  c.addEventListener("click", () => runShellCommand(c.dataset.cmd));
});

document.getElementById("clear-shell").addEventListener("click", () => {
  termOut.innerHTML = "";
});

// Command Palette
const backdrop = document.getElementById("palette-backdrop");
const paletteInput = document.getElementById("palette-input");
const paletteList = document.getElementById("palette-list");

const PALETTE_ACTIONS = [
  { label: "Go to 01 // Overview", hint: "1", run: () => activateSection("overview") },
  { label: "Go to 02 // Formal Proofs (Project Genesis)", hint: "2", run: () => activateSection("genesis") },
  { label: "Go to 03 // Systems Architecture", hint: "3", run: () => activateSection("systems") },
  { label: "Go to 04 // Toolchain Matrix", hint: "4", run: () => activateSection("matrix") },
  { label: "Go to 05 // Workstation Shell", hint: "5", run: () => activateSection("shell") },
  { label: "Go to 06 // Cryptographic Identity", hint: "6", run: () => activateSection("identity") },
  { label: "Copy Email (sylenthai@gmail.com)", hint: "copy", run: () => copyText("sylenthai@gmail.com", "Copied email") },
  { label: "Copy SSH Signing Fingerprint", hint: "copy", run: () => copyText("SHA256:AwTwyq0i0pr3pBljb67zuWa+jA24IFD790xNN2ry97k", "Copied SSH fingerprint") },
  { label: "Open Project Genesis Blueprint", hint: "url", run: () => window.open("https://sylenthai.github.io/project-genesis/", "_blank") }
];

function renderPalette(query = "") {
  const q = query.toLowerCase();
  const filtered = PALETTE_ACTIONS.filter((a) => a.label.toLowerCase().includes(q));
  paletteList.innerHTML = "";
  filtered.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<span>${item.label}</span><span class="mono-dim">${item.hint}</span>`;
    li.addEventListener("click", () => {
      closePalette();
      item.run();
    });
    paletteList.appendChild(li);
  });
}

function openPalette() {
  backdrop.classList.add("open");
  paletteInput.value = "";
  renderPalette();
  paletteInput.focus();
}

function closePalette() {
  backdrop.classList.remove("open");
}

document.getElementById("open-palette").addEventListener("click", openPalette);
backdrop.addEventListener("click", (e) => {
  if (e.target === backdrop) closePalette();
});
paletteInput.addEventListener("input", () => renderPalette(paletteInput.value));

// Keyboard Shortcuts
document.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
    e.preventDefault();
    backdrop.classList.contains("open") ? closePalette() : openPalette();
    return;
  }
  if (e.key === "Escape" && backdrop.classList.contains("open")) {
    closePalette();
    return;
  }
  const activeTag = document.activeElement?.tagName;
  if (activeTag === "INPUT" || activeTag === "TEXTAREA") return;
  if (e.key === "/") {
    e.preventDefault();
    openPalette();
    return;
  }
  const map = { "1": "overview", "2": "genesis", "3": "systems", "4": "matrix", "5": "shell", "6": "identity" };
  if (map[e.key]) activateSection(map[e.key]);
});

// Hash navigation on load
const initialHash = window.location.hash.replace("#", "");
if (["overview", "genesis", "systems", "matrix", "shell", "identity"].includes(initialHash)) {
  activateSection(initialHash);
}
