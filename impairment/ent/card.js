// card.js — UI ร่วมของการ์ดรายโรค โสต ศอ นาสิก (บทที่ 7)
// mountStepCard('vestibular'|'facial'|'airway') · mountVoiceCard() · mountSwallowCard() · mountOtherCard()
import { ENT_STEP_TABLES, stepAdjust, voiceResult, VOICE_VALUES, SWALLOW, CAP_OTHER } from './engine.js';
import { mountExamples } from '/shared/example.js';
import { mountPageKit } from '/shared/pagekit.js';
import { CARD_EXAMPLES } from './examples.js';

const CSS = `
  .lead{max-width:940px;margin:0 auto;padding:16px 16px 0}
  .lead .kick{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dk);font-weight:700}
  .lead h1{font-size:21px;margin:4px 0 6px}
  .lead p{color:var(--muted);margin:0;font-size:14px}
  .sec{margin-top:16px;padding:16px}
  .sec>h2{font-size:16px;color:var(--navy);margin-bottom:2px}
  .sec .hint{color:var(--muted);font-size:13px;margin-bottom:10px}
  .warn{background:#fff8ec;border:1px solid #ecd9a8;border-radius:12px;padding:14px 16px;margin-top:14px}
  .warn b{color:var(--gold-dk)}.warn ul{margin:8px 0 0;padding-left:20px}
  .warn li{font-size:13.5px;color:#5b5030;margin:4px 0;line-height:1.5}
  .levels{display:flex;flex-direction:column;gap:10px;margin-top:6px}
  .lvl{border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;transition:.12s;background:#fff}
  .lvl:hover{border-color:var(--gold)}
  .lvl.on{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,37,69,.08)}
  .lvl .lhead{display:flex;align-items:center;gap:10px}
  .lvl .badge{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--line2);color:var(--navy);font-weight:800;display:grid;place-items:center;font-size:15px}
  .lvl.on .badge{background:var(--navy);color:#fff}
  .lvl .ltitle{font-weight:700;color:var(--navy);font-size:14.5px}
  .lvl .ldesc{font-size:12.5px;color:#3a4557;line-height:1.5;margin-top:3px}
  .lvl .lrange{margin-left:auto;font-size:12.5px;color:var(--muted);white-space:nowrap;font-weight:700}
  .nk{margin-top:14px}.nk.hide{display:none}
  .nkrow{margin-bottom:12px}
  .nkrow label{display:block;font-weight:600;font-size:13px;color:var(--navy2);margin-bottom:5px}
  select{width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;background:#fff;font-size:15px}
  .comp3{display:grid;gap:12px}
  .toggle{display:flex;align-items:flex-start;gap:9px;font-size:14px;cursor:pointer;background:#fff8ec;border:1px solid #ecd9a8;border-radius:10px;padding:10px 12px;margin-bottom:12px}
  .toggle input{margin-top:2px}
  .steps{background:var(--bg);border:1px dashed var(--line);border-radius:10px;padding:11px 14px;margin-top:12px;font-size:13px;line-height:1.7;color:var(--navy2)}
  .steps b{color:var(--navy)}
  .result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
  .rcard b{display:block;font-size:32px;color:var(--navy);line-height:1;font-weight:800}
  .rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
  .rcard.gold b{color:var(--gold-lt)}.rcard.gold span{color:#c8d4e4}
  .rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
  .print-note{margin-top:12px;font-size:12px;color:var(--muted)}
  .print-head{display:none}
  @media(max-width:560px){.result{grid-template-columns:1fr}}
  @media print{@page{margin:14mm}body{background:#fff;font-size:12px}
    .occ-topbar,.occ-back,#btnCopy,#btnPrint,.warn{display:none!important}.lvl:not(.on){display:none}
    .card,.sec{box-shadow:none;border-color:#ccc;break-inside:avoid}.rcard.gold{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .print-head{display:block;padding:0 0 8px;border-bottom:2px solid var(--navy);margin-bottom:10px}
    .print-head b{font-size:16px;color:var(--navy)}.print-head span{display:block;color:#555;font-size:12px;margin-top:2px}}
`;
const THMON = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
const beToday = () => { const d = new Date(); return `${d.getDate()} ${THMON[d.getMonth()]} ${d.getFullYear() + 543}`; };
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const $ = id => document.getElementById(id);

function shell(titleTh, ref, note, bodyHtml, exampleKey) {
  document.title = `${titleTh} — โสต ศอ นาสิก | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar"><div class="mark">OC</div>
  <div><b>${esc(titleTh)}</b><small>โสต ศอ นาสิก · ตาราง ${ref}</small></div>
  <div class="sp"></div><a class="occ-back" href="/impairment/">← เลือกระบบ</a></div>
<div class="lead">
  <div class="kick">สำนักงานกองทุนเงินทดแทน · ฉบับจัดทำ 4 (พ.ศ. 2564)</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(titleTh)}</h1>
  <p>อ้างอิงตาราง ${ref}</p>
</div>
<div class="wrap">
  <div class="warn"><b>ข้อควรทราบ</b><ul>
    <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาเต็มที่แล้ว</li>
    ${note ? `<li>${esc(note)}</li>` : ''}
    <li>ผลหลายหน้าที่/ระบบ ให้รวมด้วยตารางค่ารวม (Combined Values) ไม่บวกกันตรงๆ</li>
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
  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(titleTh)}</b><span>ตามคู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม) บทที่ 7 (ตาราง ${ref}) · วันที่ประเมิน ${beToday()}</span>`;
  mountPageKit();
  mountExamples('#secExamples', (CARD_EXAMPLES && CARD_EXAMPLES[exampleKey]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 7)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม · บทที่ 7',
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
const resultCards = (bigTop, bigBottom, subTop, subBottom) => `
  <div class="result">
    <div class="rcard"><b>${bigTop}</b><span>${subTop}</span></div>
    <div class="rcard gold"><b>${bigBottom}</b><span>${subBottom}</span></div>
  </div>`;

// ============ การ์ด step-adjust (7-4/7-5/7-6) ============
export function mountStepCard(key) {
  const T = ENT_STEP_TABLES[key];
  const keyRow = T.rows.find(r => r.isKey);
  const nonKeyRows = T.rows.filter(r => !r.isKey);
  const state = { keyClass: null, nk: {}, override: false };
  nonKeyRows.forEach(r => state.nk[r.key] = null);

  const body = `
  ${T.override ? `<label class="toggle" style="margin-top:14px"><input type="checkbox" id="ov"> <span>${esc(T.override.label)} → <b>ร้อยละ ${T.override.value}</b> ของทั้งร่างกาย</span></label>` : ''}
  <div class="card sec" id="secKey">
    <h2>${esc(keyRow.label)} → จัดขั้น (ตาราง ${T.ref})</h2>
    <div class="hint">แตะเลือกขั้นที่ตรงกับผู้ป่วย (ปัจจัยหลัก)</div>
    <div class="levels" id="levels"></div>
  </div>
  <div class="card sec nk hide" id="secNk">
    <h2>ปัจจัยรอง → ปรับระดับภายในขั้น</h2>
    <div class="hint">ค่าเริ่มต้น = ค่ากลางของขั้น · ปรับด้วย Σ(ขั้นปัจจัยรอง − ขั้นปัจจัยหลัก)</div>
    <div id="nkBody"></div>
  </div>`;
  shell(T.titleTh, T.ref, T.note, body, key);

  function renderLevels() {
    $('levels').innerHTML = keyRow.desc.map((d, i) => {
      const vals = T.classValues[i];
      const rng = i === 0 ? '0%' : `${vals[0]}–${vals[vals.length - 1]}%`;
      return `<div class="lvl${state.keyClass === i ? ' on' : ''}" data-k="${i}">
        <div class="lhead"><div class="badge">${i}</div><div class="ltitle">ขั้นที่ ${i}</div><div class="lrange">${rng}</div></div>
        <div class="ldesc">${esc(d)}</div></div>`;
    }).join('');
  }
  function renderNk() {
    const show = state.keyClass != null && state.keyClass > 0 && !state.override;
    $('secNk').classList.toggle('hide', !show);
    if (!show) return;
    $('nkBody').innerHTML = nonKeyRows.map(r => `
      <div class="nkrow"><label>${esc(r.label)}</label>
        <select data-nk="${r.key}">${r.desc.map((d, i) => `<option value="${i}" ${state.nk[r.key] === i ? 'selected' : ''}>ขั้น ${i} — ${esc(d)}</option>`).join('')}</select></div>`).join('');
  }
  function compute() {
    if (state.override) return { value: T.override.value, override: true };
    if (state.keyClass == null) return null;
    const nkClasses = nonKeyRows.map(r => state.nk[r.key] == null ? state.keyClass : state.nk[r.key]);
    return { ...stepAdjust(T.classValues, state.keyClass, nkClasses), nkClasses };
  }
  function renderResult() {
    const r = compute();
    if (!r) { $('resultBody').innerHTML = `<div class="hint">เลือกขั้น (ปัจจัยหลัก) ด้านบนเพื่อดูผล</div>`; return; }
    if (r.override) {
      $('resultBody').innerHTML = resultCards('25%', '25%', 'เจาะคอ/stoma ถาวร', 'การสูญเสียทั้งร่างกาย (WPI)')
        + `<div class="steps">เจาะคอ (Tracheostomy) / stoma ถาวรเพื่อหายใจ → <b>ร้อยละ 25</b> ของทั้งร่างกาย (ตาราง ${T.ref})</div>`;
      return;
    }
    if (r.class === 0) { $('resultBody').innerHTML = resultCards('0', '0%', 'ขั้นที่ 0', 'การสูญเสียทั้งร่างกาย (WPI)'); return; }
    const adj = r.adjuster > 0 ? `+${r.adjuster}` : `${r.adjuster}`;
    $('resultBody').innerHTML = resultCards(`ขั้น ${r.class}`, `${r.value}%`, `ค่าเบื้องต้น ${r.initial}% · ปรับ ${adj}`, 'การสูญเสียทั้งร่างกาย (WPI)')
      + `<div class="steps">ปัจจัยหลัก ขั้น ${r.class} (ค่าเบื้องต้น <b>${r.initial}%</b>) · ตัวปรับ = ${adj}${r.highest ? ' (ขั้นสูงสุด ใช้ รอง+1−หลัก)' : ''} → <b>${r.value}%</b> ของทั้งร่างกาย</div>`;
  }
  document.addEventListener('click', e => {
    const lv = e.target.closest('.lvl');
    if (lv) { state.keyClass = Number(lv.dataset.k); nonKeyRows.forEach(r => state.nk[r.key] = state.keyClass); renderLevels(); renderNk(); renderResult(); }
  });
  document.addEventListener('change', e => {
    if (e.target.id === 'ov') { state.override = e.target.checked; $('secKey').style.opacity = state.override ? .5 : 1; renderNk(); renderResult(); }
    if (e.target.dataset && e.target.dataset.nk) { state.nk[e.target.dataset.nk] = Number(e.target.value); renderResult(); }
  });
  wireCopy(() => {
    const r = compute(); if (!r) return 'ยังไม่ได้เลือกขั้น';
    const L = [`สรุป — ${T.titleTh} (คู่มือฯ บทที่ 7 ตาราง ${T.ref}) · วันที่ ${beToday()}`];
    if (r.override) L.push('เจาะคอ/stoma ถาวร → การสูญเสียทั้งร่างกาย (WPI) = 25%');
    else if (r.class === 0) L.push('ขั้นที่ 0 → 0%');
    else L.push(`ปัจจัยหลัก ขั้น ${r.class} (เบื้องต้น ${r.initial}%) ตัวปรับ ${r.adjuster >= 0 ? '+' : ''}${r.adjuster} → การสูญเสียทั้งร่างกาย (WPI) = ${r.value}%`);
    L.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    return L.join('\n');
  });
  renderLevels(); renderNk(); renderResult();
}

// ============ การ์ดเสียง/พูด (7-8) ============
export function mountVoiceCard() {
  const state = { audibility: 0, intelligibility: 0, functional: 0, objective: 0 };
  const opt = (v, sel) => `<option value="${v}" ${v === sel ? 'selected' : ''}>ขั้น ${v}</option>`;
  const sel = (id, label) => `<div class="nkrow"><label>${label}</label><select data-v="${id}">${[0, 1, 2, 3, 4].map(v => opt(v, state[id])).join('')}</select></div>`;
  const body = `
  <div class="card sec">
    <h2>องค์ประกอบเสียง/พูด (ตาราง 7-8)</h2>
    <div class="hint">ให้ขั้นแต่ละองค์ประกอบ (0–4) · ปัจจัยหลัก = องค์ประกอบที่ขั้นสูงสุด</div>
    <div class="comp3">
      ${sel('audibility', 'ความดังของเสียง (Audibility)')}
      ${sel('intelligibility', 'ความชัดเจน (Intelligibility)')}
      ${sel('functional', 'ความคล่อง/ประสิทธิภาพ (Functional efficiency)')}
      ${sel('objective', 'การตรวจ objective (Strobovideolaryngoscope / VHI)')}
    </div>
  </div>`;
  shell('เสียงและการพูด (Voice & Speech)', '7-8', 'ปกติ: พูดต่อเนื่อง > 10 วินาที หรือประโยค ≥ 10 คำโดยไม่หยุดหายใจ · ≥ 75–100 คำ/นาที · นับ 1→100 ได้ใน 2 นาที', body, 'voice');

  function renderResult() {
    const r = voiceResult(state, state.objective);
    if (r.key === 0) { $('resultBody').innerHTML = resultCards('0', '0%', 'ไม่มีการสูญเสีย', 'การสูญเสียทั้งร่างกาย (WPI)'); return; }
    $('resultBody').innerHTML = resultCards(`ขั้น ${r.key}`, `${r.value}%`, `องค์ประกอบสูงสุด = ขั้น ${r.key}`, 'การสูญเสียทั้งร่างกาย (WPI)')
      + `<div class="steps">ปัจจัยหลัก = องค์ประกอบขั้นสูงสุด (ขั้น ${r.key}) · ปรับด้วยผลตรวจ objective และองค์ประกอบที่ขั้นเท่ากัน → <b>${r.value}%</b> ของทั้งร่างกาย</div>`;
  }
  document.addEventListener('change', e => { if (e.target.dataset && e.target.dataset.v) { state[e.target.dataset.v] = Number(e.target.value); renderResult(); } });
  wireCopy(() => {
    const r = voiceResult(state, state.objective);
    return [`สรุป — เสียงและการพูด (คู่มือฯ บทที่ 7 ตาราง 7-8) · วันที่ ${beToday()}`,
      `ความดัง ขั้น ${state.audibility} · ความชัด ขั้น ${state.intelligibility} · ความคล่อง ขั้น ${state.functional} · objective ขั้น ${state.objective}`,
      `การสูญเสียทั้งร่างกาย (WPI) = ${r.value}%`,
      'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n');
  });
  renderResult();
}

// ============ การ์ดการเคี้ยว/กลืน (7-7) ============
export function mountSwallowCard() {
  const state = { food: null, sub: 0 };
  const body = `
  <div class="card sec">
    <h2>ประเภทอาหารที่ผู้ป่วยรับได้ (ตาราง 7-7)</h2>
    <div class="hint">เลือกประเภทอาหาร แล้วเลือกระดับความจำกัดภายในกลุ่ม</div>
    <div class="levels" id="foods"></div>
    <div class="nk hide" id="subWrap" style="margin-top:12px"><div class="nkrow"><label>ระดับภายในกลุ่ม</label><select id="sub"></select></div></div>
  </div>`;
  shell('การเคี้ยวและการกลืน', '7-7', 'เลือกค่าตามความจำกัดของชนิดอาหารที่รับได้', body, 'swallow');

  function renderFoods() {
    $('foods').innerHTML = SWALLOW.map(s => {
      const rng = s.values.length > 1 ? `${s.values[0]}–${s.values[s.values.length - 1]}%` : `${s.values[0]}%`;
      return `<div class="lvl${state.food === s.id ? ' on' : ''}" data-f="${s.id}">
        <div class="lhead"><div class="badge">${s.values[0]}</div><div class="ltitle">${esc(s.label)}</div><div class="lrange">${rng}</div></div></div>`;
    }).join('');
  }
  function renderSub() {
    const s = SWALLOW.find(x => x.id === state.food);
    const show = s && s.values.length > 1;
    $('subWrap').classList.toggle('hide', !show);
    if (show) $('sub').innerHTML = s.values.map((v, i) => `<option value="${i}" ${state.sub === i ? 'selected' : ''}>${v}%</option>`).join('');
  }
  function value() { const s = SWALLOW.find(x => x.id === state.food); if (!s) return null; return s.values[Math.min(state.sub, s.values.length - 1)]; }
  function renderResult() {
    const v = value();
    if (v == null) { $('resultBody').innerHTML = `<div class="hint">เลือกประเภทอาหารด้านบนเพื่อดูผล</div>`; return; }
    const s = SWALLOW.find(x => x.id === state.food);
    $('resultBody').innerHTML = resultCards(`${v}%`, `${v}%`, esc(s.label), 'การสูญเสียทั้งร่างกาย (WPI)');
  }
  document.addEventListener('click', e => { const f = e.target.closest('.lvl'); if (f) { state.food = f.dataset.f; state.sub = 0; renderFoods(); renderSub(); renderResult(); } });
  document.addEventListener('change', e => { if (e.target.id === 'sub') { state.sub = Number(e.target.value); renderResult(); } });
  wireCopy(() => { const v = value(); if (v == null) return 'ยังไม่ได้เลือก'; const s = SWALLOW.find(x => x.id === state.food); return [`สรุป — การเคี้ยวและการกลืน (คู่มือฯ บทที่ 7 ตาราง 7-7) · วันที่ ${beToday()}`, `${s.label}`, `การสูญเสียทั้งร่างกาย (WPI) = ${v}%`, 'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n'); });
  renderFoods(); renderSub(); renderResult();
}

// ============ การ์ดการได้กลิ่น-รู้รส / เสียงในหู (เพดาน ≤5%) ============
export function mountOtherCard() {
  const state = { olfaction: 0, tinnitus: 0 };
  const num = (id, label, cap) => `<div class="nkrow"><label>${label} (0–${cap}%)</label>
    <input type="number" min="0" max="${cap}" step="1" data-o="${id}" value="${state[id]}" style="width:100%;padding:9px 11px;border:1px solid var(--line);border-radius:9px;font-size:15px"></div>`;
  const body = `
  <div class="card sec">
    <h2>การได้กลิ่น-รู้รส / เสียงในหู (Tinnitus)</h2>
    <div class="hint">แต่ละอย่างมีเพดานการสูญเสียไม่เกินร้อยละ 5 ของทั้งร่างกาย · ให้ค่าตามผลกระทบต่อชีวิตประจำวัน แล้วรวมด้วย Combined Values</div>
    ${num('olfaction', 'การได้กลิ่น-รู้รส (Olfaction/Taste)', CAP_OTHER.olfaction)}
    ${num('tinnitus', 'เสียงในหู (Tinnitus)', CAP_OTHER.tinnitus)}
  </div>`;
  shell('การได้กลิ่น-รู้รส / เสียงในหู', '7 §ซ,ฌ', 'ไม่มีเกณฑ์แบ่งขั้นชัดเจน · เพดานอย่างละ ≤ ร้อยละ 5', body, 'other');

  const clampV = (v, cap) => Math.max(0, Math.min(cap, Number(v) || 0));
  function renderResult() {
    const o = clampV(state.olfaction, CAP_OTHER.olfaction), t = clampV(state.tinnitus, CAP_OTHER.tinnitus);
    $('resultBody').innerHTML = resultCards(`${o}%`, `${t}%`, 'การได้กลิ่น-รู้รส', 'เสียงในหู (Tinnitus)')
      + `<div class="steps">แต่ละค่าเป็นการสูญเสียทั้งร่างกาย (เพดาน ≤5%) · นำไปรวมกับการสูญเสียอื่นด้วยตารางค่ารวม (Combined Values)</div>`;
  }
  document.addEventListener('input', e => { if (e.target.dataset && e.target.dataset.o) { state[e.target.dataset.o] = e.target.value; renderResult(); } });
  wireCopy(() => { const o = clampV(state.olfaction, 5), t = clampV(state.tinnitus, 5); return [`สรุป — การได้กลิ่น-รู้รส / เสียงในหู (คู่มือฯ บทที่ 7) · วันที่ ${beToday()}`, `การได้กลิ่น-รู้รส = ${o}% · เสียงในหู (Tinnitus) = ${t}%`, 'นำไปรวมด้วยตารางค่ารวม (Combined Values)', 'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน'].join('\n'); });
  renderResult();
}
