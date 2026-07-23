// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพ ระบบทางเดินหายใจ (บทที่ 9)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 9 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม)
// Pure logic — ไม่มี UI · ห้ามแก้ตัวเลข/ข้อความในตาราง
// ครอบคลุม: 9-3 โรคปอดทั่วไป (FEV1) · 9-4 หอบหืดจากการทำงาน (class×grade) ·
//           9-5 Karnofsky (มะเร็งปอด) · 9-6 ภาวะหยุดหายใจขณะหลับ (OSA)

export const GRADE_LETTERS = ['A', 'B', 'C', 'D', 'E'];

// ปัดเศษตามคู่มือบท 9 (ตัวอย่าง 9.4: 37.5 → 38) = ปัดครึ่งขึ้น
export function roundHalfUp(x) { return Math.round(Number(x)); }
function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }

// ============================================================
// ตารางที่ 9-3 โรคปอดทั่วไป — จัดชั้นด้วย FEV1 (% ของค่าปกติ) แล้วเทียบสัดส่วนเชิงเส้น
//   ขั้น 1: FEV1 >= 80  -> 0-10%   (ที่ FEV1 80 = 10, ที่ 100 = 0)
//   ขั้น 2: 60 <= FEV1 < 80 -> >10-25%  (ที่ 60 = 25, ที่ 80 = 10)
//   ขั้น 3: 40 <= FEV1 < 60 -> >25-50%  (ที่ 40 = 50, ที่ 60 = 25)
//   ขั้น 4: FEV1 < 40 -> >50-100%       (ที่ 40 = 50, ที่ 0 = 100)
//   ตัวอย่าง 9.2: FEV1 48 -> 50 - (48-40)x1.25 = 40 · 9.4: FEV1 50 -> 37.5 -> 38
// ============================================================
export const LUNG_CLASSES = [
  { cls: 1, fevLo: 80, fevHi: Infinity, impLo: 0, impHi: 10, base: 80, baseImp: 10, slope: 0.5 },
  { cls: 2, fevLo: 60, fevHi: 80, impLo: 10, impHi: 25, base: 60, baseImp: 25, slope: 0.75 },
  { cls: 3, fevLo: 40, fevHi: 60, impLo: 25, impHi: 50, base: 40, baseImp: 50, slope: 1.25 },
  { cls: 4, fevLo: 0, fevHi: 40, impLo: 50, impHi: 100, base: 0, baseImp: 100, slope: 1.25 },
];

export function lungResult(fev1Pct) {
  const f = Number(fev1Pct);
  let L;
  if (f >= 80) L = LUNG_CLASSES[0];
  else if (f >= 60) L = LUNG_CLASSES[1];
  else if (f >= 40) L = LUNG_CLASSES[2];
  else L = LUNG_CLASSES[3];
  // เส้นตรง: ยิ่ง FEV1 มาก การสูญเสียยิ่งน้อย
  const impExact = clamp(L.baseImp - (f - L.base) * L.slope, 0, 100);
  return { cls: L.cls, fev1: f, impExact, impairment: roundHalfUp(impExact), range: [L.impLo, L.impHi], fevRange: [L.fevLo, L.fevHi] };
}

// ============================================================
// ตารางที่ 9-4 โรคหอบหืดจากการทำงาน — class x grade (A-E)
//   ปัจจัยหลัก (key) = ผลตรวจห้องปฏิบัติการ: FEV1 หลังพ่นยาขยายหลอดลม และ/หรือ PC20 -> จัดชั้น
//   ปัจจัยรอง (non-key) = ประวัติ (ยา/ความถี่การกำเริบ) + การตรวจร่างกาย
//   ตั้งต้นที่ grade C แล้วปรับด้วย sum(ขั้นปัจจัยรอง - ขั้นหลัก) ภายในชั้น (ไม่ข้ามชั้น)
// ============================================================
export const ASTHMA_GRADES = [[0], [2, 4, 6, 8, 10], [11, 14, 17, 20, 23], [24, 30, 36, 42, 48], [49, 57, 65, 73, 81]];
export const ASTHMA_SEVERITY_TH = ['', 'น้อยมาก', 'น้อย', 'ปานกลาง', 'มาก'];

// FEV1 หลังพ่นยาขยายหลอดลม (% ของค่าปกติ) -> ชั้นปัจจัยหลัก
//   > 80 -> 0 · 70-80 -> 1 · 60-<70 -> 2 · 50-<60 -> 3 · < 50 -> 4
export function asthmaLabClassFromFev1(fev1PostBd) {
  const f = Number(fev1PostBd);
  if (f > 80) return 0;
  if (f >= 70) return 1;
  if (f >= 60) return 2;
  if (f >= 50) return 3;
  return 4;
}

// คำนวณผลหอบหืด: labClass = ปัจจัยหลัก · historyClass/examClass = ปัจจัยรอง (0-4)
export function asthmaResult(labClass, historyClass = null, examClass = null) {
  const kc = Number(labClass);
  if (kc <= 0) return { cls: 0, gradeIndex: null, gradeLetter: null, value: 0, initial: 0, net: 0, range: [0, 0] };
  const vals = ASTHMA_GRADES[kc];
  const mid = 2; // grade C = กลางของ 5 ระดับ
  const nk = [historyClass, examClass].filter(c => c != null && c !== '').map(Number);
  const net = nk.reduce((s, c) => s + (c - kc), 0);
  const idx = clamp(mid + net, 0, vals.length - 1);
  return {
    cls: kc, gradeIndex: idx, gradeLetter: GRADE_LETTERS[idx], value: vals[idx],
    initial: vals[mid], net, range: [vals[0], vals[vals.length - 1]],
  };
}

// ============================================================
// ตารางที่ 9-5 มะเร็งปอด — Karnofsky scale (จัดชั้นด้วยความสามารถทำกิจวัตร) · ให้ช่วงร้อยละ
//   ขั้น 0: 0 · 1: 2-10 · 2: 11-34 · 3: 35-60 · 4: 61-100
// ============================================================
export const KARNOFSKY_LEVELS = [
  { cls: 0, lo: 0, hi: 0, desc: 'ทำกิจกรรมได้เต็มที่เท่ากับก่อนเกิดโรค' },
  { cls: 1, lo: 2, hi: 10, desc: 'มีข้อจำกัดในงานที่ต้องใช้แรงมาก แต่ยังทำกิจกรรมเบา ๆ ได้ (งานสำนักงาน/งานบ้านเบา)' },
  { cls: 2, lo: 11, hi: 34, desc: 'ต้องการความช่วยเหลือในกิจกรรมต่าง ๆ โดยเฉพาะการมาพบแพทย์' },
  { cls: 3, lo: 35, hi: 60, desc: 'ทำได้เฉพาะการดูแลตนเอง และใช้เวลามากกว่าครึ่งวัน (waking hours) อยู่บนเตียงหรือเก้าอี้' },
  { cls: 4, lo: 61, hi: 100, desc: 'ทำกิจวัตรประจำวันเองไม่ได้ และใช้เวลาส่วนใหญ่อยู่บนเตียงหรือเก้าอี้' },
];

// ============================================================
// ตารางที่ 9-6 ภาวะหยุดหายใจขณะหลับจากการอุดกั้น (OSA) · ให้ช่วงร้อยละ
//   ขั้น 0: 0 · 1: 1-5 · 2: 6-10 · 3: 11-25 · 4: 26-35
// ============================================================
export const OSA_LEVELS = [
  { cls: 0, lo: 0, hi: 0, desc: 'ไม่มีอาการ สามารถทำกิจวัตรประจำวันได้อย่างปกติ' },
  { cls: 1, lo: 1, hi: 5, desc: 'มีอาการง่วงในเวลากลางวัน แต่ยังทำกิจวัตรประจำวันได้อย่างปกติ' },
  { cls: 2, lo: 6, hi: 10, desc: 'มีอาการง่วงในเวลากลางวันมาก ทำให้ทำงานได้ไม่ปกติ (เช่น ขับรถไม่ไหว)' },
  { cls: 3, lo: 11, hi: 25, desc: 'มีอาการง่วงในเวลากลางวันมาก จนทำให้การทำกิจวัตรประจำวันลดลงในระดับปานกลาง' },
  { cls: 4, lo: 26, hi: 35, desc: 'มีอาการง่วงในเวลากลางวันมาก จนไม่สามารถทำกิจวัตรประจำวันได้' },
];

// เลือกค่าในช่วงของชั้น (สำหรับตารางแบบให้ช่วง 9-5/9-6) — คืนค่าที่ clamp อยู่ในช่วง
export function rangeValue(levels, cls, picked) {
  const L = levels.find(x => x.cls === Number(cls));
  if (!L) return { cls: Number(cls), lo: 0, hi: 0, value: 0 };
  const v = picked == null ? L.lo : clamp(Number(picked), L.lo, L.hi);
  return { cls: L.cls, lo: L.lo, hi: L.hi, value: v, desc: L.desc };
}

// ตารางที่ 9-1 ระดับความรุนแรงของอาการหอบเหนื่อย (Dyspnea) — ใช้ประกอบการจัดชั้น (ปัจจัยรอง)
export const DYSPNEA_LEVELS = [
  { level: 1, text: 'หอบเหนื่อยเฉพาะเมื่อออกกำลังกายอย่างหนัก' },
  { level: 2, text: 'หอบเหนื่อยเมื่อเดินขึ้นที่ลาดชัน หรือเดินขึ้นบันได' },
  { level: 3, text: 'หอบเหนื่อยเมื่อออกกำลังกายเพียงเล็กน้อย เดินบนพื้นราบได้ไกลแต่ช้ากว่าคนปกติที่อายุและน้ำหนักใกล้เคียงกัน' },
  { level: 4, text: 'หอบเหนื่อยตลอดเวลา แม้ไม่ได้ออกกำลังกาย เดินบนพื้นราบได้ช้า ๆ ไม่เกิน 90 เมตร' },
];
