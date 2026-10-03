/* Tiny dependency-free SVG charts with hover tooltips.
 * Single-series per chart (small multiples) — one axis, one hue.
 */
const Charts = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const tip = () => document.getElementById("tooltip");

  function el(name, attrs = {}, parent) {
    const n = document.createElementNS(NS, name);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (parent) parent.appendChild(n);
    return n;
  }

  function showTip(evt, html) {
    const t = tip();
    t.innerHTML = html;
    t.hidden = false;
    const pad = 12;
    const r = t.getBoundingClientRect();
    let x = evt.clientX + pad;
    let y = evt.clientY - r.height - pad;
    if (x + r.width > window.innerWidth - 8) x = evt.clientX - r.width - pad;
    if (y < 8) y = evt.clientY + pad;
    t.style.left = `${Math.max(8, x)}px`;
    t.style.top = `${y}px`;
  }
  function hideTip() { tip().hidden = true; }

  function niceMax(v) {
    if (v <= 0) return 1;
    const p = Math.pow(10, Math.floor(Math.log10(v)));
    const n = v / p;
    const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
    return step * p;
  }

  function frame(container, height) {
    container.innerHTML = "";
    const W = Math.max(280, container.clientWidth || 320);
    const H = height;
    const m = { t: 10, r: 8, b: 22, l: 34 };
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: H, class: "chart", role: "img" });
    container.appendChild(svg);
    return { svg, W, H, m, iw: W - m.l - m.r, ih: H - m.t - m.b };
  }

  function yAxis(f, max, fmt) {
    const g = el("g", { class: "axis" }, f.svg);
    [0, max / 2, max].forEach((v) => {
      const y = f.m.t + f.ih - (v / max) * f.ih;
      el("line", { x1: f.m.l, x2: f.W - f.m.r, y1: y, y2: y, class: "grid" }, g);
      const t = el("text", { x: f.m.l - 6, y: y + 4, "text-anchor": "end" }, g);
      t.textContent = fmt(v);
    });
  }

  function xLabels(f, pts, xAt) {
    const g = el("g", { class: "axis" }, f.svg);
    const every = Math.ceil(pts.length / 7);
    pts.forEach((p, i) => {
      if (i % every !== 0 && i !== pts.length - 1) return;
      if (i !== pts.length - 1 && pts.length - 1 - i < every) return; // avoid crowding last label
      const t = el("text", { x: xAt(i), y: f.H - 6, "text-anchor": "middle" }, g);
      t.textContent = p.short;
    });
  }

  /** pts: [{short, long, value|null}] */
  function bar(container, pts, opts = {}) {
    const f = frame(container, opts.height || 160);
    const values = pts.map((p) => p.value || 0);
    const max = opts.max || niceMax(Math.max(opts.goal || 0, ...values));
    const fmt = opts.fmt || ((v) => String(Math.round(v)));
    yAxis(f, max, fmt);
    f.svg.setAttribute("aria-label", opts.label || "bar chart");

    const slot = f.iw / pts.length;
    const bw = Math.max(2, Math.min(22, slot - 2));
    const xAt = (i) => f.m.l + slot * i + slot / 2;
    const base = f.m.t + f.ih;

    pts.forEach((p, i) => {
      const v = p.value;
      if (v != null && v > 0) {
        const h = Math.max(2, (v / max) * f.ih);
        const x = xAt(i) - bw / 2;
        const r = Math.min(4, bw / 2, h);
        // rounded data end, square at the baseline
        el("path", {
          class: "bar" + (opts.goal && v >= opts.goal ? " met" : ""),
          d: `M${x},${base} V${base - h + r} Q${x},${base - h} ${x + r},${base - h} H${x + bw - r} Q${x + bw},${base - h} ${x + bw},${base - h + r} V${base} Z`,
        }, f.svg);
      }
      const hit = el("rect", { x: f.m.l + slot * i, y: f.m.t, width: slot, height: f.ih, class: "hit" }, f.svg);
      const show = (e) => showTip(e, `<b>${p.long}</b><br>${v == null ? "No entry" : (opts.tipFmt || fmt)(v)}`);
      hit.addEventListener("pointermove", show);
      hit.addEventListener("pointerdown", show);
      hit.addEventListener("pointerleave", hideTip);
    });

    if (opts.goal) {
      const y = base - (opts.goal / max) * f.ih;
      el("line", { x1: f.m.l, x2: f.W - f.m.r, y1: y, y2: y, class: "goal" }, f.svg);
      const t = el("text", { x: f.W - f.m.r, y: y - 4, "text-anchor": "end", class: "goal-label" }, f.svg);
      t.textContent = `goal ${fmt(opts.goal)}`;
    }
    xLabels(f, pts, xAt);
  }

  /** Line chart; null values create gaps but the line bridges across them. */
  function line(container, pts, opts = {}) {
    const f = frame(container, opts.height || 160);
    const vals = pts.map((p) => p.value).filter((v) => v != null);
    const fmt = opts.fmt || ((v) => String(Math.round(v * 10) / 10));
    let lo, hi;
    if (opts.min != null && opts.max != null) { lo = opts.min; hi = opts.max; }
    else {
      const mn = Math.min(...vals), mx = Math.max(...vals);
      const pad = Math.max(1, (mx - mn) * 0.2);
      lo = Math.floor(mn - pad); hi = Math.ceil(mx + pad);
    }
    f.svg.setAttribute("aria-label", opts.label || "line chart");
    const g = el("g", { class: "axis" }, f.svg);
    [lo, (lo + hi) / 2, hi].forEach((v) => {
      const y = f.m.t + f.ih - ((v - lo) / (hi - lo)) * f.ih;
      el("line", { x1: f.m.l, x2: f.W - f.m.r, y1: y, y2: y, class: "grid" }, g);
      const t = el("text", { x: f.m.l - 6, y: y + 4, "text-anchor": "end" }, g);
      t.textContent = fmt(v);
    });

    const slot = f.iw / pts.length;
    const xAt = (i) => f.m.l + slot * i + slot / 2;
    const yAt = (v) => f.m.t + f.ih - ((v - lo) / (hi - lo)) * f.ih;
    const known = pts.map((p, i) => ({ ...p, i })).filter((p) => p.value != null);
    if (known.length > 1) {
      el("path", { class: "line", d: known.map((p, k) => `${k ? "L" : "M"}${xAt(p.i)},${yAt(p.value)}`).join(" ") }, f.svg);
    }
    known.forEach((p) => el("circle", { cx: xAt(p.i), cy: yAt(p.value), r: 4, class: "dot" }, f.svg));

    const cross = el("line", { y1: f.m.t, y2: f.m.t + f.ih, class: "cross", visibility: "hidden" }, f.svg);
    const hit = el("rect", { x: f.m.l, y: f.m.t, width: f.iw, height: f.ih, class: "hit" }, f.svg);
    const move = (e) => {
      const r = f.svg.getBoundingClientRect();
      const sx = ((e.clientX - r.left) / r.width) * f.W;
      const i = Math.max(0, Math.min(pts.length - 1, Math.floor((sx - f.m.l) / slot)));
      cross.setAttribute("x1", xAt(i)); cross.setAttribute("x2", xAt(i));
      cross.setAttribute("visibility", "visible");
      const v = pts[i].value;
      showTip(e, `<b>${pts[i].long}</b><br>${v == null ? "No entry" : (opts.tipFmt || fmt)(v)}`);
    };
    hit.addEventListener("pointermove", move);
    hit.addEventListener("pointerdown", move);
    hit.addEventListener("pointerleave", () => { cross.setAttribute("visibility", "hidden"); hideTip(); });
    xLabels(f, pts, xAt);
  }

  return { bar, line, hideTip };
})();
