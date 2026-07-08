import { loadCompletions, saveCompletion, deleteCompletion, isFirebaseActive, waitReady, lastError } from "./storage.js";

const TYPE_LABEL = {
  rolig: "Rolig",
  tempo: "Tempo",
  progressiv: "Progressiv",
  lang: "Lang",
  interval: "Interval"
};

let completions = [];
let plan = generatePlan(24);

// ==== Helpers ====
function trainingKey(uge, index) { return `u${uge}-t${index}`; }
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
function isValidUrl(str) {
  if (!str) return false;
  try {
    const u = new URL(str.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch { return false; }
}
function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// ==== Rendering ====
function renderPlan() {
  const container = document.getElementById("plan-container");
  container.innerHTML = "";

  const phases = {};
  plan.forEach(week => {
    if (!phases[week.fase]) phases[week.fase] = [];
    phases[week.fase].push(week);
  });

  for (const phaseName of Object.keys(phases)) {
    const phaseEl = document.createElement("section");
    phaseEl.className = "phase";
    phaseEl.innerHTML = `<h2 class="phase-title">${escapeHtml(phaseName)}</h2>`;

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
            <span class="week-note">${escapeHtml(week.note)}</span>
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
              <span class="training-desc">${escapeHtml(t.description)}</span>
              ${done ? `<span class="training-done-line">${formatDate(done.date)} · ${done.distance} km · ${formatPace(done.paceSeconds)}${done.routeUrl ? " · 🗺" : ""}</span>` : ""}
            </span>
          </button>
        `;
        list.appendChild(li);
      });

      phaseEl.appendChild(weekEl);
    }
    container.appendChild(phaseEl);
  }

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
    const routeLink = c.routeUrl
      ? `<a class="log-route" href="${escapeHtml(c.routeUrl)}" target="_blank" rel="noopener">🗺 Åbn rute</a>`
      : "";
    li.innerHTML = `
      <div class="log-date">${formatDate(c.date)}</div>
      <div class="log-main">
        <div class="log-desc">${escapeHtml(c.description)}</div>
        <div class="log-meta">Uge ${c.uge} · ${c.distance} km · ${formatPace(c.paceSeconds)}</div>
        ${routeLink}
      </div>
      <button class="log-delete" data-id="${escapeHtml(c.id)}" aria-label="Slet registrering">×</button>
    `;
    logEl.appendChild(li);
  });
  logEl.querySelectorAll(".log-delete").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Slet denne registrering?")) return;
      try {
        await deleteCompletion(btn.dataset.id);
        completions = await loadCompletions();
        renderPlan(); renderLog(); renderStats();
      } catch (err) {
        alert("Kunne ikke slette: " + (err?.message || err));
      }
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
function showDialogError(msg) {
  const el = document.getElementById("dlg-error");
  if (!msg) { el.textContent = ""; el.hidden = true; return; }
  el.textContent = msg;
  el.hidden = false;
}

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
  const routeInput = document.getElementById("dlg-route");
  const deleteBtn = document.getElementById("dlg-delete");

  if (existing) {
    dateInput.value = existing.date;
    distInput.value = existing.distance;
    paceInput.value = formatPace(existing.paceSeconds).replace("/km", "");
    routeInput.value = existing.routeUrl || "";
    deleteBtn.style.display = "";
  } else {
    dateInput.value = todayISO();
    distInput.value = training.distance;
    paceInput.value = "";
    routeInput.value = "";
    deleteBtn.style.display = "none";
  }
  showDialogError("");

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
  const routeUrl = document.getElementById("dlg-route").value.trim();

  if (!date || isNaN(distance)) {
    showDialogError("Angiv mindst dato og distance.");
    return;
  }
  if (routeUrl && !isValidUrl(routeUrl)) {
    showDialogError("Rute-URL ser ikke gyldig ud. Skal starte med https://");
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
    description: training.description,
    routeUrl: routeUrl || null
  };

  const submitBtn = document.querySelector('#training-form button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = "Gemmer…";
  try {
    await saveCompletion(entry);
    completions = await loadCompletions();
    dialog.close();
    renderPlan(); renderLog(); renderStats();
  } catch (err) {
    console.error("Save failed:", err);
    const code = err?.code || "";
    let msg = err?.message || String(err);
    if (code === "permission-denied") {
      msg = "Firestore afviste skrivning (permission-denied). Tjek at Firestore Rules tillader skrivning til users/solo-runner/completions/*.";
    } else if (code === "unavailable") {
      msg = "Kan ikke nå Firestore. Tjek din netværksforbindelse.";
    } else if (String(msg).includes("not-found") || String(msg).includes("NOT_FOUND")) {
      msg = "Firestore-databasen findes ikke i projektet. Aktivér Firestore Database i Firebase Console.";
    }
    showDialogError(msg);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "Gem";
  }
}

async function deleteFromDialog() {
  const dialog = document.getElementById("training-dialog");
  const existingId = dialog.dataset.existingId;
  if (!existingId) return;
  if (!confirm("Fjern denne træning som gennemført?")) return;
  try {
    await deleteCompletion(existingId);
    completions = await loadCompletions();
    dialog.close();
    renderPlan(); renderLog(); renderStats();
  } catch (err) {
    showDialogError("Kunne ikke slette: " + (err?.message || err));
  }
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

  const status = document.getElementById("storage-status");
  await waitReady();
  if (isFirebaseActive()) {
    status.textContent = "Synkroniseret via Firebase";
    status.className = "status status--online";
  } else {
    const errMsg = lastError();
    status.textContent = errMsg
      ? "Firebase fejlede – kun lokal (se konsol)"
      : "Kun lokal (localStorage)";
    status.className = "status status--local";
    status.title = errMsg || "";
  }

  try {
    completions = await loadCompletions();
  } catch (err) {
    console.error("loadCompletions failed:", err);
    completions = [];
  }
  renderPlan();
  renderLog();
  renderStats();
}

init();
