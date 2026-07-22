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

// ============================================================
// §7.1 เครื่องปรับระดับด้วยปัจจัยหลัก/รอง (Key / Non-key step adjust)
//   ใช้กับตาราง 7-4 (การทรงตัว), 7-5 (ใบหน้า), 7-6 (ทางเดินหายใจ)
//   ปัจจัยหลัก → ขั้น · ค่าเบื้องต้น = ค่ากลางของขั้น
//   ตัวปรับ = Σ(ขั้นปัจจัยรอง − ขั้นปัจจัยหลัก) · เลื่อนภายในขั้น (ไม่ข้ามขั้น)
//   กรณีปัจจัยหลักอยู่ขั้นสูงสุด (มักเป็นขั้น 4): แต่ละพจน์ใช้ (ปัจจัยรอง + 1 − หลัก)  [หน้า 508]
//   * หมายเหตุ: ตัวอย่างที่ 7.10 ในคู่มือใช้สูตรปกติ (3−4)+(3−4) ขัดกับกฎขั้นสูงสุดหน้า 508
//     โมดูลนี้ยึด "กฎทั่วไปหน้า 508" — ให้แพทย์ทวนกรณีปัจจัยหลักอยู่ขั้นสูงสุดอีกครั้ง
// ============================================================
export function stepAdjust(classValues, keyClass, nonKeyClasses = [], maxClass = classValues.length - 1) {
  const kc = Number(keyClass);
  if (kc <= 0) return { class: 0, value: 0, index: null, mid: null, adjuster: 0, initial: 0, highest: false };
  const vals = classValues[kc];
  const mid = Math.floor((vals.length - 1) / 2);            // 5 ค่า→index 2 · 3 ค่า→index 1
  const highest = kc >= maxClass;
  let adjuster = 0;
  for (const nk of nonKeyClasses) { const n = Number(nk); adjuster += highest ? (n + 1 - kc) : (n - kc); }
  const index = Math.max(0, Math.min(vals.length - 1, mid + adjuster));
  return { class: kc, value: vals[index], index, mid, adjuster, initial: vals[mid], highest };
}

// ============================================================
// ตารางที่ 7-8 เสียงและการพูด (Voice & Speech)
//   key = ขั้นสูงสุดของ 3 องค์ประกอบ (ความดัง/ความชัด/ความคล่อง) · ค่าเบื้องต้น = ค่ากลางของขั้น
//   ผลตรวจ objective: สูงกว่า key → เลื่อนขึ้น 1 · ต่ำกว่า → ลง 1
//   ถ้ามีองค์ประกอบที่ 2 อยู่ขั้นเดียวกับ key และยังไม่สุดขั้น → เลื่อนขึ้นอีก 1
// ============================================================
export const VOICE_VALUES = [[0], [2, 6, 10], [12, 15, 18], [20, 24, 28], [30, 33, 35]];
export function voiceResult(components, objectiveClass) {
  const comps = [Number(components.audibility) || 0, Number(components.intelligibility) || 0, Number(components.functional) || 0];
  const key = Math.max(...comps);
  if (key <= 0) return { key: 0, value: 0, index: null, countAtKey: comps.filter(c => c === 0).length };
  const vals = VOICE_VALUES[key];
  const mid = Math.floor((vals.length - 1) / 2);
  let idx = mid;
  const obj = Number(objectiveClass);
  if (!Number.isNaN(obj) && obj > 0) { if (obj > key) idx += 1; else if (obj < key) idx -= 1; }
  idx = Math.max(0, Math.min(vals.length - 1, idx));
  const countAtKey = comps.filter(c => c === key).length;
  if (countAtKey >= 2 && idx < vals.length - 1) idx += 1;
  return { key, value: vals[idx], index: idx, countAtKey, mid };
}

// ============================================================
// ตารางที่ 7-7 การเคี้ยวและกลืน (Mastication & Deglutition) — lookup ตรงตามชนิดอาหาร
// ============================================================
export const SWALLOW = [
  { id: 'soft', label: 'อาหารกึ่งของแข็ง (Semi-solid) หรืออาหารอ่อน (Soft foods)', values: [5, 10, 15] },
  { id: 'liquid', label: 'อาหารเหลวเท่านั้น (Liquid foods)', values: [20, 25, 30] },
  { id: 'tube', label: 'ให้อาหารทางท่อจมูก→กระเพาะ (Tube feeding) หรือ Gastrostomy', values: [50] },
];

// เพดานการสูญเสีย: การได้กลิ่น-รู้รส / เสียงในหู (tinnitus) — ไม่เกินร้อยละ 5
export const CAP_OTHER = { olfaction: 5, tinnitus: 5 };

// ตารางค่ารวม (Combined Values) — รวมหลายหน้าที่/ระบบ (§7.1 ฏ)
export function combineValues(values) {
  const v = values.map(Number).filter(x => x > 0).sort((a, b) => b - a);
  if (!v.length) return 0;
  let acc = v[0];
  for (let i = 1; i < v.length; i++) acc = acc + v[i] * (100 - acc) / 100;
  return Math.min(100, acc);
}

// ============================================================
// ข้อมูลตาราง step-adjust (ค่าตัวเลข + เกณฑ์รายขั้น) สำหรับ UI
// ============================================================
const VEST_VALUES = [[0], [1, 3, 5, 7, 9], [11, 15, 19, 23, 27], [30, 33, 36, 39, 42], [45, 48, 51, 54, 58]];
const FACE_VALUES = [[0], [1, 3, 5], [6, 7, 8, 9, 10], [11, 14, 17, 20, 23], [25, 30, 35, 40, 45]];
const AIRWAY_VALUES = [[0], [1, 3, 5, 7, 9], [11, 15, 19, 23, 27], [30, 33, 36, 39, 42], [45, 48, 51, 54, 58]];

export const ENT_STEP_TABLES = {
  vestibular: {
    ref: '7-4', titleTh: 'การทรงตัว (Vestibular)', classValues: VEST_VALUES,
    rows: [
      { key: 'history', label: 'ประวัติ (ปัจจัยหลัก)', isKey: true, desc: [
        'ไม่มีอาการ',
        'มีอาการเวียนศีรษะ/เสียการทรงตัว แต่ทำกิจวัตรได้ตามปกติ ต้องการความช่วยเหลือเฉพาะงานที่ต้องออกแรงหรือเสี่ยงมาก (เช่น ปีนนั่งร้าน)',
        'ทำกิจวัตรตามปกติไม่ได้ ต้องการความช่วยเหลือ ยกเว้นการดูแลตนเองอย่างง่าย งานบ้านเบา หรือเดินทางโดยมีผู้ขับให้',
        'ทำกิจวัตรไม่ได้ ยกเว้นการดูแลตนเองที่มีผู้ช่วย',
        'ทำกิจวัตรไม่ได้เลย ต้องมีผู้อื่นช่วยตลอด เดินเองไม่ได้ ต้องอยู่ในบ้าน/ที่พักพิง',
      ] },
      { key: 'exam', label: 'การตรวจร่างกาย', desc: ['ปกติ', 'ปกติหรือการเดินผิดปกติเล็กน้อย (Romberg ฯลฯ)', 'เดินเซ Romberg ผิดปกติ', 'เดินได้ด้วยความยากลำบากมากหากไม่มีคนช่วย', 'ยืน/เดินไม่ได้หากไม่มีคนช่วย'] },
      { key: 'objective', label: 'การตรวจวินิจฉัย', desc: ['ปกติ', 'ENG/VNG/Caloric ผิดปกติ (positional nystagmus / caloric)', 'ร่วมกับอาการแสดงทางระบบประสาทส่วนกลาง', 'ร่วมกับ Dynamic posturography ผิดปกติ', 'ร่วมกับ Brain MRI ผิดปกติ'] },
    ],
  },
  facial: {
    ref: '7-5', titleTh: 'ใบหน้า / รูปลักษณ์ (Facial)', classValues: FACE_VALUES,
    note: 'ความผิดปกติเหนือคิ้วเท่านั้น ≤ ร้อยละ 1 · ต่ำกว่าริมฝีปากบนเท่านั้น ≤ ร้อยละ 8 · เต็มใบหน้า (คิ้วถึงริมฝีปากบน) = ร้อยละ 25–45 · การสูญเสียการมองเห็น/การเคลื่อนไหว/การหายใจ/การกิน ให้ประเมินในระบบของตนเองแล้วรวม (Combine)',
    rows: [
      { key: 'history', label: 'ประวัติ (ปัจจัยหลัก)', isKey: true, desc: [
        'ไม่มีความผิดปกติ',
        'แผลเป็นที่ผิวหนังเท่านั้น ไม่กระทบการทำหน้าที่',
        'สูญเสียโครงสร้างบางส่วน หรือจมูกยุบเล็กน้อย แต่หายใจได้ปกติ',
        'สูญเสียโครงสร้างบางส่วนของใบหน้า (ริมฝีปาก/จมูกบางส่วน) กระทบการเข้าสังคมและภาพลักษณ์',
        'สูญเสียโครงสร้างใบหน้ารุนแรง จำกัดการเข้าร่วมสังคม',
      ] },
      { key: 'exam', label: 'การตรวจร่างกาย', desc: ['ปกติ', 'แผลเป็นเห็นได้เล็กน้อย', 'กล้ามเนื้อใบหน้าอ่อนแรงข้างเดียว หรือโครงสร้าง (จมูก/แก้ม) ยุบเล็กน้อย', 'โครงสร้างยุบชัดเจน หรืออ่อนแรงชัด', 'เสียโครงสร้างรุนแรง'] },
      { key: 'objective', label: 'การตรวจวินิจฉัย', desc: ['ภาพถ่ายรังสีกระดูก/กระดูกอ่อนปกติ', 'ผิดปกติเล็กน้อย', 'ผิดปกติปานกลาง', 'ผิดปกติสอดคล้องกับประวัติ (ขั้น 3–4)', 'ผิดปกติรุนแรง'] },
    ],
  },
  airway: {
    ref: '7-6', titleTh: 'ทางเดินหายใจส่วนบน (Upper airway)', classValues: AIRWAY_VALUES,
    override: { label: 'เจาะคอ (Tracheostomy) หรือมีช่องถาวรที่คอ (Stoma) เพื่อใช้หายใจ', value: 25 },
    note: 'ทางเดินหายใจส่วนล่าง/ปอด และภาวะหยุดหายใจขณะหลับ ประเมินในบทระบบหายใจ · ผู้ที่เจาะคอ/มี stoma ถาวรเพื่อหายใจ = ร้อยละ 25 ของทั้งร่างกาย',
    rows: [
      { key: 'history', label: 'ประวัติ (อาการเหนื่อย · ปัจจัยหลัก)', isKey: true, desc: [
        'ไม่มีอาการเหนื่อย',
        'ไม่เหนื่อยขณะพัก รบกวนกิจวัตรเล็กน้อยหรือไม่รบกวน',
        'เหนื่อยเฉพาะเมื่อออกแรงหนัก/เป็นเวลานาน หรือขึ้นที่ชัน',
        'เหนื่อยเมื่อเดินทางราบ ≥ 50 เมตร หรือขึ้นบันได ต้องหยุดพัก',
        'เหนื่อยขณะพัก (ไม่ตลอดเวลา) เกิดจากกิจวัตรปกติ เช่น อาบน้ำ แต่งตัว หวีผม',
      ] },
      { key: 'exam', label: 'การตรวจร่างกาย', desc: ['ปกติ', 'อุดกั้น/เปลี่ยนแปลงเล็กน้อย (Minimal)', 'อุดกั้นน้อย (Mild)', 'อุดกั้นปานกลาง (Moderate)', 'อุดกั้นรุนแรง (Severe)'] },
      { key: 'objective', label: 'การตรวจวินิจฉัย (CT sinus / Laryngoscopy)', desc: ['ปกติ', 'ผิดปกติเล็กน้อย', 'ผิดปกติน้อย', 'ผิดปกติปานกลาง', 'ผิดปกติรุนแรง (เช่น สายเสียงอัมพาตทั้งสองข้าง)'] },
    ],
  },
};
