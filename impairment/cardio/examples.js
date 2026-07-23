// examples.js — โจทย์ตัวอย่าง + วิธีทำ ระบบหัวใจและหลอดเลือด (คู่มือฯ บทที่ 10)
// ถอดความจากภาพหน้าคู่มือ · ตรวจคำตอบกับ engine.js แล้ว
// วิธี: ปัจจัยหลัก (key factor) → จัดชั้น (class) · ตั้งต้น grade กลางชั้น · ปรับด้วยปัจจัยรอง (ภายในชั้น)
import { fx } from '/shared/example.js';

// CARDIO_EXAMPLES: คีย์ตรงกับคีย์ใน CARDIO_TABLES (htn/pvdArm/pvdLeg/valve/hf/pericard/arrhythmia/pulmhtn)
export const CARDIO_EXAMPLES = {
  htn: [], pvdArm: [], pvdLeg: [],
  valve: [
    {
      tag: 'ตัวอย่างที่ 10.22', title: 'หญิงอายุ 22 ปี ลิ้นหัวใจไมทรัลหย่อนเล็กน้อย', ans: 'WPI 0%',
      problem:
`หญิงอายุ 22 ปี ตรวจสุขภาพบริษัทพบ mitral valve prolapse ไม่มีอาการ หัวใจไม่โต ไม่มีหัวใจล้มเหลว/เต้นผิดจังหวะ เล่นเทนนิสได้สม่ำเสมอ
คลื่นไฟฟ้าหัวใจปกติ · echocardiography พบลิ้นไมทรัลหย่อนเล็กน้อย (mild MVP) ขนาดห้องหัวใจปกติ LVEF ปกติ ไม่มีลิ้นรั่ว`,
      solution:
        fx.sheet([
          fx.item('ปัจจัยหลัก', 'การตรวจทางห้องปฏิบัติการ (CXR/echo) → จัดชั้น',
            `${fx.eq} mild MVP โดยไม่มีความผิดปกติของการทำงาน ${fx.eq} ${fx.res('ขั้นที่ 0')}`),
          fx.item('ผลการประเมิน', 'ไม่มีการสูญเสียสมรรถภาพ',
            `${fx.eq} ${fx.res('0%', true)}`),
        ]),
      plain:
`ปัจจัยหลัก: echo พบ mild MVP ไม่มีความผิดปกติของการทำงาน → ขั้นที่ 0
ผล = 0%`,
      answer: 'WPI 0% (ขั้นที่ 0)',
    },
    {
      tag: 'ตัวอย่างที่ 10.23', title: 'หญิงอายุ 38 ปี ลิ้นเอออร์ติกตีบเล็กน้อย', ans: 'WPI 6%',
      problem:
`หญิงอายุ 38 ปี NYHA class I เป็นนักวิ่งมาราธอน ไม่มีอาการเหนื่อย/เจ็บหน้าอก/ใจสั่น ความดันปกติ ชีพจร 52/นาที
ตรวจหัวใจพบ systolic ejection murmur + midsystolic ejection click · echocardiography พบ bicuspid aortic valve · mean gradient 22 มม.ปรอท · valve area 1.6 ตร.ซม.
วินิจฉัย: ลิ้นเอออร์ติกตีบเล็กน้อยจาก bicuspid aortic valve ที่ไม่มีอาการ`,
      solution:
        fx.sheet([
          fx.item('ปัจจัยหลัก', 'การตรวจทางห้องปฏิบัติการ (echo): ลิ้นตีบระดับเล็กน้อย · METS &gt; 7 · BNP ต่ำ',
            `${fx.eq} ${fx.res('ขั้นที่ 1')} ${fx.note('NYHA class 1 · ช่วง 2–10%')}`),
          fx.item('ระดับย่อย', 'ไม่มีอาการ → ค่ากลางของชั้น (grade C)',
            `${fx.eq} ${fx.res('6%', true)} ${fx.note('ขั้น 1C')}`),
        ]),
      plain:
`ปัจจัยหลัก: echo ลิ้นตีบเล็กน้อย + NYHA 1 → ขั้นที่ 1 (ช่วง 2–10%)
ระดับย่อย: ค่ากลางของชั้น (grade C) → 6% (ขั้น 1C)`,
      answer: 'WPI 6% (ขั้นที่ 1 ระดับ C)',
    },
  ],
  hf: [
    {
      tag: 'ตัวอย่างที่ 10.26', title: 'ชายอายุ 41 ปี กล้ามเนื้อหัวใจจากแอลกอฮอล์', ans: 'WPI 2%',
      problem:
`ชายอายุ 41 ปี ตรวจสุขภาพพบหัวใจโตจากภาพรังสีทรวงอก ดื่มสุราจนเมาทุกวัน (แอลกอฮอล์ &gt; 90 กรัม/วัน นานเกิน 10 ปี) ปฏิเสธอาการเหนื่อย/นอนราบไม่ได้ เล่นกีฬาได้นานเป็นชั่วโมงโดยไม่เหนื่อย
ตรวจร่างกาย: apical beat เลื่อน ไม่มี murmur ไม่มีภาวะน้ำคั่ง · echocardiography: หัวใจห้องล่างซ้ายโตเล็กน้อย LVEF 51% mild global hypokinesia · NT-proBNP ปกติ
วินิจฉัย: alcoholic cardiomyopathy`,
      solution:
        fx.sheet([
          fx.item('ปัจจัยหลัก', 'การตรวจทางห้องปฏิบัติการ (echo LVEF/BNP) → จัดชั้น',
            `${fx.eq} LVEF 41–50% (ผิดปกติเล็กน้อย) · BNP ปกติ ${fx.eq} ${fx.res('ขั้นที่ 1')} ${fx.note('NYHA 1 · ช่วง 2–10%')}`),
          fx.item('ระดับย่อย', 'ไม่มีอาการ (ปัจจัยรองต่ำ) → grade A',
            `${fx.eq} ${fx.res('2%', true)} ${fx.note('ขั้น 1 ระดับ A')}`),
        ]),
      plain:
`ปัจจัยหลัก: echo LVEF 51% (ผิดปกติเล็กน้อย) BNP ปกติ → ขั้นที่ 1
ระดับย่อย: ไม่มีอาการ → grade A → 2%`,
      answer: 'WPI 2% (ขั้นที่ 1 ระดับ A)',
    },
    {
      tag: 'ตัวอย่างที่ 10.27', title: 'ชายอายุ 54 ปี หัวใจล้มเหลวจากกล้ามเนื้อหัวใจขาดเลือด', ans: 'WPI 17%',
      problem:
`ชายอายุ 54 ปี หัวใจล้มเหลวจากกล้ามเนื้อหัวใจขาดเลือดเมื่อ 2 ปีก่อน รักษาด้วย ACE inhibitor, Beta-blocker, MRA · ยังเหนื่อยเมื่อออกแรง (เดินขึ้นที่สูง) ไม่มีอาการขณะพัก
ตรวจร่างกาย: JVP 8 ซม., S3 gallop, บวม 1+ · echocardiography: LVEF 45% มี akinesia ที่ LV apex/anteroseptal · NT-proBNP 150 pg/mL
วินิจฉัย: Ischemic cardiomyopathy, NYHA FC II (improved LVEF)`,
      solution:
        fx.sheet([
          fx.item('ปัจจัยหลัก', 'การตรวจทางห้องปฏิบัติการ (echo/BNP) + NYHA class 2 → จัดชั้น',
            `${fx.eq} LVEF 30–40% (ผิดปกติปานกลาง) ${fx.eq} ${fx.res('ขั้นที่ 2')} ${fx.note('ช่วง 11–23% · ค่าย่อย [11,14,17,20,23]')}`),
          fx.item('ระดับย่อย', 'ปรับด้วยปัจจัยรอง → ค่ากลางของชั้น (grade C)',
            `${fx.eq} ${fx.res('17%', true)} ${fx.note('ขั้น 2 ระดับ C')}`),
        ]),
      plain:
`ปัจจัยหลัก: echo LVEF 45% + NYHA 2 → ขั้นที่ 2 (ช่วง 11–23%)
ระดับย่อย: grade C → 17% (ขั้น 2 ระดับ C)`,
      answer: 'WPI 17% (ขั้นที่ 2 ระดับ C)',
    },
  ],
  pericard: [], arrhythmia: [], pulmhtn: [],
};

// ตัวอย่างของหน้า CAD (impairment/cardio/index.html) — ตาราง 10-4 · ตรวจกับ cadResult แล้ว
export const CAD_EXAMPLES = [
  {
    tag: 'ตัวอย่างที่ 10.1', title: 'หญิงอายุ 55 ปี เจ็บหน้าอกที่ไม่ใช่จากหัวใจ', ans: 'WPI 0%',
    problem:
`ผู้ป่วยหญิงอายุ 55 ปี สูบบุหรี่ ประวัติครอบครัวเป็นโรคหลอดเลือดหัวใจ ทำ CT พบ CAC = 90 จึงส่งต่ออายุรแพทย์โรคหัวใจ
เจ็บจี๊ดที่หน้าอกขณะพัก ไม่สัมพันธ์กับการออกแรง · เดินสายพาน (Bruce) ได้ 9 นาที · echocardiography ปกติ · สวนหัวใจไม่พบหลอดเลือดตีบ · LVEF 68%
วินิจฉัย: เจ็บหน้าอกที่ไม่ใช่จากหลอดเลือดหัวใจ (Non-cardiac chest pain)`,
    solution:
      fx.sheet([
        fx.item('ปัจจัยหลัก', 'การฉีดสีหลอดเลือดหัวใจ / echocardiography → จัดชั้น',
          `${fx.eq} ปกติ ไม่พบหลอดเลือดตีบ ${fx.eq} ${fx.res('ขั้นที่ 0')}`),
        fx.item('ผลการประเมิน', 'ไม่มีการสูญเสียสมรรถภาพจากโรคหลอดเลือดหัวใจ',
          `${fx.eq} ${fx.res('0%', true)}`),
      ]) +
      fx.meta('ผล stress test เป็น false positive · แนะนำโปรแกรมป้องกันระดับทุติยภูมิ (หยุดบุหรี่ ควบคุมไขมัน)'),
    plain:
`ปัจจัยหลัก: สวนหัวใจ/echo ปกติ ไม่พบตีบ → ขั้นที่ 0
ผลการประเมิน = 0% (Non-cardiac chest pain)`,
    answer: 'WPI 0% (ไม่ใช่โรคหลอดเลือดหัวใจ)',
  },
  {
    tag: 'ตัวอย่างที่ 10.2', title: 'หญิงอายุ 45 ปี Cardiac syndrome X', ans: 'WPI 6%',
    problem:
`ผู้ป่วยหญิงอายุ 45 ปี สูบบุหรี่ ไขมันในเลือดสูงเล็กน้อย เจ็บหน้าอกตรงกลางร้าวไปไหล่และกรามซ้ายเมื่อออกแรงหนัก อมยาใต้ลิ้นแล้วดีขึ้น
เดินสายพาน (Bruce) 8 นาที มี horizontal ST depression 1.0 มม. · echocardiography ปกติ · สวนหัวใจไม่พบตีบ แต่เลือดไหลช้าเล็กน้อย (TIMI 2) · LVEF 0.58
วินิจฉัย: หลอดเลือดหัวใจขนาดเล็ก (Coronary microvascular disease / Cardiac syndrome X)`,
    solution:
      fx.sheet([
        fx.item('ปัจจัยหลัก', 'มี angina + ภาวะหลอดเลือดขนาดเล็ก (ไม่ตีบ epicardial)',
          `${fx.eq} ${fx.res('ขั้นที่ 1')} ${fx.note('ช่วง 2–10% · ค่าย่อย [2,4,6,8,10]')}`),
        fx.item('ระดับย่อย', 'ปรับด้วยปัจจัยรอง (burden of treatment ปานกลาง) → ค่ากลางของชั้น (grade C)',
          `${fx.eq} ${fx.res('6%', true)}`),
      ]),
    plain:
`ปัจจัยหลัก: angina + microvascular (ไม่ตีบ epicardial) → ขั้นที่ 1 (ช่วง 2–10%)
ระดับย่อย: ค่ากลางของชั้น (grade C) → 6%`,
    answer: 'WPI 6%',
  },
  {
    tag: 'ตัวอย่างที่ 10.3', title: 'ชายอายุ 55 ปี กล้ามเนื้อหัวใจขาดเลือดแบบไม่แสดงอาการ', ans: 'WPI 8%',
    problem:
`ผู้ป่วยชายอายุ 55 ปี ไม่เคยมีอาการเจ็บหน้าอก ส่งตรวจเพราะ exercise thallium ผิดปกติ · ไขมันในเลือดสูง (LDL 275)
Exercise thallium: กล้ามเนื้อหัวใจขาดเลือดที่อัตราการเต้น 170/นาที (ST depression 1.5 มม.) · สวนหัวใจพบตีบ LAD ร้อยละ 50 ที่ต้น–ปลาย, RCA/LCx ตีบร้อยละ 20–30 · LVEF 65%
วินิจฉัย: กล้ามเนื้อหัวใจขาดเลือดแบบไม่แสดงอาการ (Silent ischemia)`,
    solution:
      fx.sheet([
        fx.item('ปัจจัยหลัก', 'หลอดเลือดตีบไม่เกินร้อยละ 70 (non–left main) ร่วมกับหลักฐานการขาดเลือด',
          `${fx.eq} ${fx.res('ขั้นที่ 1')} ${fx.note('ช่วง 2–10% · ค่าย่อย [2,4,6,8,10]')}`),
        fx.item('ระดับย่อย', 'ปรับด้วยปัจจัยรอง → grade D',
          `${fx.eq} ${fx.res('8%', true)}`),
      ]),
    plain:
`ปัจจัยหลัก: ตีบไม่เกิน 70% (non–left main) + ischemia → ขั้นที่ 1 (ช่วง 2–10%)
ระดับย่อย: grade D → 8%`,
    answer: 'WPI 8%',
  },
];
