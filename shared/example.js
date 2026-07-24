// example.js — ตัวเรนเดอร์ "โจทย์ตัวอย่าง + วิธีทำ" ใช้ร่วมทุกโมดูล (static, ไม่มี build)
// ใช้ formula-sheet classes ใน shared/theme.css · เรียก mountExamples(target, list, opts)
//
// รูปแบบข้อมูลแต่ละตัวอย่าง (จากคู่มือ ถอดความจากภาพหน้า ไม่ใช่ .txt):
//   { tag:'ตัวอย่างที่ 6.1', title:'...', ans:'VSI 4%',
//     problem:'ข้อความโจทย์ (หลายบรรทัดได้)',
//     solution:'HTML วิธีทำ (ใช้ helper fx.* ได้)',
//     plain:'ข้อความวิธีทำแบบตัวอักษรล้วน (สำหรับคัดลอก)',
//     answer:'ข้อความคำตอบ' }

const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const brs = s => esc(s).replace(/\n/g, '<br>');

// helper สร้าง formula-sheet (ให้ examples.js ใช้เขียนวิธีทำแบบสูตร)
export const fx = {
  frac: (num, den) => `<span class="frac"><span class="num">${num}</span><span class="den">${den}</span></span>`,
  eq: '<span class="feq">=</span>',
  sub: t => `<span class="fsub">${t}</span>`,
  note: t => `<span class="fnote">${t}</span>`,
  res: (v, hl) => `<span class="fres${hl ? ' hl' : ''}">${v}</span>`,
  item: (label, def, calc) => `<div class="fitem"><div class="fdef">${def}</div><div class="fcalc"><span class="flabel">${label}</span>${calc}</div></div>`,
  sheet: items => `<div class="fsheet">${items.join('')}</div>`,
  meta: t => `<div class="fmeta">${t}</div>`,
};

async function copyText(txt, btn) {
  let ok = false;
  try { await navigator.clipboard.writeText(txt); ok = true; }
  catch (e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta);
    } catch (e2) {}
  }
  const old = btn.textContent; btn.textContent = ok ? 'คัดลอกแล้ว' : 'คัดลอกไม่สำเร็จ';
  setTimeout(() => btn.textContent = old, 1600);
}

function copyOf(ex) {
  const L = [];
  L.push(`${ex.tag || 'ตัวอย่าง'}${ex.title ? ' — ' + ex.title : ''}`);
  L.push('');
  L.push('โจทย์:');
  L.push(String(ex.problem || '').trim());
  L.push('');
  L.push('วิธีทำ:');
  L.push(String(ex.plain || '').trim());
  if (ex.answer) { L.push(''); L.push('คำตอบ: ' + String(ex.answer).trim()); }
  L.push('');
  L.push('ที่มา: คู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (พ.ศ. 2564) · สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม');
  return L.join('\n');
}

// target: element หรือ selector · list: อาเรย์ตัวอย่าง · opts: { title, source }
export function mountExamples(target, list, opts = {}) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el || !Array.isArray(list) || !list.length) return;
  const title = opts.title || 'ดูโจทย์ตัวอย่าง + วิธีทำ (จากคู่มือ)';
  const source = opts.source || '';

  const rows = list.map((ex, i) => {
    const tag = esc(ex.tag || ('ตัวอย่างที่ ' + (i + 1)));
    const pill = ex.ans ? `<span class="ex-pill">${esc(ex.ans)}</span>` : '';
    const answer = ex.answer ? `<div class="ex-block ex-answer"><div class="ex-h">คำตอบ</div><div class="ex-ans">${brs(ex.answer)}</div></div>` : '';
    return `<details class="ex-q"${list.length === 1 ? ' open' : ''}>
      <summary class="ex-qsum"><span class="ex-tag">${tag}</span><span class="ex-title">${esc(ex.title || '')}</span>${pill}</summary>
      <div class="ex-body">
        <div class="ex-block"><div class="ex-h">โจทย์</div><div class="ex-text">${brs(ex.problem)}</div></div>
        <div class="ex-block"><div class="ex-h">วิธีทำ</div><div class="ex-text">${ex.solution || ''}</div></div>
        ${answer}
        <button class="btn ex-copy" type="button" data-ex="${i}">คัดลอกโจทย์ + วิธีทำ</button>
      </div>
    </details>`;
  }).join('');

  el.innerHTML = `<details class="ex-wrap">
    <summary class="ex-sum">${esc(title)}<span class="ex-count">${list.length} ข้อ</span></summary>
    ${source ? `<div class="ex-src">${esc(source)}</div>` : ''}
    <div class="ex-list">${rows}</div>
  </details>`;

  el.addEventListener('click', e => {
    const btn = e.target.closest('.ex-copy');
    if (!btn) return;
    e.preventDefault();
    copyText(copyOf(list[Number(btn.dataset.ex)] || {}), btn);
  });
}
