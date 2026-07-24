// engine.test.js — ทดสอบ engine ทางจิตและพฤติกรรม (บทที่ 18)
import test from 'node:test';
import assert from 'node:assert/strict';
import { psychAverage, psychLevel, psychResult, interpWpi, PSYCH_DOMAINS, PSYCH_LEVELS } from './engine.js';

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
});
test('บัญญัติไตรยางค์: คะแนนเฉลี่ย → ร้อยละเจาะจงในช่วง (คะแนนต่ำ = สูญเสียมาก)', () => {
  const L3 = PSYCH_LEVELS.find(x => x.level === 3);   // เฉลี่ย 2.51–3.50 · ช่วง 25–54
  assert.equal(interpWpi(3.25, L3), 32);              // ตามที่แพทย์ระบุ (3.25 → ~32%)
  assert.equal(interpWpi(3.50, L3), 25);              // ปลายช่วงคะแนนสูง → ร้อยละต่ำสุด
  assert.equal(interpWpi(2.51, L3), 54);              // ปลายช่วงคะแนนต่ำ → ร้อยละสูงสุด
  const L1 = PSYCH_LEVELS.find(x => x.level === 1);   // เฉลี่ย 4.51–5.00 · ช่วง 0–9
  assert.equal(interpWpi(5.00, L1), 0);
  const L5 = PSYCH_LEVELS.find(x => x.level === 5);   // เฉลี่ย 1.00–1.50 · ช่วง 76–100
  assert.equal(interpWpi(1.00, L5), 100);
});
test('ค่าตั้งต้น (ไม่ระบุ wpi) = ค่าบัญญัติไตรยางค์ (auto)', () => {
  const r = psychResult([4, 4, 3, 2]);                // เฉลี่ย 3.25
  assert.equal(r.auto, 32); assert.equal(r.wpi, 32);
});
