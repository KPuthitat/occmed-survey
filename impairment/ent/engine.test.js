// engine.test.js — unit test ตามตัวอย่างในคู่มือ บทที่ 7 (หน้า 511)
// รัน: node --test impairment/ent/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dshl, monauralPct, binauralPct, hearingWpi, hearingResult, stepAdjust, voiceResult, VOICE_VALUES, SWALLOW, CAP_OTHER, ENT_STEP_TABLES, combineValues } from './engine.js';
const VEST = ENT_STEP_TABLES.vestibular.classValues;
const FACE = ENT_STEP_TABLES.facial.classValues;

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

// ---------- §7.1 step-adjust (ตัวอย่างหน้า 507–508) ----------
test('step-adjust: key ขั้น2 [11,15,19,23,27] เริ่ม 19', () => {
  assert.equal(stepAdjust(VEST, 2, [1, 3]).value, 19);   // (1-2)+(3-2)=0
  assert.equal(stepAdjust(VEST, 2, [2, 3]).value, 23);   // +1
  assert.equal(stepAdjust(VEST, 2, [2, 1]).value, 15);   // -1
  assert.equal(stepAdjust(VEST, 2, [3, 3]).value, 27);   // +2
  assert.equal(stepAdjust(VEST, 2, [3, 4]).value, 27);   // +3 → clamp สุดขั้น
});
test('step-adjust: key ขั้นสูงสุด (4) ใช้ (รอง+1−หลัก) [45,48,51,54,58] เริ่ม 51', () => {
  assert.equal(stepAdjust(VEST, 4, [4, 4]).value, 58);   // (4+1-4)+(4+1-4)=2
  assert.equal(stepAdjust(VEST, 4, [3, 4]).value, 54);   // 0+1=1
  assert.equal(stepAdjust(VEST, 4, []).value, 51);       // เริ่มต้น
});
test('step-adjust: ขั้น 0 → 0', () => {
  assert.equal(stepAdjust(VEST, 0, [2, 3]).value, 0);
});
test('การทรงตัว (7-4) ตัวอย่าง 7.3/7.4/7.5', () => {
  assert.equal(stepAdjust(VEST, 1, [1, 1]).value, 5);    // 7.3
  assert.equal(stepAdjust(VEST, 2, [2, 3]).value, 23);   // 7.4
  assert.equal(stepAdjust(VEST, 3, [3, 4]).value, 39);   // 7.5
});
test('ใบหน้า (7-5) ตัวอย่าง 7.7/7.8/7.9 (ค่าในขั้นต่างความยาว)', () => {
  assert.deepEqual(FACE[1], [1, 3, 5]);                  // ขั้น 1 มี 3 ค่า
  assert.equal(stepAdjust(FACE, 1, [1, 1]).value, 3);    // 7.7
  assert.equal(stepAdjust(FACE, 2, [3, 3]).value, 10);   // 7.8 (เริ่ม 8 +2)
  assert.equal(stepAdjust(FACE, 3, [3, 3]).value, 17);   // 7.9
});

// ---------- 7-8 เสียง/พูด ----------
test('voiceResult: ตัวอย่าง 7.14/7.16/7.18/7.19', () => {
  assert.deepEqual(VOICE_VALUES[1], [2, 6, 10]);
  assert.equal(voiceResult({ audibility: 1, intelligibility: 0, functional: 0 }, 1).value, 6);   // 7.14
  assert.equal(voiceResult({ audibility: 2, intelligibility: 2, functional: 2 }, 3).value, 18);  // 7.16
  assert.equal(voiceResult({ audibility: 3, intelligibility: 0, functional: 0 }, 4).value, 28);  // 7.18
  assert.equal(voiceResult({ audibility: 4, intelligibility: 4, functional: 4 }, 4).value, 35);  // 7.19
  assert.equal(voiceResult({ audibility: 0, intelligibility: 0, functional: 0 }, 0).value, 0);
});

// ---------- 7-7 เคี้ยว/กลืน + เพดานอื่น ----------
test('การเคี้ยว-กลืน (7-7) lookup', () => {
  assert.deepEqual(SWALLOW.find(s => s.id === 'soft').values, [5, 10, 15]);   // 7.13 = 10
  assert.deepEqual(SWALLOW.find(s => s.id === 'liquid').values, [20, 25, 30]);
  assert.deepEqual(SWALLOW.find(s => s.id === 'tube').values, [50]);
});
test('เพดานการได้กลิ่น-รู้รส / tinnitus = 5', () => {
  assert.equal(CAP_OTHER.olfaction, 5);
  assert.equal(CAP_OTHER.tinnitus, 5);
});

// ---------- Combined Values ----------
test('combineValues: A + B(100−A)/100', () => {
  assert.equal(Math.round(combineValues([50, 50])), 75);
  assert.equal(combineValues([0]), 0);
});
