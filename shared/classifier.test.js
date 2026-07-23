// classifier.test.js — ตรรกะ input-driven (ปัจจัยหลัก→ขั้น · ปัจจัยรอง→ระดับย่อย)
// รัน: node --test shared/classifier.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyPicks } from './classifier.js';
import { HTN_LEVELS, HF_LEVELS, CAD_LEVELS } from '../impairment/cardio/engine.js';

// ---------- โหมด 'key' : ปัจจัยหลักกำหนดขั้น · ค่ากลางเป็นค่าตั้งต้น ----------
test("key mode: HTN เลือกปัจจัยหลัก(exam)=ขั้น1 → ค่ากลาง 6% (ตย. 10.12)", () => {
  const r = classifyPicks({ levels: HTN_LEVELS, keyRow: 'exam', picks: { exam: 1 } });
  assert.equal(r.level, 1);
  assert.equal(r.grade, 'B');     // 3 ระดับ → กลาง = B
  assert.equal(r.percent, 6);
});
test("key mode: HTN exam=ขั้น0 → 0%", () => {
  const r = classifyPicks({ levels: HTN_LEVELS, keyRow: 'exam', picks: { exam: 0 } });
  assert.equal(r.level, 0); assert.equal(r.percent, 0);
});
test("key mode: HF lab=ขั้น2 (ค่ากลาง) → 2C = 17%", () => {
  const r = classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { lab: 2 } });
  assert.equal(r.level, 2); assert.equal(r.grade, 'C'); assert.equal(r.percent, 17);
});
test("key mode: ปัจจัยรองสูงกว่า → เลื่อนระดับย่อยขึ้น (ภายในขั้น)", () => {
  // HF key=lab ขั้น1 (ค่ากลาง C=index2 → 6) · ปัจจัยรอง history=ขั้น2 → +1 → index3 = 8%
  const r = classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { lab: 1, history: 2 } });
  assert.equal(r.level, 1); assert.equal(r.autoGrade, 3); assert.equal(r.percent, 8);
});
test("key mode: ปัจจัยรองต่ำกว่า → เลื่อนลง แต่ไม่หลุดขั้น (clamp A)", () => {
  // HF key=lab ขั้น1 (C=index2) · รอง history=ขั้น0 → −1 → index1 = 4% · รองอีกตัว exam=0 → รวม −2 → clamp index0 = 2%
  const r1 = classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { lab: 1, history: 0 } });
  assert.equal(r1.percent, 4);
  const r2 = classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { lab: 1, history: 0, exam: 0 } });
  assert.equal(r2.autoGrade, 0); assert.equal(r2.percent, 2); // ไม่ต่ำกว่าขั้น 1 ระดับ A
});
test("key mode: ยังไม่เลือกปัจจัยหลัก → null", () => {
  assert.equal(classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { history: 3 } }), null);
});
test("key mode: override ระดับย่อยเอง", () => {
  const r = classifyPicks({ levels: HF_LEVELS, keyRow: 'lab', picks: { lab: 2 }, gradeOverride: 4 });
  assert.equal(r.gradeIndex, 4); assert.equal(r.percent, 23);
});

// ---------- โหมด 'max' : ขั้น = ค่าสูงสุดของด้านที่เลือก (CAD) ----------
test("max mode: CAD angio=ขั้น0 → 0%", () => {
  const r = classifyPicks({ levels: CAD_LEVELS, classMode: 'max', picks: { angio: 0 } });
  assert.equal(r.level, 0); assert.equal(r.percent, 0);
});
test("max mode: CAD history=ขั้น1 + angio=ขั้น0 → ขั้นสูงสุด=1 ค่ากลาง 6% (ตย. 10.2)", () => {
  const r = classifyPicks({ levels: CAD_LEVELS, classMode: 'max', picks: { history: 1, angio: 0 } });
  assert.equal(r.level, 1); assert.equal(r.percent, 6);
});
test("max mode: หลายด้าน → ใช้ค่าสูงสุด", () => {
  const r = classifyPicks({ levels: CAD_LEVELS, classMode: 'max', picks: { history: 1, exam: 3, angio: 2 } });
  assert.equal(r.level, 3);
});
test("max mode: ยังไม่เลือกด้านใด → null", () => {
  assert.equal(classifyPicks({ levels: CAD_LEVELS, classMode: 'max', picks: {} }), null);
});
