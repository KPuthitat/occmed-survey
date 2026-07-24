// card.js — การ์ดรายต่อมระบบต่อมไร้ท่อ (บทที่ 16) แบบ input-driven · เรียก mountEndocrineCard('<key>')
// key = คีย์ใน ENDOCRINE_TABLES
import { ENDOCRINE_TABLES, botcGradeCfg } from './engine.js';
import { mountClassifier } from '/shared/classifier.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { ENDO_EXAMPLES } from './examples.js';

const NOTES = [
  'ประเมินเมื่ออาการคงที่ ได้รับการรักษาอย่างเหมาะสมเต็มที่แล้ว (maximum medical improvement)',
  'เลือก “ประวัติ/ผลตรวจที่ตรงกับผู้ป่วย” → ระบบจัดขั้น (ปัจจัยหลัก) ให้ · ค่าตั้งต้น = ระดับกลางของขั้น',
  'BOTC (ผลกระทบจากการรักษา) รวมเป็นคะแนน → เทียบเป็นขั้น แล้วปรับระดับย่อยเทียบกับขั้นปัจจัยหลัก · ปรับเองได้',
  'ถ้ามีความผิดปกติของอวัยวะอื่นจากโรคต่อมไร้ท่อ ให้ประเมินแยกแล้วรวมด้วยตารางค่ารวม (Combined Values)',
  'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน',
];

export function mountEndocrineCard(key) {
  const T = ENDOCRINE_TABLES[key];
  if (!T) throw new Error('ไม่พบตาราง ' + key);
  mountClassifier({
    titleTh: T.titleTh,
    subtitleTh: 'ระบบต่อมไร้ท่อและเมตะบอลิสม',
    ref: T.ref,
    chapter: 'สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564) · บทที่ 16',
    output: 'wpi',
    keyRow: T.keyRow || 'history',
    shiftMode: T.shiftMode || 'proportional',
    levels: T.levels,
    factors: T.factors,
    botcGrade: T.botcThresholds ? botcGradeCfg(T.botcThresholds) : null,
    notes: NOTES,
    examples: (ENDO_EXAMPLES && ENDO_EXAMPLES[key]) || [],
    examplesOpts: {
      title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 16)',
      source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม · บทที่ 16',
    },
    mountExamples,
    mountPageKit,
  });
}
