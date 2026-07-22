// engine.test.js — unit test ตามตัวอย่างในคู่มือ บทที่ 6 · รัน: node --test impairment/eye/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  ACUITY, vasFor, functionalScore, vsiToWpi, visionResult, combineValues, acuityByEn,
} from './engine.js';

// ---------- VAS lookup (ตาราง 6-3) ----------
test('VAS: 20/20 = 100, NLP = 0, 20/200 = 20, 20/12.5 = 110', () => {
  assert.equal(vasFor('20/20'), 100);
  assert.equal(vasFor('NLP'), 0);
  assert.equal(vasFor('20/200'), 20);
  assert.equal(vasFor('20/12.5'), 110);
});
test('VAS aphakia/pseudophakia (ตาราง 6-3): 20/20 → 50 / 75', () => {
  assert.equal(vasFor('20/20', 'aphakia'), 50);       // 100 − 50
  assert.equal(vasFor('20/20', 'pseudophakia'), 75);  // 100 − 25
  assert.equal(vasFor('20/40', 'aphakia'), 43);       // 100 − 57
});

// ---------- ตัวอย่างในคู่มือ (กรณีที่ 1/2 หน้า 495 + ตัวอย่างหน้า 497) ----------
test('กรณีที่ 1: VA 20/200 + 20/20 → VSI 20%', () => {
  const r = visionResult({ vasRE: vasFor('20/200'), vasLE: vasFor('20/20') });
  assert.equal(r.fva, 80);      // (2·100 + 20 + 100)/4
  assert.equal(r.vsi, 20);
  assert.equal(r.wpi, 20);
});
test('กรณีที่ 2: VA NLP + 20/20 → VSI 25%, WPI 25%', () => {
  const r = visionResult({ vasRE: vasFor('NLP'), vasLE: vasFor('20/20') });
  assert.equal(r.fva, 75);      // (2·100 + 0 + 100)/4
  assert.equal(r.vsi, 25);
  assert.equal(r.wpi, 25);
});
test('ตัวอย่างหน้า 497: สูญเสียลูกตาขวา (VAS 0) + ตาซ้ายปกติ → VSI 25 · รวมเบ้าตา 19% → 39%', () => {
  const r = visionResult({ vasRE: 0, vasLE: 100 });
  assert.equal(r.vsi, 25);
  assert.equal(Math.round(combineValues([r.vsi, 19])), 39);  // 25 + 19(75)/100 = 39.25 → 39
});

// ---------- VSI → WPI (ตาราง 6-8 / สูตร) ----------
test('vsiToWpi: ≤50 = VSI', () => {
  for (const v of [0, 5, 25, 50]) assert.equal(vsiToWpi(v), v);
});
test('vsiToWpi: >50 = 50 + 0.7(VSI−50) ปัดเศษ (ตรงตาราง 6-8)', () => {
  assert.equal(vsiToWpi(60), 57);   // 50 + 7
  assert.equal(vsiToWpi(70), 64);   // 50 + 14
  assert.equal(vsiToWpi(80), 71);
  assert.equal(vsiToWpi(90), 78);
  assert.equal(vsiToWpi(100), 85);
  assert.equal(vsiToWpi(61), 58);   // 50 + 7.7 → 58
  assert.equal(vsiToWpi(55), 54);   // 50 + 3.5 → 54
});

// ---------- FVA/FVF/FVS ครบวงจร (มีลานสายตา) ----------
test('มีลานสายตา: FVA 100, FVF 80 → FVS 80, VSI 20', () => {
  // ตาปกติทั้งคู่ (VAS 100) แต่ลานสายตาลดลง (VFS 80 ทั้งคู่)
  const r = visionResult({ vasRE: 100, vasLE: 100, vfsRE: 80, vfsLE: 80 });
  assert.equal(r.fva, 100);
  assert.equal(r.fvf, 80);
  assert.equal(r.fvs, 80);
  assert.equal(r.vsi, 20);
});
test('ตาปกติสมบูรณ์ → VSI 0', () => {
  const r = visionResult({ vasRE: 100, vasLE: 100 });
  assert.equal(r.vsi, 0);
  assert.equal(r.wpi, 0);
});
test('VAS_BE ปริยาย = ตาข้างที่ดีกว่า', () => {
  const r = visionResult({ vasRE: 20, vasLE: 100 });  // BE = 100
  assert.equal(r.vasBE, 100);
});

// ---------- ตรวจความครบของตาราง 6-3 ----------
test('ตาราง VAS: 20/20=100 และ VAS ลดหลั่นไม่เพิ่ม (จนถึง 0 ที่ NLP)', () => {
  assert.equal(acuityByEn('20/20').vas, 100);
  assert.equal(ACUITY[ACUITY.length - 1].vas, 0);   // NLP
  for (let i = 1; i < ACUITY.length; i++) assert.ok(ACUITY[i].vas <= ACUITY[i - 1].vas, 'VAS ไม่เพิ่มขึ้น');
});
test('functionalScore: (2·both+R+L)/4', () => {
  assert.equal(functionalScore(100, 20, 100), 80);
  assert.equal(functionalScore(100, 0, 100), 75);
});
