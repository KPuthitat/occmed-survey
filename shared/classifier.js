// classifier.js — การ์ดประเมินแบบ "กรอกผลตรวจ → เลือกขั้นให้อัตโนมัติ" (input-driven)
// ใช้ร่วมทุกระบบที่ใช้แพทเทิร์น ปัจจัยหลัก→ขั้น (class) · ปัจจัยรอง/BOTC→ระดับย่อย (grade)
//
// แนวคิด: แทนที่จะให้แพทย์ "เลือกขั้น" เอง ให้เลือก "ผลตรวจที่ตรงกับผู้ป่วย" ในแต่ละด้าน
//   (ประวัติ/อาการ · การตรวจร่างกาย · ผลแล็บ ฯลฯ) โดยตัวเลือกคือข้อความจริงจากตารางคู่มือ
//   - ปัจจัยหลัก (keyRow) ที่เลือก → กำหนด "ขั้น" อัตโนมัติ
//   - ปัจจัยรองที่เลือก → เลื่อน "ระดับย่อย" = Σ(ขั้นปัจจัยรอง − ขั้นปัจจัยหลัก) ภายในขั้นเดิม
//   - ระดับย่อยยัง "ปรับเองได้" (override) เสมอ
//
// ข้อมูลตัวเลข/ข้อความมาจาก engine ของแต่ละบท — โมดูลนี้ไม่แก้ตัวเลขในตาราง

export const GRADE_LETTERS = ['A', 'B', 'C', 'D', 'E'];
const clamp = (x, lo, hi) => Math.min(hi, Math.max(lo, x));
const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const midIndex = grades => Math.floor(grades.length / 2);

// ---------- ตรรกะบริสุทธิ์ (เทสต์ได้) ----------
// picks = { factorKey: levelNumber } · คืน { level, gradeIndex, percent, grade, range, autoGrade }
// classMode:
//   'key' (ค่าเริ่มต้น) — ขั้น = ปัจจัยหลัก (keyRow) · ระดับย่อยเลื่อนตามปัจจัยรอง = Σ(รอง−หลัก)
//   'max'              — ขั้น = ค่ามากที่สุดในบรรดาด้านที่เลือก · ระดับย่อยตั้งต้นค่ากลาง (ปรับเอง)
export function classifyPicks({ levels, keyRow, picks = {}, gradeOverride = null, classMode = 'key' }) {
  const vals = Object.values(picks).filter(v => v != null).map(Number);
  let keyClass, autoShift = 0;
  if (classMode === 'max') {
    if (!vals.length) return null;
    keyClass = Math.max(...vals);
  } else {
    keyClass = picks[keyRow];
    if (keyClass == null) return null;
    keyClass = Number(keyClass);
    for (const [k, v] of Object.entries(picks)) {
      if (k === keyRow || v == null) continue;
      autoShift += (Number(v) - keyClass);
    }
  }
  const L = levels.find(x => x.level === keyClass);
  if (!L) return null;
  if (L.level === 0) return { level: 0, gradeIndex: null, grade: null, percent: 0, range: L.range || [0, 0], autoGrade: null };
  const mid = midIndex(L.grades);
  const auto = clamp(mid + autoShift, 0, L.grades.length - 1);
  const gi = gradeOverride == null ? auto : clamp(Number(gradeOverride), 0, L.grades.length - 1);
  return {
    level: L.level, gradeIndex: gi, grade: GRADE_LETTERS[gi], percent: L.grades[gi],
    range: L.range, autoGrade: auto, label: L.level + GRADE_LETTERS[gi],
  };
}

// ---------- UI ----------
const CSS = `
.cl-lead{max-width:940px;margin:0 auto;padding:16px 16px 0}
.cl-lead .kick{font-size:12px;letter-spacing:2px;text-transform:uppercase;color:var(--gold-dk);font-weight:700}
.cl-lead h1{font-size:21px;margin:4px 0 6px}
.cl-lead p{color:var(--muted);margin:0;font-size:14px}
.cl-sec{margin-top:16px;padding:16px}
.cl-sec>h2{font-size:16px;color:var(--navy);margin-bottom:2px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.cl-sec .hint{color:var(--muted);font-size:13px;margin-bottom:10px}
.cl-keytag{font-size:10.5px;font-weight:800;color:var(--gold-dk);background:#fdf1dd;border-radius:6px;padding:2px 8px;letter-spacing:.3px}
.cl-warn{background:#fff8ec;border:1px solid #ecd9a8;border-radius:12px;padding:14px 16px;margin-top:14px}
.cl-warn b{color:var(--gold-dk)}
.cl-warn ul{margin:8px 0 0;padding-left:20px}
.cl-warn li{font-size:13.5px;color:#5b5030;margin:4px 0;line-height:1.5}
.cl-opts{display:flex;flex-direction:column;gap:8px}
.cl-opt{display:flex;gap:11px;align-items:flex-start;border:1.5px solid var(--line);border-radius:12px;padding:11px 13px;cursor:pointer;transition:.12s;background:#fff}
.cl-opt:hover{border-color:var(--gold)}
.cl-opt.on{border-color:var(--navy);box-shadow:0 0 0 3px rgba(11,37,69,.08);background:#fbfcfe}
.cl-opt .cl-badge{flex:0 0 auto;width:30px;height:30px;border-radius:8px;background:var(--line2);color:var(--navy);font-weight:800;display:grid;place-items:center;font-size:14px}
.cl-opt.on .cl-badge{background:var(--navy);color:#fff}
.cl-opt .cl-otext{font-size:13px;line-height:1.55;color:#3a4557}
.cl-opt .cl-ohead{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:2px}
.cl-opt .cl-olv{font-weight:800;color:var(--navy);font-size:13px}
.cl-opt .cl-orange{font-size:11.5px;color:var(--muted)}
.cl-opt .cl-nyha{font-size:11px;color:var(--gold-dk);font-weight:700}
.cl-clear{margin-top:8px;font-size:12.5px;color:var(--navy2);background:none;border:none;cursor:pointer;text-decoration:underline;padding:0}
#clGrade{display:none}#clGrade.show{display:block}
.cl-grades{display:grid;gap:8px;margin-top:6px}
.cl-gbtn{border:1.5px solid var(--line);border-radius:11px;padding:11px 6px;text-align:center;cursor:pointer;background:#fff;transition:.12s;position:relative}
.cl-gbtn:hover{border-color:var(--gold)}
.cl-gbtn.on{border-color:var(--navy);background:var(--navy);color:#fff}
.cl-gbtn .gl{font-weight:800;font-size:17px;color:var(--navy);display:block}
.cl-gbtn.on .gl{color:var(--gold-lt)}
.cl-gbtn .gp{font-size:12px;color:var(--muted);margin-top:2px}
.cl-gbtn.on .gp{color:#c8d4e4}
.cl-gbtn .cl-auto{position:absolute;top:-8px;right:-6px;font-size:9.5px;font-weight:800;color:#fff;background:var(--gold-dk);border-radius:10px;padding:1px 6px}
.cl-gnote{font-size:12.5px;color:var(--muted);margin-top:10px;line-height:1.5}
.cl-result{margin-top:14px;display:grid;grid-template-columns:1fr 1fr;gap:12px}
.cl-rcard{background:var(--line2);border-radius:12px;padding:16px;text-align:center}
.cl-rcard b{display:block;font-size:30px;color:var(--navy);line-height:1;font-weight:800}
.cl-rcard.gold{background:linear-gradient(135deg,var(--navy),var(--navy2))}
.cl-rcard.gold b{color:var(--gold-lt)}.cl-rcard.gold span{color:#c8d4e4}
.cl-rcard span{color:var(--muted);font-size:12px;margin-top:6px;display:block;line-height:1.3}
.cl-empty{color:var(--muted);font-size:14px;text-align:center;padding:22px 10px}
.cl-refs{margin-top:6px;border:1px solid var(--line);border-radius:12px;overflow:hidden}
.cl-refs summary{padding:11px 14px;background:var(--line2);font-weight:700;color:var(--navy);cursor:pointer;list-style:none;font-size:14px}
.cl-refs summary::-webkit-details-marker{display:none}
.cl-refs summary::after{content:'▾';float:right;color:var(--acc)}
.cl-refs[open] summary::after{content:'▴'}
.cl-refrow{display:flex;gap:12px;padding:11px 14px;border-top:1px solid var(--line)}
.cl-refrow .cls{flex:0 0 42px;font-weight:800;color:var(--navy);font-size:15px;text-align:center}
.cl-refrow .txt{font-size:12.5px;color:var(--ink);line-height:1.5}
.cl-print-note{margin-top:12px;font-size:12px;color:var(--muted)}
.cl-print-head{display:none}
@media(max-width:560px){.cl-result{grid-template-columns:1fr}}
@media print{@page{margin:14mm}body{background:#fff;font-size:12px}
  .occ-topbar,.occ-back,.occ-home,.occ-reset,.cl-copy,.cl-print,.cl-warn,.cl-refs,.cl-clear{display:none!important}
  .cl-opt:not(.on){display:none}.cl-gbtn:not(.on){display:none}
  .card,.cl-sec{box-shadow:none;border-color:#ccc;break-inside:avoid}.cl-rcard.gold{-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .cl-print-head{display:block;padding:0 0 8px;border-bottom:2px solid var(--navy);margin-bottom:10px}
  .cl-print-head b{font-size:16px;color:var(--navy)}.cl-print-head span{display:block;color:#555;font-size:12px;margin-top:2px}}
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

// factor ที่ "แยกขั้นได้จริง" (ข้อความไม่เหมือนกันทุกขั้น) — ถ้าเหมือนหมดและไม่ใช่ key ให้ข้าม
function isDiscriminating(levels, key) {
  const texts = levels.map(L => (L[key] || '').trim()).filter(Boolean);
  if (texts.length < 2) return false;
  return new Set(texts).size > 1;
}

// opts: { titleTh, subtitleTh, ref, chapter, output, outputLabel, keyRow, levels,
//         factors:[{key,label}], nyhaKey, refs:[{title,rows:[{cls,text}]}],
//         notes:[..], examples, examplesOpts, mountExamples, mountPageKit }
export function mountClassifier(opts) {
  const { levels, keyRow } = opts;
  const classMode = opts.classMode || 'key';
  const factors = (opts.factors || []).filter(f => f.key === keyRow || classMode === 'max' || isDiscriminating(levels, f.key));
  const outLabel = opts.outputLabel || ({ wpi: 'การสูญเสียทั้งร่างกาย (WPI)', arm: 'ร้อยละของแขน (Upper Extremity)', leg: 'ร้อยละของขา (Lower Extremity)' }[opts.output] || 'ร้อยละการสูญเสีย');
  const isExtremity = opts.output === 'arm' || opts.output === 'leg';
  document.title = `${opts.titleTh} | OCCMED`;
  const st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  const state = { picks: {}, gradeOverride: null };

  const refsHtml = (opts.refs || []).map(r =>
    `<details class="cl-refs" style="margin-top:8px"><summary>${esc(r.title)}</summary>
     ${r.rows.map(x => `<div class="cl-refrow"><div class="cls">${esc(x.cls)}</div><div class="txt">${esc(x.text)}</div></div>`).join('')}</details>`).join('');

  const notesHtml = (opts.notes || [
    'ประเมินเมื่ออาการคงที่ ได้รับการรักษาอย่างเหมาะสมเต็มที่แล้ว (maximum medical improvement)',
    'เลือก “ผลตรวจที่ตรงกับผู้ป่วย” ในแต่ละด้าน — ระบบจะจัดขั้นและระดับย่อยให้อัตโนมัติ แล้วปรับเองได้',
    'การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน',
  ]).map(n => `<li>${n}</li>`).join('');

  const factorSections = factors.map(f => {
    const isKey = classMode === 'max' ? true : f.key === keyRow;
    const showInfo = isKey; // แสดงขั้น/ช่วง% บนตัวเลือกด้านที่ใช้จัดขั้น
    const optionLevels = levels.filter(L => (L[f.key] || '').trim());
    const rows = optionLevels.map(L => {
      const rangeTxt = L.level === 0 ? '0%' : `${L.range[0]}–${L.range[1]}%`;
      const nyha = (showInfo && L.nyha && L.nyha !== '—') ? `<span class="cl-nyha">NYHA ${L.nyha}</span>` : '';
      const head = showInfo ? `<div class="cl-ohead"><span class="cl-olv">ขั้นที่ ${L.level}</span><span class="cl-orange">${rangeTxt}</span>${nyha}</div>` : '';
      return `<div class="cl-opt" data-factor="${esc(f.key)}" data-level="${L.level}">
        <div class="cl-badge">${L.level}</div>
        <div><div class="cl-otext">${head}${esc(L[f.key])}</div></div></div>`;
    }).join('');
    const tag = isKey ? `<span class="cl-keytag">${classMode === 'max' ? 'ใช้จัดขั้น (ค่าสูงสุด)' : 'ใช้จัดขั้นอัตโนมัติ'}</span>` : '';
    const hint = classMode === 'max'
      ? 'เลือกผลที่ตรงกับผู้ป่วย → ระบบใช้ขั้นสูงสุดของทุกด้านเป็นขั้นความรุนแรง'
      : (isKey ? 'เลือกผลที่ตรงกับผู้ป่วย → กำหนดขั้นความรุนแรงให้อัตโนมัติ' : 'เลือกถ้ามีข้อมูล → ใช้ปรับระดับย่อยภายในขั้น (ไม่บังคับ)');
    return `<div class="card cl-sec">
      <h2>${esc(f.label)}${tag}</h2>
      <div class="hint">${hint}</div>
      <div class="cl-opts">${rows}</div>
      <button class="cl-clear" data-clear="${esc(f.key)}" type="button">ล้างการเลือกด้านนี้</button>
    </div>`;
  }).join('');

  document.body.innerHTML = `
<div class="cl-print-head" id="clPrintHead"></div>
<div class="occ-topbar">
  <div class="mark">OC</div>
  <div><b>${esc(opts.titleTh)}</b><small>${esc(opts.subtitleTh || '')}${opts.ref ? ' · ตาราง ' + esc(opts.ref) : ''}</small></div>
  <div class="sp"></div>
  <a class="occ-back" href="/impairment/">← เลือกระบบ</a>
</div>
<div class="cl-lead">
  <div class="kick">${esc(opts.chapter || 'กองทุนเงินทดแทน · ฉบับจัดทำ 4')}</div>
  <h1>เครื่องคำนวณการสูญเสียสมรรถภาพ — ${esc(opts.titleTh)}</h1>
  <p>กรอกผลตรวจ (ประวัติ · การตรวจร่างกาย · แล็บ) แล้วระบบเลือกขั้น + ระดับย่อยให้อัตโนมัติ (ปรับเองได้)</p>
</div>
<div class="wrap">
  <div class="cl-warn"><b>ข้อควรทราบ</b><ul>${notesHtml}</ul></div>
  ${refsHtml ? `<div class="card cl-sec"><h2>ข้อมูลอ้างอิงประกอบ</h2>${refsHtml}</div>` : ''}
  ${factorSections}
  <div class="card cl-sec" id="clGrade">
    <h2>ระดับย่อยภายในขั้น (ปรับเองได้)</h2>
    <div class="hint" id="clGradeHint"></div>
    <div class="cl-grades" id="clGrades"></div>
    <div class="cl-gnote">ระบบตั้งค่าให้อัตโนมัติจากปัจจัยรอง (ป้าย “auto”) · แตะเพื่อปรับเอง · A = น้อยที่สุดในขั้น</div>
  </div>
  <div class="card cl-sec">
    <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
      <h2 style="margin:0">ผลการประเมิน</h2><div class="sp" style="flex:1"></div>
      <button class="btn cl-print" type="button">พิมพ์ / PDF</button>
      <button class="btn gold cl-copy" type="button">คัดลอกสรุปผล</button>
    </div>
    <div id="clResult" style="margin-top:10px"></div>
    <div class="cl-print-note">การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน</div>
  </div>
  <div id="secExamples"></div>
</div>`;

  const $ = id => document.getElementById(id);
  const compute = () => classifyPicks({ levels, keyRow, picks: state.picks, gradeOverride: state.gradeOverride, classMode });

  function renderOpts() {
    document.querySelectorAll('.cl-opt').forEach(el => {
      const on = state.picks[el.dataset.factor] === Number(el.dataset.level);
      el.classList.toggle('on', on);
    });
  }
  function renderGrades() {
    const r = compute();
    if (!r || r.level === 0) { $('clGrade').classList.remove('show'); return; }
    $('clGrade').classList.add('show');
    const L = levels.find(x => x.level === r.level);
    $('clGradeHint').textContent = `ขั้นที่ ${r.level} · ช่วง ${L.range[0]}–${L.range[1]}% · แตะระดับเพื่อปรับ`;
    $('clGrades').style.gridTemplateColumns = `repeat(${L.grades.length},1fr)`;
    $('clGrades').innerHTML = L.grades.map((p, i) =>
      `<div class="cl-gbtn${r.gradeIndex === i ? ' on' : ''}" data-grade="${i}">${i === r.autoGrade ? '<span class="cl-auto">auto</span>' : ''}<span class="gl">${GRADE_LETTERS[i]}</span><div class="gp">${p}%</div></div>`).join('');
  }
  function renderResult() {
    const r = compute();
    if (!r) { $('clResult').innerHTML = `<div class="cl-empty">${classMode === 'max' ? 'เลือกผลตรวจอย่างน้อย 1 ด้านเพื่อดูผล' : 'เลือกผลตรวจของ “ปัจจัยหลัก” (ป้าย <b>ใช้จัดขั้นอัตโนมัติ</b>) เพื่อดูผล'}</div>`; return; }
    const lbl = r.level === 0 ? 'ขั้นที่ 0 (ไม่มีการสูญเสีย)' : `ขั้นที่ ${r.level} ระดับ ${r.grade}`;
    $('clResult').innerHTML = `
      <div class="cl-result">
        <div class="cl-rcard"><b>${lbl.replace('ขั้นที่ ', '')}</b><span>${r.level === 0 ? 'ไม่มีการสูญเสีย' : 'ขั้น/ระดับที่ประเมินได้'}</span></div>
        <div class="cl-rcard gold"><b>${r.percent}%</b><span>${esc(outLabel)}</span></div>
      </div>
      <div class="cl-gnote" style="margin-top:12px">${esc(opts.titleTh)} — ${lbl} → <b style="color:var(--navy)">${r.percent}%</b> ${esc(outLabel)}${r.level === 0 ? '' : ` (อยู่ในช่วง ${r.range[0]}–${r.range[1]}% ของขั้น)`}${isExtremity ? ' · ต้องแปลงเป็น % ทั้งร่างกายแล้วรวมด้วย Combined Values' : ''}</div>`;
  }
  function rerender() { renderOpts(); renderGrades(); renderResult(); }

  document.addEventListener('click', e => {
    const opt = e.target.closest('.cl-opt');
    if (opt) {
      const f = opt.dataset.factor, lv = Number(opt.dataset.level);
      state.picks[f] = state.picks[f] === lv ? undefined : lv;
      if (f === keyRow) state.gradeOverride = null; // เปลี่ยนขั้น → รีเซ็ต override
      rerender(); return;
    }
    const clr = e.target.closest('[data-clear]');
    if (clr) { state.picks[clr.dataset.clear] = undefined; if (clr.dataset.clear === keyRow) state.gradeOverride = null; rerender(); return; }
    const g = e.target.closest('.cl-gbtn');
    if (g) { state.gradeOverride = Number(g.dataset.grade); renderGrades(); renderResult(); return; }
  });

  $('clPrintHead').innerHTML = `<b>สรุปการประเมินการสูญเสียสมรรถภาพ — ${esc(opts.titleTh)}</b><span>${esc(opts.chapter || '')}${opts.ref ? ' (ตาราง ' + esc(opts.ref) + ')' : ''} · วันที่ประเมิน ${beToday()}</span>`;

  function buildText() {
    const r = compute();
    if (!r) return 'ยังไม่ได้เลือกผลตรวจของปัจจัยหลัก';
    const lbl = r.level === 0 ? 'ขั้นที่ 0 (ไม่มีการสูญเสีย)' : `ขั้นที่ ${r.level} ระดับ ${r.grade}`;
    const out = [];
    out.push(`สรุปการประเมินการสูญเสียสมรรถภาพ — ${opts.titleTh}${opts.ref ? ' (ตาราง ' + opts.ref + ')' : ''} · วันที่ ${beToday()}`);
    // สรุปผลตรวจที่เลือก
    for (const f of factors) {
      const lv = state.picks[f.key];
      if (lv == null) continue;
      const L = levels.find(x => x.level === lv);
      out.push(`- ${f.label}: [ขั้น ${lv}] ${L[f.key]}`);
    }
    out.push(`ขั้นความรุนแรง: ${lbl}`);
    out.push(`${outLabel} = ${r.percent}%`);
    if (isExtremity) out.push('หมายเหตุ: เป็นร้อยละของอวัยวะ ต้องแปลงเป็น % ทั้งร่างกายแล้วรวมด้วยตารางค่ารวม (Combined Values)');
    out.push('การตัดสินขั้นสุดท้ายอยู่ที่ดุลยพินิจของแพทย์ผู้ประเมิน');
    return out.join('\n');
  }
  document.querySelector('.cl-copy').addEventListener('click', e => copyText(buildText(), e.currentTarget));
  document.querySelector('.cl-print').addEventListener('click', () => window.print());

  rerender();
  if (opts.mountPageKit) opts.mountPageKit();
  if (opts.mountExamples) opts.mountExamples('#secExamples', opts.examples || [], opts.examplesOpts || {});
  return { state, compute };
}
