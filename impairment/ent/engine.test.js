// engine.test.js — unit test ตามตัวอย่างในคู่มือ บทที่ 7 (หน้า 511)
// รัน: node --test impairment/ent/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dshl, monauralPct, binauralPct, hearingWpi, hearingResult } from './engine.js';

// ---------- DSHL + กติกา cap 0–100 ต่อความถี่ ----------
test('DSHL = ผลรวม 4 ความถี่', () => {
  assert.equal(dshl({ 500: 50, 1000: 55, 2000: 60, 3000: 70 }), 235);
  assert.equal(dshl([30, 40, 40, 50]), 160);
});
test('cap >100→100, <0→0 ต่อความถี่', () => {
  assert.equal(dshl([120, 100, 100, 100]), 400);   // 120→100
  assert.equal(dshl([-5, 0, 0, 0]), 0);             // −5→0
});

// ---------- monaural (ตาราง 7-1) ----------
test('monaural% = (DSHL−100)×0.375 clamp 0–100', () => {
  assert.equal(monauralPct(100), 0);
  assert.equal(monauralPct(160), 22.5);
  assert.equal(monauralPct(235), 50.625);
  assert.equal(monauralPct(400), 100);   // (400−100)×0.375=112.5 → cap 100
  assert.equal(monauralPct(50), 0);      // < 100 → 0
});

// ---------- ตัวอย่างในคู่มือ (หน้า 511) ----------
test('ผู้ป่วย ก: R{50,55,60,70}=235, L{30,40,40,50}=160 → binaural 27.2%, WPI 10%', () => {
  const r = hearingResult({ 500: 50, 1000: 55, 2000: 60, 3000: 70 }, { 500: 30, 1000: 40, 2000: 40, 3000: 50 });
  assert.equal(r.dshlR, 235);
  assert.equal(r.dshlL, 160);
  assert.equal(r.better, 22.5);     // หูซ้ายดีกว่า
  assert.equal(r.worse, 50.625);
  assert.equal(r.binaural1, 27.2);  // (5×22.5+50.625)/6 = 27.1875 → 27.2
  assert.equal(r.wpi, 10);
});
test('ผู้ป่วย ข: R{35,60,65,70}=230, L{45,65,70,80}=260 → binaural 50.6%, WPI 18%', () => {
  const r = hearingResult({ 500: 35, 1000: 60, 2000: 65, 3000: 70 }, { 500: 45, 1000: 65, 2000: 70, 3000: 80 });
  assert.equal(r.dshlR, 230);
  assert.equal(r.dshlL, 260);
  assert.equal(r.better, 48.75);    // หูขวาดีกว่า
  assert.equal(r.worse, 60);
  assert.equal(r.binaural1, 50.6);  // (5×48.75+60)/6 = 50.625 → 50.6
  assert.equal(r.wpi, 18);
});

// ---------- binaural + WPI แยก ----------
test('binaural = (5×ดีกว่า + เลวกว่า)/6', () => {
  assert.equal(binauralPct(22.5, 50.625), 27.1875);
  assert.equal(binauralPct(0, 0), 0);
  assert.equal(binauralPct(100, 100), 100);
});
test('WPI = round(binaural×0.35)', () => {
  assert.equal(hearingWpi(100), 35);
  assert.equal(hearingWpi(27.1875), 10);
  assert.equal(hearingWpi(50.625), 18);
  assert.equal(hearingWpi(0), 0);
});
test('หูปกติทั้งคู่ (thresholds ต่ำ) → 0%', () => {
  const r = hearingResult([10, 10, 10, 10], [10, 10, 10, 10]);
  assert.equal(r.binaural, 0);
  assert.equal(r.wpi, 0);
});
test('หูหนวกสองข้าง → binaural 100, WPI 35', () => {
  const r = hearingResult([100, 100, 100, 100], [100, 100, 100, 100]);
  assert.equal(r.monR, 100);
  assert.equal(r.binaural, 100);
  assert.equal(r.wpi, 35);
});
