// engine.test.js — ทดสอบ engine ทางจิตและพฤติกรรม (บทที่ 18)
import test from 'node:test';
import assert from 'node:assert/strict';
import { psychAverage, psychLevel, psychResult, PSYCH_DOMAINS, PSYCH_LEVELS } from './engine.js';

test('มี 4 ด้าน · 5 ระดับ', () => { assert.equal(PSYCH_DOMAINS.length, 4); assert.equal(PSYCH_LEVELS.length, 5); });
test('เฉลี่ยคะแนน 4 ด้าน', () => {
  assert.equal(psychAverage([4, 4, 3, 2]), 3.25);
  assert.equal(psychAverage([5, 5, 4, 3]), 4.25);
  assert.equal(psychAverage([3, 3, 4, 4]), 3.5);
});
test('ตาราง 18-3: เฉลี่ย → ระดับ (ขอบเขต)', () => {
  assert.equal(psychLevel(5.00).level, 1);
  assert.equal(psychLevel(4.51).level, 1);
  assert.equal(psychLevel(4.50).level, 2);
  assert.equal(psychLevel(3.51).level, 2);
  assert.equal(psychLevel(3.50).level, 3);  // 18.3
  assert.equal(psychLevel(2.51).level, 3);
  assert.equal(psychLevel(2.50).level, 4);
  assert.equal(psychLevel(1.50).level, 5);
  assert.equal(psychLevel(1.00).level, 5);
});
test('18.1: [4,4,3,2] → เฉลี่ย 3.25 → ระดับ 3 (25–54) · แพทย์เลือก 35', () => {
  const r = psychResult([4, 4, 3, 2], 35);
  assert.equal(r.avg, 3.25); assert.equal(r.level, 3);
  assert.deepEqual(r.range, [25, 54]); assert.equal(r.wpi, 35);
});
test('18.2: [5,5,4,3] → เฉลี่ย 4.25 → ระดับ 2 (10–24) · เลือก 10', () => {
  const r = psychResult([5, 5, 4, 3], 10);
  assert.equal(r.avg, 4.25); assert.equal(r.level, 2); assert.equal(r.wpi, 10);
});
test('18.3: [3,3,4,4] → เฉลี่ย 3.50 → ระดับ 3 (25–54) · เลือก 25', () => {
  const r = psychResult([3, 3, 4, 4], 25);
  assert.equal(r.avg, 3.5); assert.equal(r.level, 3); assert.equal(r.wpi, 25);
});
test('wpi นอกช่วงถูก clamp เข้าช่วงของระดับ', () => {
  assert.equal(psychResult([4, 4, 3, 2], 99).wpi, 54); // ระดับ 3 เพดาน 54
  assert.equal(psychResult([4, 4, 3, 2]).wpi, 25);     // ไม่ระบุ = ต่ำสุดของช่วง
});
