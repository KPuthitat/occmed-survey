// pagekit.js — ปุ่มหน้าแรก (home) + แผงรวมค่า (Combined Values) ใช้ร่วมทุกหน้าคำนวณ
// เรียก mountPageKit() ท้ายการเรนเดอร์หน้า · idempotent (เรียกซ้ำไม่เพิ่มซ้ำ)
// combine:false → ใส่เฉพาะปุ่มหน้าแรก (เช่น หน้าเครื่องรวมค่าเอง)

const HOME_ICON = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.6V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.6"/></svg>';

// สูตรตารางค่ารวม: A + B(100−A)/100 เรียงมาก→น้อย เพดาน 100
export function combineValues(vals) {
  const v = vals.map(Number).filter(x => x > 0).sort((a, b) => b - a);
  if (!v.length) return 0;
  let acc = v[0];
  for (let i = 1; i < v.length; i++) acc = acc + v[i] * (100 - acc) / 100;
  return Math.min(100, acc);
}
function combineSteps(vals) {
  const v = vals.map(Number).filter(x => x > 0).sort((a, b) => b - a);
  const steps = []; if (!v.length) return { total: 0, v, steps };
  let acc = v[0];
  for (let i = 1; i < v.length; i++) { const b = v[i], a = acc, na = acc + b * (100 - acc) / 100; steps.push({ a, b, na }); acc = na; }
  return { total: Math.min(100, acc), v, steps };
}

function addHome() {
  const bar = document.querySelector('.occ-topbar');
  if (!bar || bar.querySelector('.occ-home')) return;
  const a = document.createElement('a');
  a.className = 'occ-home'; a.href = '/'; a.title = 'หน้าแรก OCCMED';
  a.innerHTML = HOME_ICON + '<span>หน้าแรก</span>';
  const back = bar.querySelector('.occ-back');
  if (back) bar.insertBefore(a, back); else bar.appendChild(a);
}

async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) { try { const ta = document.createElement('textarea'); ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta); } catch (e2) {} }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'ไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}

function addCombine() {
  const wrap = document.querySelector('.wrap');
  if (!wrap || wrap.querySelector('.cv-wrap')) return;
  const el = document.createElement('div');
  el.id = 'secCombine';
  el.innerHTML = `<details class="ex-wrap cv-wrap">
    <summary class="ex-sum">รวมค่าการสูญเสีย (Combined Values)<span class="ex-count">สูตร A + B(100−A)/100</span></summary>
    <div class="cv-body">
      <div class="cv-hint">ใส่ค่าร้อยละการสูญเสียของแต่ละรายการ (เช่น จากหลายอวัยวะ/หลายระบบ) แล้วระบบรวมให้ตามตารางค่ารวม โดยไม่ต้องออกไปหน้าอื่น</div>
      <div class="cv-rows"></div>
      <button class="btn cv-add" type="button" style="margin-top:8px">+ เพิ่มค่า</button>
      <div class="cv-result" style="margin-top:12px"></div>
      <button class="btn gold cv-copy" type="button" style="margin-top:12px">คัดลอกผลรวม</button>
    </div>
  </details>`;
  const ex = document.getElementById('secExamples');
  if (ex) wrap.insertBefore(el, ex); else wrap.appendChild(el);

  let values = ['', ''];
  const q = s => el.querySelector(s);
  function renderRows() {
    q('.cv-rows').innerHTML = values.map((val, i) => `<div class="cv-row">
      <div class="cv-idx">${i + 1}</div>
      <input type="number" min="0" max="100" inputmode="numeric" data-cvi="${i}" value="${val}" placeholder="ร้อยละ (0–100)">
      ${values.length > 1 ? `<button class="cv-rm" data-cvrm="${i}" type="button" title="ลบ">×</button>` : ''}
    </div>`).join('');
  }
  function renderResult() {
    const { total, v, steps } = combineSteps(values);
    const rounded = Math.round(total);
    const nn = x => (x % 1 ? +x.toFixed(2) : x);
    const frac = (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`;
    const eq = '<span class="feq">=</span>';
    const res = (x, hl) => `<span class="fres${hl ? ' hl' : ''}">${x}</span>`;
    const item = (label, def, calc) => `<div class="fitem"><div class="fdef">${def}</div><div class="fcalc"><span class="flabel">${label}</span>${calc}</div></div>`;
    let sheet;
    if (!v.length) sheet = '<div class="fmeta">ยังไม่มีค่าที่มากกว่า 0</div>';
    else if (steps.length === 0) sheet = `<div class="fmeta">มีค่าเดียว: <b>${v[0]}</b>% → ค่ารวม = ${v[0]}%</div>`;
    else sheet = `<div class="fmeta">เรียงมาก→น้อย: <b>${v.join(', ')}</b></div>`
      + steps.map((s, i) => item(i + 1 === steps.length ? 'รวม' : `ขั้น ${i + 1}`,
        `A = ${nn(s.a)} · B = ${s.b}`,
        `${eq} ${nn(s.a)} + ${frac(`${s.b} × (100 − ${nn(s.a)})`, 100)} ${eq} ${res(nn(s.na) + '%', i + 1 === steps.length)}`)).join('');
    q('.cv-result').innerHTML = `<div class="result"><div class="rcard gold"><b>${rounded}%</b><span>ค่ารวม (Combined Values) ของทั้งร่างกาย</span></div></div><div class="fsheet" style="margin-top:12px">${sheet}</div>`;
  }
  el.addEventListener('input', e => { if (e.target.dataset.cvi != null) { values[Number(e.target.dataset.cvi)] = e.target.value; renderResult(); } });
  el.addEventListener('click', e => {
    if (e.target.closest('.cv-add')) { values.push(''); renderRows(); renderResult(); return; }
    const rm = e.target.closest('[data-cvrm]'); if (rm) { values.splice(Number(rm.dataset.cvrm), 1); renderRows(); renderResult(); return; }
    const cp = e.target.closest('.cv-copy'); if (cp) {
      e.preventDefault();
      const { total, v } = combineSteps(values);
      const txt = v.length ? `รวมค่าการสูญเสีย (Combined Values): ${v.join(' + ')} → ${Math.round(total)}% ของทั้งร่างกาย (สูตร A + B(100−A)/100)` : 'ยังไม่มีค่าที่มากกว่า 0';
      copyText(txt, cp);
    }
  });
  renderRows(); renderResult();
}

export function mountPageKit(opts = {}) {
  addHome();
  if (opts.combine !== false) addCombine();
}
