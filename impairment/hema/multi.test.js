// multi.test.js — ทดสอบการรวมหลายภาวะทางเลือดในเคสเดียว (บทที่ 15)
// ตรรกะ: แต่ละภาวะ → classifyPicks (ตารางของตัวเอง) → ร้อยละฐาน → รวมด้วย Combined Values → + BOTC (เพดาน 100)
import test from 'node:test';
import assert from 'node:assert/strict';
import { HEMA_TABLES, BOTC_ITEMS } from './engine.js';
import { classifyPicks } from '../../shared/classifier.js';
import { combineValues } from '../../shared/pagekit.js';
import { combineHema } from './multi.js';

// helper: ประเมินภาวะหนึ่งจาก picks ของปัจจัยหลัก/รอง
function baseOf(key, picks, gradeOverride = null) {
  const T = HEMA_TABLES[key];
  const r = classifyPicks({ levels: T.levels, keyRow: T.keyRow, picks, gradeOverride, classMode: 'key', shiftMode: 'unit' });
  return r ? r.percent : 0;
}

test('combineHema = Combined Values แล้วบวก BOTC (เพดาน 100)', () => {
  assert.equal(combineHema([20, 16, 15]), 43);        // 20 ⊕ 16 ⊕ 15 = 42.88 → 43
  assert.equal(combineHema([20, 16, 15], 2), 45);     // + BOTC 2 = 45
  assert.equal(combineHema([]), 0);
  assert.equal(combineHema([30]), 30);                // ภาวะเดียว = ค่าตัวเอง
  assert.equal(combineHema([90, 90, 90], 50), 100);   // เพดาน 100
});

test('pancytopenia: โลหิตจาง + นิวโตรฟิลต่ำ + เกล็ดเลือดต่ำ (แต่ละภาวะขั้น 2 ค่ากลาง)', () => {
  // Anemia 15-4 · key=history ขั้น 2 → grade กลาง B = 20% (grades [6,20,34])
  const an = baseOf('anemia', { history: 2 });
  // Neutropenia 15-5 · key=lab ขั้น 2 → B = 16% (grades [6,16,25])
  const ne = baseOf('neutropenia', { lab: 2 });
  // Platelet 15-9 · key=history ขั้น 2 → B = 15% (grades [7,15,24])
  const pl = baseOf('platelet', { history: 2 });
  assert.equal(an, 20);
  assert.equal(ne, 16);
  assert.equal(pl, 15);
  assert.equal(combineHema([an, ne, pl]), 43);
});

test('รวมกับ BOTC ที่ใช้ร่วมทั้งเคส (การให้เลือด 2 ยูนิต/เดือน = +2%)', () => {
  const an = baseOf('anemia', { history: 3 });     // ขั้น 3 → B = 45% (grades [35,45,54])
  const pl = baseOf('platelet', { history: 3 });   // ขั้น 3 → B = 34% (grades [25,34,44])
  assert.equal(an, 45);
  assert.equal(pl, 34);
  // 45 ⊕ 34 = 45 + 34*0.55 = 63.7 → 64 · + BOTC 2 = 66
  assert.equal(combineValues([an, pl]), 64);
  assert.equal(combineHema([an, pl], 2), 66);
});

// helper รวม BOTC เหมือนใน multi.js (unit → pct×จำนวน เพดาน cap · ไม่ unit → clamp 0..pct)
function botcTotal(sel) {
  const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
  let t = 0;
  for (const it of BOTC_ITEMS) {
    const v = Number(sel[it.id]) || 0;
    if (v <= 0) continue;
    t += it.unit ? Math.min(it.cap != null ? it.cap : Infinity, it.pct * v) : clamp(v, 0, it.pct);
  }
  return Math.round(t);
}

test('ตัวอย่างคู่มือ: หญิง 38 ปี Aplastic anemia/PNH + Budd-Chiari → 62%', () => {
  // โรคหลัก โลหิตจาง (15-4): ประวัติอาการรุนแรง = ขั้น 4 · Hb 6.1 = ขั้น 3 (ปัจจัยรอง ต่ำกว่า → ลด 1) → 4A = 55%
  const an = baseOf('anemia', { history: 4, lab: 3 });
  assert.equal(an, 55);
  // Neutropenia (15-5): ANC 1250 > 1000 = ขั้น 0 → 0%
  const ne = baseOf('neutropenia', { lab: 0 });
  assert.equal(ne, 0);
  // Thrombocytopenia (15-9): ไม่มีอาการเลือดออก (ปัจจัยหลัก=ประวัติ) = ขั้น 0 → 0%
  const pl = baseOf('platelet', { history: 0 });
  assert.equal(pl, 0);
  // รวมด้วยตารางค่ารวม = 55%
  assert.equal(combineValues([an, ne, pl]), 55);
  // BOTC ใช้ร่วมทั้งเคส: warfarin (anticoagulant) 5% + prednisolone (steroid) 1% + ให้เลือด 1 ยูนิต/เดือน 1% = 7%
  const bt = botcTotal({ anticoag: 5, steroid: 1, transfuse: 1 });
  assert.equal(bt, 7);
  // ผลรวมท้ายสุด: 55 + 7 = 62%
  assert.equal(combineHema([an, ne, pl], bt), 62);
});

import { HEMA_MULTI_EXAMPLES } from './multi-examples.js';
test('ตัวอย่างในหน้ารวมหลายภาวะ: คำตอบตรงกับ engine (62%)', () => {
  const ex = HEMA_MULTI_EXAMPLES.find(e => /62/.test(e.ans));
  assert.ok(ex, 'ต้องมีตัวอย่าง pancytopenia 62%');
  const an = baseOf('anemia', { history: 4, lab: 3 });
  const bt = botcTotal({ anticoag: 5, steroid: 1, transfuse: 1 });
  assert.equal(combineHema([an, 0, 0], bt), 62);
});

test('ปัจจัยรองเลื่อนระดับย่อยของแต่ละภาวะก่อนรวม', () => {
  // Anemia ขั้น 2 (history) + Hb ต่ำกว่าขั้น (lab ขั้น 3) → +1 → grade C = 34%
  const an = baseOf('anemia', { history: 2, lab: 3 });
  assert.equal(an, 34);
  const ne = baseOf('neutropenia', { lab: 2 });    // 16%
  assert.equal(combineHema([an, ne]), combineValues([34, 16]));
});
