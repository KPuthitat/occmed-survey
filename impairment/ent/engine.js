// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพ ระบบโสต ศอ นาสิก (บทที่ 7)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 7 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม)
// รุ่น core: การสูญเสียการได้ยิน (Hearing loss) — ตาราง 7-1/7-2/7-3
// Pure logic — ไม่มี UI · ห้ามแก้ตัวเลข/ข้อความ
//
// โมเดล:
//   DSHL (ต่อหู) = ผลรวมระดับการได้ยินที่ 500,1000,2000,3000 Hz (แต่ละความถี่คิด 0–100 dB)
//   ร้อยละต่อหู (Monaural, ตาราง 7-1) = (DSHL − 100) × 1.5 / 4  = (DSHL − 100) × 0.375  [0–100]
//   ร้อยละสองข้าง (Binaural, ตาราง 7-2) = (5 × ข้างที่ดีกว่า + ข้างที่เลวกว่า) / 6
//   WPI (ตาราง 7-3) = binaural × 0.35 (ปัดเศษ)

export const HEARING_FREQS = [500, 1000, 2000, 3000]; // Hz

export function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

// กติกา: ความถี่ที่ > 100 dB คิดเป็น 100 · ดีกว่าปกติ (เช่น −5) คิดเป็น 0
export function dshl(thresholds) {
  const vals = Array.isArray(thresholds) ? thresholds : HEARING_FREQS.map(f => thresholds[f]);
  return vals.reduce((s, v) => s + clamp(Number(v) || 0, 0, 100), 0);
}

// ตาราง 7-1: DSHL → ร้อยละการสูญเสียการได้ยินข้างเดียว
export function monauralPct(dshlValue) {
  return clamp((Number(dshlValue) - 100) * 0.375, 0, 100);
}

// ตาราง 7-2: รวมสองข้าง (ข้างที่ดีกว่าถ่วง 5 เท่า)
export function binauralPct(monBetter, monWorse) {
  return (5 * Number(monBetter) + Number(monWorse)) / 6;
}

// ตาราง 7-3: binaural → การสูญเสียทั้งร่างกาย (WPI)
export function hearingWpi(binaural) {
  return Math.round(Number(binaural) * 0.35);
}

// คำนวณครบวงจรจากระดับการได้ยินของสองหู
// rightThresholds / leftThresholds = {500,1000,2000,3000} หรือ array 4 ค่า
export function hearingResult(rightThresholds, leftThresholds) {
  const dR = dshl(rightThresholds), dL = dshl(leftThresholds);
  const monR = monauralPct(dR), monL = monauralPct(dL);
  const better = Math.min(monR, monL);   // สูญเสียน้อยกว่า = หูดีกว่า
  const worse = Math.max(monR, monL);
  const binaural = binauralPct(better, worse);
  const wpi = hearingWpi(binaural);
  return {
    dshlR: dR, dshlL: dL, monR, monL, better, worse,
    binaural, binaural1: Math.round(binaural * 10) / 10, wpi,
  };
}
