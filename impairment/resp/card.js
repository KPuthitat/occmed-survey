// card.js — UI ร่วมของการ์ดระบบทางเดินหายใจ (บทที่ 9) · mountRespCard('asthma'|'cancer'|'osa')
import { asthmaResult, asthmaLabClassFromFev1, ASTHMA_GRADES, GRADE_LETTERS, KARNOFSKY_LEVELS, OSA_LEVELS, rangeValue } from './engine.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { CARD_EXAMPLES } from './examples.js';

const HISTORY_DESC = [
  'ไม่จำเป็นต้องใช้ยา',
  'มีการใช้ยาขยายหลอดลมเป็นครั้งคราว',
  'ใช้คอร์ติโคสเตียรอยด์ชนิดสูดขนาดน้อย (<400–800 mcg/วัน ของ beclomethasone หรือเทียบเท่า)',
  'ใช้คอร์ติโคสเตียรอยด์ชนิดสูดขนาดปานกลางถึงสูง (800–1000 mcg/วัน) หรือ ICS+LABA และ/หรือ ใช้คอร์ติโคสเตียรอยด์รับประทานระยะสั้นเป็นครั้งคราว',
  'ใช้ยาทุกขนาดในขั้น 3 แล้วยังคุมอาการไม่ได้ เช่น ICS สูงกว่า 1000 mcg/วัน ร่วมกับ LABA, ใช้คอร์ติโคสเตียรอยด์รับประทานต่อเนื่อง หรือใช้ยา omalizumab',
];
const EXAM_DESC = [
  'ตรวจร่างกายไม่พบสิ่งผิดปกติ',
  'การรักษาต่อเนื่องทำให้ตรวจไม่พบสิ่งผิดปกติ หรือพบสิ่งผิดปกติเล็กน้อยเป็นครั้งคราว',
  'ตรวจพบสิ่งผิดปกติเล็กน้อยอย่างต่อเนื่องแม้รักษา หรือพบสิ่งผิดปกติปานกลางเป็นครั้งคราว',
  'ตรวจพบสิ่งผิดปกติขนาดปานกลางตลอดเวลาแม้รักษา หรือพบสิ่งผิดปกติรุนแรงเป็นครั้งคราว',
  'ตรวจพบสิ่งผิดปกติขนาดรุนแรงตลอดเวลาแม้รักษา หรือพบสิ่งผิดปกติรุนแรงมากเป็นครั้งคราว',
];

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
  .lvls{display:flex;flex-direction:column;gap:10px;margin-top:6px}
  .lvl{border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;transition:.12s;background:#fff}
  .lvl:hover{border-color:var(--gold)}.lvl.on{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,37,69,.08)}
  .lvl .lhead{display:flex;align-items:center;gap:10px}
  .lvl .badge{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--line2);color:var(--navy);font-weight:800;display:grid;place-items:center;font-size:15px}
  .lvl.on .badge{background:var(--navy);color:#fff}
  .lvl .ltitle{font-weight:700;color:var(--navy);font-size:14px}
  .lvl .lrange{margin-left:auto;font-size:12.5px;color:var(--muted);white-space:nowrap}
  .lvl .ldesc{margin-top:6px;font-size:12.5px;color:#3a4557;line-height:1.5}
  .pickwrap{margin-top:12px;display:none}.pickwrap.show{display:block}
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
    .occ-topbar,.occ-back,#btnCopy,#btnPrint,.warn{display:none!important}.lvl:not(.on){display:none}
    .card,.sec{box-shadow:none;border-color:#ccc;break-inside:avoid}.rcard.gold{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .print-head{display:block;padding:0 0 8px;border-bottom:2px solid var(--navy);margin-bottom:10px}
    .print-head b{font-size:16px;color:var(--navy)}.print-head span{display:block;color:#555;font-size:12px;margin-top:2px}}
`;
const THMON = ['มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'];
const beToday = () => { const d = new Date(); return `${d.getDate()} ${THMON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const esc = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const $ = id => document.getElementById(id);

const CFG = {
  asthma: { type: 'grade', titleTh: 'โรคหอบหืดจากการทำงาน', ref: '9-4' },
  cancer: { type: 'range', titleTh: 'มะเร็งปอด (Karnofsky)', ref: '9-5', levels: KARNOFSKY_LEVELS },
  osa:    { type: 'range', titleTh: 'ภาวะหยุดหายใจขณะหลับ (OSA)', ref: '9-6', levels: OSA_LEVELS },
};

function shell(titleTh, ref, note, bodyHtml, key) {
  document.title = `${titleTh} — ระบบทางเดินหายใจ | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar"><div class="mark">OC</div>
  <div><b>${esc(titleTh)}</b><small>ระบบทางเดินหายใจ · ตาราง ${ref}</small></div>
  <div class="sp"></div><a class="occ-back" href="/impairment/">← เลือกระบบ</a></div>
<div class="lead"><div class="kick">สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564)</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(titleTh)}</h1>
  <p>อ้างอิงตาราง ${ref}</p></div>
<div class="wrap">
  <div class="warn"><b>ข้อควรทราบ</b><ul>
    <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว</li>
    ${note ? `<li>${esc(note)}</li>` : ''}
    <li>ผลหลายระบบให้รวมด้วยตารางค่ารวม (Combined Values)</li>
    <li>การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</li>
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
  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(titleTh)}</b><span>ตามคู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม) บทที่ 9 (ตาราง ${ref}) · วันที่ประเมิน ${beToday()}</span>`;
  mountPageKit();
  mountExamples('#secExamples', (CARD_EXAMPLES && CARD_EXAMPLES[key]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 9)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม · บทที่ 9',
  });
}
async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}
function wireCopy(getText) {
  $('btnCopy').addEventListener('click', e => copyText(getText(), e.currentTarget));
  $('btnPrint').addEventListener('click', () => window.print());
}
const resultCards = (bigTop, subTop, bigBottom, subBottom) => `
  <div class="result">
    <div class="rcard"><b>${bigTop}</b><span>${subTop}</span></div>
    <div class="rcard gold"><b>${bigBottom}</b><span>${subBottom}</span></div>
  </div>`;

// ============ การ์ดหอบหืด (9-4) — class × grade ============
function mountAsthma() {
  const T = CFG.asthma;
  const opt = (arr, sel, cur) => arr.map((d, i) => `<option value="${i}" ${cur === i ? 'selected' : ''}>ขั้น ${i} — ${esc(d)}</option>`).join('');
  const body = `
  <div class="card sec">
    <h2>ปัจจัยหลัก (key) — ผลตรวจห้องปฏิบัติการ</h2>
    <div class="hint">ป้อน FEV<sub>1</sub> หลังพ่นยาขยายหลอดลม (% ของค่าปกติ) → จัดขั้น (>80=0 · 70–80=1 · 60–<70=2 · 50–<60=3 · <50=4)</div>
    <label class="fld">FEV<sub>1</sub> post-bronchodilator (% ของค่าปกติ)</label>
    <input type="number" id="fev1" min="0" max="150" step="1" inputmode="decimal" value="69">
    <div class="hint" id="labcls" style="margin-top:8px"></div>
  </div>
  <div class="card sec">
    <h2>ปัจจัยรอง (non-key) — ปรับระดับย่อยภายในขั้น</h2>
    <div class="hint">ตั้งต้นที่ระดับ C แล้วปรับด้วย ผลรวม(ขั้นปัจจัยรอง − ขั้นหลัก) · ปรับได้ภายในขั้นเดิม (ไม่ข้ามขั้น)</div>
    <label class="fld">ประวัติ (ขนาดยา / ความถี่การกำเริบ)</label>
    <select id="hist">${opt(HISTORY_DESC, 0, 2)}</select>
    <label class="fld">การตรวจร่างกาย</label>
    <select id="exam">${opt(EXAM_DESC, 0, 2)}</select>
  </div>`;
  shell(T.titleTh, T.ref, 'ปัจจัยหลักใช้ FEV1 หลังพ่นยาขยายหลอดลม และ/หรือ PC20 · ปัจจัยรอง = ประวัติ + การตรวจร่างกาย', body, 'asthma');
  const state = { fev1: 69, hist: 2, exam: 2 };
  function render() {
    const lab = asthmaLabClassFromFev1(state.fev1);
    $('labcls').innerHTML = `FEV₁ ${state.fev1}% → <b style="color:var(--navy)">ปัจจัยหลัก = ขั้นที่ ${lab}</b>`;
    if (lab <= 0) { $('resultBody').innerHTML = resultCards('ขั้น 0', 'ไม่มีการสูญเสีย', '0%', 'การสูญเสียทั้งร่างกาย (WPI)'); return; }
    const r = asthmaResult(lab, state.hist, state.exam);
    const adj = r.net === 0 ? 'ไม่ปรับ' : (r.net > 0 ? `+${r.net}` : `${r.net}`) + ' ระดับ';
    $('resultBody').innerHTML = resultCards(`ขั้น ${r.cls}${r.gradeLetter}`, `ค่ากลาง ${r.initial}% · ปรับ ${adj}`, `${r.value}%`, 'การสูญเสียทั้งร่างกาย (WPI)')
      + `<div class="steps">ปัจจัยหลัก = ขั้น ${r.cls} (ตั้งต้น grade C = ${r.initial}%) · ปัจจัยรอง: ประวัติ ขั้น ${state.hist}, ตรวจร่างกาย ขั้น ${state.exam} → ผลรวม (${state.hist}−${r.cls})+(${state.exam}−${r.cls}) = ${r.net} → <b>${r.value}%</b> (ระดับ ${r.gradeLetter})</div>`;
  }
  $('fev1').addEventListener('input', e => { state.fev1 = e.target.value === '' ? 0 : Number(e.target.value); render(); });
  $('hist').addEventListener('change', e => { state.hist = Number(e.target.value); render(); });
  $('exam').addEventListener('change', e => { state.exam = Number(e.target.value); render(); });
  wireCopy(() => {
    const lab = asthmaLabClassFromFev1(state.fev1);
    const r = asthmaResult(lab, state.hist, state.exam);
    return [`สรุปการประเมิน — ${T.titleTh} (คู่มือฯ บทที่ 9 ตาราง 9-4) · วันที่ ${beToday()}`,
      `FEV1 post-BD = ${state.fev1}% → ขั้น ${lab}`,
      lab <= 0 ? 'ไม่มีการสูญเสีย (ขั้น 0)' : `ผล: ขั้น ${r.cls} ระดับ ${r.gradeLetter} = ${r.value}%`,
      'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n');
  });
  render();
}

// ============ การ์ดแบบให้ช่วง (9-5 Karnofsky / 9-6 OSA) ============
function mountRange(key) {
  const T = CFG[key];
  const body = `
  <div class="card sec">
    <h2>เลือกขั้นความรุนแรง (ตาราง ${T.ref})</h2>
    <div class="hint">แตะเลือกขั้นที่ตรงกับผู้ป่วย แล้วเลือกค่าร้อยละภายในช่วงของขั้น</div>
    <div class="lvls" id="lvls"></div>
    <div class="pickwrap" id="pickwrap">
      <label class="fld">ค่าการสูญเสีย (WPI) ภายในช่วง <span id="rangeLbl"></span></label>
      <input type="number" id="pick" step="1">
    </div>
  </div>`;
  shell(T.titleTh, T.ref, 'ตารางนี้ให้ช่วงร้อยละต่อขั้น — เลือกค่าภายในช่วงตามความรุนแรงและปัจจัยรอง', body, key);
  const state = { cls: null, pick: null };
  function renderLvls() {
    $('lvls').innerHTML = T.levels.map(L => {
      const range = L.hi === L.lo ? `${L.lo}%` : `${L.lo}–${L.hi}%`;
      return `<div class="lvl${state.cls === L.cls ? ' on' : ''}" data-c="${L.cls}">
        <div class="lhead"><div class="badge">${L.cls}</div><div class="ltitle">ขั้นที่ ${L.cls}</div><div class="lrange">${range}</div></div>
        <div class="ldesc">${esc(L.desc)}</div></div>`;
    }).join('');
  }
  function renderPick() {
    const L = T.levels.find(x => x.cls === state.cls);
    if (!L || L.cls === 0) { $('pickwrap').classList.remove('show'); return; }
    $('pickwrap').classList.add('show');
    $('rangeLbl').textContent = `(${L.lo}–${L.hi}%)`;
    const inp = $('pick'); inp.min = L.lo; inp.max = L.hi;
    if (state.pick == null) state.pick = L.lo;
    inp.value = state.pick;
  }
  function renderResult() {
    if (state.cls == null) { $('resultBody').innerHTML = `<div class="hint">เลือกขั้นด้านบนเพื่อดูผล</div>`; return; }
    const r = rangeValue(T.levels, state.cls, state.cls === 0 ? 0 : state.pick);
    $('resultBody').innerHTML = resultCards(`ขั้น ${r.cls}`, `ช่วง ${r.lo}–${r.hi}%`, `${r.value}%`, 'การสูญเสียทั้งร่างกาย (WPI)')
      + `<div class="steps">${esc(r.desc || '')} → เลือกค่าในช่วง ${r.lo}–${r.hi}% → <b>${r.value}%</b></div>`;
  }
  document.addEventListener('click', e => {
    const lv = e.target.closest('.lvl'); if (!lv) return;
    state.cls = Number(lv.dataset.c);
    const L = T.levels.find(x => x.cls === state.cls);
    state.pick = L.cls === 0 ? 0 : L.lo;
    renderLvls(); renderPick(); renderResult();
  });
  document.addEventListener('input', e => {
    if (e.target.id === 'pick') { const L = T.levels.find(x => x.cls === state.cls); state.pick = Math.min(L.hi, Math.max(L.lo, Number(e.target.value))); renderResult(); }
  });
  wireCopy(() => {
    if (state.cls == null) return 'ยังไม่ได้เลือกขั้น';
    const r = rangeValue(T.levels, state.cls, state.cls === 0 ? 0 : state.pick);
    return [`สรุปการประเมิน — ${T.titleTh} (คู่มือฯ บทที่ 9 ตาราง ${T.ref}) · วันที่ ${beToday()}`,
      `ขั้นที่ ${r.cls} (ช่วง ${r.lo}–${r.hi}%) → การสูญเสียทั้งร่างกาย (WPI) = ${r.value}%`,
      'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n');
  });
  renderLvls(); renderResult();
}

export function mountRespCard(key) {
  if (key === 'asthma') return mountAsthma();
  return mountRange(key);
}
