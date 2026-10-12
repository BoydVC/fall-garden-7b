(() => {
  const DATA = window.__GARDEN__;
  if (!DATA || !DATA.months) {
    document.body.innerHTML = "<p style='padding:2rem;font-family:system-ui;color:#fef3c7;background:#0c1a12'>Missing garden data. Run build.py.</p>";
    return;
  }

  const STORE_KEY = "fall-garden-7b-v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function loadStore() {
    try { return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {}; }
    catch { return {}; }
  }
  function saveStore(store) {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
  }

  let store = loadStore();
  if (!store.checks) store.checks = {};
  if (!store.journal) store.journal = [];
  let currentMonth = "october";
  const now = new Date();
  if (now.getMonth() === 10) currentMonth = "november";

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function setView(name) {
    $$(".tab").forEach((t) => {
      const on = t.dataset.view === name;
      t.classList.toggle("active", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
    });
    $$(".view").forEach((v) => v.classList.toggle("active", v.id === `view-${name}`));
    if (location.hash.slice(1) !== name) history.replaceState(null, "", `#${name}`);
  }

  function monthObj() {
    return DATA.months.find((m) => m.id === currentMonth) || DATA.months[0];
  }

  function totalChecked() {
    return Object.values(store.checks).filter(Boolean).length;
  }

  function updatePills() {
    const m = monthObj();
    $("#monthPill").textContent = `${m.label} · ${DATA.zone}`;
    $("#donePill").textContent = `${totalChecked()} checked`;
    $("#footStat").textContent = `${store.journal.length} journal · ${totalChecked()} tasks`;
  }

  function renderMonth() {
    const m = monthObj();
    $("#focusLine").textContent = `${m.emoji} ${m.focus}`;
    $$(".month-btn").forEach((b) => b.classList.toggle("active", b.dataset.month === currentMonth));
    const root = $("#monthRoot");
    root.innerHTML = m.tasks.map((t) => {
      const done = !!store.checks[t.id];
      return `<div class="check-item${done ? " done" : ""}" data-id="${escapeHtml(t.id)}" role="checkbox" aria-checked="${done}">
        <div class="check-box">${done ? "✓" : ""}</div>
        <div>
          <div class="check-label">${escapeHtml(t.label)}</div>
          <div class="check-cat">${escapeHtml(t.category)}</div>
        </div>
      </div>`;
    }).join("");
    root.querySelectorAll(".check-item").forEach((el) => {
      el.addEventListener("click", () => {
        const id = el.dataset.id;
        store.checks[id] = !store.checks[id];
        saveStore(store);
        renderMonth();
        updatePills();
      });
    });
    $("#cutRoot").innerHTML = (DATA.cutBack || []).map((c) => `
      <div class="cut-row">
        <span class="cut-badge ${c.keep ? "keep" : "cut"}">${c.keep ? "leave" : "cut"}</span>
        <span>${escapeHtml(c.label)}</span>
      </div>`).join("");
  }

  function renderPlant() {
    $("#plantRoot").innerHTML = DATA.plantNow.map((p) => `
      <article class="plant-card">
        <h3>${p.emoji} ${escapeHtml(p.name)} ${p.example ? '<span class="ex-label">EXAMPLE</span>' : ""}</h3>
        <p class="plant-window">${escapeHtml(p.window)}</p>
        <p><strong>How:</strong> ${escapeHtml(p.how)}</p>
        <p><strong>Why:</strong> ${escapeHtml(p.why)}</p>
      </article>`).join("");
  }

  function renderBulbs() {
    $("#bulbRoot").innerHTML = DATA.bulbs.map((b) => `
      <div class="bulb-row">
        <div class="bulb-emoji">${b.emoji}</div>
        <div>
          <strong>${escapeHtml(b.name)}</strong>
          <div class="bulb-meta">
            <span class="bulb-chip">Depth ${escapeHtml(b.depth)}</span>
            <span class="bulb-chip">Space ${escapeHtml(b.spacing)}</span>
          </div>
          <p class="hint" style="margin:0">${escapeHtml(b.note)}</p>
        </div>
      </div>`).join("");
  }

  function renderLeaf() {
    $("#leafRoot").innerHTML = DATA.leafCare.map((l) => `
      <article class="leaf-card">
        <h3>${l.emoji} ${escapeHtml(l.title)}</h3>
        <p>${escapeHtml(l.body)}</p>
      </article>`).join("");
  }

  function renderJournal() {
    const root = $("#journalRoot");
    if (!store.journal.length) {
      root.innerHTML = `<p class="hint">No entries yet — log a planting day or leaf haul.</p>`;
      return;
    }
    root.innerHTML = [...store.journal].reverse().map((e) => `
      <div class="journal-entry" data-id="${escapeHtml(e.id)}">
        <div>
          <div>${escapeHtml(e.text)}</div>
          <time datetime="${escapeHtml(e.at)}">${new Date(e.at).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}</time>
        </div>
        <button type="button" data-del="${escapeHtml(e.id)}" aria-label="Delete">✕</button>
      </div>`).join("");
    root.querySelectorAll("[data-del]").forEach((btn) => {
      btn.addEventListener("click", () => {
        store.journal = store.journal.filter((j) => j.id !== btn.dataset.del);
        saveStore(store);
        renderJournal();
        updatePills();
      });
    });
  }

  function renderAbout() {
    $("#disclaimer").textContent = DATA.disclaimer || "";
  }

  function renderAll() {
    renderMonth();
    renderPlant();
    renderBulbs();
    renderLeaf();
    renderJournal();
    renderAbout();
    updatePills();
  }

  $$(".tab").forEach((t) => t.addEventListener("click", () => setView(t.dataset.view)));
  $$(".month-btn").forEach((b) => b.addEventListener("click", () => {
    currentMonth = b.dataset.month;
    renderMonth();
    updatePills();
  }));

  $("#journalForm").addEventListener("submit", (ev) => {
    ev.preventDefault();
    const text = $("#journalText").value.trim();
    if (!text) return;
    store.journal.push({ id: `j-${Date.now()}`, text, at: new Date().toISOString() });
    saveStore(store);
    $("#journalText").value = "";
    renderJournal();
    updatePills();
  });

  $("#btnExport").addEventListener("click", () => {
    const blob = new Blob([JSON.stringify(store, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "fall-garden-7b-save.json";
    a.click();
    $("#aboutHint").textContent = "Exported save JSON.";
  });
  $("#btnResetChecks").addEventListener("click", () => {
    if (!confirm("Reset checklist?")) return;
    store.checks = {};
    saveStore(store);
    renderAll();
    $("#aboutHint").textContent = "Checklist cleared.";
  });
  $("#btnResetAll").addEventListener("click", () => {
    if (!confirm("Reset checklist and journal?")) return;
    store = { checks: {}, journal: [] };
    saveStore(store);
    renderAll();
    $("#aboutHint").textContent = "All local data reset.";
  });

  window.addEventListener("hashchange", () => {
    const h = location.hash.slice(1) || "month";
    if (["month", "plant", "bulbs", "leaf", "journal", "about"].includes(h)) setView(h);
  });

  renderAll();
  const start = location.hash.slice(1) || "month";
  setView(["month", "plant", "bulbs", "leaf", "journal", "about"].includes(start) ? start : "month");
})();
