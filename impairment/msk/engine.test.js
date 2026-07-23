// engine.test.js — พอร์ตเทสต์ในตัวจาก occumed-impairment-calculator.html (บล็อก worked example, slides 51–64)
// รัน: node --test impairment/msk/engine.test.js
// เคสจริง: ชายอายุ 31 ปี บาดเจ็บแขน/มือซ้าย (MMI) → คำตอบสุดท้าย 44% ของทั้งร่างกาย
// ยกค่า calc/exp มาตรงจากไฟล์ต้นแบบทุกขั้น (ไม่แก้ตัวเลข) · ทดสอบฟังก์ชัน engine ที่ยกมา
import test from 'node:test';
import assert from 'node:assert/strict';
import { sum, combine, d2h, h2u, u2w } from './engine.js';

// ── worked example: 11 ขั้น (ตรงกับบล็อก CASE ในไฟล์ต้นแบบ) ──
const steps = [
  { t: 'นิ้วหัวแม่มือ · ROM (ตาราง 2-30) — บวกตรงทุกทิศ',            calc: () => sum([6, 3, 7, 10, 8, 9]),                                             exp: 43 },
  { t: 'นิ้วหัวแม่มือ + สูญเสียความรู้สึก (ตารางค่ารวม)',              calc: () => combine([43, Math.round(100 * 0.25)]),                                exp: 57 },
  { t: 'นิ้วชี้ (ตาราง 2-31) — บวกในข้อ แล้วรวมข้ามข้อ',              calc: () => combine([60, 35, sum([19, 7])]),                                      exp: 81 },
  { t: 'นิ้วกลาง (ตาราง 2-31)',                                       calc: () => combine([45, 25 + 4, 26]),                                            exp: 71 },
  { t: 'นิ้วนาง/นิ้วก้อย · ตัดขาดระดับ PIP (ตาราง 2-28)',            calc: () => 80,                                                                   exp: 80 },
  { t: 'แปลงนิ้ว → มือ (ตาราง 2-11ก) — บวกตรง',                      calc: () => sum([d2h(57, 'thumb'), d2h(81, 'index'), d2h(71, 'middle'), d2h(80, 'ring'), d2h(80, 'little')]), exp: 69 },
  { t: 'แปลงมือ → แขน (ตาราง 2-11ข) — ×0.90',                        calc: () => h2u(69),                                                              exp: 62 },
  { t: 'ข้อมือ (ตาราง 2-32) — บวกตรง',                               calc: () => sum([3, 7, 2, 4]),                                                    exp: 16 },
  { t: 'ข้อศอก (ตาราง 2-33) — บวกตรง',                               calc: () => sum([8, 2, 3, 2]),                                                    exp: 15 },
  { t: 'รวมทั้งแขน (ตารางค่ารวม บทที่ 19)',                          calc: () => combine([62, 16, 15]),                                                exp: 73 },
  { t: 'แปลงแขน → ทั้งร่างกาย (ตาราง 2-12) — ×0.60 · คำตอบสุดท้าย',  calc: () => u2w(73),                                                              exp: 44 },
];

steps.forEach((s, i) => test(`ขั้น ${i + 1}: ${s.t}`, () => assert.equal(s.calc(), s.exp)));

// การันตีคำตอบสุดท้าย
test('คำตอบสุดท้าย = 44% ของทั้งร่างกาย (แขนซ้าย)', () => {
  assert.equal(u2w(73), 44);
});

// ── สมบัติพื้นฐานของ engine (ตารางค่ารวม บทที่ 19) ──
test('combine: จับคู่-ปัดเศษ-เรียงมากไปน้อย (62⊕16⊕15 = 73)', () => {
  assert.equal(combine([62, 16, 15]), 73);
  assert.equal(combine([]), 0);
  assert.equal(combine([50]), 50);
});
