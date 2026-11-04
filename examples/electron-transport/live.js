// Live layer: a small simulation on a simulated clock. Every count on the panel comes from
// the same events that move the particles, and the gradient readouts come from gradientOf().
const D = __DATA__;
const TIPS = __TIPS__;
const PJ = D.P;
const NS = "http://www.w3.org/2000/svg";
const root = document.querySelector(".et");
const stage = root.querySelector(".et-stage");
const svg = stage.querySelector("svg");
const tipBox = stage.querySelector(".et-tip");
const readoutEl = root.querySelector("[data-readout]");
const layerOf = (name) => svg.querySelector(`[data-layer="${name}"]`);
const LQ = layerOf("q");
const LC = layerOf("cytc");
const LM = layerOf("mol");
const LF = layerOf("fx");
const ringG = svg.querySelector('[data-live="ring"]');
const gammaG = svg.querySelector('[data-live="gamma"]');
const imsTint = svg.querySelector('[data-live="ims-tint"]');
const plusG = svg.querySelector('[data-live="plus"]');
const minusG = svg.querySelector('[data-live="minus"]');
const outEl = Object.fromEntries([...document.querySelectorAll("[data-out]")].map((el) => [el.dataset.out, el]));
const siteEls = {};
svg.querySelectorAll("[data-site]").forEach((el) => (siteEls[el.dataset.site] = el));
const lobes = [...svg.querySelectorAll(".et-lobe[data-beta]")].sort((a, b) => a.dataset.beta - b.dataset.beta);
const still = matchMedia("(prefers-reduced-motion: reduce)");
const SITE = D.SITES;
const clampTo = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dist3 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const ease = (t) => t * t * (3 - 2 * t);
const rand = (a, b) => a + Math.random() * (b - a);
const fmt = (v, n = 0) => v.toFixed(n);

// ── Simulated clock and scheduler ──────────────────────────────────────────────
let simT = 0;
let gen = 0;
let waits = [];
let laters = [];
const speed = () => (still.matches ? 30 : 1);
const sleep = (s) => new Promise((resolve) => waits.push({ t: simT + s, resolve, gen }));
const later = (s, fn) => laters.push({ t: simT + s, fn, gen });

// ── Sprites ────────────────────────────────────────────────────────────────────
const sprites = new Set();
class Sprite {
  constructor(layer, html, pos, { cls = "", world = false, attrs = {} } = {}) {
    this.el = document.createElementNS(NS, "g");
    this.el.setAttribute("class", cls);
    for (const [key, value] of Object.entries(attrs)) this.el.setAttribute(key, value);
    this.el.innerHTML = html;
    layer.appendChild(this.el);
    this.world = world;
    this.pos = [...pos];
    this.alpha = 1;
    this.tween = null;
    this.fade = null;
    this.drift = null;
    this.dirty = true;
    sprites.add(this);
    this.place();
  }
  place() {
    if (this.world) this.el.setAttribute("transform", translateAlong(PJ, this.pos));
    else {
      const [sx, sy] = iso(this.pos, PJ);
      this.el.setAttribute("transform", `translate(${sx.toFixed(1)} ${sy.toFixed(1)})`);
    }
    this.el.style.opacity = this.alpha < 0.999 ? this.alpha.toFixed(3) : "";
    this.dirty = false;
  }
  set(pos) {
    this.pos = [...pos];
    this.dirty = true;
  }
  kill() {
    sprites.delete(this);
    this.el.remove();
  }
}

// Move along a polyline of world points in `dur` seconds, with an optional callback at each vertex.
function move(sp, points, dur, { onVertex, easing = ease } = {}) {
  const pts = [sp.pos, ...points];
  const lens = [0];
  for (let i = 1; i < pts.length; i++) lens.push(lens[i - 1] + dist3(pts[i - 1], pts[i]));
  return new Promise((resolve) => {
    if (lens[lens.length - 1] < 1e-6 || dur <= 0) {
      sp.set(pts[pts.length - 1]);
      for (let i = 1; i < pts.length; i++) onVertex?.(i - 1);
      resolve();
      return;
    }
    sp.tween = { pts, lens, t: 0, dur, resolve, onVertex, easing, passed: 0, gen };
  });
}
const byDistance = (sp, points, speedU, opts) => {
  let length = dist3(sp.pos, points[0]);
  for (let i = 1; i < points.length; i++) length += dist3(points[i - 1], points[i]);
  return move(sp, points, Math.max(0.25, length / speedU), opts);
};
function fadeTo(sp, to, dur) {
  return new Promise((resolve) => (sp.fade = { from: sp.alpha, to, t: 0, dur: Math.max(0.01, dur), resolve }));
}
async function vanish(sp, dur = 0.6) {
  await fadeTo(sp, 0, dur);
  sp.kill();
}

// Glyphs, drawn around (0, 0) in screen space.
const GLOW = (id, r) => `<circle r="${r}" fill="url(#${id})"/>`;
const electronHtml = `${GLOW("et-g-e", 7.5)}<circle class="et-core" r="1.7"/>`;
const protonHtml = `${GLOW("et-g-h", 6.5)}<circle class="et-core" r="2.3"/><path class="et-plus" d="M-1.2 0H1.2M0-1.2V1.2"/>`;
const hex = (cx, cy, r) => `<path class="et-ring" d="${Array.from({ length: 6 }, (_, i) => `${i ? "L" : "M"}${(cx + r * Math.cos((i * Math.PI) / 3 + Math.PI / 6)).toFixed(2)} ${(cy + r * Math.sin((i * Math.PI) / 3 + Math.PI / 6)).toFixed(2)}`).join("")}Z"/>`;
const tag = (text, x = 0, y = -7) => `<text x="${x}" y="${y}" text-anchor="middle">${text}</text>`;
const MOL = {
  nadh: () => `<path class="et-bond" d="M-4.2 0H4.2"/>${hex(-5.6, 0, 3.2)}${hex(5.6, 0, 3.2)}${tag("NADH")}`,
  nad: () => `<path class="et-bond" d="M-4.2 0H4.2"/>${hex(-5.6, 0, 3.2)}${hex(5.6, 0, 3.2)}${tag("NAD⁺")}`,
  succ: () => `<path class="et-bond" d="M-7 1.5L-2.4-1.5L2.4 1.5L7-1.5"/><circle class="et-bead" cx="-7" cy="1.5" r="1.6"/><circle class="et-bead" cx="7" cy="-1.5" r="1.6"/>${tag("succinato")}`,
  fum: () => `<path class="et-bond" d="M-7 1.5L-2.4-1.5L2.4 1.5L7-1.5M-2.4-.3L2.4 2.7"/><circle class="et-bead" cx="-7" cy="1.5" r="1.6"/><circle class="et-bead" cx="7" cy="-1.5" r="1.6"/>${tag("fumarato")}`,
  o: () => `${GLOW("et-g-o", 6)}<circle class="et-oxy" r="2.8"/>${tag("½ O₂")}`,
  h2o: () => `<circle class="et-hyd" cx="-3" cy="2" r="1.6"/><circle class="et-hyd" cx="3" cy="2" r="1.6"/><circle class="et-oxy" r="2.8"/>${tag("H₂O")}`,
  adp: () => `${hex(-6, 0, 3)}<path class="et-bond" d="M-3 0H5"/><circle class="et-bead" cx="1" cy="0" r="1.6"/><circle class="et-bead" cx="5" cy="0" r="1.6"/><circle class="et-bead" cx="11" cy="1" r="1.6"/>${tag("ADP + Pi", 2)}`,
  atp: () => `${GLOW("et-g-atp", 9)}${hex(-6, 0, 3)}<path class="et-bond" d="M-3 0H9"/><circle class="et-bead" cx="1" cy="0" r="1.6"/><circle class="et-bead" cx="5" cy="0" r="1.6"/><circle class="et-bead" cx="9" cy="0" r="1.6"/>${tag("ATP", 2)}`,
};
const molecule = (kind, pos) => new Sprite(LM, MOL[kind](), pos, { cls: "et-mol", attrs: { "data-kind": kind } });
const reshape = (sp, kind) => {
  sp.el.setAttribute("data-kind", kind);
  sp.el.innerHTML = MOL[kind]();
};
const electron = (pos) => new Sprite(LF, electronHtml, pos, { cls: "et-fx et-e" });

function flash(name, hold = 0.45) {
  const el = siteEls[name];
  if (!el) return;
  el.setAttribute("data-on", "");
  const token = (el._on = (el._on || 0) + 1);
  later(hold, () => {
    if (el._on === token) el.removeAttribute("data-on");
  });
}
// Send an electron through a list of named redox centres, lighting each as it passes.
function travel(e, names, dur) {
  return move(e, names.map((n) => SITE[n]), dur, { onVertex: (i) => flash(names[i]), easing: (t) => t });
}

// ── Protons ────────────────────────────────────────────────────────────────────
const protons = new Set();
const IMS_BOX = { x: [D.X[0] + 10, D.X[1] - 10], y: [D.YB + 10, D.YF + 26], z: [D.MEM[1] + 26, D.TOP - 20] };
const counts = { nadh: 0, fadh2: 0, atp: 0, h2o: 0, through: 0 };
const imsCount = () => {
  let n = 0;
  for (const p of protons) if (p.state === "ims") n++;
  return n;
};
function proton(pos, state = "matrix") {
  const sp = new Sprite(LF, protonHtml, pos, { cls: "et-fx et-h" });
  sp.state = state;
  sp.vel = [0, 0, 0];
  protons.add(sp);
  const kill = sp.kill.bind(sp);
  sp.kill = () => {
    protons.delete(sp);
    kill();
  };
  return sp;
}
function joinCloud(p) {
  p.state = "ims";
  p.vel = [rand(-8, 8), rand(-6, 6), rand(4, 10)];
}
// One proton from the matrix, up a channel of complex `id` at x, into the IMS.
async function pumpOne(id, x, top, delay) {
  await sleep(delay);
  const start = [x + rand(-5, 5), D.FY + rand(14, 26), rand(-46, -30)];
  const p = proton(start, "pumping");
  p.alpha = 0;
  fadeTo(p, 1, 0.3);
  await move(p, [[x, D.FY + 1.2, -3], [x, D.FY + 1.2, top - 2]],1.05);
  await move(p, [[x + rand(-6, 6), D.FY - rand(2, 14), IMS_BOX.z[0] + rand(0, 8)]], 0.55);
  joinCloud(p);
}
function pump(id, count, spacing = 0.18) {
  const xs = D.PUMPS[id];
  const jobs = [];
  for (let i = 0; i < count; i++) jobs.push(pumpOne(id, xs[i % xs.length], 34, i * spacing));
  log(`Complejo ${id}: ${count} H⁺ matriz → espacio intermembrana`);
  return Promise.all(jobs);
}
// A proton taken from (or released into) the matrix: it drifts and dissolves.
function matrixProton(from, to, dur = 1.1) {
  const p = proton(from, "matrix");
  return move(p, [to], dur).then(() => vanish(p, 0.4));
}

// ── Mobile carriers: a pool of Q in the bilayer, two cytochrome c on the IMS face ──
function pool(items) {
  const queue = [];
  return {
    items,
    acquire(prefer) {
      const free = items.filter((it) => !it.busy);
      if (free.length) {
        const pick = prefer ? free.sort((a, b) => prefer(a) - prefer(b))[0] : free[0];
        pick.busy = true;
        return Promise.resolve(pick);
      }
      return new Promise((resolve) => queue.push({ resolve, prefer, gen }));
    },
    release(it) {
      it.busy = false;
      const next = queue.shift();
      if (next && next.gen === gen) {
        it.busy = true;
        next.resolve(it);
      }
    },
    reset() {
      queue.length = 0;
      for (const it of items) it.busy = false;
    },
  };
}
const Q_HOME = [
  [-152, D.FY + 4, 15],
  [-84, D.FY + 4, 13],
  [40, D.FY + 4, 15],
];
const qGlow = `<circle class="et-qglow" r="9" fill="url(#et-g-site)" style="--et-site:var(--et-q)"/>`;
const Qs = Q_HOME.map((home, i) => {
  const sp = new Sprite(LQ, `<g class="et-qglow-wrap" transform="translate(${iso([0, 0, 0], PJ).map((v) => v.toFixed(1)).join(" ")})">${qGlow}</g>${D.Q_SVG}`, home, { cls: "et-q et-tinted", world: true, attrs: { "data-cx": "Q", "data-tip": "Q" } });
  sp.home = home;
  sp.phase = i * 2.1;
  return sp;
});
const QP = pool(Qs);
const CYTC_DOCK = { III: [-4, -8, 46], IV: [99, -13, 46] };
const CYTC_AIR = 54;
const Cs = ["III", "IV"].map((at) => {
  const sp = new Sprite(LC, D.CYTC_SVG, CYTC_DOCK[at], { cls: "et-cytc et-tinted", world: true, attrs: { "data-cx": "c", "data-tip": "c" } });
  sp.at = at;
  return sp;
});
const CP = pool(Cs);
const hemeOf = (c) => [c.pos[0], c.pos[1] + 7.2, c.pos[2] + 4.5];
async function cytcTo(c, at) {
  if (c.at === at) return;
  const to = CYTC_DOCK[at];
  c.at = "moving";
  await move(c, [[c.pos[0], c.pos[1], CYTC_AIR], [to[0], to[1], CYTC_AIR], to], 1.1);
  c.at = at;
}
async function qHome(q) {
  q.homing = true;
  await byDistance(q, [[q.pos[0], D.FY + 4, 15], q.home], 70);
  q.homing = false;
}

// ── Chains ─────────────────────────────────────────────────────────────────────
let running = 0;
let queued = [];
const MAX_CHAINS = 3;
function logQueue() {
  if (queued.length) log(`En cola: ${queued.length} oxidación${queued.length > 1 ? "es" : ""}`);
}
function request(kind) {
  if (running >= MAX_CHAINS) {
    queued.push(kind);
    logQueue();
    return;
  }
  start(kind);
}
function start(kind) {
  running++;
  const myGen = gen;
  (kind === "nadh" ? nadhChain() : fadChain()).then(() => {
    if (myGen !== gen) return;
    running--;
    if (queued.length) start(queued.shift());
  });
}

async function nadhChain() {
  const S0 = SITE["I.nadh"];
  const m = molecule("nadh", [S0[0] - 10, D.FY + 44, -124]);
  m.alpha = 0;
  fadeTo(m, 1, 0.4);
  const qWait = QP.acquire((q) => Math.abs(q.pos[0] - SITE["I.q"][0]));
  qWait.then((q) => byDistance(q, [[q.pos[0], D.FY + 4, 10], SITE["I.q"]], 60).then(() => (q.ready = true)));
  log("NADH llega al complejo I");
  await move(m, [[S0[0] - 4, D.FY + 30, -112], S0], 1.6);
  flash("I.fmn", 0.8);
  reshape(m, "nad");
  counts.nadh++;
  log("Complejo I: NADH → NAD⁺ + H⁺ + 2e⁻ (FMN)");
  matrixProton(lerp3(S0, [S0[0] + 8, S0[1], S0[2]], 1), [S0[0] + 26, D.FY + 30, -86], 1.4);
  move(m, [[S0[0] - 30, D.FY + 46, -120]], 2.2).then(() => vanish(m, 0.8));
  const e1 = electron(SITE["I.fmn"]);
  const e2 = electron(SITE["I.fmn"]);
  const path = ["I.n3", "I.n1b", "I.n4", "I.n5", "I.n6a", "I.n6b", "I.n2", "I.q"];
  await Promise.all([travel(e1, path, 2.2), sleep(0.3).then(() => travel(e2, path, 2.2))]);
  const q = await qWait;
  while (!q.ready) await sleep(0.05);
  q.ready = false;
  pump("I", 4, 0.16);
  e1.kill();
  e2.kill();
  flash("I.q", 0.8);
  reduceQ(q);
  // Q takes up 2 H⁺ from the matrix as it becomes QH₂.
  matrixProton([SITE["I.q"][0] + 20, D.FY + 22, -26], SITE["I.q"], 0.8);
  matrixProton([SITE["I.q"][0] + 4, D.FY + 26, -30], SITE["I.q"], 0.9);
  log("Q + 2e⁻ + 2H⁺ → QH₂ (ubiquinol)");
  await fromQ(q);
}

async function fadChain() {
  const S0 = SITE["II.succ"];
  const m = molecule("succ", [S0[0] + 16, D.FY + 44, -120]);
  m.alpha = 0;
  fadeTo(m, 1, 0.4);
  const qWait = QP.acquire((q) => Math.abs(q.pos[0] - SITE["II.q"][0]));
  qWait.then((q) => byDistance(q, [[q.pos[0], D.FY + 4, 10], SITE["II.q"]], 60).then(() => (q.ready = true)));
  log("Succinato llega al complejo II");
  await move(m, [[S0[0] + 6, D.FY + 30, -96], S0], 1.5);
  flash("II.fad", 1.6);
  reshape(m, "fum");
  counts.fadh2++;
  log("Complejo II: FAD → FADH₂ (succinato → fumarato); sin bombeo de H⁺");
  move(m, [[S0[0] + 34, D.FY + 46, -110]], 2.2).then(() => vanish(m, 0.8));
  await sleep(0.5);
  flash("II.fad", 0.6);
  const e1 = electron(SITE["II.fad"]);
  const e2 = electron(SITE["II.fad"]);
  const path = ["II.s1", "II.s2", "II.s3", "II.q"];
  await Promise.all([travel(e1, path, 1.5), sleep(0.3).then(() => travel(e2, path, 1.5))]);
  const q = await qWait;
  while (!q.ready) await sleep(0.05);
  q.ready = false;
  e1.kill();
  e2.kill();
  flash("II.q", 0.8);
  reduceQ(q);
  matrixProton([SITE["II.q"][0] + 16, D.FY + 24, -40], SITE["II.q"], 0.9);
  matrixProton([SITE["II.q"][0] - 10, D.FY + 26, -44], SITE["II.q"], 1);
  log("FADH₂ → Q: QH₂ formado en el complejo II");
  await fromQ(q);
}

function reduceQ(q) {
  q.el.setAttribute("data-red", "");
}

// QH₂ → complex III → 2 × cytochrome c → complex IV → water.
async function fromQ(q) {
  const qo = SITE["III.qo"];
  await byDistance(q, [[q.pos[0] + 14, D.FY + 4, 15], [qo[0] - 16, D.FY + 4, 20], qo], 55);
  flash("III.qo", 0.8);
  q.el.removeAttribute("data-red");
  log("Complejo III: QH₂ → Q en el sitio Qo (ciclo Q)");
  QP.release(q);
  if (!q.busy) qHome(q);
  pump("III", 4, 0.22);
  const e1 = electron(qo);
  const e2 = electron(qo);
  const ox = { arrived: 0, wait: null };
  const water = waterAtIV(ox);
  await Promise.all([toIV(e1, ox, 0), toIV(e2, ox, 1)]);
  await water;
}

async function toIV(e, ox, which) {
  if (which) {
    // The second electron's Q-cycle detour: bL → bH, then back through Rieske on the next turnover.
    await sleep(0.4);
    await travel(e, ["III.bL", "III.bH"], 0.6);
    await sleep(0.5);
    await travel(e, ["III.bL", "III.qo"], 0.5);
  }
  await travel(e, ["III.isp", "III.c1"], 0.9);
  const c = await CP.acquire((it) => (it.at === "III" ? 0 : 1));
  await cytcTo(c, "III");
  await move(e, [hemeOf(c)], 0.35);
  e.kill();
  c.el.setAttribute("data-red", "");
  log(`Citocromo c (Fe³⁺ → Fe²⁺) lleva el e⁻ ${which + 1} de 2 al complejo IV`);
  await cytcTo(c, "IV");
  c.el.removeAttribute("data-red");
  const e2 = electron(hemeOf(c));
  CP.release(c);
  await travel(e2, ["IV.cuA", "IV.a", "IV.a3"], 1.1);
  pump("IV", 1, 0);
  e2.kill();
  flash("IV.a3", 1.2);
  ox.arrived++;
  if (ox.arrived === 1) ox.call?.();
}

// ½O₂ comes to the heme a3–CuB centre with the first electron; with the second, two matrix
// H⁺ join it and one H₂O leaves.
async function waterAtIV(ox) {
  await new Promise((resolve) => (ox.call = resolve));
  const a3 = SITE["IV.a3"];
  const o = molecule("o", [a3[0] + 26, D.FY + 40, -96]);
  o.alpha = 0;
  fadeTo(o, 1, 0.3);
  await move(o, [[a3[0] + 14, D.FY + 18, -22], [a3[0] + 4, D.FY + 4, 4], a3], 1.4);
  while (ox.arrived < 2) await sleep(0.05);
  const hs = [0, 1].map((i) => proton([114 + rand(-4, 4), D.FY + rand(18, 26), rand(-44, -32)], "matrix"));
  await Promise.all(hs.map((h, i) => move(h, [[114, D.FY + 1.2, -3], [114, D.FY + 1.2, 11], a3], 0.9 + i * 0.2)));
  hs.forEach((h) => h.kill());
  flash("IV.a3", 1);
  flash("IV.cuB", 1);
  reshape(o, "h2o");
  counts.h2o++;
  log("Complejo IV: 2e⁻ + 2H⁺ + ½O₂ → H₂O");
  await move(o, [[a3[0] + 10, D.FY + 8, -8], [a3[0] + 30, D.FY + 34, -60]], 1.8);
  move(o, [[a3[0] + 40, D.FY + 44, -90]], 2.4);
  await vanish(o, 2.4);
}

// ── ATP synthase ───────────────────────────────────────────────────────────────
const V = D.V;
const F0 = { angle: 0, target: 0, lastIn: -1e9, released: 0, onRing: [], inlet: 0 };
const slotAngle = (k, angle) => angle + k * DEG_PER_H + V.ENTRY_ANGLE;
const slotPos = (k, angle) => {
  const a = (slotAngle(k, angle) * Math.PI) / 180;
  return [V.AX[0] + (V.RING_R + V.C_R * 0.55) * Math.cos(a), V.AX[1] + (V.RING_R + V.C_R * 0.55) * Math.sin(a), 15 + (k % 2 ? 4 : -4)];
};
const depthHere = (x, y, z = 0) => depthOf([x, y, z], PJ);

function takeProton() {
  // The cloud proton nearest the inlet goes down the a subunit's IMS half-channel.
  let best = null;
  let bestD = Infinity;
  const inlet = SITE["V.in"];
  for (const p of protons) {
    if (p.state !== "ims") continue;
    const d = dist3(p.pos, inlet);
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  if (!best) return;
  best.state = "f0";
  F0.inlet++;
  byDistance(best, [[inlet[0], inlet[1] + 4, inlet[2] + 14], inlet, SITE["V.inLow"]], 160).then(() => {
    if (!protons.has(best)) return;
    F0.inlet--;
    const k = (((Math.round(-F0.target / DEG_PER_H) % C_RING) + C_RING) % C_RING);
    best.state = "ring";
    best.slot = k;
    best.bound = F0.target;
    F0.onRing.push(best);
    F0.target += DEG_PER_H;
    counts.through++;
  });
}
function releaseProtons() {
  for (const p of [...F0.onRing]) {
    if (F0.angle - p.bound < 360 - DEG_PER_H - 0.5) continue;
    F0.onRing.splice(F0.onRing.indexOf(p), 1);
    p.state = "exit";
    move(p, [SITE["V.outTop"], SITE["V.out"], [SITE["V.out"][0] + rand(-6, 10), D.FY + rand(16, 30), rand(-40, -24)]], 1.1).then(() => vanish(p, 0.7));
  }
}
function betaStates() {
  const c = Math.floor(F0.angle / 120 + 1e-6);
  lobes.forEach((el, i) => {
    const s = "OLT"[(((i + c) % 3) + 3) % 3];
    if (el.dataset.state !== s) el.dataset.state = s;
  });
  while (F0.released < c) {
    F0.released++;
    const j = (((-F0.released) % 3) + 3) % 3;
    const site = SITE[`V.beta${j}`];
    counts.atp++;
    const atp = molecule("atp", site);
    lobes[j].setAttribute("data-flash", "");
    later(0.4, () => lobes[j].removeAttribute("data-flash"));
    log(`ATP sintasa: ADP + Pi → ATP en β${j + 1} (γ a ${Math.round(F0.released * 120)}°)`);
    move(atp, [[site[0] + rand(-10, 14), D.FY + 30, -86 + rand(-6, 6)]], 1.5).then(() => move(atp, [[atp.pos[0] + rand(-20, 20), D.FY + 46, -118]], 2.6)).then(() => vanish(atp, 0.8));
    later(0.8, () => {
      const adp = molecule("adp", [site[0] + rand(-30, 30), D.FY + 48, -124]);
      adp.alpha = 0;
      fadeTo(adp, 1, 0.4);
      move(adp, [[site[0], D.FY + 22, -70], site], 1.8).then(() => vanish(adp, 0.3));
    });
  }
}

// Ring, plug, γ and its foot are rebuilt from the angle.
let drawnAngle = null;
function drawRotor() {
  if (drawnAngle !== null && Math.abs(drawnAngle - F0.angle) < 0.02) return;
  drawnAngle = F0.angle;
  const [cx, cy] = V.AX;
  const S2 = (paths, opts) => solidSvg(paths, opts);
  const items = [];
  for (let k = 0; k < C_RING; k++) {
    const a = (slotAngle(k, F0.angle) * Math.PI) / 180;
    const x = cx + V.RING_R * Math.cos(a);
    const y = cy + V.RING_R * Math.sin(a);
    const g = S2(cylinder(x, y, V.C_R, V.Z[0], V.Z[1] - V.Z[0], PJ, 18, 0.4), { tone: "mid", className: k === 0 ? "et-c0" : "", inner: lineSvg(sideArc(x, y, V.C_R, 15, PJ, 12), { tone: "faint" }) });
    items.push({ d: depthHere(x, y), svg: g });
  }
  items.push({ d: depthHere(cx, cy) + 0.01, svg: S2(cylinder(cx, cy, V.PLUG_R, V.Z[0] + 0.5, V.Z[1] - V.Z[0] - 1.5, PJ, 24), { tone: "lo", crease: "none" }) });
  items.sort((a, b) => a.d - b.d);
  ringG.innerHTML = items.map((it) => it.svg).join("");
  // γ shaft with its fin, and the ε foot with a key tab.
  const t = (F0.angle * Math.PI) / 180;
  const radial = (r0, r1, half, z0, z1) => {
    const u = [Math.cos(t), Math.sin(t)];
    const v = [-u[1], u[0]];
    const p = (r, w) => [cx + u[0] * r + v[0] * w, cy + u[1] * r + v[1] * w];
    return { paths: extrude([p(r0, -half), p(r1, -half), p(r1, half), p(r0, half)], z0, z1 - z0, PJ), d: depthHere(cx + u[0] * (r0 + r1) / 2, cy + u[1] * (r0 + r1) / 2) };
  };
  const fin = radial(2.5, 8.2, 1.5, V.GAMMA_Z[0] + 6, V.GAMMA_Z[1] - 8);
  const shaft = { paths: cylinder(cx, cy, V.GAMMA_R, V.GAMMA_Z[0], V.GAMMA_Z[1] - V.GAMMA_Z[0], PJ, 20), d: depthHere(cx, cy) };
  const foot = { paths: cylinder(cx, cy, V.FOOT_R, V.FOOT_Z[0], V.FOOT_Z[1] - V.FOOT_Z[0], PJ, 28, 0.4), d: depthHere(cx, cy) };
  const tab = radial(V.FOOT_R - 1, V.FOOT_R + 2.2, 1.8, V.FOOT_Z[0], V.FOOT_Z[1]);
  const low = [shaft, fin].sort((a, b) => a.d - b.d).map((it) => S2(it.paths, { tone: "mid", lit: it === fin }));
  const high = [foot, tab].sort((a, b) => a.d - b.d).map((it) => S2(it.paths, { tone: "mid", lit: it === tab }));
  gammaG.innerHTML = low.join("") + high.join("");
}

// ── Readouts ───────────────────────────────────────────────────────────────────
let shown = {};
function show(key, text) {
  if (shown[key] === text) return;
  shown[key] = text;
  if (outEl[key]) outEl[key].textContent = text;
}
let lastLog = "";
function log(text) {
  if (text === lastLog) return;
  lastLog = text;
  outEl.log.textContent = text;
}
function readouts() {
  const n = imsCount();
  const g = gradientOf(n);
  show("n", String(n));
  show("ph", fmt(g.phIms, 2));
  show("dph", fmt(g.dpH, 2));
  show("psi", fmt(g.psi));
  show("dp", fmt(g.dp));
  show("atp", String(counts.atp));
  show("nadh", String(counts.nadh));
  show("fadh2", String(counts.fadh2));
  show("h2o", String(counts.h2o));
  const turning = Math.abs(F0.target - F0.angle) > 0.5 || F0.inlet > 0;
  show("f0", turning ? "girando" : n > THRESHOLD ? "activándose" : "detenido");
  show("deg", fmt(((F0.angle % 360) + 360) % 360));
  const bar = `${clampTo((g.dp / 240) * 100, 0, 100).toFixed(1)}%`;
  if (shown.bar !== bar) {
    shown.bar = bar;
    outEl.bar.style.width = bar;
    const share = clampTo(g.dp / 230, 0, 1);
    imsTint.style.opacity = (0.04 + share * 0.34).toFixed(3);
    plusG.style.opacity = clampTo(g.psi / PSI_MAX, 0, 1).toFixed(3);
    minusG.style.opacity = clampTo(g.psi / PSI_MAX, 0, 1).toFixed(3);
    outEl.n.parentElement.style.setProperty("--glow", share.toFixed(2));
  }
  const card = `Δp ${fmt(g.dp)} mV · ATP ${counts.atp}`;
  if (readoutEl.textContent !== card) readoutEl.textContent = card;
}

// ── Frame loop ─────────────────────────────────────────────────────────────────
let frame = 0;
let last = 0;
let visible = true;
function step(dt) {
  simT += dt;
  // Scheduler.
  if (waits.length) {
    const due = waits.filter((w) => w.t <= simT);
    if (due.length) {
      waits = waits.filter((w) => w.t > simT);
      for (const w of due) if (w.gen === gen) w.resolve();
    }
  }
  if (laters.length) {
    const due = laters.filter((w) => w.t <= simT);
    if (due.length) {
      laters = laters.filter((w) => w.t > simT);
      for (const w of due) if (w.gen === gen) w.fn();
    }
  }
  // Tweens and fades.
  for (const sp of [...sprites]) {
    const tw = sp.tween;
    if (tw) {
      tw.t = Math.min(tw.dur, tw.t + dt);
      const total = tw.lens[tw.lens.length - 1];
      const s = tw.easing(tw.t / tw.dur) * total;
      let i = 1;
      while (i < tw.lens.length - 1 && tw.lens[i] < s) i++;
      while (tw.passed < i - 1) {
        tw.onVertex?.(tw.passed);
        tw.passed++;
      }
      const span = tw.lens[i] - tw.lens[i - 1] || 1;
      sp.set(lerp3(tw.pts[i - 1], tw.pts[i], clampTo((s - tw.lens[i - 1]) / span, 0, 1)));
      if (tw.t >= tw.dur) {
        while (tw.passed < tw.pts.length - 1) {
          tw.onVertex?.(tw.passed);
          tw.passed++;
        }
        sp.tween = null;
        if (tw.gen === gen) tw.resolve();
      }
    }
    const f = sp.fade;
    if (f) {
      f.t = Math.min(f.dur, f.t + dt);
      sp.alpha = f.from + (f.to - f.from) * (f.t / f.dur);
      sp.dirty = true;
      if (f.t >= f.dur) {
        sp.fade = null;
        f.resolve();
      }
    }
  }
  // The proton cloud wanders, damped, inside the IMS.
  const calm = still.matches;
  for (const p of protons) {
    if (p.state !== "ims" || p.tween) continue;
    if (calm) continue;
    const v = p.vel;
    for (let a = 0; a < 3; a++) v[a] = v[a] * Math.exp(-dt * 1.4) + rand(-1, 1) * 90 * dt;
    const pos = p.pos;
    const box = [IMS_BOX.x, IMS_BOX.y, IMS_BOX.z];
    for (let a = 0; a < 3; a++) {
      pos[a] += v[a] * dt;
      if (pos[a] < box[a][0]) v[a] = Math.abs(v[a]) + 2 * (box[a][0] - pos[a]);
      if (pos[a] > box[a][1]) v[a] = -Math.abs(v[a]) - 2 * (pos[a] - box[a][1]);
    }
    p.dirty = true;
  }
  // Q at rest bobs a little in the bilayer.
  if (!calm)
    for (const q of Qs) {
      if (q.busy || q.tween || q.homing) continue;
      q.set([q.home[0] + Math.sin(simT * 0.7 + q.phase) * 5, q.home[1], q.home[2] + Math.sin(simT * 1.1 + q.phase) * 2.2]);
    }
  // F₀: above the threshold, take protons in at the rate Δp sets.
  const n = imsCount();
  if (n > THRESHOLD && F0.inlet < 2 && simT - F0.lastIn >= f0Interval(n)) {
    F0.lastIn = simT;
    takeProton();
  }
  const before = F0.angle;
  F0.angle = calm ? F0.target : F0.angle + (F0.target - F0.angle) * (1 - Math.exp(-dt / 0.22));
  if (Math.abs(F0.target - F0.angle) < 0.01) F0.angle = F0.target;
  for (const p of F0.onRing) p.set(slotPos(p.slot, F0.angle));
  if (F0.angle !== before || drawnAngle === null) {
    releaseProtons();
    betaStates();
  }
}
function render() {
  drawRotor();
  for (const sp of sprites) if (sp.dirty) sp.place();
  // Protons on the ring dim when they pass behind it.
  for (const p of F0.onRing) {
    const a = (slotAngle(p.slot, F0.angle) * Math.PI) / 180;
    const front = Math.cos(a) * towardViewer(PJ)[0] + Math.sin(a) * towardViewer(PJ)[1];
    p.el.style.opacity = (0.35 + 0.65 * clampTo((front + 0.3) / 0.8, 0, 1)).toFixed(2);
  }
  readouts();
}
function tick(now) {
  const real = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
  last = now;
  const total = real * speed();
  const steps = Math.ceil(total / (1 / 30));
  for (let i = 0; i < steps; i++) step(total / steps);
  tour(real);
  render();
  frame = visible ? requestAnimationFrame(tick) : 0;
}
const run = () => {
  if (!frame && visible) {
    last = 0;
    frame = requestAnimationFrame(tick);
  }
};
new IntersectionObserver((entries) => {
  visible = entries[entries.length - 1].isIntersecting;
  if (visible) run();
}).observe(stage);
document.addEventListener("visibilitychange", () => {
  visible = !document.hidden;
  if (visible) run();
});

// ── Controls ───────────────────────────────────────────────────────────────────
function reset() {
  gen++;
  waits = [];
  laters = [];
  running = 0;
  queued = [];
  for (const sp of [...sprites]) {
    if (Qs.includes(sp) || Cs.includes(sp)) continue;
    sp.kill();
  }
  protons.clear();
  QP.reset();
  CP.reset();
  Qs.forEach((q) => {
    q.tween = null;
    q.homing = false;
    q.ready = false;
    q.el.removeAttribute("data-red");
    q.set(q.home);
  });
  Cs.forEach((c, i) => {
    c.tween = null;
    c.at = i ? "IV" : "III";
    c.el.removeAttribute("data-red");
    c.set(CYTC_DOCK[c.at]);
  });
  Object.values(siteEls).forEach((el) => el.removeAttribute("data-on"));
  Object.assign(F0, { angle: 0, target: 0, lastIn: -1e9, released: 0, onRing: [], inlet: 0 });
  Object.assign(counts, { nadh: 0, fadh2: 0, atp: 0, h2o: 0, through: 0 });
  drawnAngle = null;
  betaStates();
  log("Simulación reiniciada: gradiente vacío, Δp = 0 mV.");
}
let touched = false;
function act(kind, byUser = true) {
  if (byUser && !touched) {
    touched = true;
    if (tourBusy) reset();
  }
  if (kind === "reset") reset();
  else request(kind);
  run();
}
document.querySelectorAll("[data-act]").forEach((button) => button.addEventListener("click", () => act(button.dataset.act)));
document.addEventListener("keydown", (event) => {
  if (event.target.closest("input, textarea, select") || event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toLowerCase();
  const kind = key === "n" ? "nadh" : key === "f" ? "fadh2" : key === "r" ? "reset" : null;
  if (!kind) return;
  event.preventDefault();
  act(kind);
});

// Idle tour: until someone presses a button, the page oxidises substrates on its own.
const TOUR = ["nadh", "nadh", "fadh2", "nadh"];
let tourClock = -1.2;
let tourStep = 0;
let tourBusy = false;
function tour(dt) {
  if (touched || still.matches) return;
  tourClock += dt;
  if (tourClock < 0) return;
  tourBusy = true;
  const gap = tourStep < 2 ? 3.4 : 6.5;
  if (tourClock >= gap || tourStep === 0) {
    tourClock = 0;
    act(TOUR[tourStep % TOUR.length], false);
    tourStep++;
  }
}

// ── Tooltips ───────────────────────────────────────────────────────────────────
let hotKey = null;
function tipHtml(key) {
  const t = TIPS[key];
  return `<h3>${t.name}</h3><p>${t.formal}</p><ul>${t.lines.map((l) => `<li>${l}</li>`).join("")}</ul>`;
}
function setHot(key) {
  if (key === hotKey) return;
  svg.querySelectorAll(".et-cx[data-hot]").forEach((el) => el.removeAttribute("data-hot"));
  hotKey = key;
  if (key) svg.querySelectorAll(`.et-cx[data-cx="${key}"]`).forEach((el) => el.setAttribute("data-hot", ""));
}
function pointAt(event) {
  const hit = event.target.closest?.("[data-tip]");
  const key = hit?.dataset.tip;
  if (!key || !TIPS[key]) {
    tipBox.hidden = true;
    setHot(null);
    return;
  }
  setHot(key);
  if (tipBox.dataset.key !== key) {
    tipBox.dataset.key = key;
    tipBox.innerHTML = tipHtml(key);
    const hue = { I: [218, "62%"], II: [142, "46%"], III: [272, "46%"], IV: [338, "52%"], V: [184, "50%"], Q: [48, "90%"], c: [4, "66%"] }[key] || [214, "14%"];
    tipBox.style.setProperty("--h", hue[0]);
    tipBox.style.setProperty("--s", hue[1]);
  }
  tipBox.hidden = false;
  const box = stage.getBoundingClientRect();
  const x = event.clientX - box.left;
  const y = event.clientY - box.top;
  const w = tipBox.offsetWidth;
  const h = tipBox.offsetHeight;
  tipBox.style.left = `${clampTo(x + 16, 4, box.width - w - 4)}px`;
  tipBox.style.top = `${y + 18 + h > box.height ? y - h - 14 : y + 18}px`;
}
stage.addEventListener("pointermove", pointAt);
stage.addEventListener("pointerdown", pointAt);
stage.addEventListener("pointerleave", () => {
  tipBox.hidden = true;
  setHot(null);
});

betaStates();
render();
run();
