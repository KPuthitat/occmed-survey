// engine.test.js — unit test ระบบต่อมไร้ท่อ (บทที่ 16)
// รัน: node --test impairment/endocrine/engine.test.js
// ตรวจโครงตาราง + คำตอบตัวอย่าง 16.1–16.20 ผ่าน classifier (key→class, BOTC/objective ปรับเกรดตามส่วน)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ENDOCRINE_TABLES, MED_ORAL, MED_INJECT, DIET, DEVICE } from './engine.js';
import { classifyPicks } from '../../shared/classifier.js';

const sc = (list, id) => (list.find(o => o.id === id) || list[0]).score;
function botcClass(score, thr) { for (let i = 0; i < thr.length; i++) if (score <= thr[i]) return i; return thr.length - 1; }

// ประเมิน: history=keyClass · botcScore (→class per organ thresholds) · nonKey factors (class)
function assess(organ, keyClass, opts = {}) {
  const T = ENDOCRINE_TABLES[organ];
  const picks = { history: keyClass };
  if (opts.botc != null && T.botcThresholds) picks.botc = botcClass(opts.botc, T.botcThresholds);
  if (opts.lab != null) picks.lab = opts.lab;
  if (opts.exam != null) picks.exam = opts.exam;
  return classifyPicks({ levels: T.levels, keyRow: 'history', picks, shiftMode: 'proportional' });
}

// ---------- โครงตาราง ----------
test('มีครบ 8 ต่อม', () => assert.equal(Object.keys(ENDOCRINE_TABLES).length, 8));
test('เบาหวาน 16-10: 5 ขั้น × 5 ระดับ · ขั้น4 = [16,19,22,25,28]', () => {
  const T = ENDOCRINE_TABLES.diabetes;
  assert.deepEqual(T.levels.map(l => l.level), [0, 1, 2, 3, 4]);
  assert.deepEqual(T.levels.find(l => l.level === 4).grades, [16, 19, 22, 25, 28]);
});
test('adrenal medulla 16-9: ขั้น4 = [40,50,60] · osteoporosis ไม่มี BOTC', () => {
  assert.deepEqual(ENDOCRINE_TABLES.adrenalmedulla.levels.find(l => l.level === 4).grades, [40, 50, 60]);
  assert.equal(ENDOCRINE_TABLES.osteoporosis.botcThresholds, null);
});

// ---------- ต่อมใต้สมอง (16-5) ----------
test('16.1 DI: ประวัติ=ขั้น2(B=5) · BOTC=2→ขั้น1 → A = 4%', () => {
  assert.equal(assess('pituitary', 2, { botc: sc(MED_ORAL, 'd12') }).percent, 4);
});

// ---------- ธัยรอยด์ (16-6) ----------
test('16.3 Hashimoto: ประวัติ=ขั้น1(C=3) · exam=ขั้น1 · BOTC=2→ขั้น1 → คง C = 3%', () => {
  assert.equal(assess('thyroid', 1, { botc: 2, exam: 1 }).percent, 3);
});

// ---------- พาราธัยรอยด์ (16-7) ----------
test('16.4 hyperPTH: ประวัติ=ขั้น1(B=2) · BOTC=0→ขั้น0 → A = 1%', () => {
  assert.equal(assess('parathyroid', 1, { botc: 0 }).percent, 1);
});
test('16.5 hypoPTH: ประวัติ=ขั้น1(B=2) · BOTC=2→ขั้น1 → คง B = 2%', () => {
  assert.equal(assess('parathyroid', 1, { botc: 2 }).percent, 2);
});
test('16.6 hyperPTH: ประวัติ=ขั้น2(C=6) · BOTC=2→ขั้น1(−1) · exam=ขั้น2(+1) → คง C = 6%', () => {
  assert.equal(assess('parathyroid', 2, { botc: 2, exam: 2 }).percent, 6);
});

// ---------- adrenal cortex (16-8) ----------
test('16.7 Addison: ประวัติ=ขั้น1(B=2) · BOTC=2→ขั้น1 → คง B = 2%', () => {
  assert.equal(assess('adrenalcortex', 1, { botc: 2 }).percent, 2);
});
test('16.8 Cushing tumor: ประวัติ=ขั้น1(B=2) · BOTC=0→ขั้น0 → A = 1%', () => {
  assert.equal(assess('adrenalcortex', 1, { botc: 0 }).percent, 1);
});
test('16.11 recurrent Cushing: ประวัติ=ขั้น3(B=15) · BOTC=2→ขั้น1 (ลดสุด) → A = 10%', () => {
  assert.equal(assess('adrenalcortex', 3, { botc: 2 }).percent, 10);
});

// ---------- adrenal medulla (16-9) ----------
test('16.12 pheochromocytoma: ประวัติ=ขั้น1(B=3) · BOTC=0→ขั้น0 → A = 1%', () => {
  assert.equal(assess('adrenalmedulla', 1, { botc: 0 }).percent, 1);
});

// ---------- เบาหวาน (16-10) ----------
test('16.13 T2DM: ประวัติ=ขั้น1(C=3) · BOTC=2→ขั้น1 · HbA1C 5.5%→ขั้น0 → B = 2%', () => {
  assert.equal(assess('diabetes', 1, { botc: 2, lab: 0 }).percent, 2);
});
test('16.14 T2DM: ประวัติ=ขั้น1(C=3) · BOTC=4→ขั้น1 · HbA1C 6.1%→ขั้น1 → คง C = 3%', () => {
  assert.equal(assess('diabetes', 1, { botc: 4, lab: 1 }).percent, 3);
});
test('16.15 T2DM: ประวัติ=ขั้น2(C=8) · BOTC=6→ขั้น2 · HbA1C 8%→ขั้น2 → คง C = 8%', () => {
  assert.equal(assess('diabetes', 2, { botc: 6, lab: 2 }).percent, 8);
});
test('16.16 T1DM: ประวัติ=ขั้น2(C=8) · BOTC=7→ขั้น2 · HbA1C 13%→ขั้น4 (+2) → E = 10%', () => {
  assert.equal(assess('diabetes', 2, { botc: 7, lab: 4 }).percent, 10);
});

// ---------- hypoglycemia (16-11) ----------
test('16.17 reactive hypoglycemia: ประวัติ=ขั้น1(B=2) · BOTC=2→ขั้น1 · HbA1C 5.4%→ขั้น1 → คง B = 2%', () => {
  assert.equal(assess('hypoglycemia', 1, { botc: 2, lab: 1 }).percent, 2);
});

// ---------- osteoporosis (16-12) ----------
test('16.18 osteoporosis: ประวัติ=ขั้น1(B=2) · T-score≤−2→ขั้น2 (+1) → C = 3%', () => {
  assert.equal(assess('osteoporosis', 1, { lab: 2 }).percent, 3);
});
test('16.20 osteoporosis: ประวัติ=ขั้น2(max) · T-score ขั้น2(max) → ข้อยกเว้นระดับสูงสุด → C = 6%', () => {
  assert.equal(assess('osteoporosis', 2, { lab: 2 }).percent, 6);
});
