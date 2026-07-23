// card.js — UI ร่วมของการ์ดรายโรคหัวใจ (บทที่ 10) · เรียก mountCardioCard('<key>')
// key = คีย์ใน CARDIO_TABLES (htn, pvdArm, pvdLeg, valve, hf, pericard, arrhythmia, pulmhtn)
import { CARDIO_TABLES, gradeResult, GRADE_LETTERS } from './engine.js';
import { mountExamples } from '/shared/example.js';
import { CARDIO_EXAMPLES } from './examples.js';

const CSS = `
  .lead{max-width:940px;margin:0 auto;padding:16px 16px 0}
  .lead .kick{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dk);font-weight:700}
  .lead h1{font-size:21px;margin:4px 0 6px}
  .lead p{color:var(--muted);margin:0;font-size:14px}
  .sec{margin-top:16px;padding:16px}
  .sec>h2{font-size:16px;color:var(--navy);margin-bottom:2px}
  .sec .hint{color:var(--muted);font-size:13px;margin-bottom:10px}
  .warn{background:#fff8ec;border:1px solid #ecd9a8;border-radius:12px;padding:14px 16px;margin-top:14px}
  .warn b{color:var(--gold-dk)}
  .warn ul{margin:8px 0 0;padding-left:20px}
  .warn li{font-size:13.5px;color:#5b5030;margin:4px 0;line-height:1.5}
  .levels{display:flex;flex-direction:column;gap:10px;margin-top:6px}
  .lvl{border:1.5px solid var(--line);border-radius:12px;padding:12px 14px;cursor:pointer;transition:.12s;background:#fff}
  .lvl:hover{border-color:var(--gold)}
  .lvl.on{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,37,69,.08)}
  .lvl .lhead{display:flex;align-items:center;gap:10px}
  .lvl .badge{flex:0 0 auto;width:34px;height:34px;border-radius:9px;background:var(--line2);color:var(--navy);font-weight:800;display:grid;place-items:center;font-size:15px}
  .lvl.on .badge{background:var(--navy);color:#fff}
  .lvl .ltitle{font-weight:700;color:var(--navy);font-size:14.5px}
  .lvl .lrange{margin-left:auto;font-size:12.5px;color:var(--muted);white-space:nowrap}
  .lvl .lnyha{font-size:11.5px;color:var(--gold-dk);font-weight:700}
  .lvl .crit{margin-top:9px;display:none;font-size:12.5px;line-height:1.55;color:#3a4557}
  .lvl.on .crit{display:block}
  .lvl .crit dl{margin:0;display:grid;grid-template-columns:auto 1fr;gap:4px 8px}
  .lvl .crit dt{color:var(--navy2);font-weight:700;white-space:nowrap}
  .lvl .crit dt.key{color:var(--gold-dk)}
  .lvl .crit dd{margin:0}
  .keytag{display:inline-block;font-size:10px;font-weight:700;color:var(--gold-dk);background:#fdf1dd;border-radius:5px;padding:1px 6px;margin-left:6px;vertical-align:middle}
  #secGrade{display:none}#secGrade.show{display:block}
  .grades{display:grid;gap:8px;margin-top:6px}
  .gbtn{border:1.5px solid var(--line);border-radius:11px;padding:12px 6px;text-align:center;cursor:pointer;background:#fff;transition:.12s}
  .gbtn:hover{border-color:var(--gold)}
  .gbtn.on{border-color:var(--navy);background:var(--navy);color:#fff}
  .gbtn .gl{font-weight:800;font-size:17px;color:var(--navy);display:block}
  .gbtn.on .gl{color:var(--gold-lt)}
  .gbtn .gp{font-size:12.5px;color:var(--muted);margin-top:2px}
  .gbtn.on .gp{color:#c8d4e4}
  .gnote{font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.5}
  .result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
  .rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
  .rcard b{display:block;font-size:32px;color:var(--navy);line-height:1;font-weight:800}
  .rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
  .rcard.gold b{color:var(--gold-lt)}.rcard.gold span{color:#c8d4e4}
  .rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
  .empty{color:var(--muted);font-size:14px;text-align:center;padding:22px 10px}
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
const ROWS = [['nyha', 'NYHA'], ['history', 'ประวัติ'], ['exam', 'ตรวจร่างกาย'], ['lab', 'ตรวจเพิ่มเติม']];
const OUT = { wpi: 'การสูญเสียทั้งร่างกาย (WPI)', arm: 'ร้อยละของแขน (Upper Extremity)', leg: 'ร้อยละของขา (Lower Extremity)' };

export function mountCardioCard(key) {
  const T = CARDIO_TABLES[key];
  if (!T) throw new Error('ไม่พบตาราง ' + key);
  document.title = `${T.titleTh} — หัวใจและหลอดเลือด | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);
  const state = { level: null, grade: 0 };
  const isExtremity = T.output !== 'wpi';

  const warnExtra = isExtremity
    ? `<li><b>ผลเป็นร้อยละของ${T.output === 'arm' ? 'แขน' : 'ขา'}</b> (ไม่ใช่ทั้งร่างกาย) — ต้องแปลงเป็น % ทั้งร่างกายแล้วรวมด้วยตารางค่ารวม (Combined Values) ตามบทที่ 1–2 ก่อนใช้</li>`
    : '';

  document.body.innerHTML = `
<div class="print-head" id="printHead"></div>
<div class="occ-topbar">
  <div class="mark">OC</div>
  <div><b>${esc(T.titleTh)}</b><small>หัวใจและหลอดเลือด · ตาราง ${T.ref}</small></div>
  <div class="sp"></div>
  <a class="occ-back" href="/impairment/">← เลือกระบบ</a>
</div>
<div class="lead">
  <div class="kick">กองทุนเงินทดแทน · ฉบับจัดทำ 4</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(T.titleTh)}</h1>
  <p>เลือกขั้นความรุนแรง (ตาราง ${T.ref}) แล้วเลือกระดับย่อย → ร้อยละการสูญเสีย · <b>คำนวณล้วน ไม่บันทึกข้อมูล</b></p>
</div>
<div class="wrap">
  <div class="warn">
    <b>ข้อควรทราบ</b>
    <ul>
      <li>ประเมินเมื่ออาการคงที่ ได้รับการรักษาอย่างเหมาะสมเต็มที่แล้ว (maximum medical improvement)</li>
      <li>จัดขั้นจาก <b>ปัจจัยหลัก (key factor)</b> แล้วปรับระดับย่อยด้วยปัจจัยรองภายในขั้นเดิม</li>
      ${warnExtra}
      <li>การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</li>
    </ul>
  </div>
  <div class="card sec">
    <h2>ขั้นความรุนแรง (ตาราง ${T.ref})</h2>
    <div class="hint">แตะเลือกขั้นที่ตรงกับผู้ป่วย · แถบ <span class="keytag">key</span> คือปัจจัยหลักที่ใช้จัดขั้น</div>
    <div class="levels" id="levels"></div>
  </div>
  <div class="card sec" id="secGrade">
    <h2>ระดับย่อยภายในขั้น</h2>
    <div class="hint" id="gradeHint"></div>
    <div class="grades" id="grades"></div>
    <div class="gnote">A = น้อยที่สุดในขั้น · ค่าตรงตามตาราง ${T.ref}</div>
  </div>
  <div class="card sec">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h2 style="margin:0">ผลการประเมิน</h2><div class="sp" style="flex:1"></div>
      <button class="btn" id="btnPrint">พิมพ์ / PDF</button>
      <button class="btn gold" id="btnCopy">คัดลอกสรุปผล</button>
    </div>
    <div id="resultBody" style="margin-top:10px"></div>
    <div class="print-note">การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</div>
  </div>
  <div id="secExamples"></div>
</div>`;

  const $ = id => document.getElementById(id);
  const critHtml = L => `<dl>${ROWS.filter(([k]) => L[k] && L[k] !== '—').map(([k, lab]) =>
    `<dt class="${k === T.keyRow ? 'key' : ''}">${lab}${k === T.keyRow ? ' *' : ''}</dt><dd>${esc(L[k])}</dd>`).join('')}</dl>`;

  function renderLevels() {
    $('levels').innerHTML = T.levels.map(L => {
      const on = state.level === L.level ? ' on' : '';
      const rangeTxt = L.level === 0 ? '0%' : `${L.range[0]}–${L.range[1]}%`;
      const nyha = L.nyha && L.nyha !== '—' ? `<div class="lnyha">NYHA class ${L.nyha}</div>` : '';
      return `<div class="lvl${on}" data-level="${L.level}">
        <div class="lhead"><div class="badge">${L.level}</div>
          <div><div class="ltitle">ขั้นที่ ${L.level}${L.level === 0 ? ' — ไม่มีการสูญเสีย' : ''}</div>${nyha}</div>
          <div class="lrange">${rangeTxt}</div></div>
        <div class="crit">${critHtml(L)}</div></div>`;
    }).join('');
  }
  function renderGrades() {
    const L = T.levels.find(x => x.level === state.level);
    if (!L || L.level === 0) { $('secGrade').classList.remove('show'); return; }
    $('secGrade').classList.add('show');
    $('gradeHint').textContent = `ขั้นที่ ${L.level} · ช่วง ${L.range[0]}–${L.range[1]}% · เลือกระดับย่อยตามปัจจัยรอง`;
    $('grades').style.gridTemplateColumns = `repeat(${L.grades.length},1fr)`;
    $('grades').innerHTML = L.grades.map((p, i) =>
      `<div class="gbtn${state.grade === i ? ' on' : ''}" data-grade="${i}"><span class="gl">${GRADE_LETTERS[i]}</span><div class="gp">${p}%</div></div>`).join('');
  }
  function renderResult() {
    if (state.level == null) { $('resultBody').innerHTML = `<div class="empty">เลือกขั้นความรุนแรงด้านบนเพื่อดูผล</div>`; return; }
    const r = gradeResult(T.levels, state.level, state.grade);
    const lbl = r.level === 0 ? 'ขั้นที่ 0 (ไม่มีการสูญเสีย)' : `ขั้นที่ ${r.level} ระดับ ${r.gradeLetter} (${r.label})`;
    $('resultBody').innerHTML = `
      <div class="result">
        <div class="rcard"><b>${r.level === 0 ? '0' : r.label}</b><span>${lbl}</span></div>
        <div class="rcard gold"><b>${r.percent}%</b><span>${OUT[T.output]}</span></div>
      </div>
      <div class="gnote" style="margin-top:12px">${esc(T.titleTh)} — ${lbl} → <b style="color:var(--navy)">${r.percent}%</b> ${OUT[T.output]}${r.level === 0 ? '' : ` (อยู่ในช่วง ${r.range[0]}–${r.range[1]}% ของขั้น)`}${isExtremity ? ' · ต้องแปลงเป็น % ทั้งร่างกายแล้วรวมด้วย Combined Values' : ''}</div>`;
  }

  document.addEventListener('click', e => {
    const lvl = e.target.closest('.lvl');
    if (lvl) { state.level = Number(lvl.dataset.level); state.grade = 0; renderLevels(); renderGrades(); renderResult(); return; }
    const g = e.target.closest('.gbtn');
    if (g) { state.grade = Number(g.dataset.grade); renderGrades(); renderResult(); }
  });

  $('printHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(T.titleTh)}</b><span>ตามคู่มือกองทุนเงินทดแทน ฉบับจัดทำ 4 บทที่ 10 (ตาราง ${T.ref}) · วันที่ประเมิน ${beToday()}</span>`;

  function buildText() {
    if (state.level == null) return 'ยังไม่ได้เลือกขั้นความรุนแรง';
    const r = gradeResult(T.levels, state.level, state.grade);
    const lbl = r.level === 0 ? 'ขั้นที่ 0 (ไม่มีการสูญเสีย)' : `ขั้นที่ ${r.level} ระดับ ${r.gradeLetter} (${r.label})`;
    const L = [];
    L.push(`สรุปการประเมินการสูญเสียสมรรถภาพ — ${T.titleTh} (คู่มือฯ บทที่ 10 ตาราง ${T.ref}) · วันที่ ${beToday()}`);
    L.push(`ขั้นความรุนแรง: ${lbl}`);
    L.push(`${OUT[T.output]} = ${r.percent}%`);
    if (isExtremity) L.push('หมายเหตุ: เป็นร้อยละของอวัยวะ ต้องแปลงเป็น % ทั้งร่างกายแล้วรวมด้วยตารางค่ารวม (Combined Values)');
    L.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    return L.join('\n');
  }
  async function copyText(txt, btn) {
    let ok = false;
    try { await navigator.clipboard.writeText(txt); ok = true; }
    catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
    const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
    setTimeout(() => btn.textContent = old, 1600);
  }
  $('btnCopy').addEventListener('click', e => copyText(buildText(), e.currentTarget));
  $('btnPrint').addEventListener('click', () => window.print());

  renderLevels(); renderGrades(); renderResult();
  mountExamples('#secExamples', (CARDIO_EXAMPLES && CARDIO_EXAMPLES[key]) || [], {
    title: 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ บทที่ 10)',
    source: 'ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) ฉบับจัดทำ 4 บทที่ 10',
  });
}
