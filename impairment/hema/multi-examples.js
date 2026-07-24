// multi-examples.js — โจทย์ตัวอย่างหน้ารวมหลายภาวะทางเลือด (คู่มือฯ บทที่ 15)
// ถอดความจากภาพสไลด์ตัวอย่างของคู่มือ · ตรวจคำตอบกับ engine/classifier แล้ว (ดู multi.test.js)
// ใช้ relative import เพื่อให้ทั้งเบราว์เซอร์และ node (เทสต์) โหลดได้
import { fx } from '../../shared/example.js';

const { item, sheet, eq, res, note, meta } = fx;

export const HEMA_MULTI_EXAMPLES = [
  {
    tag: 'ตัวอย่าง (คู่มือ บทที่ 15)',
    title: 'หญิง 38 ปี Aplastic anemia/PNH + Budd-Chiari (pancytopenia)',
    ans: 'WPI 62%',
    problem:
`หญิง 38 ปี เป็น Aplastic anemia (non-severe) กินยา oxymetholone ผลเลือดดีขึ้น ต่อมาซีดลงและมีท้องโต ตรวจพบ hemolysis และ Hepatic vein thrombosis (Budd-Chiari syndrome) จาก PNH จึงได้ยา prednisolone 20 mg/วัน, warfarin, folic acid และได้รับเลือด 1 ถุงต่อเดือน · ไม่มีเลือดออกที่ใด
อาการปัจจุบัน: เหนื่อยง่าย อ่อนเพลียตลอด
ตรวจร่างกาย: ซีดมาก (markedly pale), Cushingoid, สิวที่หน้า/ลำตัว
LAB (ก่อนรับเลือด): Hb 6.1, WBC 2500 (N 50%, L 50% → ANC 1250), PLT 80,000
Dx: Aplastic anemia/PNH, Budd-Chiari syndrome`,
    solution: sheet([
      meta('โรคหลัก = pancytopenia โดยมีภาวะโลหิตจางเด่น → ประเมินปัจจัยหลักของแต่ละภาวะก่อน แล้วรวมด้วยตารางค่ารวม · จบด้วยบวก BOTC'),
      item('① โลหิตจาง (ตาราง 15-4)', 'ปัจจัยหลัก = ประวัติ อาการรุนแรงตลอดเวลา → ขั้น 4 (ค่ากลาง B = 70%)',
        `${eq} ${res('ขั้น 4B (70%)')}`),
      item('ปัจจัยรอง (Hb)', 'Hb 6.1 → ขั้น 3 (< 8 ถึง ≥ 6) ต่ำกว่าขั้นหลัก → ลด 1 ระดับ',
        `${eq} ${res('ขั้น 4A = 55%', true)}`),
      item('② นิวโตรฟิลต่ำ (ตาราง 15-5)', 'ANC 1250 > 1000 เซลล์/ลบ.มม. → ขั้น 0',
        `${eq} ${res('0%', true)}`),
      item('③ เกล็ดเลือดต่ำ (ตาราง 15-9)', 'ปัจจัยหลัก = ประวัติ ไม่มีอาการเลือดออก → ขั้น 0 (PLT 80,000 เป็นปัจจัยรอง ไม่ส่งผลเมื่อขั้น 0)',
        `${eq} ${res('0%', true)}`),
      item('รวมทุกภาวะ (Combined Values)', 'เรียงมาก→น้อย: 55, 0, 0',
        `${eq} ${res('55%', true)}`),
      item('BOTC (ตาราง 15-3) ใช้ร่วมทั้งเคส', 'warfarin (anticoagulant) 5% + prednisolone (steroid, มีภาวะแทรกซ้อนบ้าง) 1% + ให้เลือด 1 ยูนิต/เดือน 1%',
        `${eq} 5 + 1 + 1 ${eq} ${res('7%', true)}`),
      item('ผลรวมท้ายสุด', 'ฐาน 55% + BOTC 7%',
        `${eq} ${res('62%', true)} ${note('WPI ทั้งร่างกาย')}`),
    ]),
    plain:
`① โลหิตจาง: ประวัติ ขั้น 4B (70) · Hb 6.1 ขั้น 3 → ลด 1 → 4A = 55%
② นิวโตรฟิลต่ำ: ANC 1250 > 1000 → ขั้น 0 = 0%
③ เกล็ดเลือดต่ำ: ไม่มีอาการเลือดออก → ขั้น 0 = 0%
รวม Combined Values: 55 ⊕ 0 ⊕ 0 = 55%
BOTC: warfarin 5 + prednisolone 1 + ให้เลือด 1 ยูนิต/เดือน 1 = 7%
ผลรวม = 55 + 7 = 62%`,
    answer: 'WPI 62% — โลหิตจาง 55% ⊕ นิวโตรฟิล 0% ⊕ เกล็ดเลือด 0% = 55% แล้วบวก BOTC 7%',
  },
];
