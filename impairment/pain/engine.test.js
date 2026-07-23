// engine.test.js — ทดสอบ engine อาการปวดเรื้อรัง (บทที่ 17)
import test from 'node:test';
import assert from 'node:assert/strict';
import { pdqTotal, pdqBand, painResult, PDQ_QUESTIONS, PDQ_BANDS } from './engine.js';

test('PDQ มี 15 ข้อ', () => assert.equal(PDQ_QUESTIONS.length, 15));
test('รวมคะแนน (ข้อไม่ทำ=0) และเพดาน 0–10 ต่อข้อ', () => {
  assert.equal(pdqTotal([5, 5, 5]), 15);
  assert.equal(pdqTotal(Array(15).fill(10)), 150);
  assert.equal(pdqTotal([12, -3]), 10); // clamp 10 + 0
});
test('ตาราง 17-2: แถบคะแนน → ร้อยละ', () => {
  assert.equal(pdqBand(0).wpi, 0);      // ไม่มี
  assert.equal(pdqBand(70).wpi, 0);     // น้อย 1-70
  assert.equal(pdqBand(71).wpi, 1);     // ปานกลาง 71-100
  assert.equal(pdqBand(100).wpi, 1);
  assert.equal(pdqBand(101).wpi, 2);    // มาก 101-130
  assert.equal(pdqBand(131).wpi, 3);    // มากที่สุด 131-150
});
test('17.1: คะแนน 75 → ปานกลาง → 1%', () => {
  const r = painResult(75);
  assert.equal(r.wpi, 1); assert.equal(r.label, 'ปานกลาง');
});
test('17.2: คะแนน 115 → มาก → 2%', () => {
  const r = painResult(115);
  assert.equal(r.wpi, 2); assert.equal(r.label, 'มาก');
});
test('painResult รับอาเรย์คำตอบได้', () => {
  const ans = Array(15).fill(5); // 75
  assert.equal(painResult(ans).wpi, 1);
});
