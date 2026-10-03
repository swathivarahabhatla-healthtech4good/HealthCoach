/* Persistence: everything lives in localStorage under one key.
 * Use Export / Import on the Trends tab to back up or move devices.
 */
const STORE_KEY = "healthcoach.v1";

const Store = (() => {
  let state = load();

  function blank() {
    return { days: {}, settings: { ...DEFAULT_SETTINGS }, favorites: [], prepDone: {} };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (!raw) return blank();
      const s = JSON.parse(raw);
      return {
        days: s.days || {},
        settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) },
        favorites: s.favorites || [],
        prepDone: s.prepDone || {},
      };
    } catch {
      return blank();
    }
  }

  function save() {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(state));
    } catch {
      /* storage blocked (private mode) — app still works for this session */
    }
  }

  function blankDay() {
    return {
      checks: {},
      water: 0,
      meals: { breakfast: "", lunch: "", snacks: "", dinner: "" },
      workout: { type: "", minutes: 0, steps: 0 },
      mood: 0,
      energy: 0,
      sleep: 0,
      weight: null,
      notes: "",
      plan: { breakfast: null, lunch: null, snacks: null, dinner: null, workout: null, exDone: [] },
    };
  }

  function day(key) {
    const d = state.days[key];
    if (!d) return blankDay();
    const b = blankDay();
    return { ...b, ...d, meals: { ...b.meals, ...d.meals }, workout: { ...b.workout, ...d.workout }, checks: { ...d.checks }, plan: { ...b.plan, ...d.plan } };
  }

  function setDay(key, d) {
    state.days[key] = d;
    save();
  }

  return {
    day,
    setDay,
    get settings() { return state.settings; },
    setSettings(s) { state.settings = { ...state.settings, ...s }; save(); },
    get favorites() { return state.favorites; },
    toggleFavorite(id) {
      const i = state.favorites.indexOf(id);
      if (i >= 0) state.favorites.splice(i, 1); else state.favorites.push(id);
      save();
    },
    prepDone(week) { return state.prepDone[week] || []; },
    togglePrep(week, id) {
      const cur = state.prepDone[week] || [];
      state.prepDone[week] = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      save();
    },
    dayKeys() { return Object.keys(state.days).sort(); },
    exportJSON() { return JSON.stringify(state, null, 2); },
    importJSON(text) {
      const s = JSON.parse(text);
      if (!s || typeof s.days !== "object") throw new Error("Not a Health Coach backup file");
      state = { days: s.days, settings: { ...DEFAULT_SETTINGS, ...(s.settings || {}) }, favorites: s.favorites || [], prepDone: s.prepDone || {} };
      save();
    },
  };
})();

// ---------- date helpers (local time, YYYY-MM-DD) ----------
function dateKey(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseKey(k) {
  const [y, m, d] = k.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function addDays(k, n) {
  const d = parseKey(k);
  d.setDate(d.getDate() + n);
  return dateKey(d);
}
function todayKey() { return dateKey(new Date()); }

// ---------- scoring ----------
const ALL_CHECK_IDS = CHECKLIST_GROUPS.flatMap((g) => g.items.map((i) => i.id));

function dayHasData(d) {
  return (
    Object.values(d.checks).some(Boolean) || d.water > 0 || d.mood > 0 ||
    d.workout.minutes > 0 || d.weight != null || Object.values(d.meals).some((m) => m.trim())
  );
}

// Percentage of the day's goals met (0–100).
function dayScore(d, settings) {
  let done = ALL_CHECK_IDS.filter((id) => d.checks[id]).length;
  let total = ALL_CHECK_IDS.length;
  total += 4;
  if (d.water >= settings.waterGoal) done++;
  if (d.workout.minutes >= settings.workoutGoal) done++;
  if (d.mood > 0) done++;
  if (Object.values(d.meals).filter((m) => m.trim()).length >= 3) done++;
  return Math.round((done / total) * 100);
}

function groupScore(d, groupId) {
  const g = CHECKLIST_GROUPS.find((x) => x.id === groupId);
  const done = g.items.filter((i) => d.checks[i.id]).length;
  return Math.round((done / g.items.length) * 100);
}
