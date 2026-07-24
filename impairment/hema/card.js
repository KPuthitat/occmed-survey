// card.js — การ์ดรายโรคระบบเลือด (บทที่ 15) แบบ input-driven · เรียก mountHemaCard('<key>')
// key = คีย์ใน HEMA_TABLES (anemia, neutropenia, acuteleuk, chronicleuk, hiv, platelet,
//        hemophilia, bleeding, thrombosis, lymphoma)
import { HEMA_TABLES, BOTC } from './engine.js';
import { mountClassifier } from '/shared/classifier.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { HEMA_EXAMPLES } from './examples.js';

const NOTES = [
  'ประเมินเมื่ออาการคงที่ ได้รับการรักษาอย่างเหมาะสมเต็มที่แล้ว (maximum medical improvement)',
  'เลือก “ผลตรวจที่ตรงกับผู้ป่วย” ในแต่ละด้าน — ระบบจัดขั้น (ปัจจัยหลัก) + ระดับย่อย (ปัจจัยรอง ±1) ให้อัตโนมัติ · ปรับเองได้',
  'ถ้าปัจจัยหลักและปัจจัยรองตรงกับขั้นสูงสุดพร้อมกัน อาจปรับระดับขึ้นถึงระดับสูงสุดได้ (ดูเชิงอรรถของตาราง)',
  'BOTC (ผลกระทบจากการรักษา) บวกเข้ากับร้อยละการสูญเสีย · การรวมกับอวัยวะ/ระบบอื่นใช้แผงตารางค่ารวม (Combined Values)',
  'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน',
];

export function mountHemaCard(key) {
  const T = HEMA_TABLES[key];
  if (!T) throw new Error('ไม่พบตาราง ' + key);
  mountClassifier({
    titleTh: T.titleTh,
    subtitleTh: 'ระบบโลหิตวิทยา',
    ref: T.ref,
    chapter: 'กองทุนเงินทดแทน · ฉบับจัดทำ 4 · บทที่ 15',
    output: 'wpi',
    keyRow: T.keyRow,
    shiftMode: T.shiftMode || 'unit',
    levels: T.levels,
    factors: T.factors,
    botc: BOTC,
    notes: NOTES,
    examples: (HEMA_EXAMPLES && HEMA_EXAMPLES[key]) || [],
    examplesOpts: {
      title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 15)',
      source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 15',
    },
    mountExamples,
    mountPageKit,
  });
}
