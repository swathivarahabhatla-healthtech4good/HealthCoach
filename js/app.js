/* Health Coach UI: Today / Trends / Food guide tabs. */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

let currentKey = todayKey();
let range = 7;

// ================= Tabs =================
function showTab(name) {
  $$(".tabbar button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
  $$(".tab").forEach((t) => (t.hidden = t.id !== `tab-${name}`));
  Charts.hideTip();
  if (name === "trends") renderTrends();
  if (name === "guide") renderPlan();
  window.scrollTo(0, 0);
  try { localStorage.setItem("healthcoach.tab", name); } catch {}
}
$$(".tabbar button").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));

// ================= TODAY =================
function getDay() { return Store.day(currentKey); }
function update(fn) {
  const d = getDay();
  fn(d);
  Store.setDay(currentKey, d);
  renderToday();
}

function fmtLong(k) {
  return parseKey(k).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
}

function buildTodayStatic() {
  $("#prevDay").onclick = () => { currentKey = addDays(currentKey, -1); renderToday(); };
  $("#nextDay").onclick = () => { if (currentKey < todayKey()) { currentKey = addDays(currentKey, 1); renderToday(); } };

  $("#waterPlus").onclick = () => update((d) => (d.water = Math.min(30, d.water + 1)));
  $("#waterMinus").onclick = () => update((d) => (d.water = Math.max(0, d.water - 1)));

  const scale = (host, key, items) => {
    host.innerHTML = items.map((m) =>
      `<button role="radio" data-v="${m.v}" aria-label="${m.l}"><span class="e">${m.e}</span><span class="small">${m.l}</span></button>`).join("");
    host.onclick = (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const v = Number(b.dataset.v);
      update((d) => (d[key] = d[key] === v ? 0 : v));
    };
  };
  scale($("#moodPick"), "mood", MOODS);
  scale($("#energyPick"), "energy", [1, 2, 3, 4, 5].map((v) => ({ v, e: "⚡".repeat(v), l: ["Drained", "Low", "Okay", "Good", "Buzzing"][v - 1] })));
  $("#sleepIn").onchange = (e) => update((d) => (d.sleep = Number(e.target.value) || 0));

  $("#workoutTypes").innerHTML = WORKOUT_TYPES.map((t) => `<button class="chip" data-t="${t}">${t}</button>`).join("");
  $("#workoutTypes").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    update((d) => (d.workout.type = d.workout.type === b.dataset.t ? "" : b.dataset.t));
  };
  $("#workoutMin").onchange = (e) => update((d) => (d.workout.minutes = Number(e.target.value) || 0));
  $("#steps").onchange = (e) => update((d) => (d.workout.steps = Number(e.target.value) || 0));

  $("#foodSuggest").innerHTML = FOODS.map((f) => `<option value="${esc(f.name)}">`).join("");
  $("#mealInputs").innerHTML = MEALS.map((m) =>
    `<label class="meal"><span class="field-label">${m.label}<span class="plan-hint" data-ph="${m.id}"></span></span><input data-meal="${m.id}" list="foodSuggest" placeholder="e.g. ${esc(sampleFor(m.id))}" /></label>`).join("");
  $$("#mealInputs input").forEach((i) => (i.onchange = () => update((d) => (d.meals[i.dataset.meal] = i.value))));
  $("#mealInputs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-eat]"); if (!b) return;
    e.preventDefault();
    eatPlanned(currentKey, b.dataset.eat);
  });
  $("#workoutPlan").onclick = (e) => {
    if (e.target.closest("[data-logwo]")) logPlannedWorkout(currentKey);
    if (e.target.closest("[data-openplan]")) openPlan();
  };

  $("#checkGroups").innerHTML = CHECKLIST_GROUPS.map((g) => `
    <details class="card group" open data-g="${g.id}">
      <summary class="card-head"><h2>${g.icon} ${g.title}</h2><span class="pill" data-gp="${g.id}"></span></summary>
      <ul class="checks">
        ${g.items.map((i) => `
          <li><label>
            <input type="checkbox" data-c="${i.id}" />
            <span><span class="cl">${i.label}</span>${i.hint ? `<span class="hint">${i.hint}</span>` : ""}</span>
          </label></li>`).join("")}
      </ul>
    </details>`).join("");
  $$("#checkGroups input[type=checkbox]").forEach((c) => (c.onchange = () => update((d) => (d.checks[c.dataset.c] = c.checked))));

  $("#weightIn").onchange = (e) => update((d) => (d.weight = e.target.value === "" ? null : Number(e.target.value)));
  $("#notesIn").onchange = (e) => update((d) => (d.notes = e.target.value));
}

function sampleFor(meal) {
  return { breakfast: "Veggie egg bhurji", lunch: "Dal + sabzi + millet roti", snacks: "Roasted chana", dinner: "Lentil soup" }[meal];
}

function pickIdeas() {
  const h = new Date().getHours();
  const cat = h < 11 ? ["breakfast", "ready"] : h < 16 ? ["meal", "ready", "snack"] : h < 19 ? ["snack", "drink"] : ["meal", "drink"];
  const pool = FOODS.filter((f) => cat.includes(f.cat) && (f.tags.includes("ready") || f.tags.includes("quick")));
  // stable per day so chips don't reshuffle on every tap
  const seed = Number(currentKey.replace(/-/g, ""));
  return pool.map((f, i) => ({ f, r: Math.sin(seed + i) })).sort((a, b) => a.r - b.r).slice(0, 6).map((x) => x.f);
}

function renderToday() {
  const d = getDay();
  const s = Store.settings;
  const isToday = currentKey === todayKey();
  $("#dayLabel").textContent = isToday ? "Today" : fmtLong(currentKey);
  $("#daySub").textContent = isToday ? fmtLong(currentKey) : "Editing a past day";
  $("#nextDay").disabled = isToday;

  const score = dayScore(d, s);
  $("#scoreVal").textContent = `${score}%`;
  $("#scoreRing").style.setProperty("--p", score);
  const mealsDone = MEALS.filter((m) => d.meals[m.id].trim()).length;
  const checksDone = ALL_CHECK_IDS.filter((id) => d.checks[id]).length;
  $("#progressList").innerHTML = [
    ["🍽️ Meals", `${mealsDone}/${MEALS.length}`],
    ["🏃 Workout", `${d.workout.minutes}/${s.workoutGoal}m`],
    ["💧 Water", `${d.water}/${s.waterGoal}`],
    ["✅ Habits", `${checksDone}/${ALL_CHECK_IDS.length}`],
  ].map(([l, v]) => `<span>${l} <b>${v}</b></span>`).join("");

  // water
  const n = Math.max(s.waterGoal, d.water);
  $("#waterGlasses").innerHTML = Array.from({ length: n }, (_, i) =>
    `<button class="glass ${i < d.water ? "full" : ""}" data-i="${i}" aria-label="Set ${i + 1} glasses"></button>`).join("");
  $$("#waterGlasses .glass").forEach((g) => (g.onclick = () => update((x) => {
    const v = Number(g.dataset.i) + 1;
    x.water = x.water === v ? v - 1 : v;
  })));
  $("#waterText").textContent = `${d.water}/${s.waterGoal} · ${((d.water * s.glassMl) / 1000).toFixed(2)} L`;

  $$("#moodPick button").forEach((b) => b.setAttribute("aria-checked", String(Number(b.dataset.v) === d.mood)));
  $$("#energyPick button").forEach((b) => b.setAttribute("aria-checked", String(Number(b.dataset.v) === d.energy)));
  $("#sleepIn").value = d.sleep || "";

  $$("#workoutTypes .chip").forEach((c) => c.classList.toggle("on", c.dataset.t === d.workout.type));
  $("#workoutMin").value = d.workout.minutes || "";
  $("#steps").value = d.workout.steps || "";
  $("#workoutText").textContent = `${d.workout.minutes}/${s.workoutGoal} min`;

  $$("#mealInputs input").forEach((i) => (i.value = d.meals[i.dataset.meal] || ""));
  MEALS.forEach((m) => {
    const opt = plannedMeal(currentKey, d, m.id);
    const eaten = mealHas(d, m.id, opt.name);
    $(`[data-ph="${m.id}"]`).innerHTML = opt
      ? ` · plan: ${esc(opt.name)} ${eaten ? "<b class=\"ok\">✓</b>" : `<button class="link" data-eat="${m.id}">✓ ate this</button>`}`
      : "";
  });
  const wo = plannedWorkout(currentKey, d);
  const woLogged = d.workout.minutes >= wo.minutes;
  $("#workoutPlan").innerHTML = `<span>Plan: <b>${esc(wo.title)}</b> · ${wo.minutes} min</span>
    <span class="row gap">${woLogged ? "<b class=\"ok\">✓ done</b>" : `<button class="btn sm primary" data-logwo>✓ Log it</button>`}<button class="btn sm" data-openplan>See plan</button></span>`;
  $("#quickIdeas").innerHTML = pickIdeas().map((f) =>
    `<button class="chip idea" title="${esc(f.why)}" data-name="${esc(f.name)}">${esc(f.name)}</button>`).join("");
  $("#quickIdeas").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const h = new Date().getHours();
    const meal = h < 11 ? "breakfast" : h < 15 ? "lunch" : h < 19 ? "snacks" : "dinner";
    update((x) => (x.meals[meal] = x.meals[meal] ? `${x.meals[meal]}, ${b.dataset.name}` : b.dataset.name));
  };

  $$("#checkGroups input[type=checkbox]").forEach((c) => (c.checked = !!d.checks[c.dataset.c]));
  CHECKLIST_GROUPS.forEach((g) => {
    const done = g.items.filter((i) => d.checks[i.id]).length;
    const pill = $(`[data-gp="${g.id}"]`);
    pill.textContent = `${done}/${g.items.length}`;
    pill.classList.toggle("done", done === g.items.length);
  });

  $("#weightIn").value = d.weight ?? "";
  $("#notesIn").value = d.notes;
}

// ================= TRENDS =================
function rangeKeys(n) {
  const end = todayKey();
  return Array.from({ length: n }, (_, i) => addDays(end, i - n + 1));
}

function renderTrends() {
  const s = Store.settings;
  const keys = rangeKeys(range);
  const days = keys.map((k) => ({ k, d: Store.day(k) })).map((x) => ({ ...x, has: dayHasData(x.d) }));
  const logged = days.filter((x) => x.has);
  $("#trendEmpty").hidden = logged.length > 0;

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
  const shortFmt = (k) => {
    const d = parseKey(k);
    return range <= 7 ? d.toLocaleDateString(undefined, { weekday: "short" }) : `${d.getMonth() + 1}/${d.getDate()}`;
  };
  const pts = (fn) => days.map((x) => ({ short: shortFmt(x.k), long: fmtLong(x.k), value: x.has ? fn(x.d) : null }));

  // streak: consecutive logged days ending today (or yesterday if today is empty)
  let streak = 0;
  let k = todayKey();
  if (!dayHasData(Store.day(k))) k = addDays(k, -1);
  while (dayHasData(Store.day(k))) { streak++; k = addDays(k, -1); }

  const weights = logged.filter((x) => x.d.weight != null);
  const wChange = weights.length > 1 ? weights[weights.length - 1].d.weight - weights[0].d.weight : null;
  const moods = logged.filter((x) => x.d.mood > 0).map((x) => x.d.mood);

  const tiles = [
    { l: "Avg daily score", v: logged.length ? `${Math.round(avg(logged.map((x) => dayScore(x.d, s))))}%` : "—" },
    { l: "Current streak", v: `${streak} day${streak === 1 ? "" : "s"}` },
    { l: "Avg water", v: logged.length ? `${avg(logged.map((x) => x.d.water)).toFixed(1)} gl` : "—" },
    { l: "Workout days", v: `${logged.filter((x) => x.d.workout.minutes > 0).length}/${range}` },
    { l: "Avg mood", v: moods.length ? `${MOODS[Math.round(avg(moods)) - 1].e} ${avg(moods).toFixed(1)}` : "—" },
    { l: "Weight change", v: wChange == null ? "—" : `${wChange > 0 ? "+" : ""}${wChange.toFixed(1)}` },
  ];
  $("#statTiles").innerHTML = tiles.map((t) => `<div class="tile"><div class="tv">${t.v}</div><div class="tl">${t.l}</div></div>`).join("");

  const charts = [
    { id: "score", title: "Daily score", sub: "% of goals met", type: "bar", p: pts((d) => dayScore(d, s)), o: { max: 100, goal: 80, fmt: (v) => `${Math.round(v)}%` } },
    { id: "water", title: "Water", sub: "glasses", type: "bar", p: pts((d) => d.water), o: { goal: s.waterGoal, tipFmt: (v) => `${v} glasses · ${((v * s.glassMl) / 1000).toFixed(2)} L` } },
    { id: "workout", title: "Workout", sub: "minutes", type: "bar", p: pts((d) => d.workout.minutes), o: { goal: s.workoutGoal, tipFmt: (v) => `${v} min` } },
    { id: "plate", title: "Anti-inflammatory plate", sub: "% of plate habits", type: "bar", p: pts((d) => groupScore(d, "plate")), o: { max: 100, fmt: (v) => `${Math.round(v)}%` } },
    { id: "mood", title: "Mood", sub: "1 low – 5 great", type: "line", p: pts((d) => d.mood || null), o: { min: 1, max: 5, fmt: (v) => String(v), tipFmt: (v) => `${MOODS[v - 1].e} ${MOODS[v - 1].l}` } },
    { id: "energy", title: "Energy", sub: "1 drained – 5 buzzing", type: "line", p: pts((d) => d.energy || null), o: { min: 1, max: 5, fmt: (v) => String(v) } },
    { id: "sleep", title: "Sleep", sub: "hours", type: "bar", p: pts((d) => d.sleep || null), o: { goal: s.sleepGoal, fmt: (v) => String(Math.round(v * 10) / 10), tipFmt: (v) => `${v} h` } },
    { id: "weight", title: "Weight", sub: "", type: "line", p: pts((d) => d.weight), o: {} },
  ];
  $("#charts").innerHTML = charts.map((c) =>
    `<div class="card"><div class="card-head"><h2>${c.title}</h2><span class="muted small">${c.sub}</span></div><div class="chart-box" id="ch-${c.id}"></div></div>`).join("");
  charts.forEach((c) => {
    const host = $(`#ch-${c.id}`);
    const n = c.p.filter((p) => p.value != null).length;
    if (!n) { host.closest(".card").hidden = c.id === "weight" || !logged.length; host.innerHTML = `<p class="muted small">No entries in this range.</p>`; return; }
    Charts[c.type](host, c.p, { ...c.o, label: c.title });
  });

  // habit consistency
  const denom = Math.max(1, logged.length);
  $("#habitBars").innerHTML = CHECKLIST_GROUPS.map((g) => `
    <div class="hb-group">${g.icon} ${g.title}</div>
    ${g.items.map((i) => {
      const pct = Math.round((logged.filter((x) => x.d.checks[i.id]).length / denom) * 100);
      return `<div class="hb"><span class="hb-l">${i.label}</span><span class="hb-track"><span class="hb-fill" style="width:${pct}%"></span></span><span class="hb-v">${pct}%</span></div>`;
    }).join("")}`).join("");

  // heatmap: 12 weeks ending this week, columns = weeks, rows = Mon..Sun
  const today = parseKey(todayKey());
  const dow = (today.getDay() + 6) % 7;
  const start = addDays(todayKey(), -dow - 7 * 11);
  let cells = "";
  for (let w = 0; w < 12; w++) {
    for (let r = 0; r < 7; r++) {
      const key = addDays(start, w * 7 + r);
      if (key > todayKey()) { cells += `<i class="hm future"></i>`; continue; }
      const d = Store.day(key);
      const has = dayHasData(d);
      const sc = has ? dayScore(d, s) : 0;
      const lvl = !has ? 0 : sc < 25 ? 1 : sc < 50 ? 2 : sc < 75 ? 3 : 4;
      cells += `<i class="hm h${lvl}" data-tip="${esc(fmtLong(key))}: ${has ? sc + "%" : "no entry"}"></i>`;
    }
  }
  $("#heatmap").innerHTML = cells;

  // data table (most recent first)
  $("#dataTable").innerHTML = `<thead><tr><th>Date</th><th>Score</th><th>Water</th><th>Workout</th><th>Mood</th><th>Energy</th><th>Sleep</th><th>Weight</th></tr></thead><tbody>` +
    logged.slice().reverse().map((x) => `<tr><td>${x.k}</td><td>${dayScore(x.d, s)}%</td><td>${x.d.water}</td><td>${x.d.workout.minutes}${x.d.workout.type ? " " + esc(x.d.workout.type) : ""}</td><td>${x.d.mood || ""}</td><td>${x.d.energy || ""}</td><td>${x.d.sleep || ""}</td><td>${x.d.weight ?? ""}</td></tr>`).join("") + "</tbody>";

  // settings
  $("#setWater").value = s.waterGoal;
  $("#setGlass").value = s.glassMl;
  $("#setWorkout").value = s.workoutGoal;
  $("#setSteps").value = s.stepsGoal;
}

function buildTrendsStatic() {
  $("#rangeSeg").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    range = Number(b.dataset.range);
    $$("#rangeSeg button").forEach((x) => x.classList.toggle("on", x === b));
    renderTrends();
  };
  const bind = (id, key) => ($(id).onchange = (e) => { Store.setSettings({ [key]: Number(e.target.value) }); renderTrends(); renderToday(); });
  bind("#setWater", "waterGoal"); bind("#setGlass", "glassMl"); bind("#setWorkout", "workoutGoal"); bind("#setSteps", "stepsGoal");

  $("#exportBtn").onclick = () => {
    const blob = new Blob([Store.exportJSON()], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `health-coach-backup-${todayKey()}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };
  $("#importIn").onchange = async (e) => {
    const f = e.target.files[0]; if (!f) return;
    try { Store.importJSON(await f.text()); renderToday(); renderTrends(); alert("Backup restored."); }
    catch (err) { alert(`Could not import: ${err.message}`); }
    e.target.value = "";
  };

  const hm = $("#heatmap");
  const show = (e) => {
    const t = e.target.closest("[data-tip]");
    if (!t) return Charts.hideTip();
    const tip = $("#tooltip"); tip.textContent = t.dataset.tip; tip.hidden = false;
    tip.style.left = `${Math.min(e.clientX + 12, window.innerWidth - 180)}px`; tip.style.top = `${e.clientY - 40}px`;
  };
  hm.addEventListener("pointermove", show);
  hm.addEventListener("pointerdown", show);
  hm.addEventListener("pointerleave", Charts.hideTip);

  let rt;
  window.addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (!$("#tab-trends").hidden) renderTrends(); }, 150); });
}

// ================= FOOD GUIDE =================
const guide = { cat: "all", tags: new Set(), q: "", favOnly: false, source: "all", rq: "" };

function buildGuide() {
  $("#guideSeg").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#guideSeg button").forEach((x) => x.classList.toggle("on", x === b));
    ["plan", "foods", "recipes", "limit"].forEach((v) => ($(`#guide-${v}`).hidden = v !== b.dataset.view));
  };

  $("#catChips").innerHTML = [{ id: "all", label: "All" }, { id: "fav", label: "★ Favourites" }, ...FOOD_CATEGORIES]
    .map((c) => `<button class="chip ${c.id === "all" ? "on" : ""}" data-cat="${c.id}">${c.label}</button>`).join("");
  $("#catChips").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    guide.cat = b.dataset.cat;
    $$("#catChips .chip").forEach((x) => x.classList.toggle("on", x === b));
    renderFoods();
  };
  $("#tagChips").innerHTML = Object.entries(TAG_LABELS).map(([k, l]) => `<button class="chip tag" data-tag="${k}">${l}</button>`).join("");
  $("#tagChips").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const t = b.dataset.tag;
    guide.tags.has(t) ? guide.tags.delete(t) : guide.tags.add(t);
    b.classList.toggle("on");
    renderFoods();
  };
  $("#foodSearch").oninput = (e) => { guide.q = e.target.value.toLowerCase(); renderFoods(); };
  $("#foodList").onclick = (e) => {
    const b = e.target.closest(".fav"); if (!b) return;
    Store.toggleFavorite(b.dataset.id); renderFoods();
  };

  $("#sourceChips").innerHTML = [{ id: "all", name: "All sources" }, ...RECIPE_SOURCES]
    .map((s) => `<button class="chip ${s.id === "all" ? "on" : ""}" data-src="${s.id}">${esc(s.name)}</button>`).join("");
  $("#sourceChips").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    guide.source = b.dataset.src;
    $$("#sourceChips .chip").forEach((x) => x.classList.toggle("on", x === b));
    renderRecipes();
  };
  $("#recipeSearch").oninput = (e) => { guide.rq = e.target.value.toLowerCase(); renderRecipes(); };

  const lvl = { time: ["⏰", "Time it"], moderate: ["⚖️", "Moderate"], avoid: ["⛔", "Avoid / minimise"] };
  $("#limitList").innerHTML = ["time", "moderate", "avoid"].map((L) => `
    <div class="card"><h2>${lvl[L][0]} ${lvl[L][1]}</h2>
      ${LIMIT_FOODS.filter((f) => f.level === L).map((f) => `<div class="limit"><b>${esc(f.name)}</b><p>${esc(f.why)}</p></div>`).join("")}
    </div>`).join("");

  renderFoods();
  renderRecipes();
}

function renderFoods() {
  const favs = Store.favorites;
  const list = FOODS.filter((f) =>
    (guide.cat === "all" || (guide.cat === "fav" ? favs.includes(f.name) : f.cat === guide.cat)) &&
    [...guide.tags].every((t) => f.tags.includes(t)) &&
    (!guide.q || `${f.name} ${f.why}`.toLowerCase().includes(guide.q)));
  const catLabel = Object.fromEntries(FOOD_CATEGORIES.map((c) => [c.id, c.label]));
  $("#foodList").innerHTML = list.length ? list.map((f) => `
    <article class="food card">
      <div class="food-top">
        <div><h3>${esc(f.name)}</h3><div class="muted small">${catLabel[f.cat]} · ${esc(f.serving)}</div></div>
        <button class="fav ${favs.includes(f.name) ? "on" : ""}" data-id="${esc(f.name)}" aria-label="Favourite">${favs.includes(f.name) ? "★" : "☆"}</button>
      </div>
      <p>${esc(f.why)}</p>
      <div class="tags">${f.tags.map((t) => `<span class="t t-${t}">${TAG_LABELS[t]}</span>`).join("")}</div>
    </article>`).join("") : `<p class="muted">No foods match those filters.</p>`;
}

function renderRecipes() {
  const srcName = Object.fromEntries(RECIPE_SOURCES.map((s) => [s.id, s.name]));
  const list = RECIPES.filter((r) =>
    (guide.source === "all" || r.source === guide.source) &&
    (!guide.rq || `${r.title} ${r.ingredients.join(" ")}`.toLowerCase().includes(guide.rq)));
  $("#recipeList").innerHTML = list.length ? list.map((r) => `
    <details class="card recipe">
      <summary>
        <h3>${esc(r.title)}</h3>
        <div class="muted small">${r.time} min · serves ${r.serves} · ${esc(srcName[r.source] || r.source)}</div>
        <div class="tags">${r.tags.map((t) => `<span class="t t-${t}">${TAG_LABELS[t]}</span>`).join("")}</div>
      </summary>
      ${r.prepNote ? `<p class="prep">🍱 ${esc(r.prepNote)}</p>` : ""}
      ${r.thyroidNote ? `<p class="thy">💊 ${esc(r.thyroidNote)}</p>` : ""}
      <h4>Ingredients</h4><ul>${r.ingredients.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
      <h4>Steps</h4><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
      ${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">View original recipe ↗</a>` : ""}
    </details>`).join("") : `<p class="muted">No recipes from this source yet.</p>`;
}

// ================= PLAN (today's meals + workout) =================
const SLOT_SOURCES = {
  breakfast: { cats: ["breakfast"], meal: ["breakfast"] },
  lunch: { cats: ["meal"], meal: ["meal"] },
  dinner: { cats: ["meal"], meal: ["meal"] },
  snacks: { cats: ["snack"], meal: ["snack"] },
};
const SLOT_OFFSET = { breakfast: 0, lunch: 1, snacks: 2, dinner: 5 };

// Recipes first (they have full instructions), then foods; favourites float to the top.
function slotOptions(slot, favFirst = true) {
  const src = SLOT_SOURCES[slot];
  const favs = Store.favorites;
  const opts = [
    ...RECIPES.filter((r) => src.meal.includes(r.meal)).map((r) => ({ key: `r:${r.id}`, name: r.title, why: r.prepNote, tags: r.tags, recipe: r })),
    ...FOODS.filter((f) => src.cats.includes(f.cat)).map((f) => ({ key: `f:${f.name}`, name: f.name, why: `${f.serving} — ${f.why}`, tags: f.tags })),
  ];
  return favFirst ? opts.sort((a, b) => favs.includes(b.name) - favs.includes(a.name)) : opts;
}
function dayIndex(k) { return Math.round(parseKey(k).getTime() / 864e5); }

function plannedMeal(key, d, slot) {
  const opts = slotOptions(slot, false); // stable order so starring a food doesn't reshuffle the default
  if (!opts.length) return null;
  return opts.find((o) => o.key === d.plan[slot]) || opts[(dayIndex(key) * 3 + SLOT_OFFSET[slot]) % opts.length];
}
function plannedWorkout(key, d) {
  return WORKOUTS.find((w) => w.id === d.plan.workout) || WORKOUTS.find((w) => w.id === WEEKLY_WORKOUT[parseKey(key).getDay()]);
}
function mealHas(d, slot, name) { return (d.meals[slot] || "").toLowerCase().includes(name.toLowerCase()); }

function eatPlanned(key, slot) {
  const d = Store.day(key);
  const name = plannedMeal(key, d, slot).name;
  if (!mealHas(d, slot, name)) d.meals[slot] = d.meals[slot] ? `${d.meals[slot]}, ${name}` : name;
  Store.setDay(key, d);
  renderToday(); renderPlan();
}
function logPlannedWorkout(key) {
  const d = Store.day(key);
  const wo = plannedWorkout(key, d);
  d.workout.type = wo.type;
  d.workout.minutes = Math.max(d.workout.minutes, wo.minutes);
  Store.setDay(key, d);
  renderToday(); renderPlan();
}
function openPlan() {
  showTab("guide");
  $('#guideSeg [data-view="plan"]').click();
}

function setPlan(fn, k = todayKey()) {
  const d = Store.day(k);
  fn(d);
  Store.setDay(k, d);
  renderPlan();
  if (currentKey === k) renderToday();
}

// ---------- week view ----------
let weekOffset = 0;
function weekStart(k) {
  const dow = (parseKey(k).getDay() + 6) % 7; // Monday = 0
  return addDays(k, -dow);
}
function weekKeys() {
  const start = addDays(weekStart(todayKey()), weekOffset * 7);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}
function fmtShort(k) { return parseKey(k).toLocaleDateString(undefined, { month: "short", day: "numeric" }); }

function renderWeek() {
  const keys = weekKeys();
  const today = todayKey();
  $("#weekLabel").textContent = weekOffset === 0 ? "This week" : weekOffset === 1 ? "Next week" : weekOffset === -1 ? "Last week" : `Week of ${fmtShort(keys[0])}`;
  $("#weekLabel").nextElementSibling.textContent = `${fmtShort(keys[0])} – ${fmtShort(keys[6])} · tap ↻ to swap`;
  $("#weekDays").innerHTML = keys.map((k) => {
    const d = Store.day(k);
    const wo = plannedWorkout(k, d);
    const row = (slot, label, name, done, swap) =>
      `<div class="wk-row"><span class="wk-slot">${label}</span><span class="wk-name ${done ? "done" : ""}">${esc(name)}</span>${swap ? `<button class="wk-swap" data-k="${k}" data-swap="${slot}" aria-label="Swap ${label}">↻</button>` : "<span></span>"}</div>`;
    return `<div class="card wk-day ${k === today ? "today" : k < today ? "past" : ""}">
      <div class="wk-head"><h3>${parseKey(k).toLocaleDateString(undefined, { weekday: "long" })} <small>${fmtShort(k)}</small></h3>${k === today ? '<span class="pill done">Today</span>' : ""}</div>
      ${MEALS.map((m) => { const o = plannedMeal(k, d, m.id); return row(m.id, m.label, o.name, mealHas(d, m.id, o.name), k >= today); }).join("")}
      ${row("workout", "Workout", `${wo.title} · ${wo.minutes} min`, d.workout.minutes >= wo.minutes, k >= today)}
    </div>`;
  }).join("");
}

// ---------- prep & shopping ----------
function weekPlanItems() {
  return weekKeys().flatMap((k) => {
    const d = Store.day(k);
    return MEALS.map((m) => ({ k, slot: m.id, opt: plannedMeal(k, d, m.id) }));
  });
}
function dayAbbr(k) { return parseKey(k).toLocaleDateString(undefined, { weekday: "short" }); }

function renderPrep() {
  const keys = weekKeys();
  const wk = keys[0];
  const items = weekPlanItems().filter((x) => x.k >= todayKey() || weekOffset !== 0);
  const tasks = PREP_RULES.map((r) => {
    const hits = items.filter((x) => r.match.test(x.opt.name));
    if (!hits.length) return null;
    const names = [...new Set(hits.map((x) => x.opt.name))];
    const days = [...new Set(hits.map((x) => dayAbbr(x.k)))];
    return { id: r.id, task: r.task, when: r.when, detail: r.detail, forText: `${names.slice(0, 3).join(", ")}${names.length > 3 ? ` +${names.length - 3}` : ""} · ${days.join(" ")}` };
  }).filter(Boolean);
  // recipe-specific prep notes
  const recipes = [...new Map(items.filter((x) => x.opt.recipe && x.opt.recipe.prepNote).map((x) => [x.opt.recipe.id, x])).values()];
  recipes.forEach((x) => tasks.push({ id: `r:${x.opt.recipe.id}`, task: `Prep: ${x.opt.recipe.title}`, when: dayAbbr(x.k), detail: x.opt.recipe.prepNote, forText: "" }));

  const done = Store.prepDone(wk);
  const n = tasks.filter((t) => done.includes(t.id)).length;
  $("#prepMeta").textContent = `${n}/${tasks.length}`;
  $("#prepMeta").classList.toggle("done", tasks.length > 0 && n === tasks.length);
  $("#prepSub").textContent = `${weekOffset === 0 ? "Remaining days this week" : $("#weekLabel").textContent} · ${fmtShort(keys[0])} – ${fmtShort(keys[6])}. Change meals in the Week view and this list updates.`;
  $("#prepTasks").innerHTML = tasks.map((t) => `
    <li><label><input type="checkbox" data-prep="${esc(t.id)}" ${done.includes(t.id) ? "checked" : ""} />
      <span><span class="prep-when">${esc(t.when)}</span><span class="cl">${esc(t.task)}</span>
      <span class="hint">${esc(t.detail)}</span>${t.forText ? `<span class="prep-for">For: ${esc(t.forText)}</span>` : ""}</span></label></li>`).join("")
    || `<li class="muted">Nothing to prep — the rest of the week is planned with no-cook options.</li>`;

  // shopping list
  const count = (arr) => arr.reduce((m, x) => m.set(x, (m.get(x) || 0) + 1), new Map());
  const recipeUses = count(items.filter((x) => x.opt.recipe).map((x) => x.opt.recipe.id));
  const foodUses = count(items.filter((x) => !x.opt.recipe).map((x) => x.opt.name));
  const groups = [];
  recipeUses.forEach((c, id) => {
    const r = RECIPES.find((x) => x.id === id);
    groups.push(`<div class="shop-group"><h4>${esc(r.title)}${c > 1 ? ` ×${c}` : ""}</h4><ul>${r.ingredients.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></div>`);
  });
  if (foodUses.size) {
    const byName = Object.fromEntries(FOODS.map((f) => [f.name, f]));
    groups.push(`<div class="shop-group"><h4>Meals & snacks</h4><ul>${[...foodUses].map(([nm, c]) => `<li>${esc(nm)}${c > 1 ? ` ×${c}` : ""} <span class="muted small">— ${esc(byName[nm]?.serving || "")}</span></li>`).join("")}</ul></div>`);
  }
  groups.push(`<div class="shop-group"><h4>Weekly staples</h4><ul>${WEEKLY_STAPLES.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div>`);
  $("#shopList").innerHTML = groups.join("");
}

function buildPlan() {
  $("#planSeg").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    $$("#planSeg button").forEach((x) => x.classList.toggle("on", x === b));
    ["today", "week", "prep"].forEach((v) => ($(`#pv-${v}`).hidden = v !== b.dataset.pv));
    renderPlan();
  };
  $("#prevWeek").onclick = () => { weekOffset--; renderPlan(); };
  $("#nextWeek").onclick = () => { weekOffset++; renderPlan(); };
  $("#weekDays").addEventListener("click", (e) => {
    const b = e.target.closest("[data-swap]"); if (!b) return;
    const k = b.dataset.k, slot = b.dataset.swap;
    setPlan((d) => {
      if (slot === "workout") {
        const i = WORKOUTS.findIndex((w) => w.id === plannedWorkout(k, d).id);
        d.plan.workout = WORKOUTS[(i + 1) % WORKOUTS.length].id;
        d.plan.exDone = [];
      } else {
        const opts = slotOptions(slot);
        const i = opts.findIndex((o) => o.key === plannedMeal(k, d, slot).key);
        d.plan[slot] = opts[(i + 1) % opts.length].key;
      }
    }, k);
  });
  $("#prepTasks").addEventListener("change", (e) => {
    const c = e.target.closest("[data-prep]"); if (!c) return;
    Store.togglePrep(weekKeys()[0], c.dataset.prep);
    renderPrep();
  });
  $("#woChips").innerHTML = WORKOUTS.map((w) => `<button class="chip" data-wo="${w.id}">${esc(w.title.split(" — ")[0])}</button>`).join("");
  $("#woChips").onclick = (e) => {
    const b = e.target.closest("button"); if (!b) return;
    setPlan((d) => { d.plan.workout = b.dataset.wo; d.plan.exDone = []; });
  };
  $("#newIdeas").onclick = () => setPlan((d) => {
    MEALS.forEach((m) => {
      const opts = slotOptions(m.id);
      const cur = plannedMeal(todayKey(), d, m.id);
      const rest = opts.filter((o) => o.key !== cur.key);
      if (rest.length) d.plan[m.id] = rest[Math.floor(Math.random() * rest.length)].key;
    });
  });
  $("#planMeals").addEventListener("click", (e) => {
    const sw = e.target.closest("[data-swap]");
    if (sw) {
      const slot = sw.dataset.swap;
      setPlan((d) => {
        const opts = slotOptions(slot);
        const i = opts.findIndex((o) => o.key === plannedMeal(todayKey(), d, slot).key);
        d.plan[slot] = opts[(i + 1) % opts.length].key;
      });
    }
    const eat = e.target.closest("[data-eat]");
    if (eat) eatPlanned(todayKey(), eat.dataset.eat);
  });
  $("#planMeals").addEventListener("change", (e) => {
    const sel = e.target.closest("select[data-pick]"); if (!sel) return;
    setPlan((d) => (d.plan[sel.dataset.pick] = sel.value));
  });
  $("#planWorkout").addEventListener("change", (e) => {
    const c = e.target.closest("input[data-ex]"); if (!c) return;
    setPlan((d) => {
      const i = Number(c.dataset.ex);
      d.plan.exDone = c.checked ? [...new Set([...d.plan.exDone, i])] : d.plan.exDone.filter((x) => x !== i);
    });
  });
  $("#planWorkout").addEventListener("click", (e) => {
    if (e.target.closest("[data-logwo]")) logPlannedWorkout(todayKey());
  });
}

function renderPlan() {
  if (!$("#pv-week").hidden) renderWeek();
  if (!$("#pv-prep").hidden) { renderWeek(); renderPrep(); }
  const k = todayKey();
  const d = Store.day(k);
  const openRecipes = new Set($$("#planMeals details[open]").map((x) => x.dataset.slot));

  $("#planMeals").innerHTML = MEALS.map((m) => {
    const opt = plannedMeal(k, d, m.id);
    const eaten = mealHas(d, m.id, opt.name);
    const r = opt.recipe;
    return `<div class="plan-meal ${eaten ? "eaten" : ""}">
      <div class="pm-head"><span class="pm-slot">${m.label}</span>
        <span class="row gap">
          <button class="btn sm" data-swap="${m.id}" aria-label="Swap ${m.label}">↻ Swap</button>
          ${eaten ? `<b class="ok">✓ Eaten</b>` : `<button class="btn sm primary" data-eat="${m.id}">✓ Ate this</button>`}
        </span></div>
      <select data-pick="${m.id}" aria-label="Choose ${m.label}">
        ${slotOptions(m.id).map((o) => `<option value="${esc(o.key)}" ${o.key === opt.key ? "selected" : ""}>${Store.favorites.includes(o.name) ? "★ " : ""}${o.recipe ? "📖 " : ""}${esc(o.name)}</option>`).join("")}
      </select>
      ${opt.why ? `<p class="muted small">${esc(opt.why)}</p>` : ""}
      <div class="tags">${opt.tags.map((t) => `<span class="t t-${t}">${TAG_LABELS[t]}</span>`).join("")}</div>
      ${r ? `<details class="pm-recipe" data-slot="${m.id}" ${openRecipes.has(m.id) ? "open" : ""}><summary>📖 Recipe · ${r.time} min</summary>
        ${r.thyroidNote ? `<p class="thy">💊 ${esc(r.thyroidNote)}</p>` : ""}
        <h4>Ingredients</h4><ul>${r.ingredients.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>
        <h4>Steps</h4><ol>${r.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
        ${r.url ? `<a href="${esc(r.url)}" target="_blank" rel="noopener">View original ↗</a>` : ""}
      </details>` : ""}
    </div>`;
  }).join("");

  const wo = plannedWorkout(k, d);
  const done = d.plan.exDone.filter((i) => i < wo.items.length).length;
  const logged = d.workout.minutes >= wo.minutes;
  $$("#woChips .chip").forEach((c) => c.classList.toggle("on", c.dataset.wo === wo.id));
  $("#planWoMeta").textContent = `${done}/${wo.items.length}`;
  $("#planWoMeta").classList.toggle("done", done === wo.items.length);
  $("#planWorkout").innerHTML = `
    <h3>${esc(wo.title)}</h3>
    <div class="muted small">${wo.minutes} min · ${esc(wo.intensity)}${wo.id === WEEKLY_WORKOUT[parseKey(k).getDay()] ? " · today's default" : ""}</div>
    <ul class="checks">${wo.items.map((it, i) => `
      <li><label><input type="checkbox" data-ex="${i}" ${d.plan.exDone.includes(i) ? "checked" : ""} />
        <span><span class="cl">${esc(it.name)}</span><span class="hint">${esc(it.detail)}</span></span></label></li>`).join("")}
    </ul>
    <p class="prep">💡 ${esc(wo.note)}</p>
    ${logged ? `<p class="ok">✓ Logged on Today: ${d.workout.minutes} min ${esc(d.workout.type)}</p>` : `<button class="btn primary" data-logwo>✓ Log this workout (${wo.minutes} min)</button>`}`;
}

// ================= boot =================
buildTodayStatic();
buildTrendsStatic();
buildGuide();
buildPlan();
renderToday();
let startTab = "today";
try { startTab = localStorage.getItem("healthcoach.tab") || "today"; } catch {}
showTab(["today", "trends", "guide"].includes(startTab) ? startTab : "today");

if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
