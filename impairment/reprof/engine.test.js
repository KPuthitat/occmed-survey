// engine.test.js — ทดสอบ engine ระบบสืบพันธุ์หญิง (บทที่ 14)
// รัน: node --test impairment/reprof/engine.test.js
// เคสตรวจสอบยึดจากตัวอย่าง 14.1–14.12 ในคู่มือ (ถอดจากภาพหน้า)
import test from 'node:test';
import assert from 'node:assert/strict';
import { reprofResult, classGrade, TABLES } from './engine.js';

// ---- ตาราง 14-1 อวัยวะสืบพันธุ์ภายนอก/ช่องคลอด ----
test('14.1 vulva: exam(key)=1, history(sec)=1 → 4% (ขั้น 1 ระดับ B)', () => {
  const r = reprofResult('vulva', 1, 1);
  assert.equal(r.value, 4);
  assert.equal(r.cls, 1);
  assert.equal(r.gradeLetter, 'B');
});
test('14.2 vulva: exam=2, history=3 (มีเพศสัมพันธ์ไม่ได้) → 17% (ขั้น 2 ระดับ C)', () => {
  const r = reprofResult('vulva', 2, 3);
  assert.equal(r.value, 17);
  assert.equal(r.cls, 2);
  assert.equal(r.gradeLetter, 'C');
});
test('14.3 vulva: exam=3, history=3 → 20% (ขั้น 3)', () => {
  const r = reprofResult('vulva', 3, 3);
  assert.equal(r.value, 20);
  assert.equal(r.cls, 3);
});

// ---- ตาราง 14-2 ปากมดลูก/มดลูก ----
test('14.4 uterus: exam=0 → 0% (ขั้น 0)', () => {
  const r = reprofResult('uterus', 0, 0);
  assert.equal(r.value, 0);
  assert.equal(r.cls, 0);
});
test('14.5 uterus: exam=1, history=0, วัยหมดระดู → 1% (ขั้น 1 ระดับ A)', () => {
  const r = reprofResult('uterus', 1, 0, { postmenopausal: true });
  assert.equal(r.value, 1);
  assert.equal(r.cls, 1);
  assert.equal(r.gradeLetter, 'A');
});
test('14.6 uterus: exam=2, history=2 → 13% (ขั้น 2 ระดับ B)', () => {
  const r = reprofResult('uterus', 2, 2);
  assert.equal(r.value, 13);
  assert.equal(r.cls, 2);
  assert.equal(r.gradeLetter, 'B');
});
test('14.7 uterus: exam=3, history=3 → 20% (ขั้น 3)', () => {
  const r = reprofResult('uterus', 3, 3);
  assert.equal(r.value, 20);
});
test('14.8 uterus: exam=3 (radical hysterectomy) → 20% (ขั้น 3)', () => {
  const r = reprofResult('uterus', 3, 3);
  assert.equal(r.value, 20);
});

// ---- ตาราง 14-3 ท่อนำไข่/รังไข่ ----
test('14.9 ovary: objective=0 → 0% (ขั้น 0)', () => {
  const r = reprofResult('ovary', 0, 0);
  assert.equal(r.value, 0);
  assert.equal(r.cls, 0);
});
test('14.10 ovary: objective=1, history=0 → 1% (ขั้น 1 ระดับ A)', () => {
  const r = reprofResult('ovary', 1, 0);
  assert.equal(r.value, 1);
  assert.equal(r.cls, 1);
  assert.equal(r.gradeLetter, 'A');
});
test('14.11 ovary: objective=2, history=3 (ไม่ตอบสนองรักษา) → 11% (ขั้น 2 ระดับ C)', () => {
  const r = reprofResult('ovary', 2, 3);
  assert.equal(r.value, 11);
  assert.equal(r.cls, 2);
  assert.equal(r.gradeLetter, 'C');
});
test('14.12 ovary: objective=3 (primary ovarian failure) → 15% (ขั้น 3)', () => {
  const r = reprofResult('ovary', 3, 3);
  assert.equal(r.value, 15);
  assert.equal(r.cls, 3);
});

// ---- กติกาพื้นฐาน class×grade ----
test('classGrade: ค่ากลาง (B) เป็นค่าตั้งต้นเมื่อปัจจัยรอง = ปัจจัยหลัก', () => {
  const r = classGrade(TABLES.vulva.grades, 2, 2);
  assert.equal(r.value, 13); // ระดับ B ของขั้น 2
  assert.equal(r.gradeLetter, 'B');
});
test('classGrade: ปัจจัยรองต่ำกว่า 1 ชั้น → ลดระดับ (B→A)', () => {
  const r = classGrade(TABLES.vulva.grades, 2, 1);
  assert.equal(r.value, 9);
  assert.equal(r.gradeLetter, 'A');
});
test('classGrade: ปรับไม่ข้ามชั้น (clamp ภายในชั้น)', () => {
  const r = classGrade(TABLES.vulva.grades, 1, 3); // net +2 แต่ชั้น 1 มีแค่ 3 ระดับ
  assert.equal(r.value, 7); // สูงสุดของชั้น 1 = ระดับ C
  assert.equal(r.gradeLetter, 'C');
});

// ---- กติกาพิเศษวัยหมดระดู ----
test('14-1 วัยหมดระดู: ขั้น 2 ลดลง 1 ระดับ (13→9)', () => {
  const base = reprofResult('vulva', 2, 2);
  assert.equal(base.value, 13);
  const pm = reprofResult('vulva', 2, 2, { postmenopausal: true });
  assert.equal(pm.value, 9);
});
test('14-2 วัยหมดระดู: เพดานสูงสุดร้อยละ 7', () => {
  const pm = reprofResult('uterus', 2, 2, { postmenopausal: true });
  assert.equal(pm.value, 7);
  assert.equal(pm.cls, 1);
});
test('14-3 วัยหมดระดู: มี note ว่าไม่ประเมิน', () => {
  const pm = reprofResult('ovary', 3, 3, { postmenopausal: true });
  assert.ok(pm.note && pm.note.includes('ไม่ประเมิน'));
});
