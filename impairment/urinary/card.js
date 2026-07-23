// card.js — UI ร่วมของการ์ดระบบทางเดินปัสสาวะ (บทที่ 12) · mountUrinaryCard('upper'|'bladder'|'urethra'|'diversion')
import {
  TABLES, DIVERSION, LEVEL_NAMES, urinaryResult, combineValues,
  effectiveEgfr, egfrAgeAdjust, egfrClass, EGFR_BANDS,
} from './engine.js';
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
  select,input[type=number]{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:15px}
  .two{display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .egfrbox{background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:10px 12px;margin-top:10px;font-size:13px;line-height:1.6;color:var(--navy2)}
  .lvls{display:flex;gap:8px;margin-top:6px}
  .lvlbtn{flex:1;border:1.5px solid var(--line);border-radius:10px;padding:10px;text-align:center;cursor:pointer;background:#fff;transition:.12s}
  .lvlbtn:hover{border-color:var(--gold)}.lvlbtn.on{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,37,69,.08)}
  .lvlbtn .ln{font-size:12px;color:var(--muted)}.lvlbtn .lv{font-size:20px;font-weight:800;color:var(--navy)}
  .chk{display:flex;align-items:flex-start;gap:9px;margin-top:10px;font-size:13.5px;color:var(--navy2);cursor:pointer;line-height:1.45}
  .chk input{width:18px;height:18px;margin-top:1px;flex:0 0 auto}
  .chk .add{margin-left:auto;color:var(--gold-dk);font-weight:700;white-space:nowrap}
  .result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
  .rcard b{display:block;font-size:32px;color:var(--navy);line-height:1;font-weight:800}
  .rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
  .rcard.gold b{color:var(--gold-lt)}.rcard.gold span{color:#c8d4e4}
  .rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
  .steps{background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:12px 14px;margin-top:12px;font-size:13px;line-height:1.7;color:var(--navy2)}
  .print-note{margin-top:12px;font-size:12px;color:var(--muted)}.print-head{display:none}
  @media(max-width:560px){.result,.two{grid-template-columns:1fr}}
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

function shell(name, ref, key, bodyHtml) {
  document.title = `${name} — ระบบทางเดินปัสสาวะ | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar"><div class="mark">OC</div>
  <div><b>${esc(name)}</b><small>ระบบทางเดินปัสสาวะ · ตาราง ${ref}</small></div>
  <div class="sp"></div><a class="occ-back" href="/impairment/">← เลือกระบบ</a></div>
<div class="lead"><div class="kick">กองทุนเงินทดแทน · ฉบับจัดทำ 4</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(name)}</h1>
  <p>จัดขั้นการสูญเสีย → เลือกระดับย่อยตามความรุนแรง (ตาราง ${ref})</p></div>
<div class="wrap">
  <div class="warn"><b>ข้อควรทราบ</b><ul>
    <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว</li>
    <li>ขั้นพิจารณาจากลักษณะทางคลินิก ณ ปัจจุบัน ร่วมกับผลตรวจ · ระดับย่อย (ต่ำ/กลาง/สูง) ตามความรุนแรง (ค่าตั้งต้น = กลาง)</li>
    <li>ผู้มีไตข้างเดียว: เพิ่ม 10% · ผู้ฟอกไต/ใส่สายสวน: พิจารณาภาระการรักษา (BOTC) เพิ่ม</li>
    <li>ผลหลายส่วน (บน/ล่าง/diversion/ระบบอื่น) ให้รวมด้วยตารางค่ารวม (Combined Values) · การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์</li>
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
  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(name)}</b><span>ตามคู่มือกองทุนเงินทดแทน ฉบับจัดทำ 4 บทที่ 12 (ตาราง ${ref}) · วันที่ประเมิน ${beToday()}</span>`;
  mountPageKit();
  mountExamples('#secExamples', (CARD_EXAMPLES && CARD_EXAMPLES[key]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 12)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 12',
  });
}
async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}

// ============ การ์ดจัดขั้น × ระดับย่อย (upper/bladder/urethra) ============
function mountLevelCard(key) {
  const T = TABLES[key];
  const state = { cls: 1, lvl: 1, single: false };
  const clsOpt = T.classDesc.map((d, i) => `<option value="${i}">ขั้น ${i} — ${esc(d)}</option>`).join('');
  const egfrBox = T.egfr ? `
    <div class="two">
      <div><label class="fld">eGFR ที่วัดได้ (มล./นาที/1.73 ตร.ม.)</label><input type="number" id="egfr" min="0" max="200" step="1" value="50"></div>
      <div><label class="fld">อายุ (ปี)</label><input type="number" id="age" min="0" max="120" step="1" value="45"></div>
    </div>
    <div class="egfrbox" id="egfrbox"></div>` : '';
  const singleChk = T.egfr ? `<label class="chk"><input type="checkbox" id="single"> ผู้รับการประเมินมีไตเพียงข้างเดียว<span class="add">+10%</span></label>` : '';
  const body = `
  <div class="card sec">
    <h2>ปัจจัยหลัก — จัดขั้นการสูญเสีย (ตาราง ${T.ref})</h2>
    <div class="hint">เลือกขั้นตามลักษณะทางคลินิก ณ ปัจจุบัน ร่วมกับผลตรวจ${T.egfr ? ' และช่วง eGFR (ปรับตามอายุ)' : ''}</div>
    ${egfrBox}
    <label class="fld">ขั้นการสูญเสีย</label>
    <select id="clssel">${clsOpt}</select>
  </div>
  <div class="card sec">
    <h2>ระดับย่อยในขั้น (ความรุนแรง)</h2>
    <div class="hint">ค่าตั้งต้น = ระดับกลาง · ปรับตามความรุนแรงของอาการ/ผลตรวจ (ต่ำ = ดีกว่า · สูง = แย่กว่า)</div>
    <div class="lvls" id="lvls"></div>
    ${singleChk}
  </div>`;
  shell(T.name, T.ref, key, body);

  function renderLvls() {
    const row = T.levels[state.cls];
    if (row.length === 1) { $('lvls').innerHTML = `<div class="lvlbtn on"><div class="ln">ขั้นนี้มีระดับเดียว</div><div class="lv">${row[0]}%</div></div>`; return; }
    $('lvls').innerHTML = row.map((v, i) => `<div class="lvlbtn${state.lvl === i ? ' on' : ''}" data-lv="${i}"><div class="ln">${LEVEL_NAMES[i]}</div><div class="lv">${v}%</div></div>`).join('');
    $('lvls').querySelectorAll('.lvlbtn[data-lv]').forEach(bt => bt.addEventListener('click', () => { state.lvl = Number(bt.dataset.lv); render(); }));
  }
  function render() {
    if (T.egfr) {
      const egfr = Number($('egfr').value) || 0, age = Number($('age').value) || 0;
      const adj = egfrAgeAdjust(age), eff = effectiveEgfr(egfr, age), ec = egfrClass(eff);
      $('egfrbox').innerHTML = `eGFR ${egfr} + ปรับตามอายุ ${adj ? '+' + adj : '0'} = <b>${eff.toFixed(1)}</b> → ช่วง <b>${EGFR_BANDS[ec].label}</b> → แนะนำ <b style="color:var(--navy)">ขั้นที่ ${ec}</b> (เลือกขั้นสุดท้ายด้านล่างโดยพิจารณาอาการร่วม)`;
    }
    const row = T.levels[state.cls];
    if (state.lvl > row.length - 1) state.lvl = row.length === 1 ? 0 : 1;
    renderLvls();
    const r = urinaryResult(T.levels, state.cls, state.lvl);
    const total = r.wpi + (state.single ? 10 : 0);
    const lvlTxt = r.levelName ? `ระดับ${r.levelName}` : 'ระดับเดียว';
    const singleTxt = state.single ? ' + ไตข้างเดียว 10%' : '';
    $('resultBody').innerHTML = `
      <div class="result">
        <div class="rcard"><b>ขั้น ${r.cls}</b><span>${lvlTxt} (ตาราง ${T.ref})</span></div>
        <div class="rcard gold"><b>${total}%</b><span>การสูญเสียทั้งร่างกาย (WPI)</span></div>
      </div>
      <div class="steps">ขั้น ${r.cls} · ${lvlTxt} = ${r.wpi}%${singleTxt} → <b>${total}%</b>${key !== 'upper' && total ? ' · หากมีความผิดปกติหลายส่วนให้รวมด้วยแผงรวมค่า' : ''}</div>`;
  }
  $('clssel').value = '1';
  $('clssel').addEventListener('change', e => { state.cls = Number(e.target.value); render(); });
  if (T.egfr) {
    $('egfr').addEventListener('input', render);
    $('age').addEventListener('input', render);
    $('single').addEventListener('change', e => { state.single = e.target.checked; render(); });
  }
  $('btnCopy').addEventListener('click', e => {
    const r = urinaryResult(T.levels, state.cls, state.lvl);
    const total = r.wpi + (state.single ? 10 : 0);
    const lines = [`สรุปการประเมิน — ${T.name} (คู่มือฯ บทที่ 12 ตาราง ${T.ref}) · วันที่ ${beToday()}`];
    if (T.egfr) { const egfr = Number($('egfr').value) || 0, age = Number($('age').value) || 0; lines.push(`eGFR ${egfr} (อายุ ${age}) → ปรับ = ${effectiveEgfr(egfr, age).toFixed(1)}`); }
    lines.push(`ขั้น ${r.cls}${r.levelName ? ' ระดับ' + r.levelName : ''} = ${r.wpi}%${state.single ? ' + ไตข้างเดียว 10%' : ''}`);
    lines.push(`ผล: การสูญเสียทั้งร่างกาย (WPI) = ${total}%`);
    lines.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    copyText(lines.join('\n'), e.currentTarget);
  });
  $('btnPrint').addEventListener('click', () => window.print());
  render();
}

// ============ การ์ด diversion (12-4) — เลือกวิธี → รวมค่า ============
function mountDiversion() {
  const state = { sel: new Set() };
  const body = `
  <div class="card sec">
    <h2>วิธีการผ่าตัดเปลี่ยนทิศทางเดินปัสสาวะ (ตาราง 12-4)</h2>
    <div class="hint">เลือกวิธีที่ทำ · หากทำมากกว่า 1 วิธี/2 ข้าง จะรวมค่าด้วยตารางค่ารวม (Combined Values)</div>
    ${DIVERSION.map(d => `<label class="chk"><input type="checkbox" data-id="${d.id}"> <span>${esc(d.label)}</span><span class="add">${d.wpi}%</span></label>`).join('')}
    <div class="hint" style="margin-top:12px">หมายเหตุ: ค่านี้ต้องนำไปรวมกับการสูญเสียของระบบทางเดินปัสสาวะส่วนบน/ล่างที่มีร่วมด้วย (ใช้แผงรวมค่าด้านล่าง)</div>
  </div>`;
  shell('การเปลี่ยนทิศทางเดินปัสสาวะ (Urinary Diversion)', '12-4', 'diversion', body);
  function render() {
    const picked = DIVERSION.filter(d => state.sel.has(d.id));
    const vals = picked.map(d => d.wpi);
    const total = combineValues(vals);
    const detail = picked.length ? picked.map(d => `${d.label.split(' (')[0]} ${d.wpi}%`).join(' + ') : 'ยังไม่ได้เลือกวิธี';
    $('resultBody').innerHTML = `
      <div class="result">
        <div class="rcard"><b>${picked.length}</b><span>วิธีที่เลือก</span></div>
        <div class="rcard gold"><b>${total}%</b><span>การสูญเสียจาก diversion (WPI)</span></div>
      </div>
      <div class="steps">${esc(detail)}${picked.length > 1 ? ` → รวมค่า (Combined Values) = <b>${total}%</b>` : (picked.length ? ` → <b>${total}%</b>` : '')}</div>`;
  }
  document.querySelectorAll('input[data-id]').forEach(chk => chk.addEventListener('change', e => {
    if (e.target.checked) state.sel.add(e.target.dataset.id); else state.sel.delete(e.target.dataset.id);
    render();
  }));
  $('btnCopy').addEventListener('click', e => {
    const picked = DIVERSION.filter(d => state.sel.has(d.id));
    const total = combineValues(picked.map(d => d.wpi));
    copyText([`สรุปการประเมิน — การเปลี่ยนทิศทางเดินปัสสาวะ (คู่มือฯ บทที่ 12 ตาราง 12-4) · วันที่ ${beToday()}`,
      'วิธี: ' + (picked.map(d => `${d.label} = ${d.wpi}%`).join(' · ') || '-'),
      `ผล: การสูญเสียจาก diversion = ${total}% (ต้องรวมกับการสูญเสียส่วนบน/ล่างที่มีร่วม)`,
      'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n'), e.currentTarget);
  });
  $('btnPrint').addEventListener('click', () => window.print());
  render();
}

export function mountUrinaryCard(key) {
  if (key === 'diversion') return mountDiversion();
  return mountLevelCard(key);
}
