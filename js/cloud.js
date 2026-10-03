/* Cloud sync for the published claude.ai artifact.
 *
 * Each signed-in viewer's data lives in their private database subtree:
 *   data/users/<id>/meta             settings, favourites, prep ticks
 *   data/users/<id>/meta/days/<date>  one document per logged day
 * Outside claude.ai (opening index.html directly) window.claude is absent
 * and the app runs on localStorage only.
 */
const Cloud = (() => {
  const status = (text, kind) => {
    const el = document.getElementById("syncStatus");
    if (!el) return;
    el.textContent = text;
    el.dataset.kind = kind;
    el.hidden = false;
  };

  let metaRef = null;
  let daysCol = null;
  const timers = {};
  const chains = {};
  let pending = 0;

  function queueWrite(id, ref, getBody) {
    clearTimeout(timers[id]);
    timers[id] = setTimeout(() => {
      pending++;
      status("Saving…", "busy");
      // one write at a time per document
      chains[id] = (chains[id] || Promise.resolve())
        .then(() => ref.set(getBody()))
        .catch((e) => {
          if (e && e.code === "unavailable") return new Promise((r) => setTimeout(r, 800 + Math.random() * 800)).then(() => ref.set(getBody()));
          throw e;
        })
        .then(() => { if (--pending === 0) status("Synced", "ok"); })
        .catch((e) => {
          pending--;
          status(e && e.code === "quota_exceeded" ? "Storage full: export a backup" : "Saved on this device only", "warn");
        });
    }, 700);
  }

  // Keep prep ticks bounded: drop ids whose date is more than 60 days old.
  function prunedMeta() {
    const m = Store.meta();
    const cutoff = addDays(todayKey(), -60);
    const prepDone = {};
    for (const [k, ids] of Object.entries(m.prepDone)) {
      prepDone[k] = ids.filter((id) => { const d = (id.match(/\d{4}-\d{2}-\d{2}/) || [])[0]; return !d || d >= cutoff; });
    }
    return { ...m, prepDone };
  }

  async function start(onRemote) {
    if (!window.claude || typeof window.claude.use !== "function") return;
    status("Connecting…", "busy");
    let db, user;
    try { [db, user] = await Promise.all([window.claude.use("db"), window.claude.use("user")]); } catch { db = null; }
    const uid = user ? await user.id() : null;
    if (!db || !uid) { status("Saved on this device only", "warn"); return; }

    metaRef = db.doc(`data/users/${uid}/meta`);
    daysCol = metaRef.collection("days");

    try {
      const [metaSnap, daysSnap] = await Promise.all([metaRef.get(), daysCol.limit(1000).get()]);
      const remoteDays = {};
      daysSnap.docs.forEach((d) => { remoteDays[d.id] = d.data(); });
      const remoteMeta = metaSnap.exists ? metaSnap.data() : null;
      if (Store.applyRemote({ days: remoteDays, meta: remoteMeta })) onRemote();

      // upload anything newer on this device (first use, or offline edits)
      const local = Store.allDays();
      for (const [k, d] of Object.entries(local)) {
        if (!remoteDays[k] || (d._t || 0) > (remoteDays[k]._t || 0)) queueWrite(`day:${k}`, daysCol.doc(k), () => Store.rawDay(k));
      }
      if (!remoteMeta || Store.meta().metaT > (remoteMeta.metaT || 0)) queueWrite("meta", metaRef, prunedMeta);
      if (!pending) status("Synced", "ok");
    } catch {
      status("Saved on this device only", "warn");
      return;
    }

    Store.onChange((kind, key) => {
      if (kind === "day") queueWrite(`day:${key}`, daysCol.doc(key), () => Store.rawDay(key));
      else queueWrite("meta", metaRef, prunedMeta);
    });

    // pick up edits made on another device when the app comes back to the foreground
    document.addEventListener("visibilitychange", async () => {
      if (document.visibilityState !== "visible" || pending) return;
      try {
        const [m, ds] = await Promise.all([metaRef.get(), daysCol.limit(1000).get()]);
        const days = {};
        ds.docs.forEach((d) => { days[d.id] = d.data(); });
        if (Store.applyRemote({ days, meta: m.exists ? m.data() : null })) onRemote();
      } catch { /* keep local state */ }
    });
  }

  return { start };
})();
