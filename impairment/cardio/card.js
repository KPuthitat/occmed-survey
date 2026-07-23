// card.js — การ์ดรายโรคหัวใจ (บทที่ 10) แบบ input-driven · เรียก mountCardioCard('<key>')
// key = คีย์ใน CARDIO_TABLES (htn, pvdArm, pvdLeg, valve, hf, pericard, arrhythmia, pulmhtn)
// แพทย์เลือก "ผลตรวจที่ตรงกับผู้ป่วย" แต่ละด้าน → ระบบจัดขั้น+ระดับย่อยอัตโนมัติ (ปรับเองได้)
import { CARDIO_TABLES, NYHA_CLASSES, CCS_CLASSES } from './engine.js';
import { mountClassifier } from '/shared/classifier.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { CARDIO_EXAMPLES } from './examples.js';

// ป้ายชื่อด้าน (factor) ที่นำมาให้เลือก · เรียงประวัติ→ตรวจร่างกาย→แล็บ
const FACTOR_LABELS = {
  history: 'ประวัติ / อาการ (functional)',
  exam: 'การตรวจร่างกาย',
  lab: 'การตรวจเพิ่มเติม / แล็บ (echo · CXR · BNP · ABI ฯลฯ)',
  angio: 'การฉีดสีหลอดเลือด (angiography)',
};
const FACTOR_ORDER = ['history', 'exam', 'lab', 'angio'];

export function mountCardioCard(key) {
  const T = CARDIO_TABLES[key];
  if (!T) throw new Error('ไม่พบตาราง ' + key);

  // เลือกเฉพาะด้านที่มีข้อมูลในตารางนี้
  const present = FACTOR_ORDER.filter(k => T.levels.some(L => (L[k] || '').trim()));
  const factors = present.map(k => ({ key: k, label: FACTOR_LABELS[k] }));

  // การ์ดที่อ้าง NYHA/CCS → แนบตารางอ้างอิง
  const usesNyha = T.levels.some(L => L.nyha && L.nyha !== '—');
  const refs = usesNyha
    ? [{ title: 'ดูเกณฑ์ NYHA functional class I–IV (ตาราง 10-1)', rows: NYHA_CLASSES.map(n => ({ cls: n.cls, text: n.text })) }]
    : [];

  mountClassifier({
    titleTh: T.titleTh,
    subtitleTh: 'หัวใจและหลอดเลือด',
    ref: T.ref,
    chapter: 'กองทุนเงินทดแทน · ฉบับจัดทำ 4 · บทที่ 10',
    output: T.output,
    keyRow: T.keyRow,
    levels: T.levels,
    factors,
    refs,
    examples: (CARDIO_EXAMPLES && CARDIO_EXAMPLES[key]) || [],
    examplesOpts: {
      title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 10)',
      source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 10',
    },
    mountExamples,
    mountPageKit,
  });
}
