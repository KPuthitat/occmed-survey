// card.js — UI ร่วมของการ์ดระบบสืบพันธุ์หญิง (บทที่ 14) · mountReprofCard('vulva'|'uterus'|'ovary')
import { reprofResult, TABLES, GRADE_LETTERS } from './engine.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { CARD_EXAMPLES } from './examples.js';

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
  select{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:15px}
  .chk{display:flex;align-items:center;gap:9px;margin-top:14px;font-size:14px;color:var(--navy2);cursor:pointer}
  .chk input{width:18px;height:18px}
  .result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
  .rcard b{display:block;font-size:32px;color:var(--navy);line-height:1;font-weight:800}
  .rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
  .rcard.gold b{color:var(--gold-lt)}.rcard.gold span{color:#c8d4e4}
  .rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
  .steps{background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:12px 14px;margin-top:12px;font-size:13px;line-height:1.7;color:var(--navy2)}
  .steps .nt{color:var(--gold-dk);font-weight:600}
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

function shell(t, bodyHtml) {
  document.title = `${t.name} — ระบบสืบพันธุ์หญิง | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar"><div class="mark">OC</div>
  <div><b>${esc(t.name)}</b><small>ระบบสืบพันธุ์หญิง · ตาราง ${t.ref}</small></div>
  <div class="sp"></div><a class="occ-back" href="/impairment/">← เลือกระบบ</a></div>
<div class="lead"><div class="kick">กองทุนเงินทดแทน · ฉบับจัดทำ 4</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(t.name)}</h1>
  <p>ปัจจัยหลัก: <b>${esc(t.keyName)}</b> → จัดขั้น · ปัจจัยรอง: ${esc(t.secName)} → ปรับระดับ (ตาราง ${t.ref})</p></div>
<div class="wrap">
  <div class="warn"><b>ข้อควรทราบ</b><ul>
    <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว</li>
    <li>ปัจจัยหลัก (${esc(t.keyName)}) เป็นตัวจัดขั้น · ปัจจัยรอง (${esc(t.secName)}) ใช้ปรับระดับภายในขั้น (ค่าตั้งต้น = ค่ากลาง/ระดับ B)</li>
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
  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(t.name)}</b><span>ตามคู่มือกองทุนเงินทดแทน ฉบับจัดทำ 4 บทที่ 14 (ตาราง ${t.ref}) · วันที่ประเมิน ${beToday()}</span>`;
  mountPageKit();
  mountExamples('#secExamples', (CARD_EXAMPLES && CARD_EXAMPLES[t.organ]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 14)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 14',
  });
}
async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}

export function mountReprofCard(organ) {
  const t = TABLES[organ]; t.organ = organ;
  const opt = (arr, cur) => arr.map((d, i) => `<option value="${i}" ${cur === i ? 'selected' : ''}>ขั้น ${i} — ${esc(d)}</option>`).join('');
  const pmLabel = organ === 'ovary' ? 'อยู่ในวัยหมดระดู / ไม่ประสงค์จะมีบุตรอีก' : 'อยู่ในวัยหมดระดู (postmenopausal)';
  const body = `
  <div class="card sec">
    <h2>ปัจจัยหลัก (key) — ${esc(t.keyName)}</h2>
    <div class="hint">เลือกขั้นตามผลการตรวจที่ตรงกับผู้รับการประเมิน → เป็นตัวจัดขั้น (class)</div>
    <label class="fld">${esc(t.keyName)}</label>
    <select id="keyc">${opt(t.keyDesc, 1)}</select>
  </div>
  <div class="card sec">
    <h2>ปัจจัยรอง (non-key) — ${esc(t.secName)}</h2>
    <div class="hint">ปรับระดับภายในขั้น: เริ่มที่ค่ากลาง (ระดับ B) แล้วเลื่อนตาม (ขั้นปัจจัยรอง − ขั้นปัจจัยหลัก)</div>
    <label class="fld">${esc(t.secName)}</label>
    <select id="secc">${opt(t.secDesc, 1)}</select>
    <label class="chk"><input type="checkbox" id="pmeno"> ${esc(pmLabel)}</label>
  </div>`;
  shell(t, body);
  const state = { key: 1, sec: 1, pm: false };
  function render() {
    const r = reprofResult(organ, state.key, state.sec, { postmenopausal: state.pm });
    const gradeTxt = r.gradeLetter ? ` ระดับ ${r.gradeLetter}` : '';
    const adjTxt = r.gradeLetter == null ? 'ขั้นนี้มีระดับเดียว'
      : (r.net === 0 ? 'ปัจจัยรองอยู่ขั้นเดียวกับปัจจัยหลัก → ใช้ค่ากลาง (B)'
        : `ปรับ ${r.net > 0 ? '+' + r.net : r.net} ระดับ จากค่ากลาง (B ${r.initial}%)`);
    $('resultBody').innerHTML = `
      <div class="result">
        <div class="rcard"><b>ขั้น ${r.cls}${gradeTxt}</b><span>ตาราง ${r.ref} (${esc(t.keyName)})</span></div>
        <div class="rcard gold"><b>${r.value}%</b><span>การสูญเสียทั้งร่างกาย (WPI)</span></div>
      </div>
      <div class="steps">ปัจจัยหลัก (${esc(t.keyName)}) = ขั้น ${state.key} → จัดอยู่ในขั้น ${r.cls} · ${adjTxt} → <b>${r.value}%</b>${r.note ? ` <span class="nt">· ${esc(r.note)}</span>` : ''}</div>`;
  }
  $('keyc').addEventListener('change', e => { state.key = Number(e.target.value); render(); });
  $('secc').addEventListener('change', e => { state.sec = Number(e.target.value); render(); });
  $('pmeno').addEventListener('change', e => { state.pm = e.target.checked; render(); });
  $('btnCopy').addEventListener('click', e => {
    const r = reprofResult(organ, state.key, state.sec, { postmenopausal: state.pm });
    const txt = [`สรุปการประเมิน — ${t.name} (คู่มือฯ บทที่ 14 ตาราง ${t.ref}) · วันที่ ${beToday()}`,
      `ปัจจัยหลัก (${t.keyName}) = ขั้น ${state.key} · ปัจจัยรอง (${t.secName}) = ขั้น ${state.sec}${state.pm ? ' · วัยหมดระดู' : ''}`,
      `ผล: ขั้น ${r.cls}${r.gradeLetter ? ' ระดับ ' + r.gradeLetter : ''} = การสูญเสียทั้งร่างกาย (WPI) ${r.value}%`,
      r.note ? `หมายเหตุ: ${r.note}` : null,
      'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].filter(Boolean).join('\n');
    copyText(txt, e.currentTarget);
  });
  $('btnPrint').addEventListener('click', () => window.print());
  render();
}
