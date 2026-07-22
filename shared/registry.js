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
    status: 'wip', // เปลี่ยนเป็น 'ready' เมื่อ UI (เฟส 3) เสร็จ
    requiresLogin: false,
  },
];

// เผื่อหน้า HTML ที่โหลดแบบ non-module
if (typeof window !== 'undefined') window.OCCMED_MODULES = MODULES;
