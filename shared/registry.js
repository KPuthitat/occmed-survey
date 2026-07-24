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
  femrepro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4c0 3 .8 5 2.2 6.3C11.4 11.5 11 13 11 15v5"/><path d="M16 4c0 3-.8 5-2.2 6.3C12.6 11.5 13 13 13 15v5"/><path d="M9 20h6"/><path d="M8 4H6M16 4h2"/></svg>',
  malerepro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="15" r="5.5"/><path d="M15.5 11 20 6.5"/><path d="M15.5 4H20v4.5"/></svg>',
  kidney: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 3C5.5 3 4 5.4 4 8.5 4 12 6 14 8.2 14c1.6 0 2.3-1 2.3-2.4 0-1.2-.7-1.8-.7-3 0-1 .6-1.6 1.2-2.1"/><path d="M15.5 3C18.5 3 20 5.4 20 8.5 20 12 18 14 15.8 14c-1.6 0-2.3-1-2.3-2.4 0-1.2.7-1.8.7-3 0-1-.6-1.6-1.2-2.1"/><path d="M8.4 14c-.2 2.5.6 5 3.6 7 3-2 3.8-4.5 3.6-7"/></svg>',
  xray: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2.5"/><path d="M12 6v12"/><path d="M12 8c-1.6 0-3 .7-3 2 0 1 .8 1.5 3 1.5s3 .5 3 1.5c0 1.3-1.4 2-3 2"/><path d="M8.5 6.5C8.9 8 9 9 9 9M15.5 6.5C15.1 8 15 9 15 9M8.5 17.5C8.9 16 9 15 9 15M15.5 17.5C15.1 16 15 15 15 15"/></svg>',
  bone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 17a2.2 2.2 0 1 1-1.6-3.7 2.2 2.2 0 0 1 1.6-3.7L17 5.9a2.2 2.2 0 1 1 1.6 3.7 2.2 2.2 0 0 1-1.6 3.7Z" transform="rotate(0 12 12)"/><path d="M6.2 13.3 10 9.5M14 14.5l3.8-3.8"/></svg>',
  pain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 4.5 13H11l-1 9 8.5-11H12l1-9Z"/></svg>',
  mental: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9.5 3.5a4 4 0 0 0-4 4c-1.3.6-2 1.9-2 3.3 0 1 .4 1.9 1.1 2.5-.2.4-.3.9-.3 1.4a3 3 0 0 0 4.8 2.4"/><path d="M9.3 3.5A3 3 0 0 1 12 6.5V20"/><path d="M14.5 3.5a4 4 0 0 1 4 4c1.3.6 2 1.9 2 3.3 0 1-.4 1.9-1.1 2.5.2.4.3.9.3 1.4a3 3 0 0 1-4.8 2.4"/></svg>',
  blood: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.5C12 2.5 5.5 9.5 5.5 14.5a6.5 6.5 0 0 0 13 0C18.5 9.5 12 2.5 12 2.5Z"/><path d="M9 14.5a3 3 0 0 0 3 3"/></svg>',
  endocrine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3c0 1 .5 1.8 1.2 2.4C9 8.3 8 9.8 8 11.5a4 4 0 0 0 4 4 4 4 0 0 0 4-4c0-1.7-1-3.2-2.2-4.1C14.5 6.8 15 6 15 5a3 3 0 0 0-3-3Z"/><path d="M12 15.5V22"/><path d="M9 19h6"/></svg>',
  brain: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4.5a2.5 2.5 0 0 0-2.5 2.5v.2A2.6 2.6 0 0 0 6 9.7c0 .9.4 1.6 1 2.1-.6.5-1 1.2-1 2.1a2.6 2.6 0 0 0 3.5 2.4v.2a2.5 2.5 0 0 0 5 0v-.2a2.6 2.6 0 0 0 3.5-2.4c0-.9-.4-1.6-1-2.1.6-.5 1-1.2 1-2.1a2.6 2.6 0 0 0-3.5-2.5V7A2.5 2.5 0 0 0 12 4.5Z"/><path d="M12 4.7v12.6"/></svg>',
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
    desc: 'คำนวณร้อยละการสูญเสียสมรรถภาพ (WPI) ตามคู่มือการประเมินการสูญเสียสมรรถภาพอย่างถาวรทางกายและจิต ฉบับจัดทำ 4 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม) — กดเข้าไปเลือกระบบอวัยวะ',
    icon: IC.pulse,
    path: '/impairment/',
  },
  {
    id: 'pneumo',
    nameTh: 'อ่านฟิล์ม ILO (Pneumoconiosis)',
    desc: 'จำแนกภาพรังสีทรวงอกมาตรฐาน ILO สำหรับโรคปอดจากฝุ่น · เปิดแอปในแท็บใหม่',
    icon: IC.xray,
    path: 'https://pneumo.ikigaimedihealth.com',
    single: true,
    external: true,
  },
];

// ---------- บท (ระบบอวัยวะ) ในกลุ่มประเมินการสูญเสียฯ — ใช้เป็นหัวข้อ section ในหน้า /impairment/ ----------
export const CHAPTERS = [
  { id: 'neuro', nameTh: 'ระบบประสาท', ref: 'บทที่ 5', icon: IC.brain },
  { id: 'msk', nameTh: 'กระดูกและกล้ามเนื้อ (แขน/ขา)', ref: 'บทที่ 2–3', icon: IC.bone },
  { id: 'eye', nameTh: 'ระบบจักษุ', ref: 'บทที่ 6', icon: IC.eye },
  { id: 'ent', nameTh: 'โสต ศอ นาสิก', ref: 'บทที่ 7', icon: IC.ear },
  { id: 'resp', nameTh: 'ระบบทางเดินหายใจ', ref: 'บทที่ 9', icon: IC.lung },
  { id: 'cardio', nameTh: 'ระบบหัวใจและหลอดเลือด', ref: 'บทที่ 10', icon: IC.heart },
  { id: 'gi', nameTh: 'ระบบทางเดินอาหาร', ref: 'บทที่ 11', icon: IC.stomach },
  { id: 'urinary', nameTh: 'ระบบทางเดินปัสสาวะ', ref: 'บทที่ 12', icon: IC.kidney },
  { id: 'reprom', nameTh: 'ระบบสืบพันธุ์ชาย', ref: 'บทที่ 13', icon: IC.malerepro },
  { id: 'reprof', nameTh: 'ระบบสืบพันธุ์หญิง', ref: 'บทที่ 14', icon: IC.femrepro },
  { id: 'hema', nameTh: 'ระบบเลือด (โลหิตวิทยา)', ref: 'บทที่ 15', icon: IC.blood },
  { id: 'endocrine', nameTh: 'ต่อมไร้ท่อและเมตะบอลิสม', ref: 'บทที่ 16', icon: IC.endocrine },
  { id: 'pain', nameTh: 'อาการปวดเรื้อรัง', ref: 'บทที่ 17', icon: IC.pain },
  { id: 'mental', nameTh: 'สุขภาพจิตและพฤติกรรม', ref: 'บทที่ 18', icon: IC.mental },
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

  // ---- ระบบประสาท (บท 5) ----
  {
    id: 'impairment-neuro-brain', group: 'impairment', chapter: 'neuro',
    nameTh: 'สมอง (Brain)',
    desc: 'รู้สึกตัว/ชัก/หลับ-ตื่น/สภาพจิต(CDR)/ภาษา/อารมณ์ → เลือกระดับ → ช่วง WPI (ตาราง 5-2..5-8)',
    path: '/impairment/neuro-brain/', icon: IC.brain, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-neuro-cranial', group: 'impairment', chapter: 'neuro',
    nameTh: 'เส้นประสาทสมอง (Cranial nerves)',
    desc: 'คู่ที่ 5/7/8/9-10-12 → เลือกระดับ → ช่วง WPI (ตาราง 5-9..5-12)',
    path: '/impairment/neuro-cranial/', icon: IC.brain, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-neuro-motor', group: 'impairment', chapter: 'neuro',
    nameTh: 'การยืน-เดิน และแขน (Motor)',
    desc: 'การยืน-เดิน / แขนข้างเดียว / แขนสองข้าง → เลือกระดับ → ช่วง WPI (ตาราง 5-13..5-15)',
    path: '/impairment/neuro-motor/', icon: IC.brain, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-neuro-spinal', group: 'impairment', chapter: 'neuro',
    nameTh: 'ไขสันหลัง (Spinal cord)',
    desc: 'การหายใจ / ปัสสาวะ / อุจจาระ / เพศ → เลือกระดับ → ช่วง WPI (ตาราง 5-16..5-19)',
    path: '/impairment/neuro-spinal/', icon: IC.brain, status: 'ready', requiresLogin: false,
  },

  // ---- กระดูกและกล้ามเนื้อ · แขน/ขา (บท 2–3) ----
  {
    id: 'impairment-msk', group: 'impairment', chapter: 'msk',
    nameTh: 'แขน/มือ และ ขา/เท้า',
    desc: 'วินิจฉัย/ROM/ตัดขาด/เส้นประสาท → ร้อยละแขน-ขา → ทั้งร่างกาย (ตาราง 2–3, ค่ารวม บท 19)',
    path: '/impairment/msk/', icon: IC.bone, status: 'ready', requiresLogin: false,
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

  // ---- ระบบทางเดินปัสสาวะ (บท 12) ----
  {
    id: 'impairment-urinary-upper', group: 'impairment', chapter: 'urinary',
    nameTh: 'ทางเดินปัสสาวะส่วนบน (ไต/ท่อไต)',
    desc: 'eGFR (ปรับตามอายุ) + คลินิก → ขั้น 0–4 × ต่ำ/กลาง/สูง → WPI (ตาราง 12-1)',
    path: '/impairment/urinary-upper/', icon: IC.kidney, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-urinary-bladder', group: 'impairment', chapter: 'urinary',
    nameTh: 'กระเพาะปัสสาวะ',
    desc: 'คลินิก + urodynamics → ขั้น 0–4 × ต่ำ/กลาง/สูง → WPI (ตาราง 12-2)',
    path: '/impairment/urinary-bladder/', icon: IC.kidney, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-urinary-urethra', group: 'impairment', chapter: 'urinary',
    nameTh: 'ท่อปัสสาวะ',
    desc: 'ระดับตีบ/ส่องกล้อง → ขั้น 0–4 × ต่ำ/กลาง/สูง → WPI (ตาราง 12-3)',
    path: '/impairment/urinary-urethra/', icon: IC.kidney, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-urinary-diversion', group: 'impairment', chapter: 'urinary',
    nameTh: 'การเปลี่ยนทิศทางเดินปัสสาวะ',
    desc: 'Uretero-intestinal 10 / cutaneous ureterostomy 15 / nephrostomy 20 + รวมค่า (ตาราง 12-4)',
    path: '/impairment/urinary-diversion/', icon: IC.kidney, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบสืบพันธุ์ชาย (บท 13) ----
  {
    id: 'impairment-reprom-erectile', group: 'impairment', chapter: 'reprom',
    nameTh: 'องคชาต / การแข็งตัว (Erectile)',
    desc: 'แบบสอบถาม IIEF-5 → ขั้น 0–4 (0/4/11/18/25%) + ปัจจัยรอง (ตาราง 13-1/13-2)',
    path: '/impairment/reprom-erectile/', icon: IC.malerepro, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-reprom-testes', group: 'impairment', chapter: 'reprom',
    nameTh: 'ถุงอัณฑะ / อัณฑะ / ท่อน้ำอสุจิ',
    desc: 'ตรวจร่างกาย/น้ำอสุจิ/ฮอร์โมน → ขั้น 0–4 (0/4/11/18/25%) + QoL (ตาราง 13-3/13-4)',
    path: '/impairment/reprom-testes/', icon: IC.malerepro, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-reprom-prostate', group: 'impairment', chapter: 'reprom',
    nameTh: 'ต่อมลูกหมาก / ถุงพักน้ำอสุจิ',
    desc: 'อาการ/ประวัติรักษา → ขั้น 1–4 (3/7/11/15%) + DRE/PSA/แทรกซ้อน (ตาราง 13-5)',
    path: '/impairment/reprom-prostate/', icon: IC.malerepro, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบสืบพันธุ์หญิง (บท 14) ----
  {
    id: 'impairment-reprof-vulva', group: 'impairment', chapter: 'reprof',
    nameTh: 'อวัยวะสืบพันธุ์ภายนอก / ช่องคลอด',
    desc: 'การตรวจร่างกาย → ขั้น 0–3 × A–C + ประวัติปรับระดับ → WPI (ตาราง 14-1)',
    path: '/impairment/reprof-vulva/', icon: IC.femrepro, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-reprof-uterus', group: 'impairment', chapter: 'reprof',
    nameTh: 'ปากมดลูก / มดลูก',
    desc: 'การตรวจร่างกาย → ขั้น 0–3 × A–C + ประวัติปรับระดับ → WPI (ตาราง 14-2)',
    path: '/impairment/reprof-uterus/', icon: IC.femrepro, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-reprof-ovary', group: 'impairment', chapter: 'reprof',
    nameTh: 'ท่อนำไข่ / รังไข่',
    desc: 'objective test → ขั้น 0–3 × A–C + ประวัติปรับระดับ → WPI (ตาราง 14-3)',
    path: '/impairment/reprof-ovary/', icon: IC.femrepro, status: 'ready', requiresLogin: false,
  },

  // ---- ระบบเลือด · โลหิตวิทยา (บท 15) ----
  {
    id: 'impairment-hema-anemia', group: 'impairment', chapter: 'hema',
    nameTh: 'ภาวะโลหิตจาง (Anemia)',
    desc: 'กรอกประวัติ + Hb → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-4)',
    path: '/impairment/hema-anemia/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-neutropenia', group: 'impairment', chapter: 'hema',
    nameTh: 'เม็ดเลือดขาวนิวโตรฟิลต่ำ',
    desc: 'จำนวน neutrophil + ประวัติ → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-5)',
    path: '/impairment/hema-neutropenia/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-acuteleuk', group: 'impairment', chapter: 'hema',
    nameTh: 'มะเร็งเม็ดเลือดขาวเฉียบพลัน',
    desc: 'ประวัติการรักษา + ADL → ขั้น 0/3/4 + BOTC → WPI (ตาราง 15-6)',
    path: '/impairment/hema-acuteleuk/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-chronicleuk', group: 'impairment', chapter: 'hema',
    nameTh: 'มะเร็งเม็ดเลือดขาวเรื้อรัง',
    desc: 'ประวัติการรักษา + ADL → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-7)',
    path: '/impairment/hema-chronicleuk/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-hiv', group: 'impairment', chapter: 'hema',
    nameTh: 'การติดเชื้อ HIV',
    desc: 'CD4/viral load + ประวัติ + ADL → ขั้น 0–4 × A–E + BOTC → WPI (ตาราง 15-8)',
    path: '/impairment/hema-hiv/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-platelet', group: 'impairment', chapter: 'hema',
    nameTh: 'ความผิดปกติของเกล็ดเลือด',
    desc: 'ประวัติ + จำนวนเกล็ดเลือด → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-9)',
    path: '/impairment/hema-platelet/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-hemophilia', group: 'impairment', chapter: 'hema',
    nameTh: 'โรคฮีโมฟีเลีย (Hemophilias)',
    desc: 'ประวัติ + การรักษา + clotting factor → ขั้น 0–3 × A–C + BOTC → WPI (ตาราง 15-10)',
    path: '/impairment/hema-hemophilia/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-bleeding', group: 'impairment', chapter: 'hema',
    nameTh: 'ภาวะเลือดออก (Bleeding disorders)',
    desc: 'ความถี่เลือดออก + การรักษา → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-11)',
    path: '/impairment/hema-bleeding/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-thrombosis', group: 'impairment', chapter: 'hema',
    nameTh: 'ลิ่มเลือดอุดตันในหลอดเลือด',
    desc: 'จำนวนครั้ง + hypercoagulable state → ขั้น 0–3 × A–C + BOTC → WPI (ตาราง 15-12)',
    path: '/impairment/hema-thrombosis/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-hema-lymphoma', group: 'impairment', chapter: 'hema',
    nameTh: 'Lymphoma / มะเร็งแพร่กระจาย',
    desc: 'ประวัติการรักษา + ADL → ขั้น 0–4 × A–C + BOTC → WPI (ตาราง 15-13)',
    path: '/impairment/hema-lymphoma/', icon: IC.blood, status: 'ready', requiresLogin: false,
  },

  // ---- ต่อมไร้ท่อและเมตะบอลิสม (บท 16) ----
  {
    id: 'impairment-endocrine-pituitary', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ต่อมใต้สมอง / ฮัยโปธาลามัส',
    desc: 'ประวัติ → ขั้น 0–4 + BOTC (ยา/อาหาร/อุปกรณ์) → WPI (ตาราง 16-5)',
    path: '/impairment/endocrine-pituitary/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-thyroid', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ต่อมธัยรอยด์',
    desc: 'ประวัติ + การตรวจ (ก้อน) → ขั้น 0–2 + BOTC → WPI (ตาราง 16-6)',
    path: '/impairment/endocrine-thyroid/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-parathyroid', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ต่อมพาราธัยรอยด์',
    desc: 'ประวัติ + แคลเซียม → ขั้น 0–2 + BOTC → WPI (ตาราง 16-7)',
    path: '/impairment/endocrine-parathyroid/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-adrenalcortex', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ต่อมหมวกไตส่วนนอก',
    desc: 'ประวัติ (อาการ/biochem) → ขั้น 0–3 + BOTC → WPI (ตาราง 16-8)',
    path: '/impairment/endocrine-adrenalcortex/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-adrenalmedulla', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ต่อมหมวกไตส่วนใน',
    desc: 'ประวัติ (การควบคุม catecholamine) → ขั้น 0–4 + BOTC → WPI (ตาราง 16-9)',
    path: '/impairment/endocrine-adrenalmedulla/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-diabetes', group: 'impairment', chapter: 'endocrine',
    nameTh: 'โรคเบาหวาน',
    desc: 'ประวัติ/การรักษา + HbA1C → ขั้น 0–4 × A–E + BOTC → WPI (ตาราง 16-10)',
    path: '/impairment/endocrine-diabetes/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-hypoglycemia', group: 'impairment', chapter: 'endocrine',
    nameTh: 'ภาวะน้ำตาลในเลือดต่ำ',
    desc: 'ประวัติ + HbA1C (กลับด้าน) → ขั้น 0–2 + BOTC → WPI (ตาราง 16-11)',
    path: '/impairment/endocrine-hypoglycemia/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },
  {
    id: 'impairment-endocrine-osteoporosis', group: 'impairment', chapter: 'endocrine',
    nameTh: 'โรคกระดูกพรุน (Osteoporosis)',
    desc: 'ประวัติ + T-score → ขั้น 0–2 (ไม่มี BOTC) → WPI (ตาราง 16-12)',
    path: '/impairment/endocrine-osteoporosis/', icon: IC.endocrine, status: 'ready', requiresLogin: false,
  },

  // ---- อาการปวดเรื้อรัง (บท 17) ----
  {
    id: 'impairment-pain', group: 'impairment', chapter: 'pain',
    nameTh: 'อาการปวดเรื้อรัง (PDQ)',
    desc: 'แบบสอบถาม PDQ 15 ข้อ → คะแนนรวม 0–150 → ร้อยละทั้งร่างกาย (ตาราง 17-1/17-2)',
    path: '/impairment/pain/', icon: IC.pain, status: 'ready', requiresLogin: false,
  },

  // ---- สุขภาพจิตและพฤติกรรม (บท 18) ----
  {
    id: 'impairment-mental', group: 'impairment', chapter: 'mental',
    nameTh: 'ทางจิตและพฤติกรรม',
    desc: 'ให้คะแนน 4 ด้าน (1–5) → เฉลี่ย → ระดับ + ช่วงร้อยละ (ตาราง 18-2/18-3)',
    path: '/impairment/mental/', icon: IC.mental, status: 'ready', requiresLogin: false,
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
