// multi.js — รวมหลายภาวะทางเลือดในเคสเดียว (เช่น pancytopenia = โลหิตจาง + นิวโตรฟิลต่ำ + เกล็ดเลือดต่ำ)
// เรียก mountHemaMulti() · ผู้ป่วย 1 เคสอาจมีปัจจัยหลักจากหลายตาราง (15-4/15-5/15-9 ฯลฯ)
// แต่ละภาวะประเมินด้วยตารางของตัวเอง (classifyPicks) → ได้ร้อยละฐาน → รวมด้วยตารางค่ารวม
// (Combined Values) → บวก BOTC (ตาราง 15-3 · ใช้ร่วมทั้งเคส เพราะการรักษามักซ้อนกัน) → เพดาน 100%
//
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 15 (กองทุนเงินทดแทน) · ไม่แก้ตัวเลข/ข้อความในตาราง
import { HEMA_TABLES, BOTC_ITEMS } from './engine.js';
import { classifyPicks, GRADE_LETTERS } from '../../shared/classifier.js';
import { combineValues, mountPageKit } from '../../shared/pagekit.js';
import { mountExamples } from '../../shared/example.js';
import { HEMA_MULTI_EXAMPLES } from './multi-examples.js';

const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ภาวะที่พบร่วมกันบ่อย (pancytopenia) → เปิดไว้ให้ตั้งต้น · ที่เหลือยุบไว้
const DEFAULT_OPEN = ['anemia', 'neutropenia', 'platelet'];
const ORDER = ['anemia', 'neutropenia', 'platelet', 'acuteleuk', 'chronicleuk', 'lymphoma', 'hemophilia', 'bleeding', 'thrombosis', 'hiv'];

// factor ที่แยกขั้นได้จริง (ข้อความไม่เหมือนกันทุกขั้น) — ให้ตรงกับ classifier
function discriminates(levels, key) {
  const texts = levels.map(L => (L[key] || '').trim()).filter(Boolean);
  return new Set(texts).size > 1;
}

const CSS = `
.mc-lead{max-width:940px;margin:0 auto;padding:16px 16px 0}
.mc-lead .kick{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dk);font-weight:700}
.mc-lead h1{font-size:21px;margin:4px 0 6px}
.mc-lead p{color:var(--muted);margin:0;font-size:14px}
.mc-warn{background:#fff8ec;border:1px solid #ecd9a8;border-radius:12px;padding:14px 16px;margin-top:14px}
.mc-warn b{color:var(--gold-dk)}
.mc-warn ul{margin:8px 0 0;padding-left:20px}
.mc-warn li{font-size:13.5px;color:#5b5030;margin:4px 0;line-height:1.5}
.mc-h{font-size:16px;color:var(--navy);margin:18px 0 4px;font-weight:700}
.mc-sub{color:var(--muted);font-size:13px;margin-bottom:8px}
.mc-cond{margin-top:10px;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#fff}
.mc-cond>summary{padding:13px 15px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:10px;flex-wrap:wrap}
.mc-cond>summary::-webkit-details-marker{display:none}
.mc-cond>summary::after{content:'▾';margin-left:auto;color:var(--acc)}
.mc-cond[open]>summary::after{content:'▴'}
.mc-cname{font-weight:700;color:var(--navy);font-size:15px}
.mc-cref{font-size:11px;color:var(--muted);font-weight:600}
.mc-cpill{margin-left:auto;font-size:12px;font-weight:800;color:var(--navy);background:var(--line2);border-radius:20px;padding:3px 11px}
.mc-cond[open]>summary .mc-cpill{margin-left:8px}
.mc-cbody{padding:4px 15px 15px;border-top:1px solid var(--line)}
.mc-frow{margin-top:12px}
.mc-flab{font-size:13px;color:#3a4557;font-weight:600;margin-bottom:5px;display:block}
.mc-flab .k{font-size:10.5px;font-weight:800;color:var(--gold-dk);background:#fdf1dd;border-radius:6px;padding:1px 7px;margin-left:6px;letter-spacing:.3px}
.mc-sel{width:100%;padding:10px 11px;border:1px solid var(--line);border-radius:9px;font-size:14px;background:#fff;color:var(--ink);line-height:1.4}
.mc-cres{margin-top:14px;background:var(--line2);border-radius:10px;padding:11px 13px;font-size:13.5px;color:var(--navy)}
.mc-cres b{color:var(--navy)}
.mc-gsel{margin-top:9px;display:flex;align-items:center;gap:9px;flex-wrap:wrap}
.mc-gsel span{font-size:12.5px;color:var(--muted)}
.mc-gsel select{padding:7px 9px;border:1px solid var(--line);border-radius:8px;font-size:14px;background:#fff}
.mc-botc{margin-top:10px}
.mc-brow{display:flex;gap:10px;align-items:center;border:1px solid var(--line);border-radius:11px;padding:10px 12px;margin-top:8px;background:#fff}
.mc-brow .t{font-size:13px;line-height:1.5;color:#3a4557;flex:1}
.mc-brow .t b{color:var(--gold-dk);white-space:nowrap}
.mc-brow input{flex:0 0 auto;width:74px;padding:8px 9px;border:1px solid var(--line);border-radius:9px;font-size:16px;text-align:center}
.mc-result{margin-top:14px}
.mc-rlist{margin:0 0 10px;padding:0;list-style:none}
.mc-rlist li{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-bottom:1px dashed var(--line);font-size:13.5px;color:#3a4557}
.mc-rlist li b{color:var(--navy);white-space:nowrap}
.mc-cards{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:6px}
.mc-card{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
.mc-card b{display:block;font-size:30px;color:var(--navy);line-height:1;font-weight:800}
.mc-card span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
.mc-card.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
.mc-card.gold b{color:var(--gold-lt)}.mc-card.gold span{color:#c8d4e4}
.mc-steps{margin-top:12px;font-size:12.5px;color:var(--muted);line-height:1.6}
.mc-steps code{background:var(--line2);border-radius:6px;padding:1px 6px;color:var(--navy);font-weight:700}
.mc-empty{color:var(--muted);font-size:14px;text-align:center;padding:22px 10px}
.mc-print-head{display:none}
@media(max-width:560px){.mc-cards{grid-template-columns:1fr}}
@media print{@page{margin:14mm}body{background:#fff;font-size:12px}
  .occ-topbar,.occ-back,.occ-home,.occ-reset,.mc-copy,.mc-print,.mc-warn,.cv-wrap{display:none!important}
  .mc-cond:not([open]){display:none}.card,.mc-cond{box-shadow:none;border-color:#ccc;break-inside:avoid}
  .mc-card.gold{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .mc-print-head{display:block;padding:0 0 8px;border-bottom:2px solid var(--navy);margin-bottom:10px}
  .mc-print-head b{font-size:16px;color:var(--navy)}.mc-print-head span{display:block;color:#555;font-size:12px;margin-top:2px}}
`;

const THMON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const beToday = () => { const d = new Date(); return `${d.getDate()} ${THMON[d.getMonth()]} ${d.getFullYear() + 543}`; };

async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}

// ---------- ตรรกะบริสุทธิ์ (เทสต์ได้ผ่าน multi.test.js) ----------
// รวมร้อยละฐานของหลายภาวะด้วยตารางค่ารวม แล้วบวก BOTC (เพดาน 100)
export function combineHema(bases, botcTotal = 0) {
  const cv = combineValues(bases);
  return Math.min(100, cv + Math.round(Number(botcTotal) || 0));
}

export function mountHemaMulti() {
  document.title = 'รวมหลายภาวะทางเลือด | OCCMED';
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  // state: แต่ละภาวะเก็บ picks + gradeOverride · BOTC ใช้ร่วมทั้งเคส
  const state = { cond: {}, botc: {} };
  ORDER.forEach(k => { state.cond[k] = { picks: {}, gradeOverride: null }; });

  const notes = [
    'ใช้เมื่อผู้ป่วย 1 เคสมีความผิดปกติทางเลือดหลายภาวะพร้อมกัน (เช่น pancytopenia = โลหิตจาง + นิวโตรฟิลต่ำ + เกล็ดเลือดต่ำ)',
    'เลือกเฉพาะภาวะที่ผู้ป่วยมีจริง แล้วกรอกผลตรวจของแต่ละภาวะ — ระบบจัดขั้น + ระดับย่อยของแต่ละภาวะให้อัตโนมัติ (ปรับเองได้)',
    'ร้อยละฐานของทุกภาวะถูกรวมด้วยตารางค่ารวม (Combined Values) แล้วจึงบวก BOTC (ผลกระทบจากการรักษาที่ใช้ร่วมทั้งเคส เช่น การให้เลือด/เคมีบำบัด) · เพดานรวม 100%',
    'ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว (maximum medical improvement) · การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์',
  ];

  const condHtml = ORDER.map(k => {
    const T = HEMA_TABLES[k];
    const factors = T.factors.filter(f => f.key === T.keyRow || discriminates(T.levels, f.key));
    const sels = factors.map(f => {
      const isKey = f.key === T.keyRow;
      const optLevels = T.levels.filter(L => (L[f.key] || '').trim());
      const opts = ['<option value="">— ไม่ระบุ —</option>'].concat(optLevels.map(L =>
        `<option value="${L.level}">ขั้น ${L.level} · ${esc(L[f.key])}</option>`)).join('');
      return `<div class="mc-frow">
        <label class="mc-flab">${esc(f.label)}${isKey ? '<span class="k">ใช้จัดขั้น</span>' : ''}</label>
        <select class="mc-sel" data-cond="${k}" data-factor="${esc(f.key)}">${opts}</select>
      </div>`;
    }).join('');
    return `<details class="mc-cond"${DEFAULT_OPEN.includes(k) ? ' open' : ''} data-ck="${k}">
      <summary><span class="mc-cname">${esc(T.titleTh)}</span><span class="mc-cref">ตาราง ${esc(T.ref)}</span><span class="mc-cpill" id="mcPill-${k}">—</span></summary>
      <div class="mc-cbody">
        ${sels}
        <div class="mc-cres" id="mcRes-${k}"></div>
      </div>
    </details>`;
  }).join('');

  const botcHtml = `<div class="mc-botc">${BOTC_ITEMS.map(it => {
    if (it.unit) return `<label class="mc-brow"><span class="t">${esc(it.label)} <b>(+${it.pct}% ต่อ ${esc(it.unit)}${it.cap ? ' · สูงสุด ' + it.cap + '%' : ''})</b></span>
      <input type="number" min="0" step="1" inputmode="numeric" data-botc="${esc(it.id)}" placeholder="จำนวน"></label>`;
    return `<label class="mc-brow"><span class="t">${esc(it.label)} <b>(${it.upto ? 'สูงสุด ' : '+'}${it.pct}%)</b></span>
      <input type="number" min="0" max="${it.pct}" step="1" inputmode="numeric" data-botc="${esc(it.id)}" placeholder="${it.upto ? '0–' + it.pct : it.pct}"></label>`;
  }).join('')}</div>`;

  document.body.innerHTML = `
<div class="mc-print-head" id="mcPrintHead"></div>
<div class="occ-topbar">
  <div class="mark">OC</div>
  <div><b>รวมหลายภาวะทางเลือด</b><small>ระบบโลหิตวิทยา · บทที่ 15</small></div>
  <div class="sp"></div>
  <a class="occ-back" href="/impairment/">← เลือกระบบ</a>
</div>
<div class="mc-lead">
  <div class="kick">สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564)</div>
  <h1>รวมหลายภาวะทางเลือดในเคสเดียว (pancytopenia / MDS ฯลฯ)</h1>
  <p>เลือกภาวะที่ผู้ป่วยมี → กรอกผลตรวจของแต่ละภาวะ → ระบบรวมร้อยละด้วยตารางค่ารวม + BOTC ให้อัตโนมัติ</p>
</div>
<div class="wrap">
  <div class="mc-warn"><b>ข้อควรทราบ</b><ul>${notes.map(n => `<li>${n}</li>`).join('')}</ul></div>

  <div class="mc-h">1) เลือกภาวะที่ผู้ป่วยมี แล้วกรอกผลตรวจ</div>
  <div class="mc-sub">ภาวะที่พบร่วมกันบ่อย (โลหิตจาง · นิวโตรฟิลต่ำ · เกล็ดเลือดต่ำ) เปิดไว้ให้แล้ว · ภาวะอื่นแตะเพื่อเปิด</div>
  ${condHtml}

  <div class="mc-h">2) ผลกระทบจากการรักษา (BOTC · ตาราง 15-3) — ใช้ร่วมทั้งเคส</div>
  <div class="mc-sub">กรอกเฉพาะการรักษาที่ผู้ป่วยได้รับจริง (นับครั้งเดียวต่อเคส แม้จะช่วยหลายภาวะ) → บวกเข้ากับผลรวมท้ายสุด</div>
  <div class="card cl-sec" style="padding:16px">${botcHtml}</div>

  <div class="mc-h">3) ผลรวมการสูญเสียของเคส</div>
  <div class="card cl-sec" style="padding:16px">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      <div class="sp" style="flex:1"></div>
      <button class="btn mc-print" type="button">พิมพ์ / PDF</button>
      <button class="btn gold mc-copy" type="button">คัดลอกสรุปผล</button>
    </div>
    <div class="mc-result" id="mcResult"></div>
  </div>
  <div id="secExamples"></div>
</div>`;

  const $ = id => document.getElementById(id);

  function computeCond(k) {
    const T = HEMA_TABLES[k], c = state.cond[k];
    if (c.picks[T.keyRow] == null) return null;
    return classifyPicks({ levels: T.levels, keyRow: T.keyRow, picks: c.picks, gradeOverride: c.gradeOverride, classMode: 'key', shiftMode: 'unit' });
  }
  function botcTotal() {
    let t = 0;
    for (const it of BOTC_ITEMS) {
      const v = Number(state.botc[it.id]) || 0;
      if (v <= 0) continue;
      t += it.unit ? Math.min(it.cap != null ? it.cap : Infinity, it.pct * v) : clamp(v, 0, it.pct);
    }
    return Math.round(t);
  }
  function activeList() {
    const out = [];
    for (const k of ORDER) { const r = computeCond(k); if (r) out.push({ k, T: HEMA_TABLES[k], r }); }
    return out;
  }

  function renderCond(k) {
    const T = HEMA_TABLES[k], c = state.cond[k], r = computeCond(k);
    const pill = $('mcPill-' + k), res = $('mcRes-' + k);
    if (!r) { pill.textContent = '—'; res.innerHTML = '<span style="color:var(--muted)">ยังไม่ได้เลือกปัจจัยหลัก (ใช้จัดขั้น)</span>'; return; }
    if (r.level === 0) { pill.textContent = '0%'; res.innerHTML = '<b>ขั้นที่ 0</b> — ไม่มีการสูญเสียจากภาวะนี้'; return; }
    pill.textContent = r.percent + '%';
    const L = T.levels.find(x => x.level === r.level);
    const gsel = `<div class="mc-gsel"><span>ระดับย่อยในขั้น (ปรับได้):</span>
      <select data-grade="${k}">${L.grades.map((p, i) =>
        `<option value="${i}"${r.gradeIndex === i ? ' selected' : ''}>${GRADE_LETTERS[i]} · ${p}%${i === r.autoGrade ? ' (auto)' : ''}</option>`).join('')}</select></div>`;
    res.innerHTML = `<b>ขั้นที่ ${r.level} ระดับ ${r.grade}</b> → <b>${r.percent}%</b> <span style="color:var(--muted)">(ช่วงขั้นนี้ ${L.range[0]}–${L.range[1]}%)</span>${gsel}`;
  }

  function renderResult() {
    const act = activeList();
    const bt = botcTotal();
    const el = $('mcResult');
    if (!act.length && bt === 0) { el.innerHTML = '<div class="mc-empty">เลือกภาวะอย่างน้อย 1 ภาวะ (กรอกปัจจัยหลัก) เพื่อดูผลรวม</div>'; return; }
    const bases = act.map(x => x.r.percent);
    const cv = combineValues(bases);
    const final = Math.min(100, cv + bt);
    const rows = act.map(x =>
      `<li><span>${esc(x.T.titleTh)} <span style="color:var(--muted)">(ตาราง ${esc(x.T.ref)} · ขั้น ${x.r.level}${x.r.grade ? ' ' + x.r.grade : ''})</span></span><b>${x.r.percent}%</b></li>`).join('');
    const cvExpr = bases.filter(b => b > 0).sort((a, b) => b - a).join(' ⊕ ') || '—';
    const steps = `รวมด้วยตารางค่ารวม (Combined Values): <code>${cvExpr}</code> = <code>${cv}%</code>`
      + (bt > 0 ? ` &nbsp;·&nbsp; + BOTC <code>${bt}%</code> → <code>${final}%</code>` : '')
      + (final >= 100 && cv + bt > 100 ? ' &nbsp;(ครบเพดาน 100%)' : '');
    el.innerHTML = `
      <ul class="mc-rlist">${rows || '<li><span style="color:var(--muted)">ยังไม่มีภาวะที่มีการสูญเสีย</span><b>0%</b></li>'}</ul>
      <div class="mc-cards">
        <div class="mc-card"><b>${cv}%</b><span>รวมทุกภาวะ (ก่อน BOTC)</span></div>
        <div class="mc-card gold"><b>${final}%</b><span>การสูญเสียทั้งร่างกาย (WPI) รวม BOTC</span></div>
      </div>
      <div class="mc-steps">${steps}</div>`;
  }

  function rerenderAll() { ORDER.forEach(renderCond); renderResult(); }

  document.addEventListener('change', e => {
    const sel = e.target.closest('.mc-sel');
    if (sel) {
      const k = sel.dataset.cond, f = sel.dataset.factor, T = HEMA_TABLES[k];
      state.cond[k].picks[f] = sel.value === '' ? undefined : Number(sel.value);
      if (f === T.keyRow) state.cond[k].gradeOverride = null; // เปลี่ยนขั้น → รีเซ็ตระดับย่อย
      rerenderAll(); return;
    }
    const g = e.target.closest('[data-grade]');
    if (g) { state.cond[g.dataset.grade].gradeOverride = Number(g.value); renderCond(g.dataset.grade); renderResult(); return; }
  });
  document.addEventListener('input', e => {
    if (e.target.dataset && e.target.dataset.botc != null) { state.botc[e.target.dataset.botc] = e.target.value; renderResult(); }
  });

  $('mcPrintHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — รวมหลายภาวะทางเลือด (บทที่ 15)</b><span>สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564) · วันที่ประเมิน ${beToday()}</span>`;

  function buildText() {
    const act = activeList(), bt = botcTotal();
    if (!act.length && bt === 0) return 'ยังไม่ได้เลือกภาวะทางเลือด';
    const bases = act.map(x => x.r.percent);
    const cv = combineValues(bases), final = Math.min(100, cv + bt);
    const out = [`สรุปการประเมินการสูญเสียสมรรถภาพ — รวมหลายภาวะทางเลือด (บทที่ 15) · วันที่ ${beToday()}`];
    for (const x of act) out.push(`- ${x.T.titleTh} (ตาราง ${x.T.ref}): ขั้น ${x.r.level}${x.r.grade ? ' ระดับ ' + x.r.grade : ''} = ${x.r.percent}%`);
    out.push(`รวมด้วยตารางค่ารวม (Combined Values) = ${cv}%`);
    if (bt > 0) out.push(`BOTC (ผลกระทบจากการรักษา ใช้ร่วมทั้งเคส) = +${bt}%`);
    out.push(`การสูญเสียทั้งร่างกาย (WPI) รวม = ${final}%`);
    out.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    return out.join('\n');
  }
  document.querySelector('.mc-copy').addEventListener('click', e => copyText(buildText(), e.currentTarget));
  document.querySelector('.mc-print').addEventListener('click', () => window.print());

  rerenderAll();
  mountPageKit({ combine: false }); // หน้านี้เป็นตัวรวมค่าอยู่แล้ว — ใส่แค่ปุ่มหน้าแรก/เคสใหม่
  mountExamples('#secExamples', HEMA_MULTI_EXAMPLES, {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (pancytopenia จากคู่มือ บทที่ 15)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม · บทที่ 15',
  });
}
