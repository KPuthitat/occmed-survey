// engine.test.js — unit test ระบบหัวใจและหลอดเลือด (บทที่ 10) · รัน: node --test impairment/cardio/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  NYHA_CLASSES, CCS_CLASSES, CAD_LEVELS, GRADE_LETTERS, GRADE_TH, cadResult, gradeResult, combineValues,
  HTN_LEVELS, PVD_ARM_LEVELS, PVD_LEG_LEVELS, VALVE_LEVELS, HF_LEVELS, PERICARD_LEVELS, ARRHYTHMIA_LEVELS, PULMHTN_LEVELS, CARDIO_TABLES,
} from './engine.js';

// ---------- NYHA / CCS (ตาราง 10-1 / 10-5) ----------
test('NYHA มีครบ 4 ระดับ · CCS มีครบ 4 ระดับ', () => {
  assert.deepEqual(NYHA_CLASSES.map(x => x.cls), ['I', 'II', 'III', 'IV']);
  assert.deepEqual(CCS_CLASSES.map(x => x.cls), ['I', 'II', 'III', 'IV']);
  for (const n of [...NYHA_CLASSES, ...CCS_CLASSES]) assert.ok(n.text.length > 20);
});

// ---------- CAD (ตาราง 10-4) — คงเดิม ----------
test('CAD: ขั้น 0–5 + ค่าตรงตาราง 10-4', () => {
  assert.deepEqual(CAD_LEVELS.map(x => x.level), [0, 1, 2, 3, 4, 5]);
  assert.equal(cadResult(0).percent, 0);
  assert.equal(cadResult(2, 0).percent, 12);
  assert.equal(cadResult(2, 0).label, '2A');
  assert.equal(cadResult(3, 2).percent, 33);
  assert.equal(cadResult(5, 4).percent, 100);
  assert.equal(cadResult(1, 2).percent, 6);
});
test('GRADE_LETTERS = A–E · GRADE_TH = ก–จ', () => {
  assert.deepEqual(GRADE_LETTERS, ['A', 'B', 'C', 'D', 'E']);
  assert.deepEqual(GRADE_TH, ['ก', 'ข', 'ค', 'ง', 'จ']);
});

// ---------- gradeResult ทั่วไป ----------
test('gradeResult: ขั้น 0 → 0% · clamp เกรด · label', () => {
  assert.equal(gradeResult(VALVE_LEVELS, 0).percent, 0);
  assert.equal(gradeResult(VALVE_LEVELS, 0).gradeLetter, null);
  assert.equal(gradeResult(VALVE_LEVELS, 4, 99).percent, 65); // clamp → E
  assert.equal(gradeResult(VALVE_LEVELS, 4, -3).percent, 45); // clamp → A
  assert.throws(() => gradeResult(VALVE_LEVELS, 9));
});

// ---------- 10-8 ความดันโลหิตสูง (ขั้น 0–3, 3 เกรด/ขั้น) ----------
test('HTN: ช่วง 0/2-10/11-20/21-30 + เกรด 3 ค่า', () => {
  assert.deepEqual(HTN_LEVELS.map(l => l.level), [0, 1, 2, 3]);
  assert.deepEqual(HTN_LEVELS[1].grades, [2, 6, 10]);
  assert.deepEqual(HTN_LEVELS[2].grades, [11, 15, 20]);
  assert.deepEqual(HTN_LEVELS[3].grades, [21, 25, 30]);
  assert.equal(gradeResult(HTN_LEVELS, 1, 0).percent, 2);
  assert.equal(gradeResult(HTN_LEVELS, 1, 2).percent, 10);   // C = สูงสุดของขั้น (3 เกรด)
  assert.equal(gradeResult(HTN_LEVELS, 1, 2).gradeLetter, 'C');
  assert.equal(gradeResult(HTN_LEVELS, 3, 2).percent, 30);
});

// ---------- โครงมาตรฐาน 10-10..10-16 ----------
const STD = { 1: [2, 4, 6, 8, 10], 2: [11, 14, 17, 20, 23], 3: [24, 28, 32, 36, 40], 4: [45, 50, 55, 60, 65] };
for (const [name, levels] of Object.entries({ PVD_ARM_LEVELS, PVD_LEG_LEVELS, VALVE_LEVELS, HF_LEVELS, PERICARD_LEVELS, ARRHYTHMIA_LEVELS, PULMHTN_LEVELS })) {
  const arr = { PVD_ARM_LEVELS, PVD_LEG_LEVELS, VALVE_LEVELS, HF_LEVELS, PERICARD_LEVELS, ARRHYTHMIA_LEVELS, PULMHTN_LEVELS }[name];
  test(`${name}: โครงตัวเลขมาตรฐาน (ขั้น 0–4)`, () => {
    assert.deepEqual(arr.map(l => l.level), [0, 1, 2, 3, 4]);
    for (let l = 1; l <= 4; l++) assert.deepEqual(arr.find(x => x.level === l).grades, STD[l]);
    // ปลายช่วง = A และ E
    assert.equal(arr.find(x => x.level === 4).range[1], 65);
    assert.equal(arr.find(x => x.level === 1).range[0], 2);
  });
}

// ---------- fixtures จากตัวอย่างในคู่มือ (ผลลัพธ์ %) ----------
test('ตัวอย่าง PVD (10-10/10-11): 1B=4, 3C=32, 4E=65', () => {
  assert.equal(gradeResult(PVD_ARM_LEVELS, 1, 1).percent, 4);   // 10.20 = 1B → 4% ของแขน
  assert.equal(gradeResult(PVD_ARM_LEVELS, 3, 2).percent, 32);  // 10.21 = 3C → 32% ของแขน
  assert.equal(gradeResult(PVD_LEG_LEVELS, 4, 4).percent, 65);  // 10.19 = 4E → 65% ของขา
});
test('ตัวอย่างลิ้นหัวใจ (10-12): 1C=6, 3C=32, 4E=65', () => {
  assert.equal(gradeResult(VALVE_LEVELS, 1, 2).percent, 6);
  assert.equal(gradeResult(VALVE_LEVELS, 3, 2).percent, 32);
  assert.equal(gradeResult(VALVE_LEVELS, 4, 4).percent, 65);
});
test('ตัวอย่างหัวใจล้มเหลว (10-13): 1A=2, 2C=17, 4E=65', () => {
  assert.equal(gradeResult(HF_LEVELS, 1, 0).percent, 2);
  assert.equal(gradeResult(HF_LEVELS, 2, 2).percent, 17);
  assert.equal(gradeResult(HF_LEVELS, 4, 4).percent, 65);
});
test('ตัวอย่างเยื่อหุ้มหัวใจ (10-14): 1A=2, 4E=65 · หัวใจเต้นผิดจังหวะ (10-15): 0=0, 1C=6, 3C=32, 4E=65', () => {
  assert.equal(gradeResult(PERICARD_LEVELS, 1, 0).percent, 2);
  assert.equal(gradeResult(PERICARD_LEVELS, 4, 4).percent, 65);
  assert.equal(gradeResult(ARRHYTHMIA_LEVELS, 0).percent, 0);
  assert.equal(gradeResult(ARRHYTHMIA_LEVELS, 1, 2).percent, 6);
  assert.equal(gradeResult(ARRHYTHMIA_LEVELS, 3, 2).percent, 32);
  assert.equal(gradeResult(ARRHYTHMIA_LEVELS, 4, 4).percent, 65);
});

// ---------- CARDIO_TABLES registry ----------
test('CARDIO_TABLES: ครบ 8 ตาราง + output ถูกชนิด', () => {
  assert.deepEqual(Object.keys(CARDIO_TABLES).length, 8);
  assert.equal(CARDIO_TABLES.pvdArm.output, 'arm');
  assert.equal(CARDIO_TABLES.pvdLeg.output, 'leg');
  assert.equal(CARDIO_TABLES.valve.output, 'wpi');
  assert.equal(CARDIO_TABLES.htn.ref, '10-8');
});

// ---------- Combined Values ----------
test('combineValues: A + B(100−A)/100', () => {
  assert.equal(Math.round(combineValues([50, 50])), 75);
  assert.equal(combineValues([0]), 0);
  assert.equal(combineValues([]), 0);
  assert.equal(Math.round(combineValues([65, 33])), 77);
});
