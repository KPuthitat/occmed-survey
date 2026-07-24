// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพระบบต่อมไร้ท่อและเมตะบอลิสม (บทที่ 16)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 16 (กองทุนเงินทดแทน)
// Pure data — ไม่มี DOM · ห้ามแก้ตัวเลข/ข้อความในตาราง
//
// รูปแบบ input-driven (ใช้ shared/classifier.js):
//   ปัจจัยหลัก = ประวัติ → กำหนดขั้น (class) · ค่าตั้งต้น = ระดับกลางของขั้น
//   BOTC (ยา 16-2A/2B + อาหาร 16-3 + อุปกรณ์ 16-4) → Total BOTC → เทียบเป็น "ขั้น BOTC"
//     แล้วเลื่อนระดับ = (ขั้น BOTC − ขั้นปัจจัยหลัก) แบบตามส่วน (shiftMode 'proportional')
//   ปัจจัยรองอื่น (ถ้ามี) เลื่อนระดับเช่นเดียวกัน
//   แต่ละต่อมมีตารางร้อยละ (ขั้น×ระดับ) ของตัวเอง — ยึดตามตารางจริง

// ---------- BOTC option lists (ตาราง 16-2A/2B/3/4) ----------
export const MED_ORAL = [   // ตาราง 16-2A
  { id: 'none', label: 'ไม่ใช้ยากลุ่มนี้', score: 0 },
  { id: 'prn', label: 'เฉพาะเวลามีอาการ', score: 1 },
  { id: 'd12', label: '1–2 ครั้งต่อวัน', score: 2 },
  { id: 'd2p', label: '> 2 ครั้งต่อวัน', score: 3 },
];
export const MED_INJECT = [ // ตาราง 16-2B
  { id: 'none', label: 'ไม่ใช้ยาฉีด', score: 0 },
  { id: 'w1', label: 'น้อยกว่า 1 ครั้งต่อสัปดาห์', score: 2 },
  { id: 'w16', label: '1–6 ครั้งต่อสัปดาห์', score: 3 },
  { id: 'd12', label: '1–2 ครั้งต่อวัน', score: 4 },
  { id: 'd2p', label: '> 2 ครั้งต่อวัน', score: 5 },
];
export const DIET = [       // ตาราง 16-3
  { id: 'none', label: 'ไม่ต้องปรับอาหาร', score: 0 },
  { id: 'low', label: 'ปรับพฤติกรรมการกิน - น้อย', score: 2 },
  { id: 'mid', label: 'ปรับพฤติกรรมการกิน - ปานกลาง', score: 5 },
  { id: 'high', label: 'ปรับพฤติกรรมการกิน - มาก', score: 10 },
];
export const DEVICE = [      // ตาราง 16-4
  { id: 'none', label: 'ไม่ต้องใช้อุปกรณ์', score: 0 },
  { id: 'd1', label: 'ตรวจระดับน้ำตาล 1 ครั้งต่อวัน', score: 1 },
  { id: 'd2', label: 'ตรวจระดับน้ำตาล 2 ครั้งต่อวัน', score: 2 },
  { id: 'd3', label: 'ตรวจระดับน้ำตาล 3 ครั้งต่อวัน', score: 3 },
  { id: 'd4', label: 'ตรวจระดับน้ำตาล ≥ 4 ครั้งต่อวัน', score: 4 },
];

// helper สร้าง levels ให้เข้ากับ classifier · null = ไม่มีขั้นนั้นในตาราง
function mkLevels(ranges, grades, rows) {
  const out = [];
  ranges.forEach((range, lv) => {
    if (range == null || grades[lv] == null) return;
    const L = { level: lv, range: range.slice(), grades: grades[lv].slice() };
    for (const [k, arr] of Object.entries(rows)) if (arr[lv] != null && arr[lv] !== '') L[k] = arr[lv];
    out.push(L);
  });
  return out;
}

// สร้าง botcGrade config สำหรับ classifier จากเพดานคะแนน (thresholds) ของต่อม
export function botcGradeCfg(thresholds) {
  return {
    title: 'ผลกระทบจากการรักษา (BOTC · ตาราง 16-2/3/4)',
    note: 'กรอกวิธีการรักษา → รวมเป็น Total BOTC → เทียบเป็นขั้น แล้วปรับระดับย่อยเทียบกับขั้นปัจจัยหลัก',
    oral: MED_ORAL, inject: MED_INJECT, diet: DIET, device: DEVICE, thresholds,
  };
}

// เพดาน Total BOTC → ขั้น (ตามตาราง 16-5 : 0 / 1-2 / 3-6 / 7-10 / ≥11) — ใช้ร่วมทุกต่อม
const BOTC_THRESHOLDS = [0, 2, 6, 10, Infinity];

// ---------- ตาราง 16-5 ต่อมใต้สมองและฮัยโปธาลามัส (Hypothalamic–Pituitary axis) ----------
const PITUITARY = {
  id: 'pituitary', ref: '16-5', titleTh: 'ต่อมใต้สมองและฮัยโปธาลามัส',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: BOTC_THRESHOLDS,
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }],
  levels: mkLevels(
    [[0, 0], [1, 3], [4, 6], [7, 9], [10, 14]],
    [[0], [1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12, 13, 14]],
    {
      history: [
        'มีความผิดปกติของ hypothalamic-pituitary axis แต่ไม่จำเป็นต้องได้รับการรักษา',
        'จำเป็นต้องได้รับการรักษาบางครั้ง ไม่มีความผิดปกติหลงเหลือ',
        'จำเป็นต้องได้รับการรักษาทุกวัน ไม่มีความผิดปกติหลงเหลือ',
        'จำเป็นต้องได้รับการรักษา มีความผิดปกติหลงเหลือเล็กน้อย',
        'จำเป็นต้องได้รับการรักษา มีความผิดปกติหลงเหลือมาก',
      ],
    }),
};

// ---------- ตาราง 16-6 ต่อมธัยรอยด์ (Thyroid) · 3 ขั้น (0-2) · ขั้น 1,2 = 5 ระดับ ----------
const THYROID = {
  id: 'thyroid', ref: '16-6', titleTh: 'ต่อมธัยรอยด์ (Thyroid)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 3, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }, { key: 'exam', label: 'การตรวจร่างกาย (ต่อม/ก้อน)' }],
  levels: mkLevels(
    [[0, 0], [1, 5], [6, 10]],
    [[0], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10]],
    {
      history: [
        'มีความผิดปกติของต่อมธัยรอยด์ แต่ไม่จำเป็นต้องได้รับการรักษา ไม่มีความผิดปกติหลงเหลือ',
        'มีความผิดปกติของต่อมธัยรอยด์ จำเป็นต้องได้รับการรักษา แต่ไม่มีความผิดปกติหลงเหลือ',
        'มีความผิดปกติของต่อมธัยรอยด์ จำเป็นต้องได้รับการรักษา และมีความผิดปกติหลงเหลือ',
      ],
      exam: [
        'ต่อมธัยรอยด์ขนาดปกติ และไม่มีก้อนในต่อมธัยรอยด์',
        'ต่อมธัยรอยด์โต หรือมีก้อนขนาด ≤ 1.5 เซนติเมตร',
        'ต่อมธัยรอยด์โต หรือมีก้อนขนาด > 1.5 เซนติเมตร',
      ],
    }),
};

// ---------- ตาราง 16-7 ต่อมพาราธัยรอยด์ (Parathyroid) · 3 ขั้น · ขั้น1=3ระดับ ขั้น2=5ระดับ ----------
const PARATHYROID = {
  id: 'parathyroid', ref: '16-7', titleTh: 'ต่อมพาราธัยรอยด์ (Parathyroid)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 2, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }, { key: 'exam', label: 'สิ่งที่ตรวจพบ / ระดับแคลเซียม (แยกขั้น 1–2)' }],
  levels: mkLevels(
    [[0, 0], [1, 3], [4, 8]],
    [[0], [1, 2, 3], [4, 5, 6, 7, 8]],
    {
      history: [
        'มีความผิดปกติของต่อมพาราธัยรอยด์ แต่ไม่จำเป็นต้องได้รับการรักษา ไม่มีความผิดปกติหลงเหลือ',
        'มีความผิดปกติของต่อมพาราธัยรอยด์ จำเป็นต้องได้รับการรักษาหรือผ่าตัด แต่ไม่มีความผิดปกติหลงเหลือ',
        'มีความผิดปกติของต่อมพาราธัยรอยด์ จำเป็นต้องได้รับการรักษา และมีความผิดปกติหลงเหลือ',
      ],
      exam: [
        'ตรวจร่างกายปกติ และระดับแคลเซียมในเลือดปกติ',
        'ตรวจร่างกายปกติ และระดับแคลเซียมในเลือดปกติ',
        'มีอาการหลงเหลือ และ/หรือ ระดับแคลเซียมในเลือดผิดปกติ',
      ],
    }),
};

// ---------- ตาราง 16-8 ต่อมหมวกไตส่วนนอก (Adrenal cortex) · 4 ขั้น (0-3) · 3 ระดับ ----------
const ADRENAL_CORTEX = {
  id: 'adrenalcortex', ref: '16-8', titleTh: 'ต่อมหมวกไตส่วนนอก (Adrenal cortex)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 4, 7, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }],
  levels: mkLevels(
    [[0, 0], [1, 3], [5, 9], [10, 20]],
    [[0], [1, 2, 3], [5, 7, 9], [10, 15, 20]],
    {
      history: [
        'มีความผิดปกติของ adrenal cortex แต่ไม่มีอาการและไม่จำเป็นต้องได้รับการรักษา',
        'จำเป็นต้องได้รับการรักษา แต่ไม่มีอาการ/อาการแสดงที่ active หลงเหลือ และผล biochemical tests ปกติ',
        'จำเป็นต้องได้รับการรักษา มีอาการ/อาการแสดงที่ active หลงเหลือ และผล biochemical tests ปกติ',
        'จำเป็นต้องได้รับการรักษา มีอาการ/อาการแสดงหลงเหลือ และผล biochemical tests ผิดปกติ',
      ],
    }),
};

// ---------- ตาราง 16-9 ต่อมหมวกไตส่วนใน (Adrenal medulla) · 5 ขั้น · 3 ระดับ ----------
const ADRENAL_MEDULLA = {
  id: 'adrenalmedulla', ref: '16-9', titleTh: 'ต่อมหมวกไตส่วนใน (Adrenal medulla)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 3, 6, 10, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }],
  levels: mkLevels(
    [[0, 0], [1, 5], [6, 15], [20, 30], [40, 60]],
    [[0], [1, 3, 5], [6, 10, 15], [20, 25, 30], [40, 50, 60]],
    {
      history: [
        'มีความผิดปกติของต่อมหมวกไตส่วนใน ไม่จำเป็นต้องได้รับการรักษา ไม่มีอาการ',
        'มีความผิดปกติของต่อมหมวกไตส่วนใน จำเป็นต้องได้รับการรักษา ไม่มีอาการหลงเหลือ',
        'ภาวะ catecholamine มากผิดปกติ ควบคุมด้วยยาได้เกือบตลอดเวลา (> 75% ต่อเดือน)',
        'ภาวะ catecholamine มากผิดปกติ ควบคุมด้วยยาได้บ้าง (50–75% ต่อเดือน)',
        'ภาวะ catecholamine มากผิดปกติ ควบคุมด้วยยาได้น้อย (25–50% ต่อเดือน)',
      ],
    }),
};

// ---------- ตาราง 16-10 โรคเบาหวาน (Diabetes) · 5 ขั้น · 5 ระดับ · ปัจจัยรอง = HbA1C ----------
const DIABETES = {
  id: 'diabetes', ref: '16-10', titleTh: 'โรคเบาหวาน (Diabetes mellitus)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 5, 10, 15, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ / การรักษา (ปัจจัยหลัก)' }, { key: 'lab', label: 'ผลตรวจ HbA1C (ค่าเฉลี่ย 0–6 เดือน)' }],
  levels: mkLevels(
    [[0, 0], [1, 5], [6, 10], [11, 15], [16, 28]],
    [[0], [1, 2, 3, 4, 5], [6, 7, 8, 9, 10], [11, 12, 13, 14, 15], [16, 19, 22, 25, 28]],
    {
      history: [
        'ระดับน้ำตาลสูงชนิด IFG หรือ IGT และไม่จำเป็นต้องได้รับการรักษาด้วยยา',
        'เป็นเบาหวาน/metabolic syndrome รักษาด้วยคุมอาหารและ/หรือยารับประทาน 1–2 ชนิด ยังไม่ต้องฉีดอินซูลิน',
        'เบาหวานคุมได้ดีด้วยคุมอาหาร + ยา 3–4 ชนิด และ/หรือ อินซูลินวันละ 1–2 ครั้ง',
        'เบาหวานคุมได้ดีด้วยคุมอาหาร + ยา ≥ 5 ชนิด และ/หรือ อินซูลินวันละ 1–3 ครั้ง',
        'เบาหวานคุมไม่ได้ทั้งที่คุมอาหารเข้มงวดและกินยาสม่ำเสมอ ร่วมกับอินซูลินวันละ ≥ 4 ครั้ง',
      ],
      lab: [
        'HbA1C < 6%',
        'HbA1C 6 – 6.5%',
        'HbA1C 6.6 – 8.0%',
        'HbA1C 8.1 – 10%',
        'HbA1C > 10%',
      ],
    }),
};

// ---------- ตาราง 16-11 ระดับน้ำตาลในเลือดต่ำ (Hypoglycemia) · 3 ขั้น · HbA1C กลับด้าน ----------
const HYPOGLYCEMIA = {
  id: 'hypoglycemia', ref: '16-11', titleTh: 'ภาวะน้ำตาลในเลือดต่ำ (Hypoglycemia)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: [0, 5, Infinity],
  factors: [{ key: 'history', label: 'ประวัติ / การควบคุม (ปัจจัยหลัก)' }, { key: 'lab', label: 'ผลตรวจ HbA1C (ยิ่งต่ำยิ่งรุนแรง)' }],
  levels: mkLevels(
    [[0, 0], [1, 3], [4, 6]],
    [[0], [1, 2, 3], [4, 5, 6]],
    {
      history: [
        'มีประวัติน้ำตาลในเลือดต่ำที่ยืนยันทางห้องปฏิบัติการ แต่ไม่จำเป็นต้องได้รับการรักษาเพิ่มเติม',
        'มีประวัติน้ำตาลในเลือดต่ำที่ยืนยันทางห้องปฏิบัติการ จำเป็นต้องได้รับการรักษาเพื่อควบคุม',
        'มีประวัติน้ำตาลในเลือดต่ำที่ยืนยันทางห้องปฏิบัติการ แต่ควบคุมไม่ได้แม้ได้รับการรักษา',
      ],
      lab: [
        'HbA1C > 6%',
        'HbA1C 5.0 – 6.0%',
        'HbA1C < 5.0%',
      ],
    }),
};

// ---------- ตาราง 16-12 Osteoporosis/Osteomalacia · 3 ขั้น · ★ไม่มี BOTC ใช้ T-score ----------
const OSTEOPOROSIS = {
  id: 'osteoporosis', ref: '16-12', titleTh: 'โรคกระดูกพรุน (Osteoporosis / Osteomalacia)',
  keyRow: 'history', shiftMode: 'proportional', botcThresholds: null,
  factors: [{ key: 'history', label: 'ประวัติ (ปัจจัยหลัก)' }, { key: 'lab', label: 'ผลตรวจมวลกระดูก (T-score)' }],
  levels: mkLevels(
    [[0, 0], [1, 3], [4, 6]],
    [[0], [1, 2, 3], [4, 5, 6]],
    {
      history: [
        'โรคกระดูกพรุน ไม่จำเป็นต้องรักษา',
        'โรคกระดูกพรุน จำเป็นต้องรักษา',
        'โรคกระดูกพรุนที่รุนแรงหรือไม่ตอบสนองต่อการรักษา',
      ],
      lab: [
        'มวลกระดูกผิดปกติในอดีต ปัจจุบัน T-score ≥ −1',
        'มวลกระดูกผิดปกติในอดีต ปัจจุบัน T-score < −1 แต่ > −2',
        'มวลกระดูกผิดปกติในอดีต ปัจจุบัน T-score ≤ −2',
      ],
    }),
};

export const ENDOCRINE_TABLES = {
  pituitary: PITUITARY, thyroid: THYROID, parathyroid: PARATHYROID,
  adrenalcortex: ADRENAL_CORTEX, adrenalmedulla: ADRENAL_MEDULLA,
  diabetes: DIABETES, hypoglycemia: HYPOGLYCEMIA, osteoporosis: OSTEOPOROSIS,
};
export { BOTC_THRESHOLDS, mkLevels };
