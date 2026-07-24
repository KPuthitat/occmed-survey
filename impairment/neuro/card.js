// card.js — การ์ดกลุ่มระบบประสาท (บทที่ 5) แบบ input-driven (rangeMode)
// เรียก mountNeuroGroup('<groupKey>') · groupKey ใน NEURO_GROUPS (brain/cranial/motor/spinal)
// แต่ละหน้ามีตัวเลือก "หัวข้อย่อย" (ตาราง 5-x) ด้านบน · เลือกแล้วสลับเครื่องคำนวณ
import { NEURO_TABLES, NEURO_GROUPS } from './engine.js';
import { mountClassifier } from '/shared/classifier.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { NEURO_EXAMPLES } from './examples.js';

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const BRAIN_NOTE = 'กฎสมอง: เลือกค่าสูงสุดเพียงค่าเดียวจาก 4 การทำงานของสมอง (รู้สึกตัว/สภาพจิต/ภาษา/อารมณ์) เป็นตัวแทนสมอง แล้วรวมกับรายการอื่น (ตาราง 5-1) ด้วยตารางค่ารวม (Combined Values)';

function notesFor(T, groupKey) {
  const n = [
    'ประเมินเมื่ออาการคงที่ ได้รับการรักษา/ฟื้นฟูเต็มที่แล้ว (maximum medical improvement)',
    'เลือกระดับที่ตรงกับผู้ป่วยจากเกณฑ์ → เลือกค่าร้อยละภายในช่วงตามความรุนแรงจริง (ดุลยพินิจแพทย์)',
  ];
  if (T.note) n.push(T.note);
  if (groupKey === 'brain') n.push(BRAIN_NOTE);
  else n.push('นำค่าที่ได้ไปรวมกับค่าการสูญเสียฯ ที่มากที่สุดของสมอง (และรายการอื่น) ด้วยตารางค่ารวม (Combined Values)');
  n.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
  return n;
}

export function mountNeuroGroup(groupKey) {
  const G = NEURO_GROUPS[groupKey];
  if (!G) throw new Error('ไม่พบกลุ่ม ' + groupKey);

  function show(tableKey) {
    const T = NEURO_TABLES[tableKey];
    mountClassifier({
      titleTh: T.titleTh,
      subtitleTh: 'ระบบประสาท · ' + G.titleTh,
      ref: T.ref,
      chapter: 'สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564) · บทที่ 5',
      output: 'wpi',
      keyRow: 'crit',
      rangeMode: true,
      levels: T.levels,
      factors: T.factors,
      notes: notesFor(T, groupKey),
      examples: (NEURO_EXAMPLES && NEURO_EXAMPLES[tableKey]) || [],
      examplesOpts: {
        title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 5)',
        source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม · บทที่ 5',
      },
      mountExamples,
      mountPageKit,
    });
    // แทรกตัวเลือกหัวข้อย่อยด้านบน (หลัง mountClassifier สร้าง body ใหม่แล้ว)
    injectPicker(tableKey);
  }

  function injectPicker(tableKey) {
    const lead = document.querySelector('.cl-lead');
    if (!lead) return;
    const wrap = document.createElement('div');
    wrap.style.cssText = 'margin-top:12px';
    wrap.innerHTML = `<label style="font-size:13px;color:var(--muted);display:block;margin-bottom:5px">หัวข้อย่อยของ${esc(G.titleTh)}</label>
      <select id="neuroPick" style="width:100%;max-width:520px;padding:11px 12px;border:1.5px solid var(--gold);border-radius:11px;font-size:15px;font-weight:600;color:var(--navy);background:#fff">
        ${G.keys.map(k => `<option value="${k}"${k === tableKey ? ' selected' : ''}>ตาราง ${esc(NEURO_TABLES[k].ref)} — ${esc(NEURO_TABLES[k].titleTh)}</option>`).join('')}
      </select>`;
    lead.appendChild(wrap);
    document.getElementById('neuroPick').addEventListener('change', e => show(e.target.value));
  }

  show(G.keys[0]);
}
