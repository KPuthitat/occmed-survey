// shared/registry.js — จุดเดียวที่ประกาศโมดูล + กลุ่มของ OCCMED
// โครงสร้าง 2 ชั้น: หน้าแรก (/) แสดง "กลุ่ม" → กดเข้ากลุ่มประเมินการสูญเสียฯ (/impairment/) ค่อยแยกเป็นระบบอวัยวะ
// เพิ่มโมดูลใหม่ = เพิ่ม object ใน MODULES ที่เดียว (ระบุ group) · เพิ่มกลุ่มใหม่ = เพิ่มใน GROUPS
// status: 'ready' = พร้อมใช้ · 'wip' = กำลังพัฒนา

// ---------- ไอคอน SVG (เส้น navy · ไม่ใช้อิโมจิ) ----------
const IC = {
  factory: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9l-7 4.5V9l-7 4.5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/><path d="M6 18h.01M10 18h.01M14 18h.01M18 18h.01"/></svg>',
  pulse: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-5l-2.5 7-5-16L7 12H2"/></svg>',
  stomach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v1.5C9 8 7.2 8.6 5.9 10A5.5 5.5 0 0 0 12 20a6 6 0 0 0 6-6c0-2.4-1.1-3.9-2.5-4.9-1.2-.8-1.9-1.6-1.9-3.1"/><path d="M15.8 6.8 17.5 8"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
  ear: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8.5a6.5 6.5 0 1 1 13 0c0 6-6 6-6 10a3.5 3.5 0 1 1-7 0"/><path d="M6.5 12.5a3.5 3.5 0 1 1 7 0c0 1.6-1 2.2-1 3.5"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z"/></svg>',
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

// ---------- โมดูลทั้งหมด (แต่ละโมดูลระบุ group) ----------
export const MODULES = [
  {
    id: 'walkthrough',
    group: 'survey',
    nameTh: 'เดินสำรวจสถานประกอบการ',
    desc: 'Walk-through survey — ประเมินสิ่งคุกคาม ความเสี่ยง และวางแผนตรวจสุขภาพ ทำงานร่วมกันแบบเรียลไทม์',
    path: '/walkthrough/',
    icon: IC.factory,
    status: 'ready',
    requiresLogin: false, // เข้าห้องด้วยรหัสสำรวจ + รหัสทีม (ในตัวโมดูลเอง)
  },
  {
    id: 'impairment-gi',
    group: 'impairment',
    nameTh: 'ระบบทางเดินอาหาร',
    desc: 'คำนวณร้อยละการสูญเสียสมรรถภาพอย่างถาวร ตามคู่มือฯ ฉบับ 4 บทที่ 11 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/gi/',
    icon: IC.stomach,
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-eye',
    group: 'impairment',
    nameTh: 'ระบบจักษุ',
    desc: 'คำนวณการสูญเสียสมรรถภาพระบบจักษุ (ระดับสายตา + ลานสายตา → VSI → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 6 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/eye/',
    icon: IC.eye,
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-ent',
    group: 'impairment',
    nameTh: 'โสต ศอ นาสิก (การได้ยิน)',
    desc: 'คำนวณการสูญเสียการได้ยิน (audiogram → DSHL → Binaural → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 7 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/ent/',
    icon: IC.ear,
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-cardio',
    group: 'impairment',
    nameTh: 'ระบบหัวใจและหลอดเลือด',
    desc: 'คำนวณการสูญเสียสมรรถภาพจากโรคหลอดเลือดหัวใจ (NYHA + ขั้น 0–5 → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 10 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/cardio/',
    icon: IC.heart,
    status: 'ready',
    requiresLogin: false,
  },
];

// โมดูลในกลุ่มหนึ่ง (เรียงตามที่ประกาศ)
export function modulesInGroup(groupId) { return MODULES.filter(m => m.group === groupId); }

// เผื่อหน้า HTML ที่โหลดแบบ non-module
if (typeof window !== 'undefined') { window.OCCMED_MODULES = MODULES; window.OCCMED_GROUPS = GROUPS; }
