// engine.test.js — unit test ระบบโลหิตวิทยา (บทที่ 15)
// รัน: node --test impairment/hema/engine.test.js
// ตรวจโครงตาราง + คำตอบตัวอย่างในคู่มือ (15.x) ผ่าน classifier (key→class, non-key ±1, BOTC บวก%)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { HEMA_TABLES, BOTC_ITEMS, ADL_TEXT } from './engine.js';
import { classifyPicks } from '../../shared/classifier.js';

// คิดผลรวม: base(class×grade) + BOTC (บวก, เพดาน 100)
function assess(table, picks, botcPct = 0) {
  const r = classifyPicks({ levels: table.levels, keyRow: table.keyRow, picks, shiftMode: 'unit' });
  const base = r ? r.percent : 0;
  return { r, base, final: Math.min(100, base + botcPct) };
}
const sumBotc = sel => {
  // sel = { id: value } · unit → pct×value (cap) · อื่น → clamp(value,0,pct)
  let t = 0;
  for (const [id, v] of Object.entries(sel)) {
    const it = BOTC_ITEMS.find(x => x.id === id); if (!it || !v) continue;
    t += it.unit ? Math.min(it.cap ?? Infinity, it.pct * v) : Math.min(v, it.pct);
  }
  return Math.round(t);
};

// ---------- โครงตาราง ----------
test('มีครบ 10 ตารางโรค + จำนวนระดับ/ขั้นถูกต้อง', () => {
  assert.equal(Object.keys(HEMA_TABLES).length, 10);
  // HIV = 5 ระดับ (A–E)
  assert.equal(HEMA_TABLES.hiv.levels.find(l => l.level === 2).grades.length, 5);
  // ที่เหลือ 3 ระดับ
  assert.equal(HEMA_TABLES.anemia.levels.find(l => l.level === 2).grades.length, 3);
  // acute leukemia มีเฉพาะขั้น 0,3,4
  assert.deepEqual(HEMA_TABLES.acuteleuk.levels.map(l => l.level), [0, 3, 4]);
  // hemophilia / thrombosis มีเฉพาะขั้น 0–3
  assert.deepEqual(HEMA_TABLES.hemophilia.levels.map(l => l.level), [0, 1, 2, 3]);
  assert.deepEqual(HEMA_TABLES.thrombosis.levels.map(l => l.level), [0, 1, 2, 3]);
});

// ---------- ตัวอย่างโลหิตจาง (ตาราง 15-4) ----------
test('15.2 โลหิตจาง+RA: key=ขั้น1, Hb=ขั้น1 → 1B = 3%', () => {
  const { base, final } = assess(HEMA_TABLES.anemia, { history: 1, lab: 1 });
  assert.equal(base, 3); assert.equal(final, 3);
});
test('15.3 AIHA: key=ขั้น2, Hb=ขั้น2 → 2B = 20%', () => {
  assert.equal(assess(HEMA_TABLES.anemia, { history: 2, lab: 2 }).final, 20);
});
test('15.4 thal/HbE: key=ขั้น3, Hb=ขั้น2 (ต่ำกว่า) → 3A = 35%', () => {
  assert.equal(assess(HEMA_TABLES.anemia, { history: 3, lab: 2 }).final, 35);
});
test('15.5 aplastic: key=ขั้น4, Hb=ขั้น3 → 4A(55) + BOTC 5 = 60%', () => {
  const b = sumBotc({ anticoag: 5 });
  assert.equal(b, 5);
  assert.equal(assess(HEMA_TABLES.anemia, { history: 4, lab: 3 }, b).final, 60);
});

// ---------- Neutropenia (15-5) — key = neutrophil ----------
test('15.8 cyclic neutropenia: neutrophil=ขั้น3, ยาปฏิชีวนะ=ขั้น2 (ต่ำกว่า) → 3A = 26%', () => {
  assert.equal(assess(HEMA_TABLES.neutropenia, { lab: 3, history: 2 }).final, 26);
});

// ---------- Leukemia (15-6 / 15-7) ----------
test('15.9 CML targeted oral: history=ขั้น1 → 1B = 11%', () => {
  assert.equal(assess(HEMA_TABLES.chronicleuk, { history: 1 }).final, 11);
});
test('15.11 acute leukemia: history=ขั้น4, ADL=ขั้น3 → 4A(71) + BOTC 2 = 73%', () => {
  const b = sumBotc({ transfuse: 2 });
  assert.equal(b, 2);
  assert.equal(assess(HEMA_TABLES.acuteleuk, { history: 4, adl: 3 }, b).final, 73);
});

// ---------- HIV (15-8, 5 ระดับ) ----------
test('15.12 HIV: CD4=ขั้น1(C), ประวัติ=ขั้น0, ADL=ขั้น0 → 1A = 3%', () => {
  assert.equal(assess(HEMA_TABLES.hiv, { lab: 1, history: 0, adl: 0 }).final, 3);
});
test('15.13 HIV: CD4=ขั้น2(C), ADL=ขั้น1, ประวัติ=ขั้น1 → 2A = 16%', () => {
  assert.equal(assess(HEMA_TABLES.hiv, { lab: 2, adl: 1, history: 1 }).final, 16);
});
test('15.14 AIDS: CD4=ขั้น3(C), ADL=ขั้น2 → 3B = 38%', () => {
  assert.equal(assess(HEMA_TABLES.hiv, { lab: 3, adl: 2 }).final, 38);
});

// ---------- เกล็ดเลือด (15-9) ----------
test('15.16 ITP: history=ขั้น2(B), platelet=ขั้น3 (สูงกว่า) → 2C = 24%', () => {
  assert.equal(assess(HEMA_TABLES.platelet, { history: 2, lab: 3 }).final, 24);
});
test('15.17 Amegakaryocytic: history=ขั้น3(B), platelet=ขั้น4 → 3C(44) + BOTC 5 = 49%', () => {
  const b = sumBotc({ transfuse: 2, steroid: 3 });
  assert.equal(b, 5);
  assert.equal(assess(HEMA_TABLES.platelet, { history: 3, lab: 4 }, b).final, 49);
});

// ---------- Bleeding (15-11) / Thrombosis (15-12) ----------
test('15.19 von Willebrand: freq=ขั้น2 → 2B = 24%', () => {
  assert.equal(assess(HEMA_TABLES.bleeding, { freq: 2 }).final, 24);
});
test('15.20 Protein C def: freq=ขั้น3(B), hypercoag=ขั้น2 (ต่ำกว่า) → 3A(35) + BOTC 5 = 40%', () => {
  assert.equal(assess(HEMA_TABLES.thrombosis, { freq: 3, lab: 2 }, sumBotc({ anticoag: 5 })).final, 40);
});

// ---------- Hemophilia (15-10) — ข้อยกเว้นระดับสูงสุด ----------
test('15.18 Hemophilia A รุนแรง: ประวัติ+การรักษา+factor = ขั้น3(max) → 3C(85) + BOTC 9 = 94%', () => {
  const b = sumBotc({ factor8: 9 });
  assert.equal(b, 9);
  assert.equal(assess(HEMA_TABLES.hemophilia, { history: 3, treat: 3, lab: 3 }, b).final, 94);
});
test('15.15 AIDS ระยะท้าย: CD4=ขั้น4(max) · ประวัติ+ADL=ขั้น4 → ข้อยกเว้น → 4E = 80%', () => {
  assert.equal(assess(HEMA_TABLES.hiv, { lab: 4, history: 4, adl: 4 }).final, 80);
});

// ---------- Lymphoma (15-13) ----------
test('15.21 Hodgkin: history=ขั้น4(B), ADL=ขั้น3 → 4A(65) + BOTC 10 = 75%', () => {
  const b = sumBotc({ ivchemo: 12, radio: 2, transfuse: 2 }); // 12→cap6, 2, 2 = 10
  assert.equal(b, 10);
  assert.equal(assess(HEMA_TABLES.lymphoma, { history: 4, adl: 3 }, b).final, 75);
});

// ---------- BOTC caps ----------
test('BOTC: เคมีบำบัดฉีด 12 รอบ → เพดาน 6% · ฉายแสง 10 สัปดาห์ → เพดาน 6%', () => {
  assert.equal(sumBotc({ ivchemo: 12 }), 6);
  assert.equal(sumBotc({ radio: 10 }), 6);
  assert.equal(sumBotc({ sct: 10 }), 10);
});
