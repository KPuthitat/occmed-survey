// shared/registry.js — จุดเดียวที่ประกาศโมดูล + กลุ่ม + บท (chapter) ของ OCCMED
// โครงสร้าง: หน้าแรก (/) แสดง "กลุ่ม" → กลุ่มประเมินฯ (/impairment/) แสดงการ์ด "รายโรค" จัดกลุ่มตามบท (ระบบอวัยวะ)
// เพิ่มโรคใหม่ = เพิ่ม object ใน MODULES ที่เดียว (ระบุ group + chapter)
// status: 'ready' = พร้อมใช้ · 'wip' = กำลังพัฒนา

// ---------- ไอคอน SVG (เส้น navy · ไม่ใช้อิโมจิ) ----------
const IC = {
  factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9l-7 4.5V9l-7 4.5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M6 18h.01M10 18h.01M14 18h.01M18 18h.01"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-5l-2.5 7-5-16L7 12H2"/></svg>',
  stomach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v1.5C9 8 7.2 8.6 5.9 10A5.5 5.5 0 0 0 12 20a6 6 0 0 0 6-6c0-2.4-1.1-3.9-2.5-4.9-1.2-.8-1.9-1.6-1.9-3.1"/><path d="M15.8 6.8 17.5 8"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M6.5 12.5a3.5 3.5 0 1 1 7 0c0 1.6-1 2.2-1 3.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>',
  combine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"/><circle cx="12" cy="12" r="3"/></svg>',
  lung: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v8"/><path d="M12 11c-.6-1.4-2-2-3.3-2"/><path d="M12 11c.6-1.4 2-2 3.3-2"/><path d="M8.7 9C6.4 9 5 11 5 14.2c0 3.3.9 5.8 3.2 5.8 1.7 0 2.6-1.3 2.6-3.4V11.4C10.8 9.9 9.9 9 8.7 9Z"/><path d="M15.3 9c2.3 0 3.7 2 3.7 5.2 0 3.3-.9 5.8-3.2 5.8-1.7 0-2.6-1.3-2.6-3.4V11.4C13.2 9.9 14.1 9 15.3 9Z"/></svg>',
};

// ---------- กลุ่มบนหน้าแรก ----------
// single:true = กลุ่มที่มีโมดูลเดียว → การ์ดลิงก์ตรงเข้าโมดูล (ไม่มีหน้าแยกระบบ)
export const GROUPS = [
  {
    id: 'survey',
    nameTh: 'เดินสำรวจสถานประกอบการ',
    desc: 'Walk-through survey — ประเมินสิ่งคุกคาม ความเสี่ยง และวางแผนตรวจสุขภาพ ทำงานร่วมกันแบบเรียลไทม์',
    icon: IC.factory,
    path: '/walkthrough/',
    single: true,
  },
  {
    id: 'impairment',
    nameTh: 'ประเมินการสูญเสียสมรรถภาพถาวร',
    desc: 'คำนวณร้อยละการสูญเสียสมรรถภาพ (WPI) ตามคู่มือกองทุนเงินทดแทน ฉบับจัดทำ 4 — กดเข้าไปเลือกระบบอวัยวะ',
    icon: IC.pulse,
    path: '/impairment/',
  },
];

// ---------- บท (ระบบอวัยวะ) ในกลุ่มประเมินการสูญเสียฯ — ใช้เป็นหัวข้อ section ในหน้า /impairment/ ----------
export const CHAPTERS = [
  { id: 'eye', nameTh: 'ระบบจักษุ', ref: 'บทที่ 6', icon: IC.eye },
  { id: 'ent', nameTh: 'โสต ศอ นาสิก', ref: 'บทที่ 7', icon: IC.ear },
  { id: 'resp', nameTh: 'ระบบทางเดินหายใจ', ref: 'บทที่ 9', icon: IC.lung },
  { id: 'cardio', nameTh: 'ระบบหัวใจและหลอดเลือด', ref: 'บทที่ 10', icon: IC.heart },
  { id: 'gi', nameTh: 'ระบบทางเดินอาหาร', ref: 'บทที่ 11', icon: IC.stomach },
  { id: 'tools', nameTh: 'เครื่องมือร่วม', ref: '', icon: IC.combine },
];

// ---------- โมดูลทั้งหมด (group = กลุ่มหน้าแรก · chapter = บท/ระบบอวัยวะ) ----------
export const MODULES = [
  {
    id: 'walkthrough', group: 'survey',
    nameTh: 'เดินสำรวจสถานประกอบการ',
    desc: 'Walk-through survey — ประเมินสิ่งคุกคาม ความเสี่ยง และวางแผนตรวจสุขภาพ ทำงานร่วมกันแบบเรียลไทม์',
    path: '/walkthrough/', icon: IC.factory, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบจักษุ (บท 6) ----
  {
    id: 'impairment-eye', group: 'impairment', chapter: 'eye',
    nameTh: 'ระดับสายตา + ลานสายตา',
    desc: 'ระดับสายตา + ลานสายตา → VSI → WPI (ตาราง 6-1..6-8) พร้อมไดอะแกรมลานสายตาแบบแตะ',
    path: '/impairment/eye/', icon: IC.eye, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-eye-adnexa', group: 'impairment', chapter: 'eye',
    nameTh: 'ภาพซ้อน / หนังตา / น้ำตา',
    desc: 'การสูญเสียอื่นๆ ของตา → VAS → VSI → WPI (ตาราง 6-7)',
    path: '/impairment/eye-adnexa/', icon: IC.eye, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-eye-orbit', group: 'impairment', chapter: 'eye',
    nameTh: 'รูปลักษณ์เบ้าตา / สูญเสียลูกตา',
    desc: 'รูปลักษณ์เบ้าตา → WPI 11–23% + รวมสูญเสียลูกตา (ตาราง 6-9)',
    path: '/impairment/eye-orbit/', icon: IC.eye, status: 'ready', requiresLogin: false,
  },

  // ---- โสต ศอ นาสิก (บท 7) ----
  {
    id: 'impairment-ent', group: 'impairment', chapter: 'ent',
    nameTh: 'การได้ยิน (Hearing)',
    desc: 'audiogram → DSHL → Binaural → WPI (ตาราง 7-1..7-3)',
    path: '/impairment/ent/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-vestibular', group: 'impairment', chapter: 'ent',
    nameTh: 'การทรงตัว (Vestibular)',
    desc: 'ปัจจัยหลัก/รอง → ขั้น 0–4 → WPI (ตาราง 7-4)',
    path: '/impairment/ent-vestibular/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-facial', group: 'impairment', chapter: 'ent',
    nameTh: 'ใบหน้า / รูปลักษณ์',
    desc: 'ความผิดปกติ/เสียรูปลักษณ์ใบหน้า → ขั้น 0–4 → WPI (ตาราง 7-5)',
    path: '/impairment/ent-facial/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-airway', group: 'impairment', chapter: 'ent',
    nameTh: 'ทางเดินหายใจส่วนบน',
    desc: 'อาการเหนื่อย → ขั้น 0–4 · เจาะคอ=25% (ตาราง 7-6)',
    path: '/impairment/ent-airway/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-swallow', group: 'impairment', chapter: 'ent',
    nameTh: 'การเคี้ยว-กลืน',
    desc: 'ชนิดอาหารที่รับได้ → WPI 5–50% (ตาราง 7-7)',
    path: '/impairment/ent-swallow/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-voice', group: 'impairment', chapter: 'ent',
    nameTh: 'เสียงและการพูด',
    desc: 'ความดัง/ชัด/คล่อง → ขั้น 0–4 → WPI (ตาราง 7-8)',
    path: '/impairment/ent-voice/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-ent-other', group: 'impairment', chapter: 'ent',
    nameTh: 'การได้กลิ่น-รส / เสียงในหู',
    desc: 'เพดาน ≤5% ต่ออย่าง (บท 7 §ซ,ฌ)',
    path: '/impairment/ent-other/', icon: IC.ear, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบหัวใจและหลอดเลือด (บท 10) ----
  {
    id: 'impairment-cardio', group: 'impairment', chapter: 'cardio',
    nameTh: 'โรคหลอดเลือดหัวใจ (CAD)',
    desc: 'NYHA + ขั้น 0–5 → WPI (ตาราง 10-1/10-4/10-5)',
    path: '/impairment/cardio/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-htn', group: 'impairment', chapter: 'cardio',
    nameTh: 'ภาวะความดันโลหิตสูง',
    desc: 'ขั้น 0–3 (การควบคุมความดัน) → WPI (ตาราง 10-8)',
    path: '/impairment/cardio-htn/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-pvd-arm', group: 'impairment', chapter: 'cardio',
    nameTh: 'หลอดเลือดส่วนปลาย — แขน',
    desc: 'ขั้น 0–4 → ร้อยละของแขน (ตาราง 10-10)',
    path: '/impairment/cardio-pvd-arm/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-pvd-leg', group: 'impairment', chapter: 'cardio',
    nameTh: 'หลอดเลือดส่วนปลาย — ขา',
    desc: 'ขั้น 0–4 (ABI) → ร้อยละของขา (ตาราง 10-11)',
    path: '/impairment/cardio-pvd-leg/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-valve', group: 'impairment', chapter: 'cardio',
    nameTh: 'โรคลิ้นหัวใจ',
    desc: 'ขั้น 0–4 (echo/BNP) → WPI (ตาราง 10-12)',
    path: '/impairment/cardio-valve/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-hf', group: 'impairment', chapter: 'cardio',
    nameTh: 'หัวใจล้มเหลว / กล้ามเนื้อหัวใจ',
    desc: 'ขั้น 0–4 (LVEF/BNP) → WPI (ตาราง 10-13)',
    path: '/impairment/cardio-hf/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-pericard', group: 'impairment', chapter: 'cardio',
    nameTh: 'โรคเยื่อหุ้มหัวใจ',
    desc: 'ขั้น 0–4 → WPI (ตาราง 10-14)',
    path: '/impairment/cardio-pericard/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-arrhythmia', group: 'impairment', chapter: 'cardio',
    nameTh: 'หัวใจเต้นผิดจังหวะ',
    desc: 'ขั้น 0–4 (ECG/Holter) → WPI (ตาราง 10-15)',
    path: '/impairment/cardio-arrhythmia/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-cardio-pulmhtn', group: 'impairment', chapter: 'cardio',
    nameTh: 'โรคความดันในปอดสูง',
    desc: 'ขั้น 0–4 (PASP/6MWD) → WPI (ตาราง 10-16)',
    path: '/impairment/cardio-pulmhtn/', icon: IC.heart, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบทางเดินหายใจ (บท 9) ----
  {
    id: 'impairment-resp', group: 'impairment', chapter: 'resp',
    nameTh: 'โรคปอดทั่วไป (FEV1)',
    desc: 'FEV1 (% ค่าปกติ) → ขั้น 1–4 → WPI แบบเทียบสัดส่วน (ตาราง 9-3)',
    path: '/impairment/resp/', icon: IC.lung, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-resp-asthma', group: 'impairment', chapter: 'resp',
    nameTh: 'โรคหอบหืดจากการทำงาน',
    desc: 'FEV1 หลังพ่นยา/PC20 → ขั้น 0–4 × A–E → WPI (ตาราง 9-4)',
    path: '/impairment/resp-asthma/', icon: IC.lung, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-resp-cancer', group: 'impairment', chapter: 'resp',
    nameTh: 'มะเร็งปอด (Karnofsky)',
    desc: 'ความสามารถทำกิจวัตร → ขั้น 0–4 → WPI (ตาราง 9-5)',
    path: '/impairment/resp-cancer/', icon: IC.lung, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-resp-osa', group: 'impairment', chapter: 'resp',
    nameTh: 'หยุดหายใจขณะหลับ (OSA)',
    desc: 'อาการง่วงกลางวัน → ขั้น 0–4 → WPI (ตาราง 9-6)',
    path: '/impairment/resp-osa/', icon: IC.lung, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบทางเดินอาหาร (บท 11) ----
  {
    id: 'impairment-gi', group: 'impairment', chapter: 'gi',
    nameTh: 'ระบบทางเดินอาหาร',
    desc: 'ปัจจัยหลัก/รอง → ขั้น 0–4 × A–E → WPI (บทที่ 11)',
    path: '/impairment/gi/', icon: IC.stomach, status: 'ready', requiresLogin: false,
  },

  // ---- เครื่องมือร่วม ----
  {
    id: 'impairment-combined', group: 'impairment', chapter: 'tools',
    nameTh: 'เครื่องรวมค่า (Combined Values)',
    desc: 'รวมการสูญเสียหลายรายการด้วยสูตร A + B(100−A)/100',
    path: '/impairment/combined/', icon: IC.combine, status: 'ready', requiresLogin: false,
  },
];

// โมดูลในกลุ่มหนึ่ง / บทหนึ่ง (เรียงตามที่ประกาศ)
export function modulesInGroup(groupId) { return MODULES.filter(m => m.group === groupId); }
export function modulesInChapter(chapterId) { return MODULES.filter(m => m.chapter === chapterId); }

// เผื่อหน้า HTML ที่โหลดแบบ non-module
if (typeof window !== 'undefined') { window.OCCMED_MODULES = MODULES; window.OCCMED_GROUPS = GROUPS; window.OCCMED_CHAPTERS = CHAPTERS; }
