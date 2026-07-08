import { loadCompletions, saveCompletion, deleteCompletion, isFirebaseActive, waitReady } from "./storage.js";

const TYPE_LABEL = {
  rolig: "Rolig",
  tempo: "Tempo",
  lang: "Lang tur",
  interval: "Interval"
};

let completions = [];
let plan = generatePlan(24); // start med 24 uger, kan udvides

// ==== Helpers ====
function trainingKey(uge, index) {
  return `u${uge}-t${index}`;
}
function findCompletion(uge, index) {
  return completions.find(c => c.uge === uge && c.trainingIndex === index);
}
function formatPace(seconds) {
  if (!seconds && seconds !== 0) return "–";
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}
function parsePace(str) {
  // Accepterer "5:40" eller "5.40" eller "340" (sekunder)
  if (!str) return null;
  str = str.trim().replace(",", ".");
  if (str.includes(":")) {
    const [m, s] = str.split(":").map(x => parseInt(x, 10));
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }
  if (str.includes(".")) {
    const [m, s] = str.split(".").map(x => parseInt(x, 10));
    if (isNaN(m) || isNaN(s)) return null;
    return m * 60 + s;
  }
  const n = parseInt(str, 10);
  return isNaN(n) ? null : n;
}
function todayISO() {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 10);
}
function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("da-DK", { day: "numeric", month: "short", year: "numeric" });
}

// ==== Rendering ====
function renderPlan() {
  const container = document.getElementById("plan-container");
  container.innerHTML = "";

  // Gruppér efter fase
  const phases = {};
  plan.forEach(week => {
    if (!phases[week.fase]) phases[week.fase] = [];
    phases[week.fase].push(week);
  });

  for (const phaseName of Object.keys(phases)) {
    const phaseEl = document.createElement("section");
    phaseEl.className = "phase";
    phaseEl.innerHTML = `<h2 class="phase-title">${phaseName}</h2>`;

    for (const week of phases[phaseName]) {
      const totalKm = week.trainings.reduce((s, t) => s + t.distance, 0);
      const doneCount = week.trainings.filter((_, i) => findCompletion(week.uge, i)).length;
      const totalCount = week.trainings.length;
      const complete = doneCount === totalCount;

      const weekEl = document.createElement("article");
      weekEl.className = "week" + (complete ? " week--complete" : "");
      weekEl.innerHTML = `
        <header class="week-head">
          <div class="week-head-left">
            <span class="week-num">Uge ${week.uge}</span>
            <span class="week-note">${week.note}</span>
          </div>
          <div class="week-head-right">
            <span class="week-progress">${doneCount}/${totalCount}</span>
            <span class="week-km">${totalKm} km</span>
          </div>
        </header>
        <ul class="training-list"></ul>
      `;
      const list = weekEl.querySelector(".training-list");
      week.trainings.forEach((t, i) => {
        const done = findCompletion(week.uge, i);
        const li = document.createElement("li");
        li.className = "training" + (done ? " training--done" : "");
        li.innerHTML = `
          <button class="training-btn" data-uge="${week.uge}" data-idx="${i}">
            <span class="training-check" aria-hidden="true">${done ? "✓" : ""}</span>
            <span class="training-body">
              <span class="training-top">
                <span class="training-type type--${t.type}">${TYPE_LABEL[t.type] || t.type}</span>
                <span class="training-dist">${t.distance} km</span>
              </span>
              <span class="training-desc">${t.description}</span>
              ${done ? `<span class="training-done-line">${formatDate(done.date)} · ${done.distance} km · ${formatPace(done.paceSeconds)}</span>` : ""}
            </span>
          </button>
        `;
        list.appendChild(li);
      });

      phaseEl.appendChild(weekEl);
    }
    container.appendChild(phaseEl);
  }

  // Event delegation
  container.querySelectorAll(".training-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const uge = parseInt(btn.dataset.uge, 10);
      const idx = parseInt(btn.dataset.idx, 10);
      openDialog(uge, idx);
    });
  });
}

function renderLog() {
  const logEl = document.getElementById("log-list");
  if (!completions.length) {
    logEl.innerHTML = `<li class="log-empty">Ingen registrerede løb endnu. Vælg en træning og gennemfør den.</li>`;
    return;
  }
  logEl.innerHTML = "";
  completions.forEach(c => {
    const li = document.createElement("li");
    li.className = "log-item";
    li.innerHTML = `
      <div class="log-date">${formatDate(c.date)}</div>
      <div class="log-main">
        <div class="log-desc">${c.description}</div>
        <div class="log-meta">Uge ${c.uge} · ${c.distance} km · ${formatPace(c.paceSeconds)}</div>
      </div>
      <button class="log-delete" data-id="${c.id}" aria-label="Slet registrering">×</button>
    `;
    logEl.appendChild(li);
  });
  logEl.querySelectorAll(".log-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Slet denne registrering?")) return;
      await deleteCompletion(btn.dataset.id);
      completions = await loadCompletions();
      renderPlan();
      renderLog();
      renderStats();
    });
  });
}

function renderStats() {
  const totalKm = completions.reduce((s, c) => s + (c.distance || 0), 0);
  const totalRuns = completions.length;
  const longest = completions.reduce((max, c) => Math.max(max, c.distance || 0), 0);
  document.getElementById("stat-runs").textContent = totalRuns;
  document.getElementById("stat-km").textContent = totalKm.toFixed(1);
  document.getElementById("stat-longest").textContent = longest ? longest.toFixed(1) : "0";
}

// ==== Dialog ====
function openDialog(uge, idx) {
  const week = plan.find(w => w.uge === uge);
  const training = week.trainings[idx];
  const existing = findCompletion(uge, idx);

  const dialog = document.getElementById("training-dialog");
  document.getElementById("dlg-title").textContent = training.description;
  document.getElementById("dlg-detail").textContent = training.detail;
  document.getElementById("dlg-week-info").textContent = `Uge ${uge} · ${week.note}`;

  const dateInput = document.getElementById("dlg-date");
  const distInput = document.getElementById("dlg-distance");
  const paceInput = document.getElementById("dlg-pace");
  const deleteBtn = document.getElementById("dlg-delete");

  if (existing) {
    dateInput.value = existing.date;
    distInput.value = existing.distance;
    paceInput.value = formatPace(existing.paceSeconds).replace("/km", "");
    deleteBtn.style.display = "";
  } else {
    dateInput.value = todayISO();
    distInput.value = training.distance;
    paceInput.value = "";
    deleteBtn.style.display = "none";
  }

  dialog.dataset.uge = uge;
  dialog.dataset.idx = idx;
  dialog.dataset.existingId = existing ? existing.id : "";
  dialog.showModal();
}

async function submitDialog(e) {
  e.preventDefault();
  const dialog = document.getElementById("training-dialog");
  const uge = parseInt(dialog.dataset.uge, 10);
  const idx = parseInt(dialog.dataset.idx, 10);
  const existingId = dialog.dataset.existingId;
  const week = plan.find(w => w.uge === uge);
  const training = week.trainings[idx];

  const date = document.getElementById("dlg-date").value;
  const distance = parseFloat(document.getElementById("dlg-distance").value);
  const paceSeconds = parsePace(document.getElementById("dlg-pace").value);

  if (!date || isNaN(distance)) {
    alert("Angiv mindst dato og distance.");
    return;
  }

  const entry = {
    id: existingId || `${Date.now()}-${trainingKey(uge, idx)}`,
    date,
    distance,
    paceSeconds,
    uge,
    trainingIndex: idx,
    type: training.type,
    description: training.description
  };
  await saveCompletion(entry);
  completions = await loadCompletions();
  dialog.close();
  renderPlan();
  renderLog();
  renderStats();
}

async function deleteFromDialog() {
  const dialog = document.getElementById("training-dialog");
  const existingId = dialog.dataset.existingId;
  if (!existingId) return;
  if (!confirm("Fjern denne træning som gennemført?")) return;
  await deleteCompletion(existingId);
  completions = await loadCompletions();
  dialog.close();
  renderPlan();
  renderLog();
  renderStats();
}

// ==== Tabs ====
function setupTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("tab-btn--active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("tab-panel--active"));
      btn.classList.add("tab-btn--active");
      document.getElementById(btn.dataset.tab).classList.add("tab-panel--active");
    });
  });
}

// ==== Init ====
async function init() {
  setupTabs();

  document.getElementById("training-form").addEventListener("submit", submitDialog);
  document.getElementById("dlg-cancel").addEventListener("click", () => {
    document.getElementById("training-dialog").close();
  });
  document.getElementById("dlg-delete").addEventListener("click", deleteFromDialog);

  document.getElementById("extend-btn").addEventListener("click", () => {
    plan = generatePlan(plan.length + 12);
    renderPlan();
  });

  // Status i footer
  const status = document.getElementById("storage-status");
  await waitReady();
  status.textContent = isFirebaseActive() ? "Synkroniseret via Firebase" : "Kun lokal (localStorage)";
  status.className = isFirebaseActive() ? "status status--online" : "status status--local";

  completions = await loadCompletions();
  renderPlan();
  renderLog();
  renderStats();
}

init();
