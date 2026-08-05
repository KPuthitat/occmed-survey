// engine.js — สนับสนุนการวินิจฉัยโรคประสาทหูเสื่อมจากเสียงดัง (Noise-Induced Hearing Loss · NIHL)
// ยึดหลักเกณฑ์ทางโสตวิทยา/อาชีวเวชศาสตร์ที่ยอมรับทั่วไป:
//   ACOEM · Coles, Lutman & Buffin (2000) · OSHA/NIOSH
// ลักษณะเด่นของ NIHL:
//   - เป็นประสาทหูเสื่อมชนิดประสาทรับเสียง (sensorineural) → ช่องว่าง air–bone แคบ
//   - มักเป็นสองข้างและสมมาตร
//   - มี "รอยบาก (notch)" ที่ความถี่สูง 3–6 kHz (มักเด่นสุดที่ 4 kHz) และดีขึ้นที่ 8 kHz
//   - ต้องมีประวัติสัมผัสเสียงดังเพียงพอ + ตัดสาเหตุอื่นออก (อายุ/ยา/กรรมพันธุ์/การติดเชื้อ/บาดเจ็บ)
// ⚠️ เครื่องมือ "สนับสนุน" การวินิจฉัย — แพทย์เป็นผู้วินิจฉัยขั้นสุดท้าย · Pure logic ไม่มี DOM
//
// ค่าเกณฑ์ (ปรับได้):
export const NIHL_FREQS = [500, 1000, 2000, 3000, 4000, 6000, 8000]; // Hz (dB HL)
export const NOTCH_DEPTH = 15;     // รอยบากลึกกว่าฐาน (min ของ 1–2 kHz) อย่างน้อย (dB)
export const NOTCH_RECOVERY = 10;  // ดีขึ้นที่ 8 kHz เทียบจุดบากอย่างน้อย (dB)
export const NOISE_MIN = 85;       // ระดับเสียงเฉลี่ย 8 ชม. (dBA) ที่ถือว่าเสี่ยง
export const ASYM_MAX = 15;        // ผลต่างค่าเฉลี่ยความถี่สูงสองข้างที่ยังถือว่าสมมาตร (dB)
export const ABGAP_MAX = 15;       // ช่องว่าง air–bone เฉลี่ยที่ยังถือว่าเป็น sensorineural (dB)
export const HL_ONSET = 25;        // ระดับที่ถือว่าเริ่มมีการได้ยินผิดปกติ (dB HL)

const num = v => { const x = Number(v); return isFinite(x) ? x : null; };
const pick = (obj, fs) => fs.map(f => num(obj && obj[f])).filter(v => v != null);
const avg = arr => arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
const round = v => v == null ? null : Math.round(v);

// วิเคราะห์หูข้างเดียวจาก air-conduction thresholds (obj: freq->dB HL)
export function analyzeEar(ac) {
  ac = ac || {};
  const lowRef = pick(ac, [1000, 2000]);
  const ref = lowRef.length ? Math.min(...lowRef) : null;          // ฐานความถี่กลาง
  let peakFreq = null, peak = null;
  for (const f of [3000, 4000, 6000]) { const v = num(ac[f]); if (v != null && (peak == null || v > peak)) { peak = v; peakFreq = f; } }
  const eight = num(ac[8000]);
  const depth = (peak != null && ref != null) ? peak - ref : null;
  const recovery = (peak != null && eight != null) ? peak - eight : null;
  const notch = (depth != null && recovery != null) ? (depth >= NOTCH_DEPTH && recovery >= NOTCH_RECOVERY) : null;
  const pta = avg(pick(ac, [500, 1000, 2000]));       // ค่าเฉลี่ยความถี่พูด
  const highPTA = avg(pick(ac, [3000, 4000, 6000]));  // ค่าเฉลี่ยความถี่สูง
  return { ref, peakFreq, peak, depth: round(depth), recovery: round(recovery), notch, pta: round(pta), highPTA: round(highPTA) };
}

// ช่องว่าง air–bone เฉลี่ย (ถ้ามี BC) → บอกว่าเป็น sensorineural ไหม (null = ไม่มี BC)
export function airBoneGap(ac, bc) {
  if (!bc) return null;
  const gaps = NIHL_FREQS.map(f => { const a = num(ac && ac[f]), b = num(bc && bc[f]); return (a != null && b != null) ? a - b : null; }).filter(v => v != null);
  return gaps.length ? round(avg(gaps)) : null;
}

// วินิจฉัยรวม · input: { right:{ac,bc}, left:{ac,bc}, noise:{level,years} }
export function diagnoseNIHL(input) {
  input = input || {};
  const R = analyzeEar(input.right && input.right.ac), L = analyzeEar(input.left && input.left.ac);
  const gapR = airBoneGap(input.right && input.right.ac, input.right && input.right.bc);
  const gapL = airBoneGap(input.left && input.left.ac, input.left && input.left.bc);
  const noiseLevel = num(input.noise && input.noise.level);
  const noiseYears = num(input.noise && input.noise.years);

  const affected = e => e.highPTA != null && e.highPTA >= HL_ONSET;
  const gaps = [gapR, gapL].filter(v => v != null);

  // เกณฑ์หลัก (true = เข้าได้ · false = ขัดแย้ง · null = ไม่ทราบ/ข้อมูลไม่พอ)
  const c = {
    sensorineural: gaps.length ? gaps.every(g => g <= ABGAP_MAX) : null,
    notch: (R.notch == null && L.notch == null) ? null : (R.notch === true || L.notch === true),
    bilateral: (R.highPTA != null && L.highPTA != null) ? (affected(R) && affected(L)) : null,
    symmetric: (R.highPTA != null && L.highPTA != null) ? Math.abs(R.highPTA - L.highPTA) <= ASYM_MAX : null,
    noise: (noiseLevel != null) ? noiseLevel >= NOISE_MIN : null,
  };
  const bilateralNotch = R.notch === true && L.notch === true;

  const core = ['sensorineural', 'notch', 'bilateral', 'symmetric', 'noise'];
  const met = core.filter(k => c[k] === true).length;
  const failed = core.filter(k => c[k] === false).length;

  let level, verdict;
  if (c.notch === true && c.noise === true && failed === 0) { level = 'consistent'; verdict = 'เข้าได้กับโรคประสาทหูเสื่อมจากเสียงดัง (NIHL)'; }
  else if (c.notch === false || failed >= 2) { level = 'atypical'; verdict = 'ลักษณะไม่ตรงแบบ NIHL — ควรพิจารณาสาเหตุอื่นของประสาทหูเสื่อม'; }
  else { level = 'possible'; verdict = 'อาจเข้าได้กับ NIHL — บางเกณฑ์ยังไม่ครบ/ไม่ทราบ ควรตรวจเพิ่มเติม'; }

  return { right: R, left: L, gapR, gapL, criteria: c, bilateralNotch, met, failed, level, verdict, noiseLevel, noiseYears };
}
