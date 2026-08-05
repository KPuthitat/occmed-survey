// engine.test.js — ทดสอบตัวช่วยวินิจฉัย NIHL
import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeEar, airBoneGap, diagnoseNIHL, NOISE_MIN } from './engine.js';

// ---- รอยบาก (notch) รายหู ----
test('รอยบากคลาสสิกที่ 4 kHz + ดีขึ้นที่ 8 kHz → notch = true', () => {
  const r = analyzeEar({ 500: 10, 1000: 10, 2000: 15, 3000: 35, 4000: 55, 6000: 40, 8000: 25 });
  assert.equal(r.peakFreq, 4000);
  assert.equal(r.depth, 45);      // 55 − min(10,15)=10
  assert.equal(r.recovery, 30);   // 55 − 25
  assert.equal(r.notch, true);
});

test('การได้ยินลดแบบลาดลง (presbycusis) แย่สุดที่ 8 kHz → ไม่ใช่ notch', () => {
  const r = analyzeEar({ 500: 20, 1000: 25, 2000: 30, 3000: 40, 4000: 45, 6000: 55, 8000: 65 });
  assert.equal(r.recovery, -10);  // 55 − 65 (ไม่ดีขึ้นที่ 8k)
  assert.equal(r.notch, false);
});

test('รอยบากตื้นเกิน (<15 dB) → ไม่ใช่ notch', () => {
  const r = analyzeEar({ 500: 20, 1000: 20, 2000: 20, 3000: 28, 4000: 30, 6000: 25, 8000: 15 });
  assert.equal(r.depth, 10);
  assert.equal(r.notch, false);
});

// ---- ช่องว่าง air–bone ----
test('air–bone gap: มี BC → คำนวณค่าเฉลี่ย', () => {
  const g = airBoneGap({ 500: 40, 1000: 45, 2000: 50 }, { 500: 10, 1000: 12, 2000: 14 });
  assert.equal(g, 33);            // avg(30,33,36)=33
});
test('ไม่มี BC → null', () => { assert.equal(airBoneGap({ 500: 40 }, null), null); });

// ---- วินิจฉัยรวม ----
const classicEar = { 500: 10, 1000: 10, 2000: 15, 3000: 35, 4000: 55, 6000: 40, 8000: 25 };

test('เคสคลาสสิก: notch สองข้าง + สัมผัสเสียง 90 dBA → เข้าได้กับ NIHL', () => {
  const d = diagnoseNIHL({ right: { ac: classicEar }, left: { ac: classicEar }, noise: { level: 90, years: 15 } });
  assert.equal(d.criteria.notch, true);
  assert.equal(d.criteria.symmetric, true);
  assert.equal(d.criteria.bilateral, true);
  assert.equal(d.criteria.noise, true);
  assert.equal(d.bilateralNotch, true);
  assert.equal(d.level, 'consistent');
});

test('ไม่มีประวัติเสียงดังพอ (80 dBA) → ยังไม่สรุป consistent', () => {
  const d = diagnoseNIHL({ right: { ac: classicEar }, left: { ac: classicEar }, noise: { level: 80 } });
  assert.equal(d.criteria.noise, false);
  assert.notEqual(d.level, 'consistent');
});

test('ลาดลงแบบ presbycusis → atypical (ไม่มี notch)', () => {
  const p = { 500: 20, 1000: 25, 2000: 30, 3000: 40, 4000: 45, 6000: 55, 8000: 65 };
  const d = diagnoseNIHL({ right: { ac: p }, left: { ac: p }, noise: { level: 90 } });
  assert.equal(d.criteria.notch, false);
  assert.equal(d.level, 'atypical');
});

test('มีช่องว่าง air–bone กว้าง (conductive) → sensorineural = false', () => {
  const ac = { 500: 45, 1000: 45, 2000: 50, 3000: 60, 4000: 70, 6000: 55, 8000: 45 };
  const bc = { 500: 10, 1000: 10, 2000: 15, 3000: 20, 4000: 25, 6000: 20, 8000: 15 };
  const d = diagnoseNIHL({ right: { ac, bc }, left: { ac, bc }, noise: { level: 90 } });
  assert.equal(d.criteria.sensorineural, false);
  assert.notEqual(d.level, 'consistent');
});

test('ไม่สมมาตร (ข้างเดียวแย่กว่ามาก) → symmetric = false → ไม่ consistent', () => {
  const good = { 500: 5, 1000: 5, 2000: 10, 3000: 10, 4000: 10, 6000: 10, 8000: 10 };
  const d = diagnoseNIHL({ right: { ac: classicEar }, left: { ac: good }, noise: { level: 90 } });
  assert.equal(d.criteria.symmetric, false);
  assert.notEqual(d.level, 'consistent');
});

test('NOISE_MIN = 85 dBA', () => { assert.equal(NOISE_MIN, 85); });
