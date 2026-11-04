// Electron transport chain and chemiosmosis: an isometric cutaway of the inner
// mitochondrial membrane. `node build.mjs` writes electron-transport.html (dark);
// `--light` writes electron-transport-light.html.
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../kit/iso-kit.mjs";
import { kitScript } from "../../scripts/inline-kit.mjs";
import * as M from "./model.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const theme = process.argv.includes("--light") ? "light" : "dark";

const W = 1000;
const H = 720;

// World: x along the membrane, y into the page (the cut plane is y = 0, the back wall
// y = -100), z up. 6 units ≈ 1 nm.
const NM = 6;
const X0 = -300;
const X1 = 300;
const YB = -100;
const YF = 0;
const MEM = [0, 30]; // bilayer, ≈ 5 nm with head groups
const FLOOR = -130; // matrix floor (top of the base)
const TOP = 112; // top of the case
const CY = -10; // centre line of the complexes: half of each stands proud of the cut
const FY = 10; // front faces of the complexes

const BASE = { x: -324, y: -124, w: 648, d: 188, r: 9 };
const BASE_H = 15;
const FOOT_H = 6;

const P = k.fitProjection(
  [
    ...k.boxCorners(BASE, FLOOR - BASE_H - FOOT_H, FLOOR),
    [X0 - 8, YB - 8, TOP + 8],
    [X1 + 8, YB - 8, TOP + 8],
    [X0 - 8, YF + 8, TOP + 8],
  ],
  W,
  H,
  { pad: 26, azimuth: 60 },
);

const at = (point) => k.iso(point, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const poly = (points) => k.pathOf(points.map(at), true);
const seg = (a, b) => k.segment(a, b, P);
const depth = (x, y, z = 0) => k.depthOf([x, y, z], P);
const r1 = (v) => Math.round(v * 10) / 10;

// A marker drawn flat on a vertical face y = fy (Fe-S cluster, heme, copper, flavin).
function marker(kind, [x, fy, z], site, extra = "") {
  const y = fy + 0.15;
  let d = "";
  if (kind === "fes") d = poly([[x, y, z + 2.3], [x + 2.3, y, z], [x, y, z - 2.3], [x - 2.3, y, z]]);
  if (kind === "heme") d = poly([[x - 2.4, y, z - 2.4], [x + 2.4, y, z - 2.4], [x + 2.4, y, z + 2.4], [x - 2.4, y, z + 2.4]]);
  if (kind === "cu") d = k.sideRing([x, y, z], 2.1, "y", P, 18);
  if (kind === "fl") d = poly(Array.from({ length: 6 }, (_, i) => [x + 3 * Math.cos((i * Math.PI) / 3), y, z + 3 * Math.sin((i * Math.PI) / 3)]));
  if (kind === "q") d = k.sideRing([x, y, z], 3.1, "y", P, 22);
  const core = kind === "heme" || kind === "cu" ? `<circle class="et-site-core" cx="${r1(at([x, y, z])[0])}" cy="${r1(at([x, y, z])[1])}" r="0.7"/>` : "";
  return `<g class="et-site" data-kind="${kind}" data-site="${site}"${extra}><path class="et-site-glow" d="${d}"/><path class="et-site-mark" d="${d}"/>${core}</g>`;
}

// A channel slot on a front face: a closed rounded outline, so it has no ends.
function slot(x, fy, z0, z1, w = 5) {
  const y = fy + 0.1;
  const r = w / 2;
  const pts = [];
  for (let i = 0; i <= 8; i++) {
    const t = (i * Math.PI) / 8;
    pts.push([x + r * Math.cos(t), y, z1 - r + r * Math.sin(t)]);
  }
  for (let i = 0; i <= 8; i++) {
    const t = Math.PI + (i * Math.PI) / 8;
    pts.push([x + r * Math.cos(t), y, z0 + r + r * Math.sin(t)]);
  }
  return `<path class="et-slot" d="${poly(pts)}"/>`;
}

// Seams on a slab's front face (y = fy) at x, from z0 to z1, carried over the top to the back.
const frontSeam = (x, fy, z0, z1, yBack) => L(seg([x, fy, z0], [x, fy, z1]) + k.lineOnTop([x, fy], [x, yBack], z1, P), { tone: "faint" });

const label = (text, [x, y], z, size = 7) => k.faceTextSvg(k.topMatrix([x, y], z, P, "x"), text, { size, tone: "hi", anchor: "middle" });

// ── Base, case and walls ─────────────────────────────────────────────────────────
function base() {
  const z0 = FLOOR - BASE_H;
  const out = [`<path class="iso-halo" d="${k.haloOf(BASE, z0 - FOOT_H, BASE_H, P)}"/>`];
  const feet = k.corners(BASE, 26).sort((a, b) => depth(a[0], a[1]) - depth(b[0], b[1]));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 9, z0 - FOOT_H, 2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, z0 - FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(BASE, z0, BASE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(BASE, 6), FLOOR, P), { tone: "faint" }));
  const screws = k.corners(BASE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.6, FLOOR, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, FLOOR])), { size: 0.6 }));
  // Wall channel the panels stand in.
  out.push(S(k.slabOf({ x: X0 - 10, y: YB - 10, w: X1 - X0 + 20, d: 12, r: 2 }, FLOOR, 3, P, 3, 0.5), { tone: "lo" }));
  out.push(S(k.slabOf({ x: X0 - 10, y: YB - 10, w: 12, d: YF - YB + 14, r: 2 }, FLOOR, 3, P, 3, 0.5), { tone: "lo" }));
  // Scale ruler along the front: 1 nm per tick, a major tick every 5 nm.
  const strip = { x: -250, y: 42, w: 500, d: 9, r: 1.2 };
  out.push(S(k.slabOf(strip, FLOOR, 0.8, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 10, strip.x + strip.w - 10, NM, 5, strip.y + 0.8, FLOOR + 0.8, [2.4, 4.6], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 4, strip.y + 4.5, FLOOR + 0.8]), at([strip.x + strip.w - 4, strip.y + 4.5, FLOOR + 0.8])], { size: 0.5 }));
  out.push(k.faceTextSvg(k.topMatrix([strip.x + 10 + 30 * 0.5, strip.y + 7.6], FLOOR + 0.8, P, "x"), "10 nm", { size: 3.6, tone: "lo", anchor: "middle" }));
  // Label plate.
  const plate = { x: -312, y: 30, w: 44, d: 22, r: 2 };
  out.push(S(k.slabOf(plate, FLOOR, 1, P, 4, 0.4), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plate, 2), FLOOR + 1, P, 4), { tone: "faint" }));
  out.push(L([[6, 30], [11, 24], [16, 18]].map(([yy, len]) => k.lineOnTop([plate.x + 6, plate.y + yy], [plate.x + 6 + len, plate.y + yy], FLOOR + 1, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([plate.x + 3.5, plate.y + 3.5, FLOOR + 1]), at([plate.x + plate.w - 3.5, plate.y + plate.d - 3.5, FLOOR + 1])], { size: 0.45 }));
  return out.join("");
}

const POSTS = [
  { x: X0 - 9, y: YB - 9, w: 9, d: 9, r: 1.4 },
  { x: X1, y: YB - 9, w: 9, d: 9, r: 1.4 },
  { x: X0 - 9, y: YF, w: 9, d: 9, r: 1.4 },
];

function walls() {
  const out = [];
  const zMid = [MEM[0], MEM[1]];
  out.push(S(k.slabOf(POSTS[0], FLOOR, TOP + 6 - FLOOR, P, 3, 0.5), { tone: "mid" }));
  // Left wall, x = -300 plane (inner face visible), lower = matrix, upper = IMS.
  const leftLow = { x: X0 - 4, y: YB, w: 4, d: YF - YB, r: 0 };
  out.push(`<g class="et-wall" data-zone="matrix">${S(k.slabOf(leftLow, FLOOR, zMid[0] - FLOOR, P, 1), { tone: "lo", crease: "none" })}</g>`);
  out.push(`<g class="et-wall" data-zone="ims">${S(k.slabOf(leftLow, zMid[1], TOP - zMid[1], P, 1), { tone: "lo", crease: "none" })}</g>`);
  // Back wall, y = -100 plane.
  const backLow = { x: X0, y: YB - 4, w: X1 - X0, d: 4, r: 0 };
  out.push(`<g class="et-wall" data-zone="matrix">${S(k.slabOf(backLow, FLOOR, zMid[0] - FLOOR, P, 1), { tone: "lo", crease: "none" })}</g>`);
  out.push(`<g class="et-wall" data-zone="ims">${S(k.slabOf(backLow, zMid[1], TOP - zMid[1], P, 1), { tone: "lo", crease: "none" })}</g>`);
  // Tints on the inner faces: the matrix is a fixed cool wash, the IMS warms with Δp.
  const backFace = (z0, z1) => poly([[X0, YB, z0], [X1, YB, z0], [X1, YB, z1], [X0, YB, z1]]);
  const leftFace = (z0, z1) => poly([[X0, YB, z0], [X0, YF, z0], [X0, YF, z1], [X0, YB, z1]]);
  out.push(`<path class="et-tint" data-zone="matrix" d="${backFace(FLOOR, MEM[0]) + leftFace(FLOOR, MEM[0])}"/>`);
  out.push(`<path class="et-tint" data-zone="ims" data-live="ims-tint" d="${backFace(MEM[1], TOP) + leftFace(MEM[1], TOP)}" style="opacity:0"/>`);
  // Faint water lines on the panels: horizontal rules run the full panel, corner to corner.
  const rules = [];
  for (let z = FLOOR + 20; z < MEM[0] - 4; z += 20) rules.push(seg([X0, YB, z], [X1, YB, z]) + seg([X0, YF, z], [X0, YB, z]));
  for (let z = MEM[1] + 18; z < TOP - 4; z += 18) rules.push(seg([X0, YB, z], [X1, YB, z]) + seg([X0, YF, z], [X0, YB, z]));
  out.push(L(rules.join(""), { tone: "faint" }));
  // Outer membrane, cut back to a strip along the top of the back wall, with VDAC porins.
  const omm = { x: X0, y: YB, w: X1 - X0, d: 22, r: 0 };
  const OZ = [96, 108];
  out.push(`<g class="et-mem" data-tip="omm">${S(k.slabOf(omm, OZ[0], OZ[1] - OZ[0], P, 1), { tone: "mid" })}`);
  const oy = YB + omm.d;
  const heads = [];
  const tails = [];
  for (let x = X0 + 3; x < X1 - 1; x += 4.5) {
    heads.push(k.sideRing([x, oy + 0.1, OZ[1] - 1.8], 1.4, "y", P, 10), k.sideRing([x, oy + 0.1, OZ[0] + 1.8], 1.4, "y", P, 10));
    tails.push(seg([x, oy + 0.1, OZ[1] - 3.4], [x, oy + 0.1, (OZ[0] + OZ[1]) / 2 + 0.6]), seg([x, oy + 0.1, OZ[0] + 3.4], [x, oy + 0.1, (OZ[0] + OZ[1]) / 2 - 0.6]));
  }
  out.push(`<path class="et-lipid-head" d="${heads.join("")}"/>`, L(tails.join(""), { tone: "lo", free: true, className: "et-tail" }));
  out.push(`</g>`);
  for (const x of [-230, -110, 10, 130, 250]) {
    out.push(`<g class="et-porin et-tinted" data-cx="vdac" data-tip="vdac">${S(k.cylinder(x, YB + 11, 6.5, OZ[0] - 2, OZ[1] - OZ[0] + 4, P, 24, 0.5), { tone: "mid" })}${L(k.ring(x, YB + 11, 3.6, OZ[1] + 2, P, 18), { tone: "lo" })}</g>`);
  }
  out.push(S(k.slabOf({ x: X0 - 9, y: YB - 9, w: X1 - X0 + 18, d: 7, r: 1.4 }, TOP, 6, P, 3, 0.5), { tone: "mid" }));
  out.push(S(k.slabOf({ x: X0 - 9, y: YB - 2, w: 7, d: YF - YB + 11, r: 1.4 }, TOP, 6, P, 3, 0.5), { tone: "mid" }));
  out.push(D([at([X0 - 4.5, YB - 4.5, TOP + 6]), at([X1 + 4.5, YB - 4.5, TOP + 6]), at([X0 - 5.5, YF + 4.5, TOP + 6])], { size: 0.55 }));
  return out.join("");
}

// ── The bilayer ─────────────────────────────────────────────────────────────────
const GAPS = [
  [-300, -297],
  [-158, -148],
  [-96, -72],
  [24, 58],
  [122, 194],
  [252, 300],
];

function membrane() {
  const out = [`<g class="et-mem" data-tip="mim">`];
  const slab = { x: X0, y: YB, w: X1 - X0, d: YF - YB, r: 0 };
  out.push(S(k.slabOf(slab, MEM[0], MEM[1] - MEM[0], P, 1), { tone: "mid" }));
  // Cut face: head-group bands and the hydrophobic core.
  const band = (z0, z1, x0 = X0, x1 = X1) => poly([[x0, YF, z0], [x1, YF, z0], [x1, YF, z1], [x0, YF, z1]]);
  const bandX = (z0, z1) => poly([[X1, YF, z0], [X1, YB, z0], [X1, YB, z1], [X1, YF, z1]]);
  out.push(`<path class="et-band" data-band="head" d="${band(MEM[1] - 6, MEM[1]) + band(MEM[0], MEM[0] + 6) + bandX(MEM[1] - 6, MEM[1]) + bandX(MEM[0], MEM[0] + 6)}"/>`);
  out.push(`<path class="et-band" data-band="core" d="${band(MEM[0] + 6, MEM[1] - 6) + bandX(MEM[0] + 6, MEM[1] - 6)}"/>`);
  const heads = [];
  const tails = [];
  const mid = (MEM[0] + MEM[1]) / 2;
  const lipid = (x, y, axis) => {
    const p = (dx, z) => (axis === "x" ? [x + dx, y, z] : [x, y + dx, z]);
    const ring = (z) => (axis === "x" ? k.sideRing([x, y + 0.1, z], 2.05, "y", P, 12) : k.sideRing([x + 0.1, y, z], 2.05, "x", P, 12));
    heads.push(ring(MEM[1] - 2.6), ring(MEM[0] + 2.6));
    for (const [top, sign] of [[MEM[1] - 4.7, -1], [MEM[0] + 4.7, 1]]) {
      const end = mid - sign * 0.7;
      tails.push(k.pathOf([p(-0.85, top), p(-0.85, end)].map(at)));
      const kink = top + sign * 4.6;
      tails.push(k.pathOf([p(0.85, top), p(0.85, kink), p(1.6, kink + sign * 1.6), p(1.6, end)].map(at)));
    }
  };
  for (let x = X0 + 2.5; x < X1; x += 5) lipid(x, YF, "x");
  for (let y = YF - 2.5; y > YB; y -= 5) lipid(X1, y, "y");
  out.push(`<path class="et-lipid-head" d="${heads.join("")}"/>`);
  out.push(L(tails.join(""), { tone: "lo", free: true, className: "et-tail" }));
  // Head groups seen from above on the IMS face.
  const dots = [];
  for (let row = 0, y = YF - 4; y > YB + 2; y -= 6.5, row++) for (let x = X0 + 4 + (row % 2) * 3.25; x < X1 - 2; x += 6.5) dots.push(at([x, y, MEM[1]]));
  out.push(D(dots, { size: 0.55, tone: "faint" }));
  // Charge on the two faces: + on the IMS face, − under the matrix face; opacity follows Δψ.
  const plus = [];
  for (let x = X0 + 14; x < X1 - 6; x += 20) {
    const y = YF - 5;
    plus.push(k.lineOnTop([x - 2.2, y], [x + 2.2, y], MEM[1] + 0.1, P), k.lineOnTop([x, y - 2.2], [x, y + 2.2], MEM[1] + 0.1, P));
  }
  out.push(`<g class="et-charge" data-sign="plus" data-live="plus" style="opacity:0">${L(plus.join(""), { tone: "hi", free: true })}</g>`);
  out.push(`</g>`);
  return out.join("");
}

function minusMarks() {
  const minus = [];
  for (const [a, b] of GAPS) for (let x = a + 6; x < b - 4; x += 12) minus.push(seg([x - 2.2, YF + 1, -4], [x + 2.2, YF + 1, -4]));
  return `<g class="et-charge" data-sign="minus" data-live="minus" style="opacity:0">${L(minus.join(""), { tone: "hi", free: true })}</g>`;
}

// ── Complexes ───────────────────────────────────────────────────────────────────
const C = {};
const SITES = {}; // world points the live code moves things between

// Complex I: membrane arm with four pumps, peripheral arm hanging into the matrix.
C.I = (() => {
  const arm = { x: -296, y: -28, w: 136, d: FY + 28, r: 5 };
  const tip = { x: -210, y: -30, w: 52, d: FY + 30, r: 8 };
  const midA = { x: -206, y: -28, w: 46, d: FY + 28, r: 6 };
  const up = { x: -203, y: -26, w: 40, d: FY + 26, r: 5 };
  const ex = -184;
  const chain = [
    ["fmn", "fl", -88],
    ["n3", "fes", -78],
    ["n1b", "fes", -68],
    ["n4", "fes", -58],
    ["n5", "fes", -48],
    ["n6a", "fes", -38],
    ["n6b", "fes", -28],
    ["n2", "fes", -16],
  ];
  const pumps = [-282, -256, -232, -214];
  const matrix = [];
  matrix.push(S(k.slabOf(tip, -102, 28, P, 8, 0.8), { tone: "mid" }));
  matrix.push(S(k.slabOf(midA, -74, 38, P, 6, 0.6), { tone: "mid", inner: L(k.sideSeam(midA, -55, P, 6), { tone: "faint" }) }));
  matrix.push(S(k.slabOf(up, -36, 32, P, 5, 0.6), { tone: "mid", inner: L(k.sideSeam(up, -20, P, 5), { tone: "faint" }) }));
  matrix.push(`<path class="et-pocket" d="${poly([[ex - 9, FY + 0.1, -98], [ex + 9, FY + 0.1, -98], [ex + 9, FY + 0.1, -92], [ex - 9, FY + 0.1, -92]])}"/>`);
  const wires = [];
  chain.forEach(([, , z], i) => {
    if (i) wires.push(seg([ex + (i % 2 ? 2 : -2), FY + 0.1, chain[i - 1][2]], [ex + (i % 2 ? -2 : 2), FY + 0.1, z]));
  });
  matrix.push(L(wires.join(""), { tone: "lo", className: "et-wire" }));
  chain.forEach(([name, kind, z], i) => {
    const p = [ex + (i % 2 ? -2 : 2), FY, z];
    SITES[`I.${name}`] = [p[0], FY + 1, z];
    matrix.push(marker(kind, p, `I.${name}`));
  });
  SITES["I.nadh"] = [ex, FY + 9, -96];
  const membrane = [];
  const seams = [-264, -240, -222].map((x) => frontSeam(x, FY, -4, 34, arm.y)).join("");
  membrane.push(S(k.slabOf(arm, -4, 38, P, 5, 0.7), { tone: "mid", inner: seams }));
  membrane.push(pumps.map((x) => slot(x, FY, 0, 24)).join(""));
  // Lateral helix HL across the pumps, a rod on the face.
  const hl = { x: -290, y: FY, w: 104, d: 3.4, r: 1.6 };
  membrane.push(S(k.slabOf(hl, 25.5, 3.4, P, 3), { tone: "hi", crease: "none" }));
  // IMS loops.
  for (const x of [-276, -248, -224]) membrane.push(S(k.slabOf({ x: x - 6, y: -14, w: 12, d: 14, r: 4 }, 34, 3, P, 4), { tone: "mid" }));
  membrane.push(marker("q", [-190, FY, 6], "I.q"));
  SITES["I.q"] = [-190, FY + 4, 6];
  membrane.push(label("I", [-176, -14], 34));
  return { x: -230, matrix: matrix.join(""), membrane: membrane.join(""), pumps, pumpTop: 34 };
})();

// Complex II: SdhA (FAD) and SdhB (Fe-S) in the matrix, SdhC/D anchor with heme b.
C.II = (() => {
  const A = { x: -146, y: -30, w: 48, d: FY + 30, r: 8 };
  const B = { x: -140, y: -26, w: 36, d: FY + 26, r: 5 };
  const anchor = { x: -136, y: -24, w: 28, d: FY + 24, r: 6 };
  const ex = -122;
  const matrix = [];
  matrix.push(S(k.slabOf(A, -64, 34, P, 8, 0.8), { tone: "mid" }));
  matrix.push(`<path class="et-pocket" d="${poly([[ex - 8, FY + 0.1, -62], [ex + 8, FY + 0.1, -62], [ex + 8, FY + 0.1, -57], [ex - 8, FY + 0.1, -57]])}"/>`);
  matrix.push(S(k.slabOf(B, -30, 26, P, 5, 0.6), { tone: "mid" }));
  const chain = [
    ["fad", "fl", -46],
    ["s1", "fes", -24],
    ["s2", "fes", -15],
    ["s3", "fes", -7],
  ];
  matrix.push(L(seg([ex, FY + 0.1, -43], [ex, FY + 0.1, -26]) + seg([ex, FY + 0.1, -22], [ex, FY + 0.1, -17]) + seg([ex, FY + 0.1, -13], [ex, FY + 0.1, -9]), { tone: "lo", className: "et-wire" }));
  chain.forEach(([name, kind, z]) => {
    SITES[`II.${name}`] = [ex, FY + 1, z];
    matrix.push(marker(kind, [ex, FY, z], `II.${name}`));
  });
  SITES["II.succ"] = [ex, FY + 8, -59];
  const membrane = [];
  membrane.push(S(k.slabOf(anchor, -4, 38, P, 6, 0.6), { tone: "mid", inner: frontSeam(-122, FY, -4, 34, anchor.y) }));
  membrane.push(marker("heme", [-115, FY, 18], "II.b"));
  membrane.push(marker("q", [-129, FY, 6], "II.q"));
  SITES["II.q"] = [-129, FY + 4, 6];
  membrane.push(label("II", [-122, -10], 34, 6));
  return { x: -122, matrix: matrix.join(""), membrane: membrane.join(""), pumps: [], pumpTop: 34 };
})();

// Complex III: the bc1 dimer. Core proteins in the matrix, cytochrome b in the membrane,
// Rieske and cytochrome c1 heads in the IMS.
C.III = (() => {
  const coreL = { x: -68, y: -32, w: 42, d: FY + 32, r: 8 };
  const coreR = { x: -22, y: -32, w: 42, d: FY + 32, r: 8 };
  const body = { x: -70, y: -32, w: 92, d: FY + 32, r: 6 };
  const headL = { x: -62, y: -26, w: 34, d: FY + 24, r: 7 };
  const headR = { x: -16, y: -26, w: 34, d: FY + 24, r: 7 };
  const hy = headL.y + headL.d;
  const matrix = [];
  matrix.push(S(k.slabOf(coreL, -46, 42, P, 8, 0.8), { tone: "mid", inner: L(k.sideSeam(coreL, -24, P, 8), { tone: "faint" }) }));
  matrix.push(S(k.slabOf(coreR, -46, 42, P, 8, 0.8), { tone: "mid", inner: L(k.sideSeam(coreR, -24, P, 8), { tone: "faint" }) }));
  const membrane = [];
  membrane.push(S(k.slabOf(body, -4, 38, P, 6, 0.7), { tone: "mid", inner: frontSeam(-24, FY, -4, 34, body.y) }));
  membrane.push(slot(-58, FY, 0, 30), slot(10, FY, 0, 30));
  membrane.push(L(seg([-40, FY + 0.1, 23], [-40, FY + 0.1, 11]), { tone: "lo", className: "et-wire" }));
  membrane.push(marker("heme", [-40, FY, 26], "III.bL"), marker("heme", [-40, FY, 8], "III.bH"));
  membrane.push(marker("q", [-30, FY, 26], "III.qo"), marker("q", [-30, FY, 7], "III.qi"));
  SITES["III.qo"] = [-30, FY + 4, 26];
  SITES["III.bL"] = [-40, FY + 1, 26];
  SITES["III.bH"] = [-40, FY + 1, 8];
  for (const head of [headL, headR]) membrane.push(S(k.slabOf(head, 34, 12, P, 7, 0.6), { tone: "mid" }));
  membrane.push(L(seg([-42, hy + 0.1, 41], [-12, hy + 0.1, 42]), { tone: "lo", className: "et-wire" }));
  membrane.push(marker("fes", [-45, hy, 41], "III.isp"), marker("heme", [-9, hy, 42], "III.c1"));
  SITES["III.isp"] = [-45, hy + 1, 41];
  SITES["III.c1"] = [-9, hy + 1, 42];
  membrane.push(label("III", [-45, -12], 46, 6));
  return { x: -24, matrix: matrix.join(""), membrane: membrane.join(""), pumps: [-58, -58, 10, 10], pumpTop: 34 };
})();

// Complex IV: cytochrome c oxidase. CuA in subunit II's IMS head, heme a and the
// heme a3–CuB centre in subunit I.
C.IV = (() => {
  const mat = { x: 62, y: -30, w: 56, d: FY + 30, r: 6 };
  const body = { x: 60, y: -32, w: 62, d: FY + 32, r: 6 };
  const head = { x: 72, y: -26, w: 38, d: FY + 22, r: 8 };
  const hy = head.y + head.d;
  const matrix = [S(k.slabOf(mat, -18, 14, P, 6, 0.6), { tone: "mid" })];
  const membrane = [];
  membrane.push(S(k.slabOf(body, -4, 38, P, 6, 0.7), { tone: "mid", inner: frontSeam(80, FY, -4, 34, body.y) + frontSeam(108, FY, -4, 34, body.y) }));
  membrane.push(slot(70, FY, 0, 30), slot(114, FY, 0, 14, 4));
  membrane.push(L(seg([88.5, FY + 0.1, 22], [97.5, FY + 0.1, 18]), { tone: "lo", className: "et-wire" }));
  membrane.push(marker("heme", [86, FY, 23], "IV.a"), marker("heme", [100, FY, 17], "IV.a3"), marker("cu", [106, FY, 22], "IV.cuB"));
  SITES["IV.a"] = [86, FY + 1, 23];
  SITES["IV.a3"] = [101, FY + 2, 18];
  membrane.push(S(k.slabOf(head, 34, 12, P, 7, 0.6), { tone: "mid" }));
  membrane.push(marker("cu", [92, hy, 41], "IV.cuA"));
  SITES["IV.cuA"] = [92, hy + 1, 41];
  membrane.push(label("IV", [80, 0], 46, 6));
  return { x: 90, matrix: matrix.join(""), membrane: membrane.join(""), pumps: [70, 70], pumpTop: 34 };
})();

// Complex V: ATP synthase. F₀ (c8 ring + a subunit) in the membrane, F₁ (α3β3 around γ)
// in the matrix, held by the peripheral stalk.
const AX = [212, -10];
const RING_R = 15;
const C_R = 5.2;
const F1_R = 15.5;
const LOBE_R = 12.5;
const F1_Z = [-100, -52];
const A_SUB = { x: 230, y: -24, w: 17, d: 28, r: 5 };
const INLET = 234.5;
const OUTLET = 242.5;
const ENTRY_ANGLE = 22.5;
C.V = (() => {
  const [cx, cy] = AX;
  const matrix = [];
  // Peripheral stalk foot and OSCP.
  matrix.push(S(k.slabOf({ x: cx - 3, y: cy - 3, w: 254 - cx, d: 6, r: 2.5 }, -116, 6, P, 3, 0.4), { tone: "mid" }));
  matrix.push(S(k.cylinder(cx, cy, 10, -110, 8, P, 28, 0.5), { tone: "mid" }));
  // α3β3: alternate α (0, 2, 4) and β (1, 3, 5), painted far to near.
  const lobes = Array.from({ length: 6 }, (_, i) => {
    const a = ((i * 60 + 30) * Math.PI) / 180;
    return { i, x: cx + F1_R * Math.cos(a), y: cy + F1_R * Math.sin(a), beta: i % 2 === 1 };
  }).sort((a, b) => depth(a.x, a.y) - depth(b.x, b.y));
  let betaIndex = 0;
  const betaOrder = [1, 3, 5];
  for (const lobe of lobes) {
    const tag = lobe.beta ? `data-beta="${betaOrder.indexOf(lobe.i)}"` : `data-alpha=""`;
    const cap = k.cylinder(lobe.x, lobe.y, LOBE_R - 2.5, F1_Z[1], 3.2, P, 24, 0.5);
    const site = k.ring(lobe.x + (cx - lobe.x) * 0.25, lobe.y + (cy - lobe.y) * 0.25, 3, F1_Z[1] + 3.2, P, 16);
    matrix.push(
      `<g class="et-lobe" ${tag}>${S(k.cylinder(lobe.x, lobe.y, LOBE_R, F1_Z[0], F1_Z[1] - F1_Z[0], P, 30, 0.7), { tone: "mid", inner: L(k.sideArc(lobe.x, lobe.y, LOBE_R, -76, P, 20), { tone: "faint" }) })}${S(cap, { tone: "mid" })}${lobe.beta ? `<path class="et-beta-site" d="${site}"/>` : L(site, { tone: "faint" })}</g>`,
    );
    if (lobe.beta) {
      SITES[`V.beta${betaOrder.indexOf(lobe.i)}`] = [lobe.x + (cx - lobe.x) * 0.25, lobe.y + (cy - lobe.y) * 0.25, F1_Z[1] + 4];
      betaIndex++;
    }
  }
  // Peripheral stalk: b subunits up the side, d/F6 bulge.
  matrix.push(S(k.slabOf({ x: 247, y: cy - 4, w: 7, d: 8, r: 2.8 }, -110, 106, P, 3, 0.4), { tone: "mid" }));
  matrix.push(S(k.slabOf({ x: 245, y: cy - 6, w: 11, d: 12, r: 3.5 }, -82, 22, P, 4, 0.5), { tone: "mid" }));
  // γ shaft between F1 and the foot. The fin and the ε foot turn: live.
  matrix.push(`<g data-live="gamma"></g>`);
  return { x: 212, matrix: matrix.join(""), membrane: `<g data-live="ring"></g>${S(k.slabOf(A_SUB, -4, 38, P, 5, 0.6), { tone: "mid", inner: frontSeam(239, A_SUB.y + A_SUB.d, -4, 34, A_SUB.y) })}${slot(INLET, A_SUB.y + A_SUB.d, 16, 33, 4)}${slot(OUTLET, A_SUB.y + A_SUB.d, -3, 14, 4)}${label("V", [238.5, -12], 34, 6)}`, pumps: [] };
})();
SITES["V.in"] = [INLET, A_SUB.y + A_SUB.d + 1, 33];
SITES["V.inLow"] = [INLET, A_SUB.y + A_SUB.d + 1, 17];
SITES["V.outTop"] = [OUTLET, A_SUB.y + A_SUB.d + 1, 13];
SITES["V.out"] = [OUTLET, A_SUB.y + A_SUB.d + 1, -3];

const ORDER = ["I", "II", "III", "IV", "V"];
const wrap = (id, zone, inner) => `<g class="et-cx" data-cx="${id}" data-tip="${id}" data-zone="${zone}">${inner}</g>`;

// ── Live parts built in the page: Q, cytochrome c ───────────────────────────────
// Built at the world origin; the page moves them with translateAlong.
const Q_SVG = (() => {
  const ring = S(k.cylinder(0, 0, 4.4, -2.2, 4.4, P, 6, 0.4), { tone: "hi", crease: "lo" });
  const tail = [];
  for (let i = 0; i < 7; i++) tail.push([-4.4 - i * 3.2, 0, i % 2 ? 1.2 : -1.2]);
  return `${L(k.pathOf(tail.map(at)), { tone: "mid", className: "et-q-tail", free: "end" })}${ring}`;
})();
const CYTC_SVG = (() => {
  const body = S(k.cylinder(0, 0, 7, 0, 9, P, 28, 0.6), { tone: "mid" });
  const heme = poly([[-2.6, 7.1, 2], [2.6, 7.1, 2], [2.6, 7.1, 7], [-2.6, 7.1, 7]]);
  return `${body}<g class="et-site" data-kind="heme"><path class="et-site-glow" d="${heme}"/><path class="et-site-mark" d="${heme}"/></g>${label("c", [0, 0], 9, 4.5)}`;
})();

// Live ring and γ geometry the page rebuilds every frame from the angle.
const V_GEOM = { AX, RING_R, C_R, Z: [-4, 34], PLUG_R: 8.6, GAMMA_R: 4.4, GAMMA_Z: [F1_Z[1] + 3.2, -9], FOOT_R: 10, FOOT_Z: [-9, -4], ENTRY_ANGLE };

// ── Assemble ────────────────────────────────────────────────────────────────────
const DEFS = `<defs>${[
  ["et-g-e", "--et-e"],
  ["et-g-h", "--et-h"],
  ["et-g-o", "--et-o"],
  ["et-g-atp", "--et-atp"],
  ["et-g-site", "--et-site"],
]
  .map(([id, token]) => `<radialGradient id="${id}"><stop offset="0" style="stop-color:var(${token});stop-opacity:.9"/><stop offset=".35" style="stop-color:var(${token});stop-opacity:.38"/><stop offset="1" style="stop-color:var(${token});stop-opacity:0"/></radialGradient>`)
  .join("")}</defs>`;

const body = [
  DEFS,
  base(),
  walls(),
  minusMarks(),
  ...ORDER.map((id) => wrap(id, "matrix", C[id].matrix)),
  membrane(),
  ...ORDER.map((id) => wrap(id, "membrane", C[id].membrane)),
  `<g data-layer="q"></g>`,
  `<g data-layer="cytc"></g>`,
  `<g data-layer="mol"></g>`,
  `<g data-layer="fx"></g>`,
];

const LABEL =
  "Corte isométrico de la membrana mitocondrial interna en una vitrina: arriba el espacio intermembrana bajo una tira de membrana externa con porinas, en el centro la bicapa lipídica cortada, abajo la matriz. Embebidos en la bicapa, de izquierda a derecha: el complejo I en forma de L, el complejo II, el dímero del complejo III, el complejo IV y la ATP sintasa con su anillo c en la membrana y la cabeza F1 colgando en la matriz. La ubiquinona se mueve dentro de la bicapa y el citocromo c sobre su cara externa.";

const figure = k.figureSvg({ width: W, height: H, label: LABEL, body });

// Screen positions (percent of the viewBox) for the zone labels and the tooltip anchors.
const pct = ([sx, sy]) => [r1((sx / W) * 100), r1((sy / H) * 100)];
const ZONES = [
  { id: "ims", text: "Espacio intermembrana", at: pct(at([X0, YF, 78])) },
  { id: "omm", text: "Membrana externa", at: pct(at([X0, YB + 22, 110])) },
  { id: "mim", text: "Membrana interna", at: pct(at([X0, YF, 22])) },
  { id: "matrix", text: "Matriz mitocondrial", at: pct(at([X0, YF, -58])) },
];

const DATA = {
  P,
  W,
  H,
  NM,
  X: [X0, X1],
  YB,
  YF,
  MEM,
  FLOOR,
  TOP,
  FY,
  SITES,
  PUMPS: Object.fromEntries(ORDER.map((id) => [id, C[id].pumps])),
  CX: Object.fromEntries(ORDER.map((id) => [id, C[id].x])),
  V: V_GEOM,
  Q_SVG,
  CYTC_SVG,
};

const E = M.E0;
const v = (x) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(3).replace(/0$/, "")} V`;
const TIPS = {
  I: { name: "Complejo I", formal: "NADH:ubiquinona oxidorreductasa (NADH deshidrogenasa)", lines: [`NAD⁺/NADH  E°′ ${v(E.nad)}`, `FMN → 7 centros Fe-S → N2 (${v(E.n2)}) → Q`, `Bombea ${M.PUMP.I} H⁺ por 2 e⁻ (ND5, ND4, ND2 y canal E)`, "≈ 45 subunidades · ≈ 1 MDa · forma de L"] },
  II: { name: "Complejo II", formal: "Succinato:ubiquinona oxidorreductasa (succinato deshidrogenasa)", lines: [`Fumarato/succinato  E°′ ${v(E.fum)}`, "FAD unido (FADH₂) → [2Fe-2S] → [4Fe-4S] → [3Fe-4S] → Q; hemo b", "No bombea protones: ΔE°′ demasiado pequeño", "También es la enzima del ciclo de Krebs"] },
  Q: { name: "Coenzima Q", formal: "Ubiquinona / ubiquinol (Q / QH₂)", lines: [`Q/QH₂  E°′ ${v(E.q)}`, "Liposoluble: difunde dentro de la bicapa", "Acepta 2 e⁻ + 2 H⁺ de los complejos I y II", "Los entrega al sitio Qo del complejo III"] },
  III: { name: "Complejo III", formal: "Ubiquinol:citocromo c oxidorreductasa (citocromo bc₁)", lines: [`Hemos bL ${v(E.bL)} · bH ${v(E.bH)}`, `Rieske [2Fe-2S] ${v(E.rieske)} · citocromo c₁ ${v(E.c1)}`, `Ciclo Q: ${M.PUMP.III} H⁺ al espacio intermembrana por 2 e⁻`, "Dímero obligado · ≈ 480 kDa"] },
  c: { name: "Citocromo c", formal: "Citocromo c (transportador periférico)", lines: [`E°′ ${v(E.c)}`, "Proteína soluble de 12 kDa en la cara externa", "Lleva un solo e⁻ por viaje: dos viajes por par", "Del citocromo c₁ (III) al CuA (IV)"] },
  IV: { name: "Complejo IV", formal: "Citocromo c oxidasa", lines: [`CuA ${v(E.cuA)} · hemo a ${v(E.a)} · a₃–CuB ${v(E.a3)}`, `½O₂/H₂O  E°′ ${v(E.o2)}`, `Bombea ${M.PUMP.IV} H⁺ y consume 2 H⁺ de la matriz por 2 e⁻`, "2 e⁻ + 2 H⁺ + ½ O₂ → H₂O"] },
  V: { name: "Complejo V", formal: "ATP sintasa F₀F₁", lines: [`Anillo c${M.C_RING}: ${M.C_RING} H⁺ por vuelta → ${M.ATP_PER_TURN} ATP (${M.H_PER_ATP.toFixed(2)} H⁺/ATP)`, `Arranca con Δp ≳ ${M.THRESHOLD_DP.toFixed(0)} mV (aquí ${M.THRESHOLD} H⁺)`, "Rotor: anillo c + tallo γεδ · estator: a, b, d, F6, OSCP", "Cabeza α₃β₃: ADP + Pi → ATP cada 120°"] },
  mim: { name: "Membrana mitocondrial interna", formal: "Bicapa de fosfolípidos, rica en cardiolipina", lines: ["≈ 5 nm con las cabezas polares", "Impermeable a H⁺: almacena el gradiente", "Cara P (+) hacia el espacio intermembrana", "Cara N (−) hacia la matriz"] },
  omm: { name: "Membrana externa", formal: "Membrana mitocondrial externa (cortada)", lines: ["Porinas VDAC: permeable a iones y metabolitos < 5 kDa", "El pH del espacio intermembrana se equilibra con el citosol"] },
  vdac: { name: "Porina VDAC", formal: "Canal aniónico dependiente de voltaje", lines: ["Barril β de 19 hebras en la membrana externa", "Deja pasar ADP, ATP, Pi y piruvato"] },
};

const NADH_FREE = M.dG(E.nad, E.o2);
const FAD_FREE = M.dG(E.fum, E.o2);
const caption = `La membrana mitocondrial interna en corte, a escala aproximada (6 unidades ≈ 1 nm; la regla mide 10 nm por tramo mayor). El NADH cede 2 e⁻ al FMN del complejo I; los electrones bajan de potencial por siete centros Fe-S hasta la ubiquinona (Q), que los lleva por la bicapa al complejo III. El citocromo c los lleva de uno en uno al complejo IV, donde 2 e⁻ + 2 H⁺ + ½ O₂ forman H₂O. De NADH a O₂, ΔE°′ = ${(E.o2 - E.nad).toFixed(3)} V, ΔG°′ = ${NADH_FREE.toFixed(0)} kJ/mol; desde succinato, ${FAD_FREE.toFixed(0)} kJ/mol. Por par de electrones los complejos I, III y IV bombean ${M.PUMP.I} + ${M.PUMP.III} + ${M.PUMP.IV} = ${M.PER_NADH} H⁺ desde NADH, y ${M.PER_FADH2} desde FADH₂, porque el complejo II no bombea. Cada H⁺ en el espacio intermembrana suma carga (Δψ) y acidez (ΔpH): Δp = Δψ + 59·ΔpH mV. Con más de ${M.THRESHOLD} H⁺ (Δp ≈ ${M.THRESHOLD_DP.toFixed(0)} mV) los protones vuelven a la matriz por el semicanal de la subunidad a; cada uno gira el anillo c${M.C_RING} ${M.DEG_PER_H}°, y cada 120° del tallo γ un sitio β libera un ATP: ${M.C_RING} H⁺ por vuelta, ${M.ATP_PER_TURN} ATP. Cada partícula de H⁺ representa un paquete de protones, no un protón individual; el FAD del complejo II está unido a la enzima y se reduce al oxidar succinato a fumarato.`;

const panel = `
<section class="et-panel" aria-label="Controles de la simulación">
  <div class="et-actions">
    <button type="button" class="et-btn" data-act="nadh"><span class="et-btn-dot" data-cx="I"></span>Oxidar NADH en Complejo I</button>
    <button type="button" class="et-btn" data-act="fadh2"><span class="et-btn-dot" data-cx="II"></span>Oxidar FADH₂ en Complejo II</button>
    <button type="button" class="et-btn" data-act="reset" data-quiet="">Reiniciar simulación / Vaciar gradiente</button>
  </div>
  <div class="et-meters">
    <div class="et-meter" data-tone="h">
      <span class="et-k">Gradiente H⁺ · espacio intermembrana</span>
      <span class="et-v"><b data-out="n">0</b><small>H⁺</small><span class="et-sub">pH <b data-out="ph">${M.PH_MATRIX.toFixed(2)}</b> · ΔpH <b data-out="dph">0.00</b> · Δψ <b data-out="psi">0</b> mV</span></span>
      <span class="et-track" aria-hidden="true"><span class="et-fill" data-out="bar"></span><span class="et-mark" style="left:${r1((M.THRESHOLD_DP / 240) * 100)}%"></span></span>
      <span class="et-foot"><span>Δp <b data-out="dp">0</b> mV</span><span>umbral F₀ ${M.THRESHOLD_DP.toFixed(0)} mV</span></span>
    </div>
    <div class="et-meter" data-tone="atp">
      <span class="et-k">ATP sintetizados</span>
      <span class="et-v"><b data-out="atp">0</b><small>ATP</small><span class="et-sub">F₀ <b data-out="f0">detenido</b> · γ <b data-out="deg">0</b>°</span></span>
      <span class="et-foot"><span>NADH <b data-out="nadh">0</b> · FADH₂ <b data-out="fadh2">0</b></span><span>H₂O <b data-out="h2o">0</b></span></span>
    </div>
  </div>
  <p class="et-log" data-out="log" aria-live="polite">Pulsa un botón para oxidar un sustrato. La simulación corre sola mientras no toques nada.</p>
</section>`;

const zones = ZONES.map((z) => `<span class="et-zone" data-zone="${z.id}" style="left:0;top:${z.at[1]}%">${z.text}</span>`).join("");
const stage = `<div class="et-stage" tabindex="0" role="group" aria-label="Cadena de transporte de electrones. Pasa el cursor o el dedo por un complejo para ver su nombre y su potencial redox. Teclas: N oxida NADH, F oxida FADH₂, R reinicia.">${zones}${figure}<div class="et-tip" role="tooltip" hidden></div></div>`;

const plate = k.plateHtml({
  fig: "Fig 1",
  title: "Cadena de transporte de electrones",
  hint: "Pasa el cursor por un complejo",
  readout: "Δp 0 mV · ATP 0",
  keys: [
    { mark: "lit", label: "e⁻: electrones" },
    { mark: "red", label: "H⁺: protones" },
    { mark: "raised", label: "Complejos I–V codificados por color" },
    { mark: "flat", label: "Bicapa lipídica en corte" },
  ],
  caption,
  body: stage,
});

const CSS = readFileSync(join(HERE, "et.css"), "utf8");
const MODEL = readFileSync(join(HERE, "model.mjs"), "utf8").replace(/^export /gm, "");
const LIVE = readFileSync(join(HERE, "live.js"), "utf8").replace("__DATA__", JSON.stringify(DATA)).replace("__TIPS__", JSON.stringify(TIPS));
const page = k
  .pageHtml({
    title: "Cadena de transporte de electrones",
    theme,
    body: `<style>${CSS}</style><header class="et-head"><p class="et-eyebrow">Bioenergética · fosforilación oxidativa</p><h1>Cadena de transporte de electrones y quimiosmosis</h1></header>${panel}<div class="et">${plate}</div>`,
    script: kitScript() + MODEL + LIVE,
    width: 1080,
  })
  .replace('<html lang="en">', '<html lang="es">');
const name = theme === "light" ? "electron-transport-light.html" : "electron-transport.html";
writeFileSync(join(HERE, name), page);
console.log("wrote", name, `${(page.length / 1024).toFixed(0)} KB`, `scale ${P.scale.toFixed(3)}`);
