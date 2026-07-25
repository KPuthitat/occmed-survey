// engine.test.js — ทดสอบเครื่องคำนวณค่าทดแทน (ประมาณการ)
import test from 'node:test';
import assert from 'node:assert/strict';
import { monthlyComp, compResult, RATE, WAGE_CEILING, COMP_CASES } from './engine.js';

test('ค่าคงที่นโยบาย', () => {
  assert.equal(RATE, 0.70);
  assert.equal(WAGE_CEILING, 20000);
  assert.equal(COMP_CASES.length, 4);
});

test('รายเดือน = 70% ของค่าจ้าง (ต่ำกว่าเพดาน)', () => {
  assert.equal(monthlyComp(15000).monthly, 10500);   // 0.7 × 15000
  assert.equal(monthlyComp(15000).capped, false);
  assert.equal(monthlyComp(10000).monthly, 7000);
});

test('เกินเพดาน 20,000 → คิดที่ 20,000 → รายเดือน 14,000', () => {
  const r = monthlyComp(30000);
  assert.equal(r.base, 20000);
  assert.equal(r.monthly, 14000);
  assert.equal(r.capped, true);
});

test('ผลรวม = รายเดือน × จำนวนเดือน', () => {
  const r = compResult(15000, 120);
  assert.equal(r.monthly, 10500);
  assert.equal(r.total, 1260000);       // 10,500 × 120
  assert.equal(r.months, 120);
});

test('ทุพพลภาพ 180 เดือน ที่เพดาน', () => {
  const r = compResult(25000, 180);
  assert.equal(r.monthly, 14000);
  assert.equal(r.total, 2520000);       // 14,000 × 180
});

test('ปรับร้อยละ / เพดานได้ตามประกาศล่าสุด', () => {
  assert.equal(monthlyComp(10000, { rate: 0.60 }).monthly, 6000);
  assert.equal(monthlyComp(10000, { ceiling: 8000 }).monthly, Math.round(0.7 * 8000)); // 5600
});

test('ค่าจ้าง/เดือน 0 หรือค่าผิด → 0', () => {
  assert.equal(compResult(0, 100).total, 0);
  assert.equal(compResult(15000, 0).total, 0);
  assert.equal(compResult(-5, 10).monthly, 0);
  assert.equal(compResult('abc', 10).total, 0);
});
