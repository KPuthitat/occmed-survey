// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพ ระบบหัวใจและหลอดเลือด (บทที่ 10)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 10 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม)
// Pure logic — ไม่มี UI · ห้ามแก้ตัวเลข/ข้อความในตาราง
// ครอบคลุม: 10-4 CAD · 10-8 HTN · 10-10/10-11 PVD แขน/ขา · 10-12 ลิ้นหัวใจ ·
//           10-13 หัวใจล้มเหลว/กล้ามเนื้อหัวใจ · 10-14 เยื่อหุ้มหัวใจ · 10-15 หัวใจเต้นผิดจังหวะ ·
//           10-16 ความดันในปอดสูง · 10-1 NYHA · 10-5 CCS

// ============================================================
// ค่าคงที่ร่วม
// ============================================================
export const GRADE_LETTERS = ['A', 'B', 'C', 'D', 'E'];
export const GRADE_TH = ['ก', 'ข', 'ค', 'ง', 'จ'];
export const SEVERITY_TH = ['', 'น้อยมาก', 'น้อย', 'ปานกลาง', 'มาก'];

// โครงตัวเลขมาตรฐาน ตาราง 10-10..10-16 (ขั้น 0–4)
const STD_RANGE = [[0, 0], [2, 10], [11, 23], [24, 40], [45, 65]];
const STD_GRADE = [[0], [2, 4, 6, 8, 10], [11, 14, 17, 20, 23], [24, 28, 32, 36, 40], [45, 50, 55, 60, 65]];

// สร้างชุดขั้น 0–4 แบบมาตรฐาน จากเกณฑ์รายขั้น (crit[level] = {nyha?, history, exam, lab})
function stdLevels(crit) {
  return [0, 1, 2, 3, 4].map(l => ({ level: l, range: STD_RANGE[l].slice(), grades: STD_GRADE[l].slice(), ...(crit[l] || {}) }));
}

// ============================================================
// ฟังก์ชันคำนวณกลาง — ขั้น × ระดับย่อย (A–E) → ร้อยละ
// ============================================================
export function gradeResult(levels, level, gradeIndex = 0) {
  const L = levels.find(x => x.level === Number(level));
  if (!L) throw new Error('ไม่พบขั้น ' + level);
  if (L.level === 0) return { level: 0, gradeIndex: null, gradeLetter: null, gradeTh: null, percent: 0, range: L.range, label: '0' };
  const gi = Math.max(0, Math.min(L.grades.length - 1, Number(gradeIndex)));
  return {
    level: L.level, gradeIndex: gi, gradeLetter: GRADE_LETTERS[gi], gradeTh: GRADE_TH[gi],
    percent: L.grades[gi], range: L.range, label: L.level + GRADE_LETTERS[gi],
  };
}

// ============================================================
// ตารางค่ารวม (Combined Values) — A + B(100−A)/100 เรียงมาก→น้อย เพดาน 100
// ============================================================
export function combineValues(values) {
  const v = values.map(Number).filter(x => x > 0).sort((a, b) => b - a);
  if (!v.length) return 0;
  let acc = v[0];
  for (let i = 1; i < v.length; i++) acc = acc + v[i] * (100 - acc) / 100;
  return Math.min(100, acc);
}

// ============================================================
// ตารางที่ 10-1 NYHA functional classification
// ============================================================
export const NYHA_CLASSES = [
  { cls: 'I', text: 'เป็นโรคหัวใจและหลอดเลือดแต่สามารถใช้ชีวิตประจำวัน และออกกำลังกายต่างๆ ได้โดยไม่มีอาการผิดปกติใดๆ การใช้ชีวิตประจำวัน และการออกกำลังตามปกติไม่ทำให้ผู้ป่วยเกิดอาการอ่อนเพลีย ใจสั่น เหนื่อยหอบ หรือเจ็บแน่นหน้าอก' },
  { cls: 'II', text: 'เป็นโรคหัวใจและหลอดเลือดที่มีผลต่อการใช้ชีวิตประจำวัน เพียงเล็กน้อย โดยไม่มีอาการในขณะพัก และสามารถออกกำลังเบาๆ ตามปกติในชีวิตประจำวันได้ การออกกำลังค่อนข้างหนักหรือหักโหมจะทำให้เกิดอาการ อ่อนเพลีย ใจสั่น เหนื่อยหอบ หรือเจ็บแน่นหน้าอกได้' },
  { cls: 'III', text: 'เป็นโรคหัวใจและหลอดเลือดที่มีผลอย่างมากต่อใช้ชีวิตประจำวัน หรือ การออกกำลังกาย โดยไม่มีอาการในขณะพัก แต่การออกแรงตามปกติในชีวิตประจำวันจะทำให้เกิดอาการ อ่อนเพลีย ใจสั่น เหนื่อยหอบ หรือเจ็บแน่นหน้าอก' },
  { cls: 'IV', text: 'เป็นโรคหัวใจและหลอดเลือดที่ไม่สามารถใช้ชีวิตประจำวัน หรือออกแรงโดยไม่มีอาการได้เลย อาการดังกล่าวเกิดขึ้นแม้ขณะพัก แต่จะเป็นมากขึ้นเมื่อออกแรงเพียงเล็กน้อย อาการที่เกิดขึ้นอาจเป็นผลมาจากปริมาณเลือดที่ออกจากหัวใจไม่เพียงพอต่อความต้องการของร่างกาย มีสารน้ำหรือเลือดคั่งในปอดหรือของร่างกาย หรือเจ็บแน่นหน้าอก' },
];

// ตารางที่ 10-5 CCS grading of angina pectoris (Canadian Cardiovascular Society)
export const CCS_CLASSES = [
  { cls: 'I', text: 'ไม่มีอาการเจ็บหน้าอกขณะทำกิจกรรมในชีวิตประจำวันตามปกติ อาการเจ็บหน้าอกเกิดเฉพาะเมื่อออกแรงมาก เร็ว หรือเป็นเวลานาน' },
  { cls: 'II', text: 'จำกัดการทำกิจกรรมตามปกติเล็กน้อย มีอาการเจ็บหน้าอกเมื่อเดินเร็วหรือขึ้นที่สูง เดินบนทางราบเกิน 2 ช่วงตึกด้วยความเร็วปกติ ขึ้นบันไดเกิน 1 ชั้น หรือเดิน/ขึ้นบันไดหลังอาหาร ในที่อากาศเย็น หรือเมื่อมีความเครียด' },
  { cls: 'III', text: 'จำกัดการทำกิจกรรมตามปกติอย่างมาก มีอาการเจ็บหน้าอกเมื่อเดินบนทางราบน้อยกว่า 1 ช่วงตึกด้วยความเร็วปกติ หรือขึ้นบันไดน้อยกว่า 1 ชั้น' },
  { cls: 'IV', text: 'ไม่สามารถทำกิจกรรมใดๆ ได้โดยไม่มีอาการเจ็บหน้าอก อาจมีอาการเจ็บหน้าอกขณะพัก' },
];

// ============================================================
// ตารางที่ 10-4 โรคหลอดเลือดหัวใจ (Coronary artery disease) — ขั้น 0–5
// ============================================================
export const CAD_LEVELS = [
  {
    level: 0, range: [0, 0], grades: [0], nyha: '—',
    history: 'ไม่มีอาการใดๆ หรือประวัติการเจ็บหน้าอกไม่ชัดเจน',
    exam: 'ปกติ',
    angio: 'การฉีดสีหลอดเลือดหัวใจปกติ',
  },
  {
    level: 1, range: [2, 10], grades: [2, 4, 6, 8, 10], nyha: 'I',
    history: 'ได้รับการวินิจฉัยเป็นโรคกล้ามเนื้อหัวใจขาดเลือด ร่วมกับ ประวัติการเจ็บหน้าอกเป็นครั้งคราว หรือมีอาการเจ็บหน้าอก angina อยู่ในกลุ่ม CCS class I (ตาราง 10-5)',
    exam: 'ปกติ',
    angio: 'พบหลอดเลือดตีบแต่ไม่เกิน 70% ในหลอดเลือดที่ไม่ใช่ left main หรือ ตีบไม่เกิน 50% ในหลอดเลือด left main',
  },
  {
    level: 2, range: [12, 24], grades: [12, 15, 18, 21, 24], nyha: 'II',
    history: 'วินิจฉัยโรคกล้ามเนื้อหัวใจขาดเลือด ร่วมกับ angina อยู่ในกลุ่ม CCS class II ขณะได้รับการรักษาด้วยยาอย่างเหมาะสมแล้ว หรือ ประวัติ CABG / PCI / เคยกล้ามเนื้อหัวใจตาย (MI)',
    exam: 'ปกติ ไม่มีอาการแสดงของหัวใจวายหากออกกำลังกาย',
    angio: 'พบหลอดเลือดตีบอย่างน้อย 70% (fixed obstruction) ในหลอดเลือดที่ไม่ใช่ left main หรือ ≥ 50% ใน left main หรือพบภาวะหลอดเลือดหัวใจหดเกร็งตัว (coronary spasm)',
  },
  {
    level: 3, range: [27, 39], grades: [27, 30, 33, 36, 39], nyha: 'III',
    history: 'angina อยู่ในกลุ่ม CCS class III ขณะรักษาด้วยยาเหมาะสมแล้ว หรือ ประวัติ CABG/PCI/MI ที่ยังมีอาการเจ็บหน้าอกหรือมีหลักฐานการขาดเลือดแม้ได้รับการรักษาแล้ว',
    exam: 'มีอาการแสดงของหัวใจวายหากออกกำลังกาย',
    angio: 'พบหลอดเลือดตีบอย่างน้อย 70% (non–left main) หรือ ≥ 50% ใน left main',
  },
  {
    level: 4, range: [45, 65], grades: [45, 50, 55, 60, 65], nyha: 'III',
    history: 'angina อยู่ในกลุ่ม CCS class IV ขณะรักษาด้วยยาเหมาะสมแล้ว หรือ ประวัติ CABG/PCI/MI ที่ยังมีอาการเจ็บหน้าอกหรือมีหลักฐานการขาดเลือดมากแม้ได้รับการรักษาแล้ว',
    exam: 'มีอาการแสดงของหัวใจวายแม้ขณะพัก หรือเมื่อออกกำลังกายเพียงเล็กน้อย',
    angio: 'พบหลอดเลือดตีบอย่างน้อย 70% (non–left main) หรือ ≥ 50% ใน left main',
  },
  {
    level: 5, range: [68, 100], grades: [68, 76, 84, 92, 100], nyha: 'IV',
    history: 'angina อยู่ในกลุ่ม CCS class IV โดยที่ต้องใส่เครื่องช่วยหายใจหรือใส่เครื่องช่วยพยุงการไหลเวียนโลหิตอยู่ตลอดเวลา เพื่อดำรงชีวิต',
    exam: 'มีอาการแสดงของหัวใจวายแม้ขณะพัก มีการหายใจล้มเหลวต้องใส่เครื่องช่วยหายใจ หรือมีระบบไหลเวียนโลหิตล้มเหลวต้องการการรักษาด้วยยาหรืออุปกรณ์พยุงการไหลเวียนของเลือด (mechanical support)',
    angio: 'พบหลอดเลือดตีบอย่างน้อย 70% (non–left main) หรือ ≥ 50% ใน left main',
  },
];
export function cadResult(level, gradeIndex = 0) { return gradeResult(CAD_LEVELS, level, gradeIndex); }

// ============================================================
// ตารางที่ 10-8 ภาวะความดันโลหิตสูง — ขั้น 0–3 (เกรด 3 ค่า/ขั้น)
//   key factor = การตรวจร่างกาย (ระดับการควบคุมความดัน/จำนวนยา)
// ============================================================
export const HTN_LEVELS = [
  {
    level: 0, range: [0, 0], grades: [0],
    history: 'ไม่มีอาการใดๆ',
    exam: 'ความดันโลหิตควบคุมได้โดยอาศัยการปรับเปลี่ยนพฤติกรรมโดยไม่ต้องใช้ยา (เช่น การลดน้ำหนัก คุมอาหาร งดบุหรี่ ออกกำลังกาย หลีกเลี่ยงความเครียด เป็นต้น)',
    lab: 'จอประสาทตาปกติ · เลือดปกติ · ปัสสาวะปกติ · คลื่นไฟฟ้าหัวใจหรือคลื่นเสียงสะท้อนหัวใจไม่พบกล้ามเนื้อหัวใจหนาหรือหัวใจโต',
  },
  {
    level: 1, range: [2, 10], grades: [2, 6, 10],
    history: 'ไม่มีอาการใดๆ',
    exam: 'พบระดับความดันโลหิตสูง แต่สามารถควบคุมได้โดยใช้ยา 1-2 ชนิด ร่วมกับการปรับเปลี่ยนพฤติกรรม',
    lab: 'จอประสาทตาปกติหรือผิดปกติ (hypertensive retinopathy) เล็กน้อย · เลือดปกติ · ปัสสาวะปกติ · คลื่นไฟฟ้าหัวใจหรือคลื่นเสียงสะท้อนหัวใจไม่พบกล้ามเนื้อหัวใจหนาหรือหัวใจโต',
  },
  {
    level: 2, range: [11, 20], grades: [11, 15, 20],
    history: 'ไม่มีอาการใดๆ',
    exam: 'พบระดับความดันโลหิตสูง แต่สามารถควบคุมได้โดยใช้ยา อย่างน้อย 3 ชนิด ร่วมกับการปรับเปลี่ยนพฤติกรรม',
    lab: 'จอประสาทตา (hypertensive retinopathy) ปานกลางถึงรุนแรง · เลือดปกติ · ปัสสาวะพบ microalbuminuria · คลื่นไฟฟ้าหัวใจหรือคลื่นเสียงสะท้อนหัวใจพบกล้ามเนื้อหัวใจหนาหรือหัวใจโตเล็กน้อย',
  },
  {
    level: 3, range: [21, 30], grades: [21, 25, 30],
    history: 'ไม่มีอาการใดๆ',
    exam: 'พบระดับความดันโลหิตสูง ที่ไม่สามารถควบคุมได้โดยใช้ยาในขนาดที่เหมาะสมแล้ว อย่างน้อย 3 ชนิด ร่วมกับการปรับเปลี่ยนพฤติกรรม',
    lab: 'จอประสาทตา (hypertensive retinopathy) ปานกลางถึงรุนแรง · เลือดพบการทำงานของไตผิดปกติ · ปัสสาวะพบ macroalbuminuria · คลื่นไฟฟ้าหัวใจหรือคลื่นเสียงสะท้อนหัวใจพบกล้ามเนื้อหัวใจหนาหรือหัวใจโต · มี Hypertensive encephalopathy',
  },
];

// ============================================================
// ตารางที่ 10-10 โรคหลอดเลือดส่วนปลาย — แขน (Upper extremity) · ผลเป็น % ของแขน
//   key factor = Objective evidence (ดัชนีนิ้ว/แขน, duplex, angiography)
// ============================================================
export const PVD_ARM_LEVELS = stdLevels({
  0: { history: 'ไม่มีอาการปวดขณะใช้งาน (claudication) หรือปวดขณะพัก อาจมีอาการบวมชั่วคราว', exam: 'สูญเสียเนื้อเยื่อใต้ผิวหนังเล็กน้อย หรือมีเส้นเลือดขอด', lab: 'พบหินปูนเกาะผนังหลอดเลือดจากภาพถ่ายรังสี' },
  1: { history: 'ปวดขณะใช้งานหนักเท่านั้น', exam: 'แผลหายเป็นปกติไม่เจ็บ', lab: 'ดัชนีนิ้ว/แขน (finger/brachial index) < 0.8 หรือสัญญาณ laser doppler ลดลงและไม่ดีขึ้นเมื่อทำให้อุ่น' },
  2: { history: 'ปวดขณะใช้งาน ทุเลาเมื่อพัก มีอาการบวมคงอยู่ ควบคุมได้ด้วยเครื่องพยุง (elastic support)', exam: 'มีแผลหายของนิ้วมากกว่า 1 นิ้ว หรือแผลตื้นเรื้อรัง', lab: 'Doppler/angiography ผิดปกติระดับน้อย' },
  3: { history: 'ปวดขณะใช้งานเพียงเล็กน้อย หรือปวดขณะพักเป็นครั้งคราว มีอาการบวมรุนแรง ไม่ทุเลาด้วยเครื่องพยุง', exam: 'ตัดแขน/นิ้วมากกว่า 1 นิ้ว หรือแผลลึกเรื้อรัง', lab: 'Doppler/angiography ผิดปกติปานกลาง' },
  4: { history: 'ปวดขณะพักรุนแรงตลอดเวลา', exam: 'ตัดแขนทั้งสองข้าง หรือทุกนิ้ว หรือแผลลึกทั้งสองข้าง', lab: 'Doppler/angiography ผิดปกติรุนแรง' },
});

// ============================================================
// ตารางที่ 10-11 โรคหลอดเลือดส่วนปลาย — ขา (Lower extremity) · ผลเป็น % ของขา
//   key factor = Objective evidence (ABI, duplex, angiography)
// ============================================================
export const PVD_LEG_LEVELS = stdLevels({
  0: { history: 'ไม่มีอาการปวดขณะใช้งานหรือขณะพัก มีอาการบวมชั่วคราว', exam: 'สูญเสียเนื้อเยื่อใต้ผิวหนังเล็กน้อย หรือมีเส้นเลือดขอด', lab: 'ABI ปกติ' },
  1: { history: 'ปวดขณะใช้งานหนักเท่านั้น (เดินมากกว่า 100 เมตร) อาการบวมคงอยู่ ควบคุมได้ด้วยเครื่องพยุง (elastic support)', exam: 'แผล/ตอนิ้วหายเป็นปกติไม่เจ็บ', lab: 'ABI ปกติ แต่ arterial/venous duplex หรือ angiography ผิดปกติ' },
  2: { history: 'ปวดขณะเดิน 25–100 เมตรด้วยความเร็วปกติ อาการบวมคงอยู่ปานกลางถึงรุนแรง ทุเลาด้วยเครื่องพยุง', exam: 'ตัดขามากกว่า 1 นิ้ว หรือหนึ่งข้าง มีโรคหลอดเลือดคงอยู่ หรือแผลตื้น', lab: 'ABI ผิดปกติ 0.71–0.9' },
  3: { history: 'ปวดขณะใช้งานเพียงเล็กน้อย (เดินน้อยกว่า 25 เมตร) หรือปวดขณะพักเป็นครั้งคราว อาการบวมรุนแรง ไม่ทุเลาด้วยเครื่องพยุง', exam: 'ตัดขาที่ระดับข้อเท้าหรือสูงกว่าหนึ่งข้าง หรือมากกว่า 1 นิ้ว แผลลึก', lab: 'ABI ผิดปกติ 0.41–0.7' },
  4: { history: 'ปวดขณะพักรุนแรงตลอดเวลา', exam: 'ตัดขาที่ระดับข้อเท้าหรือสูงกว่าทั้งสองข้าง หรือทุกนิ้ว แผลลึกทั้งสองข้าง', lab: 'ABI ≤ 0.4 ร่วมกับ duplex/angiography ผิดปกติรุนแรง' },
});

// ============================================================
// ตารางที่ 10-12 โรคลิ้นหัวใจ (Valvular heart disease) · WPI
//   key factor = การตรวจทางห้องปฏิบัติการ (CXR/echo/METS/BNP)
// ============================================================
export const VALVE_LEVELS = stdLevels({
  0: { nyha: '—', history: 'ไม่มีอาการ ไม่จำเป็นต้องใช้ยา', exam: 'ไม่พบความผิดปกติจากการตรวจร่างกาย', lab: 'CXR ปกติ · Echo ปกติหรือ trace/mild MVP โดยไม่มี dysfunction' },
  1: { nyha: 'I', history: 'NYHA Class 1 · ต้องทานยาปฏิชีวนะสำหรับ rheumatic fever prophylaxis', exam: 'ตรวจพบ stenotic หรือ regurgitant murmur แต่ไม่พบ sign of congestion', lab: 'Echo พบ mild valvular stenosis/regurgitation · METS > 7 · BNP < 100 / NT-proBNP < 300 pg/mL' },
  2: { nyha: 'II', history: 'NYHA Class 2 · ต้องใช้ยาขับปัสสาวะเพื่อควบคุม และ/หรือ ยาละลายลิ่มเลือด', exam: 'murmur ร่วมกับ signs of mild congestion (JVP 8-10 cm หรือ hepatojugular reflux, liver edge 1+ edema)', lab: 'Echo moderate stenosis/regurgitation + mild LV dysfunction (LVEF 40–50%) · METS < 7 แต่ > 5 · BNP 100–<500 / NT-proBNP > 300 pg/mL' },
  3: { nyha: 'III', history: 'NYHA Class 3 · ต้องใช้ยาขับปัสสาวะขนาดปานกลาง (Furosemide ≥ 40 มก./วัน) และ/หรือ ยาละลายลิ่มเลือด', exam: 'murmur ร่วมกับ signs of moderate congestion (JVP 11-15 cm, liver โตปานกลาง, 2+ edema)', lab: 'Echo moderate + LVEF 30–40% · METS < 5 แต่ > 2 · BNP >100–<1800 / NT-proBNP >300–<1800 pg/mL' },
  4: { nyha: 'IV', history: 'NYHA Class 4 · มีอาการหัวใจล้มเหลว เจ็บหน้าอก เป็นลม ต้องเข้าโรงพยาบาล หรือใช้ยาขับปัสสาวะขนาดสูง (Furosemide ≥ 80 มก./วัน) และ/หรือ ยาละลายลิ่มเลือด', exam: 'murmur ร่วมกับ signs of severe congestion (JVP > 16 cm, liver โตกดเจ็บ, 3+ edema) หรือ signs of poor tissue perfusion', lab: 'Echo severe + LVEF < 30% · METS < 2 · BNP > 500 / NT-proBNP > 1800 pg/mL' },
});

// ============================================================
// ตารางที่ 10-13 ภาวะหัวใจล้มเหลว/กล้ามเนื้อหัวใจผิดปกติ · WPI
//   key factor = การตรวจทางห้องปฏิบัติการ (CXR/echo LVEF/BNP)
// ============================================================
export const HF_LEVELS = stdLevels({
  0: { nyha: '—', history: 'ไม่มีอาการ ไม่จำเป็นต้องใช้ยา', exam: 'ไม่พบความผิดปกติ', lab: 'CXR ปกติ · Echo LVEF ปกติ ไม่มี dysfunction · BNP < 100 / NT-proBNP < 300 pg/mL' },
  1: { nyha: 'I', history: 'NYHA Class 1', exam: 'อาจพบ apical beat เคลื่อน, murmur, S3/S4 gallop', lab: 'CXR หัวใจโตแต่ไม่มี congestion · Echo LVEF 41–50% (mild) · BNP 100–<500 / NT-proBNP >300–<1800 pg/mL' },
  2: { nyha: 'II', history: 'NYHA Class 2', exam: 'apical beat เคลื่อน, murmur, gallop ร่วมกับ signs of mild congestion (JVP 8-10 cm)', lab: 'CXR pulmonary venous congestion · Echo LVEF 30–40% (moderate) · BNP 100–<500 / NT-proBNP >300–<1800 pg/mL' },
  3: { nyha: 'III', history: 'NYHA Class 3', exam: 'signs of moderate congestion (JVP 11-15 cm, liver โต, 2+ edema)', lab: 'CXR interstitial/alveolar edema · Echo LVEF < 30% (severe) · BNP > 500 / NT-proBNP > 1800 pg/mL' },
  4: { nyha: 'IV', history: 'NYHA Class 4', exam: 'signs of severe congestion (JVP > 16 cm, liver โตกดเจ็บ, 3+ edema)', lab: 'Echo LVEF < 30% · BNP > 500 / NT-proBNP > 1800 · malignant ventricular arrhythmia / หลังใส่ AICD / biventricular pacemaker · มีภาวะระยะท้าย (cardiac cachexia, BMI < 19, ไตวายระยะ 4–5, ต้องพึ่งยา inotrope)' },
});

// ============================================================
// ตารางที่ 10-14 โรคเยื่อหุ้มหัวใจ (Pericardial disease) · WPI
//   key factor = การตรวจทางห้องปฏิบัติการ (ECG/echo/effusion/BNP)
// ============================================================
export const PERICARD_LEVELS = stdLevels({
  0: { nyha: '—', history: 'ไม่มีอาการ ไม่จำเป็นต้องใช้ยา', exam: 'ไม่พบภาวะหัวใจล้มเหลว', lab: 'ECG และ Echo ปกติ · ESR/CRP ปกติ' },
  1: { nyha: 'I', history: 'ไม่มีอาการ หรือมี angina/หัวใจล้มเหลวขณะพักแต่ไม่ต้องใช้ยา — NYHA 1', exam: 'signs of minimal heart failure', lab: 'ECG พบ pericarditis หรือ small pericardial effusion + BNP ปกติ หรือหลังผ่าตัด pericardiectomy/window' },
  2: { nyha: 'II', history: 'เจ็บหน้าอกหรือเหนื่อยต้องใช้ยาต่อเนื่อง (NSAIDs/colchicine/ยาขับปัสสาวะ) — NYHA 2', exam: 'signs of mild heart failure', lab: 'Echo constrictive pericarditis หรือ small effusion + BNP ปกติ' },
  3: { nyha: 'III', history: 'เจ็บหน้าอก/เหนื่อยเมื่อออกแรงเล็กน้อยต้องใช้ยา — NYHA 3', exam: 'signs of moderate heart failure', lab: 'constrictive pericarditis หรือ moderate effusion + BNP 100–<500 / NT-proBNP 300–<1800 · รักษาด้วยการผ่าตัดไม่ได้ผล' },
  4: { nyha: 'IV', history: 'เจ็บหน้าอก/เหนื่อยขณะพักแม้ได้รับยา — NYHA 4', exam: 'signs of severe heart failure', lab: 'cardiac tamponade หรือ constrictive pericarditis ร่วมกับหัวใจซีกขวาล้มเหลว หรือ large effusion + BNP > 500 / NT-proBNP > 1800 · ผ่าตัดไม่ได้ผล' },
});

// ============================================================
// ตารางที่ 10-15 ภาวะหัวใจเต้นผิดจังหวะ (Dysrhythmia) · WPI
//   key factor = การตรวจทางห้องปฏิบัติการ (ECG/Holter/echo)
// ============================================================
export const ARRHYTHMIA_LEVELS = stdLevels({
  0: { history: 'ไม่มีอาการ', exam: 'ปกติ', lab: 'ECG ปกติ หรือพบ PAC/PVC เป็นครั้งคราว + echo ปกติ' },
  1: { nyha: 'I', history: 'ไม่มีอาการ หรือใจสั่นชั่วครู่ หรือเป็นลมครั้งเดียว', exam: 'ปกติ หรือพบ extra systole เป็นครั้งคราว', lab: 'echo ปกติ + ECG พบ dysrhythmia (AF/flutter/atrial tachy), Holter PVC/PAC > 10% ของ beats ทั้งหมด, ต้องใช้ยา, หลัง RF ablation หรือใส่ pacemaker' },
  2: { nyha: 'II', history: 'ไม่มีอาการขณะทำกิจวัตร ใจสั่นหรือเป็นลมต้องใช้ยา/pacemaker — NYHA 2', exam: 'จังหวะไม่สม่ำเสมอ เช่น AF', lab: 'echo ผิดปกติ (โครงสร้าง, น้อย) หรือ malignant dysrhythmia (VT, VF, AF with WPW, pause > 2 วินาที), AVNRT/junctional tachy, sinus node dysfunction, หลัง ablation/device' },
  3: { nyha: 'III', history: 'มีอาการขณะทำกิจวัตรแม้ได้รับยา/pacemaker หรือมีอาการรุนแรงเป็นครั้งคราว — NYHA 3', exam: 'จังหวะไม่สม่ำเสมอที่มีนัยสำคัญ', lab: 'echo ผิดปกติ (ปานกลาง) หรือ malignant dysrhythmia หรือ channelopathy (Brugada, long-QT, CPVT), หลัง ablation/device' },
  4: { nyha: 'IV', history: 'มีอาการขณะพักแม้ได้รับยา/อุปกรณ์ โดยเฉพาะเป็นลมซ้ำๆ — NYHA 4', exam: 'จังหวะไม่สม่ำเสมอรุนแรง', lab: 'echo ผิดปกติ (รุนแรง) หรือ malignant dysrhythmia/channelopathy ร่วมกับประวัติหัวใจหยุดเต้น, 2nd-degree AV block Mobitz II / high-grade / complete heart block, หลัง ablation/device/CRT-D/P' },
});

// ============================================================
// ตารางที่ 10-16 โรคความดันในปอดสูง (Pulmonary hypertension) · WPI (ประเมินครั้งแรกที่วินิจฉัย)
//   key factor = การตรวจทางห้องปฏิบัติการ (PASP + BNP/6MWD/VO2)
// ============================================================
export const PULMHTN_LEVELS = stdLevels({
  0: { nyha: '—', history: 'ไม่มีอาการ', lab: 'PASP ปกติ' },
  1: { nyha: 'I', history: 'มีอาการเหนื่อยนานๆ ครั้ง แต่โดยส่วนใหญ่ยังเป็น NYHA Class 1', lab: 'PASP 40–50 mmHg และ/หรือ อย่างใดอย่างหนึ่ง: BNP/NT-proBNP ปกติ · 6MWD > 440 เมตร · peak VO₂max > 15 mL/min/kg' },
  2: { nyha: 'II', history: 'มีอาการเหนื่อยเล็กน้อย และ/หรือมีอาการของ right-sided heart failure ต้องได้รับยาเพื่อบรรเทาอาการ หรือมีอาการเหนื่อยปานกลางเป็นบางครั้ง — NYHA 2/3', lab: 'PASP 51–75 mmHg และ/หรือ อย่างใดอย่างหนึ่ง: BNP < 50 / NT-proBNP < 300 · 6MWD > 440 เมตร · peak VO₂max > 15' },
  3: { nyha: 'III', history: 'มีอาการเหนื่อยปานกลาง หรือ right-sided heart failure ต้องได้รับยา หมดสติ (syncope) ขณะออกแรง หรือ orthostatic syncope เป็นครั้งคราว — NYHA 4', lab: 'PASP > 75 mmHg และ/หรือ RV โตปานกลาง และ/หรือ systolic dysfunction ร่วมกับอย่างใดอย่างหนึ่ง: BNP 50–300 (<500) / NT-proBNP 300–<1400 · 6MWD 165–440 เมตร · peak VO₂max 11–15' },
  4: { nyha: 'IV', history: 'มีอาการเหนื่อยรุนแรง หรือ right-sided heart failure ต้องได้รับยา หมดสติ (syncope) ขณะพักหรือออกแรงเล็กน้อย', lab: 'PASP > 75 mmHg และ/หรือ RV โตรุนแรง และ/หรือ systolic dysfunction ร่วมกับอย่างใดอย่างหนึ่ง: BNP > 300 / NT-proBNP > 1400 · 6MWD < 165–440 เมตร · peak VO₂max < 11' },
});

// ============================================================
// ทะเบียนตารางสำหรับ UI (ใช้กับหน้าการ์ดรายโรค)
//   output: 'wpi' = การสูญเสียทั้งร่างกาย · 'arm'/'leg' = ร้อยละของแขน/ขา (ต้องแปลง/รวมต่อ)
// ============================================================
export const CARDIO_TABLES = {
  htn: { ref: '10-8', titleTh: 'ภาวะความดันโลหิตสูง', keyRow: 'exam', levels: HTN_LEVELS, output: 'wpi' },
  pvdArm: { ref: '10-10', titleTh: 'โรคหลอดเลือดส่วนปลาย — แขน', keyRow: 'lab', levels: PVD_ARM_LEVELS, output: 'arm' },
  pvdLeg: { ref: '10-11', titleTh: 'โรคหลอดเลือดส่วนปลาย — ขา', keyRow: 'lab', levels: PVD_LEG_LEVELS, output: 'leg' },
  valve: { ref: '10-12', titleTh: 'โรคลิ้นหัวใจ', keyRow: 'lab', levels: VALVE_LEVELS, output: 'wpi' },
  hf: { ref: '10-13', titleTh: 'ภาวะหัวใจล้มเหลว / กล้ามเนื้อหัวใจผิดปกติ', keyRow: 'lab', levels: HF_LEVELS, output: 'wpi' },
  pericard: { ref: '10-14', titleTh: 'โรคเยื่อหุ้มหัวใจ', keyRow: 'lab', levels: PERICARD_LEVELS, output: 'wpi' },
  arrhythmia: { ref: '10-15', titleTh: 'ภาวะหัวใจเต้นผิดจังหวะ', keyRow: 'lab', levels: ARRHYTHMIA_LEVELS, output: 'wpi' },
  pulmhtn: { ref: '10-16', titleTh: 'โรคความดันในปอดสูง', keyRow: 'lab', levels: PULMHTN_LEVELS, output: 'wpi' },
};
