// engine.test.js — unit test ระบบประสาท (บทที่ 5)
// รัน: node --test impairment/neuro/engine.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { NEURO_TABLES, NEURO_GROUPS } from './engine.js';
import { classifyPicks } from '../../shared/classifier.js';

function pick(tableKey, level, val) {
  const T = NEURO_TABLES[tableKey];
  return classifyPicks({ levels: T.levels, keyRow: 'crit', picks: { crit: level }, gradeOverride: val, rangeMode: true });
}

test('มีครบ 17 ตาราง + 4 กลุ่ม', () => {
  assert.equal(Object.keys(NEURO_TABLES).length, 17);
  assert.equal(Object.keys(NEURO_GROUPS).length, 4);
  // ทุก key ในกลุ่มต้องมีในตาราง
  for (const g of Object.values(NEURO_GROUPS)) for (const k of g.keys) assert.ok(NEURO_TABLES[k], 'missing ' + k);
});

test('โครงช่วง % ถูกต้อง (ตัวอย่างตาราง)', () => {
  assert.deepEqual(NEURO_TABLES.conscious.levels.map(l => l.range), [[0, 14], [15, 39], [40, 69], [70, 90]]);
  assert.deepEqual(NEURO_TABLES.armboth.levels.find(l => l.level === 4).range, [80, 100]);
  assert.deepEqual(NEURO_TABLES.respiration.levels.find(l => l.level === 1).range, [5, 19]);
  assert.deepEqual(NEURO_TABLES.bowel.levels.map(l => l.level), [1, 2, 3]); // 3 ระดับ
  assert.deepEqual(NEURO_TABLES.sexual.levels.find(l => l.level === 3).range, [30, 35]);
});

test('rangeMode: เลือกระดับ + ค่าในช่วง → ร้อยละ', () => {
  assert.equal(pick('conscious', 1, 14).percent, 14);   // 5.1
  assert.equal(pick('conscious', 3, 49).percent, 49);   // 5.3
  assert.equal(pick('conscious', 4, 90).percent, 90);   // 5.4
  assert.equal(pick('episodic', 1, 10).percent, 10);    // 5.6
  assert.equal(pick('sleep', 1, 9).percent, 9);         // 5.17
  assert.equal(pick('mental', 2, 29).percent, 29);      // 5.21 (CDR 1.0)
  assert.equal(pick('aphasia', 1, 7).percent, 7);       // 5.23
  assert.equal(pick('armone', 4, 60).percent, 60);      // 5.40
});

test('rangeMode: clamp ค่าให้อยู่ในช่วง + ค่าเริ่มต้น = ขอบล่าง', () => {
  assert.equal(pick('conscious', 1, 99).percent, 14);   // clamp บน
  assert.equal(pick('conscious', 1, -5).percent, 0);    // clamp ล่าง
  const r = classifyPicks({ levels: NEURO_TABLES.gait.levels, keyRow: 'crit', picks: { crit: 2 }, rangeMode: true });
  assert.equal(r.percent, 10); // default = lo ของระดับ 2 (10–19)
});

test('ยังไม่เลือกระดับ → null', () => {
  assert.equal(classifyPicks({ levels: NEURO_TABLES.gait.levels, keyRow: 'crit', picks: {}, rangeMode: true }), null);
});
