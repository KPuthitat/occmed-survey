// engine.test.js — unit test ตาม Acceptance ในบรีฟ · รันด้วย: node --test impairment/gi/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeGrade, tableResult, combineValues, combineAll,
  weightStageFromPercent, weightLossPercent, standardWeightKg,
  TABLES, TREATMENT, FISTULA_11_6,
} from './engine.js';

// ช่วยตรวจ: (ตาราง, ขั้นหลัก, ขั้นการรักษา, ขั้นน้ำหนัก) → {percent, label}
function res(tbl, p, tr, w) {
  const r = tableResult(tbl, p, tr, w);
  return { percent: r.percent, label: r.label };
}

// ---------- ตัวอย่างจากคู่มือ: ตาราง 11-3 ----------
test('11.3  (11-3, 1,0,0) → 1% (1A)', () => assert.deepEqual(res('11-3', 1, 0, 0), { percent: 1, label: '1A' }));
test('11.4  (11-3, 1,2,0) → 5% (1C)', () => assert.deepEqual(res('11-3', 1, 2, 0), { percent: 5, label: '1C' }));
test('11.5  (11-3, 2,2,2) → 18% (2C)', () => assert.deepEqual(res('11-3', 2, 2, 2), { percent: 18, label: '2C' }));
test('11.7  (11-3, 2,2,2) → 18% (2C)', () => assert.deepEqual(res('11-3', 2, 2, 2), { percent: 18, label: '2C' }));
test('11.9  (11-3, 2,3,2) → 22% (2D)', () => assert.deepEqual(res('11-3', 2, 3, 2), { percent: 22, label: '2D' }));
test('11.10 (11-3, 3,3,3) → 39% (3C)', () => assert.deepEqual(res('11-3', 3, 3, 3), { percent: 39, label: '3C' }));
test('11.11 (11-3, 3,3,3) → 39% (3C)', () => assert.deepEqual(res('11-3', 3, 3, 3), { percent: 39, label: '3C' }));
test('11.12 (11-3, 3,4,3) → 45% (3D)', () => assert.deepEqual(res('11-3', 3, 4, 3), { percent: 45, label: '3D' }));
test('11.13 (11-3, 3,4,3) → 45% (3D)', () => assert.deepEqual(res('11-3', 3, 4, 3), { percent: 45, label: '3D' }));
test('11.15 (11-3, 4,4,4) → 64% (4C)', () => assert.deepEqual(res('11-3', 4, 4, 4), { percent: 64, label: '4C' }));

// ---------- ตาราง 11-4 ----------
test('11.18 (11-4, 1,0,0) → 1% (1A)', () => assert.deepEqual(res('11-4', 1, 0, 0), { percent: 1, label: '1A' }));
test('11.19 (11-4, 2,3,0) → 14% (2B)', () => assert.deepEqual(res('11-4', 2, 3, 0), { percent: 14, label: '2B' }));
test('11.20 (11-4, 3,3,4) → 45% (3D)', () => assert.deepEqual(res('11-4', 3, 3, 4), { percent: 45, label: '3D' }));
test('11.21 (11-4, 4,4,4) → 64% (4C)', () => assert.deepEqual(res('11-4', 4, 4, 4), { percent: 64, label: '4C' }));

// ---------- ตาราง 11-9 ----------
test('11.29 (11-9, 1,0,0) → 1% (1A)', () => assert.deepEqual(res('11-9', 1, 0, 0), { percent: 1, label: '1A' }));
test('11.30 (11-9, 2,0,0) → 10% (2A)', () => assert.deepEqual(res('11-9', 2, 0, 0), { percent: 10, label: '2A' }));

// ---------- การรวมค่า ----------
test('Combined 64 + 45 → 80%', () => assert.equal(combineAll([64, 45]).total, 80));
test('11.14 stenosing esophagitis 64% + gastrostomy 10% (บวกตรง) → 74%', () => {
  assert.equal(combineAll([64], [10]).total, 74);
});
test('เอกสาร: ถ้าใช้ Combined Values กับ 64 & 10 จะได้ 68% (จึงต้องบวกตรงสำหรับ 11-6)', () => {
  assert.equal(Math.round(combineValues([64, 10])), 68);
});

// ---------- ตัวอย่างหน้า 688 (การปรับระดับ) ----------
test('หน้า 688 ก: ขั้นหลัก 3, รอง 1 และ 4 → 3B', () => {
  const g = computeGrade(3, 1, 4);
  assert.equal(g.stage, 3);
  assert.equal(g.gradeLetter, 'B');
  assert.equal(g.raw, -1);   // −2 + 1
});
test('หน้า 688 ข: ขั้นหลัก 3, รอง 1 และ 1 → 3A (ติดเพดาน −2)', () => {
  const g = computeGrade(3, 1, 1);
  assert.equal(g.stage, 3);
  assert.equal(g.gradeLetter, 'A');
  assert.equal(g.raw, -4);       // −2 + −2
  assert.equal(g.adj, -2);       // ตัดเหลือ −2
  assert.equal(g.clamped, true);
});

// ---------- เคส off-by-one: ยึดสูตรตามตัวอักษร ห้าม hardcode ข้อยกเว้น ----------
// คู่มือตัวอย่าง 11.6 / 11.23 / 11.24 / 11.31 เป็นกรณี "น้ำหนักไม่ลดเลย" (ขั้นน้ำหนัก 0)
// ที่ผู้เขียนใช้ดุลยพินิจทางคลินิกปรับระดับขึ้น 1 → คู่มือระบุ 2B / 2B / 4B / 3B
// แต่สูตรตามตัวอักษรให้ 2A / 2A / 4A / 3A → เรายึดสูตร (UI จะแสดงหมายเหตุให้ผู้ประเมินปรับเองได้)
// (อินพุตด้านล่างสร้างขึ้นให้ตรงเงื่อนไข "น้ำหนักไม่ลด + การรักษาอยู่ขั้นเดียวกับปัจจัยหลัก";
//  บรีฟไม่ได้ให้อินพุตตรงของแต่ละตัวอย่าง จึงยืนยันที่ "ระดับที่สูตรให้" ตามที่บรีฟกำหนด)
test('11.6  สูตร → 2A (คู่มือปรับเป็น 2B ด้วยดุลยพินิจ)', () => {
  assert.equal(computeGrade(2, 2, 0).gradeLetter, 'A');
});
test('11.23 สูตร → 2A (คู่มือปรับเป็น 2B ด้วยดุลยพินิจ)', () => {
  assert.equal(computeGrade(2, 2, 0).gradeLetter, 'A');
});
test('11.24 สูตร → 4A (คู่มือปรับเป็น 4B ด้วยดุลยพินิจ)', () => {
  assert.equal(computeGrade(4, 4, 0).gradeLetter, 'A');
});
test('11.31 สูตร → 3A (คู่มือปรับเป็น 3B ด้วยดุลยพินิจ)', () => {
  assert.equal(computeGrade(3, 3, 0).gradeLetter, 'A');
});

// ---------- ขั้น 0 = 0% เสมอ ----------
test('ขั้น 0 → 0% ทุกตาราง ไม่มีระดับ A–E', () => {
  for (const id of Object.keys(TABLES)) {
    const r = tableResult(id, 0, 0, 0);
    assert.equal(r.percent, 0);
    assert.equal(r.label, '0');
    assert.equal(r.gradeLetter, null);
  }
});

// ---------- เครื่องช่วยน้ำหนัก ----------
test('weightStageFromPercent ตามช่วง 0/1-4/5-9/10-19/≥20', () => {
  assert.equal(weightStageFromPercent(0), 0);
  assert.equal(weightStageFromPercent(1), 1);
  assert.equal(weightStageFromPercent(4), 1);
  assert.equal(weightStageFromPercent(4.9), 1);
  assert.equal(weightStageFromPercent(5), 2);
  assert.equal(weightStageFromPercent(9), 2);
  assert.equal(weightStageFromPercent(10), 3);
  assert.equal(weightStageFromPercent(19), 3);
  assert.equal(weightStageFromPercent(20), 4);
  assert.equal(weightStageFromPercent(25), 4);
});
test('weightLossPercent: มาตรฐาน 60 ปัจจุบัน 54 → 10% → ขั้น 3', () => {
  const pct = weightLossPercent(60, 54);
  assert.equal(pct, 10);
  assert.equal(weightStageFromPercent(pct), 3);
});

// ---------- น้ำหนักมาตรฐาน 11-1 / 11-2 ----------
test('ชาย สูง 170 อายุ 30 → 60 กก. (แถว 170–171, คอลัมน์ ≥25)', () => {
  assert.equal(standardWeightKg('male', 170, 30).kg, 60);
});
test('ชาย สูง 170 อายุ 20 → 55 กก. (คอลัมน์ 15–24)', () => {
  assert.equal(standardWeightKg('male', 170, 20).kg, 55);
});
test('ชาย สูง 185 อายุ 30 → 68 กก. (แถว > 180)', () => {
  assert.equal(standardWeightKg('male', 185, 30).kg, 68);
});
test('หญิง สูง 165 อายุ 40 → 65 กก.', () => {
  assert.equal(standardWeightKg('female', 165, 40).kg, 65);
});
test('ชาย สูง 150 (ต่ำกว่าช่วง) → ใช้แถวแรก + หมายเหตุนอกช่วง', () => {
  const r = standardWeightKg('male', 150, 30);
  assert.equal(r.kg, 51);       // แถวแรก 155–156, คอลัมน์ ≥25
  assert.equal(r.below, true);
  assert.ok(r.note.length > 0);
});

// ---------- ตรวจความครบของ data (กันพิมพ์ตกหล่น) ----------
test('ทุกตารางมี scale 5 ค่าในขั้น 1–4 และข้อความปัจจัยหลัก 5 ข้อ + การรักษาถูกชุด', () => {
  for (const id of Object.keys(TABLES)) {
    const t = TABLES[id];
    assert.equal(t.primary.length, 5, id + ' primary');
    assert.ok(TREATMENT[t.treatment], id + ' treatment set');
    for (const s of [1, 2, 3, 4]) assert.equal(t.scale[s].length, 5, id + ' scale ' + s);
    assert.equal(t.scale[4][4], t.range[1], id + ' ค่าสูงสุด = ขอบเขตบน');
  }
});
test('ตาราง 11-6 ครบ 6 ชนิด', () => assert.equal(FISTULA_11_6.length, 6));
