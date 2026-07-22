// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพอย่างถาวร ระบบจักษุ (Visual System)
// อ้างอิง: คู่มือฯ ฉบับจัดทำ 4 บทที่ 6 (สำนักงานกองทุนเงินทดแทน สำนักงานประกันสังคม)
// Pure logic — ไม่มี UI · ห้ามแก้ตัวเลข/ข้อความในตาราง
//
// โมเดล (ตารางที่ 6-1):
//   ต่อตา: ระดับสายตา → VAS (ตาราง 6-3) · ลานสายตา → VFS
//   FVA = (2·VAS_BE + VAS_RE + VAS_LE) / 4      (both 50% + ขวา 25% + ซ้าย 25%)
//   FVF = (2·VFS_BE + VFS_RE + VFS_LE) / 4
//   FVS = FVA × FVF / 100
//   VSI = 100 − FVS
//   WPI = แปลงจาก VSI (ตาราง 6-8 / สูตร)

// ============================================================
// ตารางที่ 6-2 + 6-3 รวมกัน: ระดับสายตา (English Snellen) → VAS + %สูญเสียกรณีเลนส์ผิดปกติ
//   vas          = Visual Acuity Score (คอลัมน์ VAS ในตาราง 6-3; ปกติ phakic)
//   lossAphakia  = ร้อยละการสูญเสียกรณี Monocular Aphakia (VAS = 100 − ค่านี้)
//   lossPseudo   = ร้อยละการสูญเสียกรณี Monocular Pseudophakia
//   metric/decimal/logmar = เทียบระบบอื่น (ตาราง 6-2) เท่าที่คู่มือระบุ
// ============================================================
export const ACUITY = [
  { en: '20/12.5', metric: '6/3.8', vas: 110 },
  { en: '20/16',   metric: '6/4.8', vas: 105, lossAphakia: 50, lossPseudo: 25 },
  { en: '20/20',   metric: '6/6',   decimal: 1.0,  logmar: 0.0, vas: 100, lossAphakia: 50, lossPseudo: 25 },
  { en: '20/25',   metric: '6/7.5', decimal: 0.80, logmar: 0.1, vas: 95,  lossAphakia: 52, lossPseudo: 29 },
  { en: '20/32',   metric: '6/9.5', decimal: 0.63, logmar: 0.2, vas: 90,  lossAphakia: 55, lossPseudo: 33 },
  { en: '20/40',   metric: '6/12',  decimal: 0.5,  logmar: 0.3, vas: 85,  lossAphakia: 57, lossPseudo: 36 },
  { en: '20/50',   metric: '6/15',  decimal: 0.4,  logmar: 0.4, vas: 75,  lossAphakia: 62, lossPseudo: 44 },
  { en: '20/63',   metric: '6/18',  decimal: 0.32, logmar: 0.5, vas: 65,  lossAphakia: 67, lossPseudo: 51 },
  { en: '20/80',   metric: '6/24',  decimal: 0.25, logmar: 0.6, vas: 55,  lossAphakia: 72, lossPseudo: 58 },
  { en: '20/100',  metric: '6/30',  decimal: 0.2,  logmar: 0.7, vas: 50,  lossAphakia: 75, lossPseudo: 63 },
  { en: '20/125',  metric: '6/36',  decimal: 0.16, logmar: 0.8, vas: 40,  lossAphakia: 80, lossPseudo: 70 },
  { en: '20/160',  metric: '6/48',  decimal: 0.125,logmar: 0.9, vas: 30,  lossAphakia: 85, lossPseudo: 78 },
  { en: '20/200',  metric: '6/60',  decimal: 0.1,  logmar: 1.0, vas: 20,  lossAphakia: 90, lossPseudo: 85 },
  { en: '20/320',  metric: '1/16',  vas: 15, lossAphakia: 92, lossPseudo: 89 },
  { en: '20/400',  metric: '1/20',  vas: 10, lossAphakia: 95, lossPseudo: 93 },
  { en: '20/500',  metric: '1/25',  vas: 5,  lossAphakia: 98, lossPseudo: 97 },
  { en: '20/630',  metric: '1/32',  vas: 5,  lossAphakia: 98, lossPseudo: 97 },
  { en: '20/800',  metric: '1/40',  vas: 5,  lossAphakia: 98, lossPseudo: 97 },
  { en: '20/1000', metric: '1/50',  vas: 5,  lossAphakia: 98, lossPseudo: 97 },
  { en: '20/1250', metric: '1/63',  vas: 3,  lossAphakia: 99, lossPseudo: 98 },
  { en: '20/1600', metric: '1/80',  vas: 3,  lossAphakia: 99, lossPseudo: 98 },
  { en: '20/2000', metric: '1/100', vas: 3,  lossAphakia: 99, lossPseudo: 98, note: 'หรือแย่กว่า' },
  { en: 'NLP',     metric: 'No light perception', vas: 0, lossAphakia: 100, lossPseudo: 100 },
];

export const LENS_STATUS = [
  { id: 'phakic', label: 'ปกติ (Phakic)' },
  { id: 'aphakia', label: 'ไม่มีเลนส์ตา (Aphakia)' },
  { id: 'pseudophakia', label: 'ใส่เลนส์เทียม (Pseudophakia)' },
];

// ============================================================
// ฟังก์ชันคำนวณ (pure)
// ============================================================

export function clamp(x, lo, hi) { return Math.min(hi, Math.max(lo, x)); }
export function acuityByEn(en) { return ACUITY.find(a => a.en === en) || null; }

// VAS ของตาหนึ่ง จากระดับสายตา + สถานะเลนส์
export function vasFor(en, lensStatus = 'phakic') {
  const a = acuityByEn(en);
  if (!a) return null;
  if (lensStatus === 'aphakia' && a.lossAphakia != null) return 100 - a.lossAphakia;
  if (lensStatus === 'pseudophakia' && a.lossPseudo != null) return 100 - a.lossPseudo;
  return a.vas; // phakic (คอลัมน์ VAS)
}

// คะแนนการทำงานรวมสองตา: (2·both + right + left)/4  — ใช้ทั้ง FVA และ FVF
export function functionalScore(both, right, left) {
  return (2 * Number(both) + Number(right) + Number(left)) / 4;
}

// ตาราง 6-8: VSI → WPI
//   VSI ≤ 50 → WPI = VSI · VSI > 50 → WPI = 50 + 0.7(VSI − 50) · ปัดเศษ
export function vsiToWpi(vsi) {
  const v = clamp(Number(vsi), 0, 100);
  const w = v <= 50 ? v : 50 + 0.7 * (v - 50);
  return Math.round(w);
}

// คำนวณผลระบบจักษุจากคะแนนสายตา/ลานสายตาของแต่ละตา
// input: { vasRE, vasLE, vasBE?, vfsRE=100, vfsLE=100, vfsBE? }
// vasBE/vfsBE เว้นได้ → ใช้ค่าตาข้างที่ดีกว่า
export function visionResult(inp) {
  const vasRE = Number(inp.vasRE), vasLE = Number(inp.vasLE);
  const vasBE = inp.vasBE != null ? Number(inp.vasBE) : Math.max(vasRE, vasLE);
  const vfsRE = inp.vfsRE != null ? Number(inp.vfsRE) : 100;
  const vfsLE = inp.vfsLE != null ? Number(inp.vfsLE) : 100;
  const vfsBE = inp.vfsBE != null ? Number(inp.vfsBE) : Math.max(vfsRE, vfsLE);
  const fva = functionalScore(vasBE, vasRE, vasLE);
  const fvf = functionalScore(vfsBE, vfsRE, vfsLE);
  const fvs = fva * fvf / 100;
  const vsi = Math.max(0, 100 - fvs);
  const wpi = vsiToWpi(vsi);
  return { fva, fvf, fvs, vsi, wpi, vasRE, vasLE, vasBE, vfsRE, vfsLE, vfsBE };
}

// ============================================================
// ลานสายตา (Visual Field) — ตาราง 6-5/6-6 + รูป 6-2
// 10 meridians · ต่อ meridian: central 0–10° = 5 คะแนน (1/2°) + peripheral 10–60° = 5 คะแนน (1/10°)
// สูงสุด 10 คะแนน/meridian × 10 = 100 = ลานสายตาปกติ (VFS)
// ============================================================
export const VF_MERIDIANS = [25, 65, 115, 155, 195, 225, 255, 285, 315, 345]; // องศา (plot)

// คะแนนของ meridian หนึ่ง จากรัศมีลานสายตาที่เหลือ (องศา)
export function meridianPoints(radiusDeg) {
  const r = Math.max(0, Number(radiusDeg) || 0);
  const central = Math.min(r, 10) / 2;                        // 0–5 (1 คะแนน/2°)
  const peripheral = Math.min(Math.max(r - 10, 0), 50) / 10;  // 0–5 (1 คะแนน/10°)
  return central + peripheral;                                 // 0–10
}

// VFS (0–100) จากรัศมี 10 meridian · radii = array 10 ค่า (ตามลำดับ VF_MERIDIANS) หรือ object {25:.., ...}
export function visualFieldScore(radii) {
  const vals = Array.isArray(radii) ? radii : VF_MERIDIANS.map(m => radii[m]);
  return vals.reduce((s, r) => s + meridianPoints(r), 0);
}

// ตารางค่ารวม (Combined Values) — สำหรับรวมกับการสูญเสียอื่น/บท (เช่น เบ้าตา 6-9)
export function combineValues(values) {
  const v = values.map(Number).filter(x => x > 0).sort((a, b) => b - a);
  if (!v.length) return 0;
  let acc = v[0];
  for (let i = 1; i < v.length; i++) acc = acc + v[i] * (100 - acc) / 100;
  return Math.min(100, acc);
}

// ============================================================
// ตารางที่ 6-7 การสูญเสียอื่นๆ ของระบบจักษุ (ภาพซ้อน/หนังตา/น้ำตา)
//   ค่าคอลัมน์ = ร้อยละการสูญเสียของตาข้างที่ผิดปกติ → VAS ของตาข้างนั้น = 100 − ค่านั้น
//   แล้วเข้าสูตร FVA (ร่วมกับตาอีกข้าง) → VSI → WPI
//   หนังตา/น้ำตา: การสูญเสียสูงสุดของระบบจักษุ (VSI) ไม่เกินร้อยละ 15
// ============================================================
export const ADNEXA_6_7 = [
  { id: 'dip-central', group: 'ภาพซ้อน (Diplopia)', label: 'ในรัศมี 0 ถึง 20 องศา', loss: [100, 100] },
  { id: 'dip-upper', group: 'ภาพซ้อน (Diplopia)', label: 'ในรัศมีมากกว่า 20 องศา บริเวณครึ่งบน', loss: [40, 40] },
  { id: 'dip-lower', group: 'ภาพซ้อน (Diplopia)', label: 'ในรัศมีมากกว่า 20 องศา บริเวณครึ่งล่าง', loss: [60, 60] },
  { id: 'lid-loss', group: 'หนังตา / เยื่อบุตา', label: 'สูญเสียหนังตา · Entropion · Ectropion · lagophthalmos', loss: [5, 10], cap: 15 },
  { id: 'lid-symb', group: 'หนังตา / เยื่อบุตา', label: 'Symblepharon', loss: [11, 15], cap: 15 },
  { id: 'lac-inter', group: 'น้ำตา', label: 'น้ำตาไหลเป็นบางครั้ง (ร่วมกับพยาธิสภาพของทางเดินน้ำตา)', loss: [5, 10], cap: 15 },
  { id: 'lac-const', group: 'น้ำตา', label: 'น้ำตาไหลเอ่อตลอดเวลา (ร่วมกับพยาธิสภาพของทางเดินน้ำตา)', loss: [11, 15], cap: 15 },
];

// lossPct = ร้อยละสูญเสียของตาที่ผิดปกติ · otherVas = VAS ของตาอีกข้าง (ปริยาย 100)
// cap = เพดาน VSI (15 สำหรับหนังตา/น้ำตา) หรือ null
export function adnexaResult(lossPct, otherVas = 100, cap = null) {
  const vasAffected = clamp(100 - Number(lossPct), 0, 100);
  const r = visionResult({ vasRE: vasAffected, vasLE: Number(otherVas) });
  let vsi = r.vsi;
  const capped = cap != null && vsi > cap;
  if (capped) vsi = cap;
  return { ...r, vasAffected, vsi, wpi: vsiToWpi(vsi), capped, cap };
}

// ============================================================
// ตารางที่ 6-9 การสูญเสียรูปลักษณ์ของเบ้าตา — ค่า = WPI โดยตรง (เลือกหัวข้อรุนแรงสุด)
//   สูญเสียลูกตา (enucleation/evisceration/phthisis bulbi) = สูญเสียสายตา 100% ของตาข้างนั้น (VSI 25% ถ้าตาอีกข้างปกติ)
//   แล้วรวมกับรูปลักษณ์เบ้าตา (11–23%) ด้วยตารางค่ารวม
// ============================================================
export const ORBIT_6_9 = [
  { range: [11, 14], desc: ['ต้องสังเกตจึงจะทราบว่าใส่ตาปลอม', 'ไม่มีภาวะตายุบลง', 'ไม่มีหนังตาตก', 'กลอกตาปลอมได้เกือบปกติ'] },
  { range: [15, 19], desc: ['คนทั่วไปพอทราบว่าใส่ตาปลอม', 'ตายุบลงเล็กน้อย', 'หนังตาตกเล็กน้อย', 'กลอกตาปลอมได้บ้าง'] },
  { range: [20, 23], desc: ['Phthisis bulbi', 'คนทั่วไปเห็นได้ชัดเจนว่าใส่ตาปลอม', 'ลูกตาดูยุบลงชัดเจน', 'มีหนังตาตกมาก', 'ไม่สามารถกลอกตาปลอมได้เลย', 'ลูกตา 2 ข้างไม่อยู่ในระดับเดียวกัน'] },
];

// การสูญเสียสายตาจากการสูญเสียลูกตา (VSI) เมื่อตาอีกข้างมี VAS = otherVas
export function globeLossVsi(otherVas = 100) { return visionResult({ vasRE: 0, vasLE: Number(otherVas) }).vsi; }
