// engine.test.js — ทดสอบ engine ระบบทางเดินหายใจ (บทที่ 9) · node --test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  lungResult, asthmaResult, asthmaLabClassFromFev1,
  rangeValue, OSA_LEVELS, KARNOFSKY_LEVELS, ASTHMA_GRADES,
} from './engine.js';

// ---------- ตาราง 9-3 โรคปอดทั่วไป (FEV1 → interpolation) ----------
test('9-3 ตัวอย่าง 9.2: FEV1 48% → ขั้น 3 → 40%', () => {
  const r = lungResult(48);
  assert.equal(r.cls, 3);
  assert.equal(r.impExact, 40);
  assert.equal(r.impairment, 40);
});

test('9-3 ตัวอย่าง 9.4: FEV1 50% → 37.5 → ปัดเป็น 38%', () => {
  const r = lungResult(50);
  assert.equal(r.cls, 3);
  assert.equal(r.impExact, 37.5);
  assert.equal(r.impairment, 38);
});

test('9-3 ขอบเขตชั้น', () => {
  assert.equal(lungResult(100).impairment, 0);
  assert.equal(lungResult(80).cls, 1);
  assert.equal(lungResult(80).impairment, 10);
  assert.equal(lungResult(60).cls, 2);
  assert.equal(lungResult(60).impairment, 25);
  assert.equal(lungResult(40).cls, 3);
  assert.equal(lungResult(40).impairment, 50);
  assert.equal(lungResult(20).cls, 4);
  assert.equal(lungResult(20).impairment, 75);
  assert.equal(lungResult(0).impairment, 100);
});

// ---------- ตาราง 9-4 หอบหืดจากการทำงาน (class × grade) ----------
test('9-4 FEV1 post-BD → ชั้นปัจจัยหลัก', () => {
  assert.equal(asthmaLabClassFromFev1(85), 0);
  assert.equal(asthmaLabClassFromFev1(75), 1);
  assert.equal(asthmaLabClassFromFev1(69), 2);
  assert.equal(asthmaLabClassFromFev1(55), 3);
  assert.equal(asthmaLabClassFromFev1(45), 4);
});

test('9-4 ตัวอย่าง 9.3: FEV1 69% → ขั้น 2, ปัจจัยรอง (3,1) net 0 → 2C = 17%', () => {
  const lab = asthmaLabClassFromFev1(69);
  assert.equal(lab, 2);
  const r = asthmaResult(lab, 3, 1);
  assert.equal(r.cls, 2);
  assert.equal(r.gradeLetter, 'C');
  assert.equal(r.net, 0);
  assert.equal(r.value, 17);
});

test('9-4 grade ตั้งต้น C และปรับด้วยปัจจัยรอง (clamp ในชั้น)', () => {
  assert.equal(asthmaResult(3).value, 36);          // grade C ตั้งต้น (ไม่มีปัจจัยรอง)
  assert.equal(asthmaResult(3, 1, 4).value, 30);    // net (1-3)+(4-3) = -1 → B
  assert.equal(asthmaResult(3, 1, 1).value, 24);    // net -4 → clamp A
  assert.equal(asthmaResult(3, 4, 4).value, 48);    // net +2 → E
  assert.equal(asthmaResult(0).value, 0);           // ชั้น 0
});

test('9-4 ค่าย่อยตรงตามตาราง', () => {
  assert.deepEqual(ASTHMA_GRADES[1], [2, 4, 6, 8, 10]);
  assert.deepEqual(ASTHMA_GRADES[2], [11, 14, 17, 20, 23]);
  assert.deepEqual(ASTHMA_GRADES[3], [24, 30, 36, 42, 48]);
  assert.deepEqual(ASTHMA_GRADES[4], [49, 57, 65, 73, 81]);
});

// ---------- ตาราง 9-6 OSA / 9-5 Karnofsky (class → range) ----------
test('9-6 ตัวอย่าง 9.1: OSA ขั้น 1 (ช่วง 1–5) เลือก 5', () => {
  const r = rangeValue(OSA_LEVELS, 1, 5);
  assert.equal(r.lo, 1);
  assert.equal(r.hi, 5);
  assert.equal(r.value, 5);
});

test('9-6 clamp ค่านอกช่วง', () => {
  assert.equal(rangeValue(OSA_LEVELS, 2, 99).value, 10);  // clamp บน (6–10)
  assert.equal(rangeValue(OSA_LEVELS, 3, 0).value, 11);   // clamp ล่าง (11–25)
});

test('9-5 Karnofsky ช่วงตรงตาราง', () => {
  assert.deepEqual([KARNOFSKY_LEVELS[2].lo, KARNOFSKY_LEVELS[2].hi], [11, 34]);
  assert.deepEqual([KARNOFSKY_LEVELS[4].lo, KARNOFSKY_LEVELS[4].hi], [61, 100]);
});
