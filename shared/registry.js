// shared/registry.js — จุดเดียวที่ประกาศโมดูลทั้งหมดของ OCCMED
// เพิ่มโมดูลใหม่ = เพิ่ม object ในนี้ที่เดียว (nav/hub อ่านจากตรงนี้ ห้ามฮาร์ดโค้ดที่อื่น)
// status: 'ready' = พร้อมใช้ · 'wip' = กำลังพัฒนา
export const MODULES = [
  {
    id: 'walkthrough',
    nameTh: 'เดินสำรวจสถานประกอบการ',
    desc: 'Walk-through survey — ประเมินสิ่งคุกคาม ความเสี่ยง และวางแผนตรวจสุขภาพ ทำงานร่วมกันแบบเรียลไทม์',
    path: '/walkthrough/',
    icon: '🏭',
    status: 'ready',
    requiresLogin: false, // เข้าห้องด้วยรหัสสำรวจ + รหัสทีม (ในตัวโมดูลเอง)
  },
  {
    id: 'impairment-gi',
    nameTh: 'ประเมินการสูญเสียสมรรถภาพ — ระบบทางเดินอาหาร',
    desc: 'คำนวณร้อยละการสูญเสียสมรรถภาพอย่างถาวร ตามคู่มือกองทุนเงินทดแทน ฉบับ 4 บทที่ 11 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/gi/',
    icon: '🩺',
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-eye',
    nameTh: 'ประเมินการสูญเสียสมรรถภาพ — ระบบจักษุ',
    desc: 'คำนวณการสูญเสียสมรรถภาพระบบจักษุ (ระดับสายตา + ลานสายตา → VSI → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 6 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/eye/',
    icon: '👁',
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-ent',
    nameTh: 'ประเมินการสูญเสียการได้ยิน — โสต ศอ นาสิก',
    desc: 'คำนวณการสูญเสียการได้ยิน (audiogram → DSHL → Binaural → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 7 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/ent/',
    icon: '👂',
    status: 'ready',
    requiresLogin: false,
  },
  {
    id: 'impairment-cardio',
    nameTh: 'ประเมินการสูญเสียสมรรถภาพ — ระบบหัวใจและหลอดเลือด',
    desc: 'คำนวณการสูญเสียสมรรถภาพจากโรคหลอดเลือดหัวใจ (NYHA + ขั้น 0–5 → WPI) ตามคู่มือฯ ฉบับ 4 บทที่ 10 (คำนวณล้วน ไม่บันทึกข้อมูล)',
    path: '/impairment/cardio/',
    icon: '❤️',
    status: 'ready',
    requiresLogin: false,
  },
];

// เผื่อหน้า HTML ที่โหลดแบบ non-module
if (typeof window !== 'undefined') window.OCCMED_MODULES = MODULES;
