// engine.test.js — unit test ระบบหัวใจและหลอดเลือด (บทที่ 10) · รัน: node --test impairment/cardio/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NYHA_CLASSES, CAD_LEVELS, GRADE_LETTERS, cadResult, combineValues } from './engine.js';

// ---------- NYHA (ตาราง 10-1) ----------
test('NYHA มีครบ 4 ระดับ I–IV', () => {
  assert.equal(NYHA_CLASSES.length, 4);
  assert.deepEqual(NYHA_CLASSES.map(x => x.cls), ['I', 'II', 'III', 'IV']);
  for (const n of NYHA_CLASSES) assert.ok(n.text.length > 20, 'ต้องมีคำอธิบาย');
});

// ---------- โครงตาราง 10-4 ----------
test('CAD_LEVELS มีขั้น 0–5 ครบ', () => {
  assert.equal(CAD_LEVELS.length, 6);
  assert.deepEqual(CAD_LEVELS.map(x => x.level), [0, 1, 2, 3, 4, 5]);
});
test('ช่วง WPI แต่ละขั้นตรงตาราง 10-4', () => {
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 0).range, [0, 0]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 1).range, [2, 10]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 2).range, [12, 24]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 3).range, [27, 39]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 4).range, [45, 65]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 5).range, [68, 100]);
});
test('ค่า severity 5 ระดับ (A–E) ตรงตาราง 10-4', () => {
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 1).grades, [2, 4, 6, 8, 10]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 2).grades, [12, 15, 18, 21, 24]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 3).grades, [27, 30, 33, 36, 39]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 4).grades, [45, 50, 55, 60, 65]);
  assert.deepEqual(CAD_LEVELS.find(l => l.level === 5).grades, [68, 76, 84, 92, 100]);
});
test('ปลายช่วงตรงกับค่าเกรด A และ E', () => {
  for (const L of CAD_LEVELS) {
    if (L.level === 0) continue;
    assert.equal(L.grades[0], L.range[0], `ขั้น ${L.level} A ต้องเท่าค่าต่ำสุด`);
    assert.equal(L.grades[4], L.range[1], `ขั้น ${L.level} E ต้องเท่าค่าสูงสุด`);
  }
});

// ---------- cadResult ----------
test('ขั้น 0 → 0% เสมอ ไม่มีเกรด', () => {
  const r = cadResult(0);
  assert.equal(r.percent, 0);
  assert.equal(r.gradeLetter, null);
  assert.equal(r.label, '0');
});
test('cadResult เลือกเกรดถูกช่อง (0=A .. 4=E)', () => {
  assert.equal(cadResult(2, 0).percent, 12);
  assert.equal(cadResult(2, 0).gradeLetter, 'A');
  assert.equal(cadResult(2, 0).label, '2A');
  assert.equal(cadResult(3, 2).percent, 33);
  assert.equal(cadResult(3, 2).label, '3C');
  assert.equal(cadResult(5, 4).percent, 100);
  assert.equal(cadResult(5, 4).label, '5E');
  assert.equal(cadResult(1, 2).percent, 6);
});
test('gradeIndex เกินขอบถูก clamp', () => {
  assert.equal(cadResult(4, -3).percent, 45); // → A
  assert.equal(cadResult(4, 99).percent, 65); // → E
});
test('cadResult ผูก NYHA ของขั้นนั้น', () => {
  assert.equal(cadResult(1, 0).range[0], 2);
  assert.equal(CAD_LEVELS.find(l => l.level === 5).nyha, 'IV');
});
test('ขั้นไม่ถูกต้อง → throw', () => {
  assert.throws(() => cadResult(9));
});
test('GRADE_LETTERS = A B C D E', () => {
  assert.deepEqual(GRADE_LETTERS, ['A', 'B', 'C', 'D', 'E']);
});

// ---------- Combined Values ----------
test('combineValues: A + B(100−A)/100 เรียงมาก→น้อย', () => {
  assert.equal(Math.round(combineValues([50, 50])), 75);
  assert.equal(combineValues([0]), 0);
  assert.equal(combineValues([]), 0);
  assert.equal(Math.round(combineValues([65, 33])), 77); // 65 + 33·0.35 = 76.55 → 77
});
