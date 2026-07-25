// engine.js — เครื่องคำนวณค่าทดแทน (ประมาณการคร่าว ๆ) · กองทุนเงินทดแทน
// อ้างอิงหลัก: พ.ร.บ.เงินทดแทน (ฉบับที่ 2) พ.ศ. 2561 — ค่าทดแทนรายเดือน = "ร้อยละ 70 ของค่าจ้างรายเดือน"
//   (ค่าจ้างที่ใช้คำนวณมีเพดานขั้นสูง/ขั้นต่ำตามกฎกระทรวง) จ่ายเป็นระยะเวลาตามแต่ละกรณี
// ⚠️ เป็น "ประมาณการ" เพื่อช่วยสื่อสารกับผู้ประกันตน — ตัวเลขจริงยึดตามประกาศฯ ล่าสุด
//   และการวินิจฉัยของเจ้าหน้าที่กองทุนเงินทดแทน · Pure logic ไม่มี DOM
//
// ค่านโยบาย (ปรับได้ตามประกาศล่าสุด) แยกเป็นค่าคงที่ให้แก้จุดเดียว:

export const RATE = 0.70;            // ร้อยละ 70 ของค่าจ้างรายเดือน
export const WAGE_CEILING = 20000;  // ค่าจ้างรายเดือนขั้นสูงที่ใช้คำนวณ (บาท) → รายเดือนสูงสุด 14,000
export const WAGE_FLOOR = 0;        // ค่าจ้างรายเดือนขั้นต่ำที่ใช้คำนวณ (บาท)

// กรณีการจ่ายค่าทดแทน + ระยะเวลา (เดือน) ตาม พ.ร.บ.
export const COMP_CASES = [
  { id: 'incapacity', label: 'หยุดพักรักษาตัว (ทำงานไม่ได้ชั่วคราว)', months: 0, maxMonths: 12,
    note: 'จ่ายตลอดเวลาที่แพทย์ให้หยุดงาน แต่ไม่เกิน 1 ปี (12 เดือน) · ระบุจำนวนเดือนที่หยุดจริง' },
  { id: 'impairment', label: 'สูญเสียสมรรถภาพในการทำงานของร่างกาย', months: 0, maxMonths: 120,
    note: 'ไม่เกิน 10 ปี (120 เดือน) · จำนวนเดือนกำหนดตามประกาศฯ ตามร้อยละที่สูญเสีย — ระบุจำนวนเดือนตามที่ประเมินได้' },
  { id: 'disability', label: 'ทุพพลภาพ', months: 180, minMonths: 180,
    note: 'ไม่น้อยกว่า 15 ปี (180 เดือน)' },
  { id: 'death', label: 'เสียชีวิต / สูญหาย', months: 120,
    note: 'จ่ายแก่ผู้มีสิทธิ 10 ปี (120 เดือน) และมีค่าทำศพต่างหาก (ไม่รวมในประมาณการนี้)' },
];

const num = v => { const n = Number(v); return isFinite(n) && n > 0 ? n : 0; };

// ค่าทดแทนรายเดือน = ร้อยละ × ค่าจ้างรายเดือน (clamp ด้วยเพดาน/ขั้นต่ำ)
export function monthlyComp(wage, { rate = RATE, ceiling = WAGE_CEILING, floor = WAGE_FLOOR } = {}) {
  const w = num(wage);
  const base = Math.min(Math.max(w, floor), ceiling);
  return { wage: w, base, capped: w > ceiling, monthly: Math.round(rate * base) };
}

// ผลรวม = รายเดือน × จำนวนเดือน
export function compResult(wage, months, opts = {}) {
  const m = monthlyComp(wage, opts);
  const mo = num(months);
  return { ...m, rate: opts.rate ?? RATE, ceiling: opts.ceiling ?? WAGE_CEILING, months: mo, total: m.monthly * mo };
}
