// engine.test.js — ทดสอบ engine ระบบสืบพันธุ์ชาย (บทที่ 13)
// รัน: node --test impairment/reprom/engine.test.js
// เคสตรวจสอบยึดจากตัวอย่าง 13.1–13.14 ในคู่มือ (ถอดจากภาพหน้า)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  iief5Total, iief5Class, iief5Band,
  ERECTILE_LEVELS, TESTES_LEVELS, PROSTATE_LEVELS,
  QOL_FACTORS, PROSTATE_FACTORS, levelWpi, sumFactors, repromResult,
} from './engine.js';

// ---- 13-1 IIEF-5 การให้คะแนน + จัดขั้น ----
test('IIEF-5 รวมคะแนน 5 ข้อ', () => {
  assert.equal(iief5Total([4, 4, 4, 4, 4]), 20);
  assert.equal(iief5Total([5, 5, 5, 5, 5]), 25);
  assert.equal(iief5Total([1, 1, 1, 1, 1]), 5);
});
test('IIEF-5 แถบ/ขั้นตามคะแนน', () => {
  assert.equal(iief5Class(23), 0); // 22-25
  assert.equal(iief5Class(20), 1); // 17-21
  assert.equal(iief5Class(15), 2); // 12-16
  assert.equal(iief5Class(9), 3);  // 8-11
  assert.equal(iief5Class(7), 4);  // 1-7
  assert.equal(iief5Band(15).label, 'หย่อนสมรรถภาพทางเพศเล็กน้อยถึงปานกลาง');
});

// ---- ค่าตั้งต้นต่อขั้น ----
test('13-2/13-4 สเกลองคชาต/อัณฑะ = 0/4/11/18/25', () => {
  assert.deepEqual(ERECTILE_LEVELS.map(l => l.wpi), [0, 4, 11, 18, 25]);
  assert.deepEqual(TESTES_LEVELS.map(l => l.wpi), [0, 4, 11, 18, 25]);
});
test('13-5 ต่อมลูกหมาก ขั้น 1-4 = 3/7/11/15', () => {
  assert.deepEqual(PROSTATE_LEVELS.map(l => l.cls), [1, 2, 3, 4]);
  assert.deepEqual(PROSTATE_LEVELS.map(l => l.wpi), [3, 7, 11, 15]);
});

// ---- องคชาต (13-1/13-2) : ค่าตั้งต้น + QoL/ปัจจัยรอง ----
test('13.1 องคชาต: IIEF 20 → ขั้น 1 (4%) + 3 QoL + 1 ตรวจร่างกาย = 8%', () => {
  assert.equal(iief5Class(20), 1);
  const r = repromResult(ERECTILE_LEVELS, 1, QOL_FACTORS, ['age', 'children', 'sex']);
  assert.equal(r.base, 4);
  assert.equal(r.add, 3);
  assert.equal(r.wpi + 1, 8); // + ความผิดปกติเล็กน้อยตรวจร่างกายอีก 1
});
test('13.2 องคชาต: IIEF 15 → ขั้น 2 (11%) + 2 QoL = 13%', () => {
  assert.equal(iief5Class(15), 2);
  const r = repromResult(ERECTILE_LEVELS, 2, QOL_FACTORS, ['age', 'sex']);
  assert.equal(r.wpi, 13);
});
test('13.3 องคชาต: ปัจจัยหลักขั้น 3 (18%) + IIEF สูงขึ้น 1 + อาการ 1 + 2 QoL = 22%', () => {
  // IIEF 7 = ขั้น 4 (สูงกว่าปัจจัยหลักขั้น 3 อยู่ 1 ขั้น → +1)
  assert.equal(iief5Class(7), 4);
  const base = levelWpi(ERECTILE_LEVELS, 3); // 18
  assert.equal(base + 1 + 1 + 2, 22);
});
test('13.4 องคชาต: IIEF 1 → ขั้น 4 (25%) + 1 QoL (ต้องการเพศสัมพันธ์) = 26%', () => {
  assert.equal(iief5Class(1), 4);
  const r = repromResult(ERECTILE_LEVELS, 4, QOL_FACTORS, ['sex']);
  assert.equal(r.wpi, 26);
});

// ---- ถุงอัณฑะ/อัณฑะ (13-3/13-4) : ค่าตั้งต้น + QoL ----
test('13.5 อัณฑะ: ขั้น 1 (4%) + 2 QoL (อายุ+บุตร) = 6%', () => {
  const r = repromResult(TESTES_LEVELS, 1, QOL_FACTORS, ['age', 'children']);
  assert.equal(r.base, 4); assert.equal(r.add, 2); assert.equal(r.wpi, 6);
});
test('13.6 อัณฑะ: ขั้น 2 (11%) + 1 QoL (อายุ) = 12%', () => {
  const r = repromResult(TESTES_LEVELS, 2, QOL_FACTORS, ['age']);
  assert.equal(r.wpi, 12);
});
test('13.7 อัณฑะ: ขั้น 3 (18%) + 2 QoL = 20% (น้ำอสุจิผิดปกติดันเป็นขั้น 3)', () => {
  const r = repromResult(TESTES_LEVELS, 3, QOL_FACTORS, ['age', 'children']);
  assert.equal(r.wpi, 20);
});
test('13.8 อัณฑะ: ขั้น 3 (18%) + 2 QoL = 20%', () => {
  const r = repromResult(TESTES_LEVELS, 3, QOL_FACTORS, ['age', 'children']);
  assert.equal(r.wpi, 20);
});
test('13.9 อัณฑะ: ขั้น 4 (25%) + 2 QoL = 27%', () => {
  const r = repromResult(TESTES_LEVELS, 4, QOL_FACTORS, ['age', 'children']);
  assert.equal(r.wpi, 27);
});

// ---- ต่อมลูกหมาก (13-5) : ค่าตั้งต้น + ปัจจัยรองคลินิก ----
test('13.10 ต่อมลูกหมาก: ขั้น 1 (3%) + DRE ผิดปกติ = 4% (PSA 3.4 ไม่บวก)', () => {
  const r = repromResult(PROSTATE_LEVELS, 1, PROSTATE_FACTORS, ['dre']);
  assert.equal(r.base, 3); assert.equal(r.wpi, 4);
});
test('13.11 ต่อมลูกหมาก: ขั้น 2 (7%) + DRE + PSA>4-10 = 9%', () => {
  const r = repromResult(PROSTATE_LEVELS, 2, PROSTATE_FACTORS, ['dre', 'psa_4_10']);
  assert.equal(r.wpi, 9);
});
test('13.12 ต่อมลูกหมาก: ขั้น 3 (11%) + DRE + PSA>4-10 = 13%', () => {
  const r = repromResult(PROSTATE_LEVELS, 3, PROSTATE_FACTORS, ['dre', 'psa_4_10']);
  assert.equal(r.wpi, 13);
});
test('13.13 ต่อมลูกหมาก: ขั้น 3 (11%) + DRE + PSA>10 + biopsy complication = 16%', () => {
  const r = repromResult(PROSTATE_LEVELS, 3, PROSTATE_FACTORS, ['dre', 'psa_10', 'biopsy_comp']);
  assert.equal(r.add, 1 + 2 + 2); assert.equal(r.wpi, 16);
});
test('13.14 ต่อมลูกหมาก: ขั้น 4 (15%) + ไม่มีปัจจัยรอง (PSA 0) = 15%', () => {
  const r = repromResult(PROSTATE_LEVELS, 4, PROSTATE_FACTORS, []);
  assert.equal(r.wpi, 15);
});

// ---- ตรวจ sumFactors ----
test('sumFactors บวกเฉพาะที่เลือก', () => {
  assert.equal(sumFactors(QOL_FACTORS, ['age', 'sex']), 2);
  assert.equal(sumFactors(PROSTATE_FACTORS, ['psa_10', 'surgery_comp']), 4);
  assert.equal(sumFactors(QOL_FACTORS, []), 0);
});
