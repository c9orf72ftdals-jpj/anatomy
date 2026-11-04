// The chemistry the figure shows, as one small pure model. The build reads it for the
// caption and the tooltips; the page inlines it and drives every count and readout from it.

// Protons each complex moves from the matrix to the intermembrane space per 2 e⁻.
export const PUMP = { I: 4, II: 0, III: 4, IV: 2 };
export const PER_NADH = PUMP.I + PUMP.III + PUMP.IV; // 10
export const PER_FADH2 = PUMP.II + PUMP.III + PUMP.IV; // 6

// Bovine ATP synthase: a c8 ring, so 8 H⁺ turn the rotor once and the three β sites
// release 3 ATP per turn (one every 120°).
export const C_RING = 8;
export const ATP_PER_TURN = 3;
export const DEG_PER_H = 360 / C_RING; // 45°
export const H_PER_ATP = C_RING / ATP_PER_TURN; // 2.67

// Standard reduction potentials E°' (V, pH 7), textbook values.
export const E0 = {
  nad: -0.32, // NAD⁺/NADH
  fmn: -0.3, // FMN in complex I
  n2: -0.15, // Fe-S cluster N2
  fum: 0.031, // fumarate/succinate
  q: 0.045, // Q/QH₂
  bL: -0.03,
  bH: 0.05,
  rieske: 0.28,
  c1: 0.22,
  c: 0.254,
  cuA: 0.25,
  a: 0.29,
  a3: 0.35,
  o2: 0.816, // ½O₂/H₂O
};
export const FARADAY = 96.485; // kJ mol⁻¹ V⁻¹
export const dG = (eFrom, eTo, n = 2) => -n * FARADAY * (eTo - eFrom); // kJ/mol

// The gradient. Each drawn H⁺ stands for a packet of protons. Membrane potential grows with
// the charge moved and saturates (leak), ΔpH grows more slowly; Δp = Δψ + 59·ΔpH mV.
export const PH_MATRIX = 7.8;
export const PSI_MAX = 180; // mV
export const PSI_N = 18;
export const DPH_MAX = 0.9;
export const DPH_N = 22;
export const THRESHOLD = 12; // H⁺ in the IMS before F₀ turns
export const CAP = 72; // most H⁺ the IMS shows

export function gradientOf(n) {
  const psi = PSI_MAX * (1 - Math.exp(-n / PSI_N));
  const dpH = DPH_MAX * (1 - Math.exp(-n / DPH_N));
  const dp = psi + 59 * dpH;
  return { n, psi, dpH, dp, phIms: PH_MATRIX - dpH };
}
export const THRESHOLD_DP = gradientOf(THRESHOLD).dp;

// Interval between protons through F₀ once it runs: faster as Δp rises above the threshold.
export function f0Interval(n) {
  const over = Math.max(0, gradientOf(n).dp - THRESHOLD_DP);
  return Math.max(0.16, 0.5 - over * 0.004);
}

// Whole ATP released for a count of protons through F₀: one per 120° of γ.
export const atpOf = (protons) => Math.floor((protons * DEG_PER_H) / (360 / ATP_PER_TURN));
