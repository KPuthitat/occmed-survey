// engine.test.js — ทดสอบ engine ระบบทางเดินปัสสาวะ (บทที่ 12)
// รัน: node --test impairment/urinary/engine.test.js
// เคสตรวจสอบยึดจากตัวอย่าง 12.1–12.18 ในคู่มือ (ถอดจากภาพหน้า)
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  egfrAgeAdjust, effectiveEgfr, egfrClass, EGFR_BANDS,
  TABLES, DIVERSION, urinaryResult, combineValues,
} from './engine.js';

// ---- eGFR ปรับตามอายุ + จัดขั้น ----
test('eGFR ปรับตามอายุ: +6.6 ต่อทศวรรษเหนือ 40 ปี', () => {
  assert.equal(egfrAgeAdjust(22), 0);
  assert.equal(egfrAgeAdjust(40), 0);
  assert.equal(egfrAgeAdjust(52), 6.6);   // 1 ทศวรรษ
  assert.equal(egfrAgeAdjust(60), 13.2);  // 2 ทศวรรษ
});
test('12.4: อายุ 52 · eGFR หลังปรับ 40 → ขั้น 2 (30–44)', () => {
  assert.equal(egfrClass(40), 2);
});
test('eGFR จัดขั้นตามช่วง', () => {
  assert.equal(egfrClass(110), 0); // ≥60
  assert.equal(egfrClass(50), 1);  // 45-59
  assert.equal(egfrClass(40), 2);  // 30-44
  assert.equal(egfrClass(18), 3);  // 16-29
  assert.equal(egfrClass(5), 4);   // ≤15
});

// ---- ตาราง 12-1 ทางเดินปัสสาวะส่วนบน ----
test('12.1 upper: ขั้น 0 → 0%', () => {
  assert.equal(urinaryResult(TABLES.upper.levels, 0, 1).wpi, 0);
});
test('12.2 upper: ขั้น 1 ระดับต่ำ → 5% (ไตปกติ เลื่อนลงจากกลาง)', () => {
  const r = urinaryResult(TABLES.upper.levels, 1, 0);
  assert.equal(r.wpi, 5); assert.equal(r.levelName, 'ต่ำ');
});
test('12.3 upper: ขั้น 1 ระดับสูง → 15% (โปรตีนยังผิดปกติ)', () => {
  assert.equal(urinaryResult(TABLES.upper.levels, 1, 2).wpi, 15);
});
test('12.4 upper: ขั้น 2 ระดับต่ำ → 20%', () => {
  assert.equal(urinaryResult(TABLES.upper.levels, 2, 0).wpi, 20);
});
test('12.9 upper: ขั้น 3 ระดับสูง → 45% (polycystic, eGFR 18)', () => {
  assert.equal(egfrClass(18), 3);
  assert.equal(urinaryResult(TABLES.upper.levels, 3, 2).wpi, 45);
});
test('12.10 upper: ขั้น 4 ระดับสูง → 60% (ESRD ฟอกไต, eGFR 5)', () => {
  assert.equal(egfrClass(5), 4);
  assert.equal(urinaryResult(TABLES.upper.levels, 4, 2).wpi, 60);
});

// ---- ตาราง 12-2 กระเพาะปัสสาวะ ----
test('12.11 bladder: ขั้น 2 ระดับสูง → 15%', () => {
  assert.equal(urinaryResult(TABLES.bladder.levels, 2, 2).wpi, 15);
});
test('12.12 bladder: ขั้น 3 ระดับกลาง → 19% + diversion 10 → รวม 27%', () => {
  const b = urinaryResult(TABLES.bladder.levels, 3, 1);
  assert.equal(b.wpi, 19);
  assert.equal(combineValues([b.wpi, 10]), 27);
});
test('12.13 bladder: ขั้น 4 ระดับสูง → 29% (neurogenic bladder)', () => {
  assert.equal(urinaryResult(TABLES.bladder.levels, 4, 2).wpi, 29);
});

// ---- ตาราง 12-3 ท่อปัสสาวะ ----
test('12.14 urethra: ขั้น 2 ระดับกลาง → 12%', () => {
  assert.equal(urinaryResult(TABLES.urethra.levels, 2, 1).wpi, 12);
});
test('12.15 urethra: ขั้น 3 ระดับสูง → 22% (fistula, กลั้นไม่ได้)', () => {
  assert.equal(urinaryResult(TABLES.urethra.levels, 3, 2).wpi, 22);
});
test('12.16 urethra: ขั้น 4 → 29% + upper ขั้น 1 (10%) → รวม 36%', () => {
  const u = urinaryResult(TABLES.urethra.levels, 4, 2);
  assert.equal(u.wpi, 29);
  assert.equal(combineValues([u.wpi, 10]), 36);
});

// ---- ตาราง 12-4 การเปลี่ยนทิศทางเดินปัสสาวะ ----
test('12-4 diversion: ค่าตายตัว 10/15/20', () => {
  assert.deepEqual(DIVERSION.map(d => d.wpi), [10, 15, 20]);
});
test('12.17 diversion: cutaneous ureterostomy 15 + upper ขั้น 2 ต่ำ (20) → รวม 32%', () => {
  const upper = urinaryResult(TABLES.upper.levels, 2, 0).wpi; // 20
  assert.equal(combineValues([15, upper]), 32);
});

// ---- combineValues ----
test('combineValues: A + B(100−A)/100 เรียงมาก→น้อย', () => {
  assert.equal(combineValues([20, 15]), 32);
  assert.equal(combineValues([29, 10]), 36);
  assert.equal(combineValues([]), 0);
  assert.equal(combineValues([50, 50, 50]), 88);
});
