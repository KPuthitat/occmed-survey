// card.js — UI ร่วมของการ์ดระบบสืบพันธุ์ชาย (บทที่ 13) · mountRepromCard('erectile'|'testes'|'prostate')
import {
  IIEF5_QUESTIONS, iief5Total, iief5Band, iief5Class,
  ERECTILE_LEVELS, TESTES_LEVELS, PROSTATE_LEVELS,
  QOL_FACTORS, PROSTATE_FACTORS, repromResult, sumFactors, levelWpi,
} from './engine.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { CARD_EXAMPLES } from './examples.js';

const CFG = {
  erectile: { name: 'องคชาตและการแข็งตัว (Erectile function)', ref: '13-1/13-2', levels: ERECTILE_LEVELS, factors: QOL_FACTORS, iief: true, manual: true },
  testes:   { name: 'ถุงอัณฑะ อัณฑะ และท่อน้ำอสุจิ', ref: '13-3/13-4', levels: TESTES_LEVELS, factors: QOL_FACTORS },
  prostate: { name: 'ต่อมลูกหมากและถุงพักน้ำอสุจิ', ref: '13-5', levels: PROSTATE_LEVELS, factors: PROSTATE_FACTORS },
};

const CSS = `
  .lead{max-width:940px;margin:0 auto;padding:16px 16px 0}
  .lead .kick{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dk);font-weight:700}
  .lead h1{font-size:21px;margin:4px 0 6px}.lead p{color:var(--muted);margin:0;font-size:14px}
  .sec{margin-top:16px;padding:16px}.sec>h2{font-size:16px;color:var(--navy);margin-bottom:2px}
  .sec .hint{color:var(--muted);font-size:13px;margin-bottom:10px}
  .warn{background:#fff8ec;border:1px solid #ecd9a8;border-radius:12px;padding:14px 16px;margin-top:14px}
  .warn b{color:var(--gold-dk)}.warn ul{margin:8px 0 0;padding-left:20px}
  .warn li{font-size:13.5px;color:#5b5030;margin:4px 0;line-height:1.5}
  label.fld{display:block;font-weight:600;font-size:13px;color:var(--navy2);margin:12px 0 5px}
  select,input[type=number]{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:15px}
  .qrow{border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-top:10px}
  .qrow .qt{font-size:13.5px;color:var(--navy2);font-weight:600;margin-bottom:6px}
  .chk{display:flex;align-items:flex-start;gap:9px;margin-top:10px;font-size:13.5px;color:var(--navy2);cursor:pointer;line-height:1.45}
  .chk input{width:18px;height:18px;margin-top:1px;flex:0 0 auto}
  .chk .add{margin-left:auto;color:var(--gold-dk);font-weight:700;white-space:nowrap}
  .num{max-width:150px}
  .result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
  .rcard b{display:block;font-size:32px;color:var(--navy);line-height:1;font-weight:800}
  .rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
  .rcard.gold b{color:var(--gold-lt)}.rcard.gold span{color:#c8d4e4}
  .rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
  .steps{background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:12px 14px;margin-top:12px;font-size:13px;line-height:1.7;color:var(--navy2)}
  .print-note{margin-top:12px;font-size:12px;color:var(--muted)}.print-head{display:none}
  @media(max-width:560px){.result{grid-template-columns:1fr}}
  @media print{@page{margin:14mm}body{background:#fff;font-size:12px}
    .occ-topbar,.occ-back,#btnCopy,#btnPrint,.warn{display:none!important}
    .card,.sec{box-shadow:none;border-color:#ccc;break-inside:avoid}.rcard.gold{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .print-head{display:block;padding:0 0 8px;border-bottom:2px solid var(--navy);margin-bottom:10px}
    .print-head b{font-size:16px;color:var(--navy)}.print-head span{display:block;color:#555;font-size:12px;margin-top:2px}}
`;
const THMON = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const beToday = () => { const d = new Date(); return `${d.getDate()} ${THMON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const $ = id => document.getElementById(id);

function shell(T, key, bodyHtml) {
  document.title = `${T.name} — ระบบสืบพันธุ์ชาย | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar"><div class="mark">OC</div>
  <div><b>${esc(T.name)}</b><small>ระบบสืบพันธุ์ชาย · ตาราง ${T.ref}</small></div>
  <div class="sp"></div><a class="occ-back" href="/impairment/">← เลือกระบบ</a></div>
<div class="lead"><div class="kick">กองทุนเงินทดแทน · ฉบับจัดทำ 4</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(T.name)}</h1>
  <p>ปัจจัยหลักจัดขั้น → ค่าตั้งต้น · ปัจจัยรองบวกเพิ่มทีละร้อยละ (ตาราง ${T.ref}) · <b>คำนวณล้วน ไม่บันทึกข้อมูล</b></p></div>
<div class="wrap">
  <div class="warn"><b>ข้อควรทราบ</b><ul>
    <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว</li>
    <li>ปัจจัยรองแต่ละข้อ "บวกเพิ่ม" จากค่าตั้งต้นของขั้น — เลือกเฉพาะข้อที่ผู้รับการประเมินมีจริง</li>
    <li>การสูญเสียความต้องการ/ความสนใจทางเพศให้ประเมินเป็นการสูญเสียสมรรถภาพทางจิต (แยกจากตารางนี้)</li>
    <li>ผลหลายระบบให้รวมด้วยตารางค่ารวม (Combined Values) · การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</li>
  </ul></div>
  ${bodyHtml}
  <div class="card sec">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h2 style="margin:0">ผลการประเมิน</h2><div class="sp" style="flex:1"></div>
      <button class="btn" id="btnPrint">พิมพ์ / PDF</button>
      <button class="btn gold" id="btnCopy">คัดลอกสรุปผล</button></div>
    <div id="resultBody" style="margin-top:10px"></div>
    <div class="print-note">การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</div>
  </div>
  <div id="secExamples"></div>
</div>`;
  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(T.name)}</b><span>ตามคู่มือกองทุนเงินทดแทน ฉบับจัดทำ 4 บทที่ 13 (ตาราง ${T.ref}) · วันที่ประเมิน ${beToday()}</span>`;
  mountPageKit();
  mountExamples('#secExamples', (CARD_EXAMPLES && CARD_EXAMPLES[key]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 13)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 13',
  });
}
async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}
const factorRows = (factors) => factors.map(f =>
  `<label class="chk"><input type="checkbox" data-fid="${f.id}"> <span>${esc(f.label)}</span><span class="add">+${f.add}%</span></label>`).join('');

export function mountRepromCard(key) {
  const T = CFG[key];
  const state = { iief: [3, 3, 3, 3, 3], cls: (key === 'prostate' ? 1 : 1), factors: new Set(), manual: 0 };

  // ---- ส่วนปัจจัยหลัก ----
  let mainHtml;
  if (T.iief) {
    const opts = q => q.opts.map((o, i) => `<option value="${i + 1}">${i + 1} — ${esc(o)}</option>`).join('');
    mainHtml = `
    <div class="card sec">
      <h2>ปัจจัยหลัก — แบบสอบถาม IIEF-5 (ตาราง 13-1)</h2>
      <div class="hint">ตอบทั้ง 5 ข้อ (ข้อละ 1–5 คะแนน) → รวมคะแนน → จัดขั้นการหย่อนสมรรถภาพทางเพศ (ตาราง 13-2)</div>
      ${IIEF5_QUESTIONS.map((q, i) => `<div class="qrow"><div class="qt">${i + 1}. ${esc(q.q)}</div><select data-qi="${i}">${opts(q)}</select></div>`).join('')}
      <div class="hint" id="iiefsum" style="margin-top:10px"></div>
    </div>`;
  } else {
    const opt = T.levels.map(l => `<option value="${l.cls}">ขั้น ${l.cls} (${l.wpi}%) — ${esc(l.desc)}</option>`).join('');
    mainHtml = `
    <div class="card sec">
      <h2>ปัจจัยหลัก — จัดขั้นการสูญเสีย (ตาราง ${T.ref})</h2>
      <div class="hint">เลือกขั้นที่ตรงกับผลการตรวจ (ค่าตั้งต้นต่อขั้นแสดงในวงเล็บ)</div>
      <label class="fld">ขั้นการสูญเสีย</label>
      <select id="clssel">${opt}</select>
    </div>`;
  }

  // ---- ส่วนปัจจัยรอง ----
  const secTitle = key === 'prostate' ? 'ปัจจัยรอง — การตรวจทางคลินิก (บวกเพิ่ม)' : 'ปัจจัยรอง — คุณภาพชีวิต (บวกเพิ่ม)';
  const secHtml = `
    <div class="card sec">
      <h2>${secTitle}</h2>
      <div class="hint">เลือกเฉพาะปัจจัยที่ผู้รับการประเมินมีจริง · แต่ละข้อบวกเพิ่มจากค่าตั้งต้น</div>
      ${factorRows(T.factors)}
      ${T.manual ? `<label class="fld">ปัจจัยรองอื่น ๆ โดยดุลยพินิจ (เช่น ความผิดปกติจากการตรวจร่างกาย / อาการร่วม / IIEF สูงกว่าปัจจัยหลัก) — บวกเพิ่ม (%)</label>
      <input type="number" id="manual" class="num" min="0" max="20" step="1" value="0">` : ''}
    </div>`;

  shell(T, key, mainHtml + secHtml);

  function baseClass() {
    if (T.iief) return iief5Class(iief5Total(state.iief));
    return state.cls;
  }
  function render() {
    const cls = baseClass();
    const r = repromResult(T.levels, cls, T.factors, [...state.factors]);
    const total = r.wpi + (T.manual ? Number(state.manual) || 0 : 0);
    let mainNote = '';
    if (T.iief) {
      const tot = iief5Total(state.iief);
      const band = iief5Band(tot);
      $('iiefsum').innerHTML = `คะแนนรวม IIEF-5 = <b style="color:var(--navy)">${tot}</b> → ${esc(band.label)} → <b style="color:var(--navy)">ขั้นที่ ${band.cls}</b> (ค่าตั้งต้น ${levelWpi(ERECTILE_LEVELS, band.cls)}%)`;
      mainNote = `IIEF-5 = ${tot} → ขั้น ${cls} (ตั้งต้น ${r.base}%)`;
    } else {
      const L = T.levels.find(l => l.cls === cls);
      mainNote = `ขั้น ${cls} (ตั้งต้น ${r.base}%)`;
      void L;
    }
    const manualTxt = T.manual && Number(state.manual) > 0 ? ` + ปัจจัยรองอื่น ๆ ${Number(state.manual)}` : '';
    $('resultBody').innerHTML = `
      <div class="result">
        <div class="rcard"><b>ขั้น ${cls}</b><span>ค่าตั้งต้น ${r.base}% (ตาราง ${T.ref})</span></div>
        <div class="rcard gold"><b>${total}%</b><span>การสูญเสียทั้งร่างกาย (WPI)</span></div>
      </div>
      <div class="steps">${mainNote} · ปัจจัยรองบวกเพิ่ม ${r.add}${manualTxt} → <b>${r.base} + ${r.add + (T.manual ? Number(state.manual) || 0 : 0)} = ${total}%</b></div>`;
  }

  if (T.iief) {
    document.querySelectorAll('select[data-qi]').forEach(sel => {
      sel.value = '3';
      sel.addEventListener('change', e => { state.iief[Number(e.target.dataset.qi)] = Number(e.target.value); render(); });
    });
  } else {
    $('clssel').addEventListener('change', e => { state.cls = Number(e.target.value); render(); });
  }
  document.querySelectorAll('input[data-fid]').forEach(chk => {
    chk.addEventListener('change', e => {
      const id = e.target.dataset.fid;
      if (e.target.checked) state.factors.add(id); else state.factors.delete(id);
      render();
    });
  });
  if (T.manual) $('manual').addEventListener('input', e => { state.manual = e.target.value === '' ? 0 : Number(e.target.value); render(); });

  $('btnCopy').addEventListener('click', e => {
    const cls = baseClass();
    const r = repromResult(T.levels, cls, T.factors, [...state.factors]);
    const total = r.wpi + (T.manual ? Number(state.manual) || 0 : 0);
    const picked = T.factors.filter(f => state.factors.has(f.id)).map(f => f.label);
    const lines = [`สรุปการประเมิน — ${T.name} (คู่มือฯ บทที่ 13 ตาราง ${T.ref}) · วันที่ ${beToday()}`];
    if (T.iief) lines.push(`IIEF-5 = ${iief5Total(state.iief)} → ${iief5Band(iief5Total(state.iief)).label} (ขั้น ${cls})`);
    lines.push(`ค่าตั้งต้นขั้น ${cls} = ${r.base}%`);
    if (picked.length) lines.push('ปัจจัยรอง: ' + picked.join(', '));
    if (T.manual && Number(state.manual) > 0) lines.push(`ปัจจัยรองอื่น ๆ (ดุลยพินิจ) = +${Number(state.manual)}%`);
    lines.push(`ผล: การสูญเสียทั้งร่างกาย (WPI) = ${total}%`);
    lines.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    copyText(lines.join('\n'), e.currentTarget);
  });
  $('btnPrint').addEventListener('click', () => window.print());
  render();
}
