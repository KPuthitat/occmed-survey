// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพทางจิตและพฤติกรรม (บทที่ 18)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 18 (กองทุนเงินทดแทน) · ตาราง 18-2 (4 ด้าน) + 18-3 (ระดับ→ร้อยละ)
// Pure logic — ไม่มี UI · ห้ามแก้ตัวเลข/ข้อความ
// ให้คะแนน 4 ด้าน (ด้านละ 1–5) → เฉลี่ย → เทียบตาราง 18-3 เป็นระดับ + ช่วงร้อยละ (แพทย์เลือกในช่วง)

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));

// ตาราง 18-2 — 4 ด้านของการทำหน้าที่ · แต่ละด้านให้คะแนน 5 (ปกติ) ถึง 1 (รุนแรง)
export const PSYCH_DOMAINS = [
  'การประกอบกิจวัตรประจำวัน',
  'การทำหน้าที่ทางสังคม',
  'การทำงานให้สำเร็จ (สมาธิ · ความพยายาม · ทำงานมีขั้นตอน)',
  'ความสามารถในการปรับตัว',
];
// ป้ายระดับคะแนน (ร่วมทั้ง 4 ด้าน) — คะแนน 5..1
export const SEVERITY = {
  5: 'ไม่มีความบกพร่อง (ทำได้ปกติ อาจช้ากว่าเล็กน้อย)',
  4: 'บกพร่องเล็กน้อย (ทำได้ ต้องมีคนกระตุ้น/แนะนำบางครั้ง)',
  3: 'บกพร่องปานกลาง (ทำได้ ต้องมีคนแนะนำใกล้ชิดตลอด)',
  2: 'บกพร่องชัดเจน (ทำได้เล็กน้อย ต้องมีคนช่วยเกือบทุกอย่าง)',
  1: 'บกพร่องรุนแรง (ทำไม่ได้เลย ต้องพึ่งคนอื่นทุกอย่าง)',
};

// ตาราง 18-3 — คะแนนเฉลี่ย → ระดับ → ร้อยละของทั้งร่างกาย (แพทย์เลือกภายในช่วง)
export const PSYCH_LEVELS = [
  { level: 1, avgLo: 4.51, avgHi: 5.00, wpiLo: 0, wpiHi: 9 },
  { level: 2, avgLo: 3.51, avgHi: 4.50, wpiLo: 10, wpiHi: 24 },
  { level: 3, avgLo: 2.51, avgHi: 3.50, wpiLo: 25, wpiHi: 54 },
  { level: 4, avgLo: 1.51, avgHi: 2.50, wpiLo: 55, wpiHi: 75 },
  { level: 5, avgLo: 1.00, avgHi: 1.50, wpiLo: 76, wpiHi: 100 },
];

// เฉลี่ยคะแนน 4 ด้าน (แต่ละด้าน clamp 1–5)
export function psychAverage(scores) {
  const s = (scores || []).slice(0, 4).map(x => clamp(Number(x) || 0, 1, 5));
  return s.length ? s.reduce((a, b) => a + b, 0) / s.length : 0;
}
export function psychLevel(avg) {
  const a = Number(avg);
  return PSYCH_LEVELS.find(L => a >= L.avgLo) || PSYCH_LEVELS[PSYCH_LEVELS.length - 1];
}
// ผลรวม: คะแนนเฉลี่ย + ระดับ + ช่วงร้อยละ · wpi = ค่าที่แพทย์เลือก (ถ้าไม่ระบุ = ค่าต่ำสุดของช่วง)
export function psychResult(scores, wpi) {
  const avg = psychAverage(scores);
  const L = psychLevel(avg);
  const picked = wpi == null ? L.wpiLo : clamp(Math.round(Number(wpi)), L.wpiLo, L.wpiHi);
  return { avg: +avg.toFixed(2), level: L.level, range: [L.wpiLo, L.wpiHi], wpi: picked };
}
