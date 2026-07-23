// engine.js — เครื่องคำนวณการสูญเสียสมรรถภาพ แขน/ขา/หลัง (MSK · Upper/Lower Extremity)
// ยกมาตรงจากบล็อก __ENGINE__ ใน occumed-impairment-calculator.html (ผ่านเทสต์เคส 44% แล้ว)
// ⚠️ ห้ามแก้ลอจิก — pure functions ไม่มี DOM · แปลงเป็น ES module (เพิ่มเฉพาะ export ท้ายไฟล์)
// อ้างอิง: คู่มือประเมินการสูญเสียสมรรถภาพฯ (กองทุนเงินทดแทน) — บทที่ 2 (แขน), 3 (ขา), 19 (ค่ารวม)

// ---- ตัวคูณแปลงนิ้ว→มือ (ตาราง 2-11 ก) ----
const DF={thumb:.40,index:.20,middle:.20,ring:.10,little:.10};

/*__ENGINE_START__ (pure calc, ไม่มี DOM) — ยกมาตรงจากไฟล์ต้นแบบ */
const round=v=>Math.round(v), d2h=(v,d)=>round(v*DF[d]), h2u=v=>round(v*.9), u2w=v=>round(v*.6);
/* ตารางค่ารวม (บทที่ 19)
   ก% รวมกับ ข% = ก% + ข%(100% − ก%) · ปัดเศษทุกขั้น
   ค่ามากที่สุดต้องอยู่แนวตั้ง (ซ้าย) เสมอ → เรียงมากไปน้อยก่อน
   มากกว่า 2 ค่า: จับคู่ทีละคู่แล้วนำผลของแต่ละคู่มารวมกันอีกครั้งในแบบเดียวกัน */
const pair=(a,b)=>round(a+b-a*b/100);
const combine=list=>{
  let v=list.filter(x=>x>0).sort((a,b)=>b-a);
  while(v.length>1){
    const nx=[];
    for(let i=0;i+1<v.length;i+=2) nx.push(pair(v[i],v[i+1]));
    if(v.length%2) nx.push(v[v.length-1]);
    v=nx.sort((a,b)=>b-a);
  }
  return v.length?v[0]:0;
};
const sum=l=>l.reduce((a,b)=>a+b,0);
const le2wp=v=>round(v*0.40);            // ขา → ทั้งร่างกาย (ตาราง 3-1)

/* ===== P0-3 เพดานค่ารวมเทียบตารางการตัดขาด (คู่มือหน้า 146) =====
   CAPS สร้างจาก upperExtremity.amputation / lowerExtremity.amputation จริง (buildCaps)
   ค่าที่ได้ = 100% ของแต่ละหน่วย (นิ้ว/มือ/แขน/ขา/เท้า) = การตัดขาดที่ระดับสูงสุดของหน่วยนั้น
   หมายเหตุ: dbi ไม่ได้ระบุ "ระดับข้อ" ของแต่ละวินิจฉัย จึงยังใช้เพดานระดับหน่วยได้เท่านั้น
   เพดานละเอียดระดับข้อ (เช่น DIP 45%) ต้องรอ tag ระดับข้อใน data (P1) */
const capAt=(v,m)=>v>m?{v:m,capped:true}:{v,capped:false};
function buildCaps(AMP,LAMP){
  let digit=0,hand=0,ue=0;
  (AMP||[]).forEach(g=>(g.rows||[]).forEach(r=>{
    if(r[1]!=null)digit=Math.max(digit,r[1]);   // ร้อยละของนิ้ว
    if(r[2]!=null)hand=Math.max(hand,r[2]);      // ร้อยละของมือ
    if(r[3]!=null)ue=Math.max(ue,r[3]);}));      // ร้อยละของแขน
  let leg=0,foot=0;
  (LAMP||[]).forEach(r=>{ if(r[2]!=null)leg=Math.max(leg,r[2]); if(r[3]!=null)foot=Math.max(foot,r[3]); });
  return {digit:digit||100,hand:hand||100,ue:ue||100,leg:leg||100,foot:foot||100};
}

/* ===== รวมรายการแบบรู้กายวิภาค (SPEC §3.3, 7 แบบ) + เพดาน (P0-3) =====
   item: {unit:'ue'|'le', lvl:'digit'|'ue'|'le', grp, df?, thumb?, nat, ...}
   • นิ้วเดียวกัน (grp): นิ้วหัวแม่มือ "บวกตรง" ข้ามข้อ · นิ้วอื่น "ตารางค่ารวม" ข้ามข้อ → ตัด 100% ของนิ้ว
     (จุดพลาดง่ายที่สุดตาม SPEC — แยกด้วยธง item.thumb)
   • นิ้ว → มือ (×df) แล้ว "บวกนิ้วตรง" → ตัด 100% ของมือ → มือ → แขน (×0.90)
   • ข้อมือ/ศอก/ไหล่/เส้นประสาท/ตัดขาด: รวมกับผลรวมนิ้วด้วย "ตารางค่ารวม" (ข้ามภูมิภาค) → ตัด 100% แขน
   • ขา: รวม %ขา ด้วย "ตารางค่ารวม" → ตัด 100% ของขา
   • ข้ามอวัยวะ (แขน+ขา): แปลงเป็น %ร่างกายก่อน แล้วจึง "ตารางค่ารวม" (คู่มือบทที่ 19) */
function aggregate(items,CAPS){
  const U=items.filter(i=>i.unit!=='le'), L=items.filter(i=>i.unit==='le');
  const caps=[];
  // --- นิ้วมือ: จัดกลุ่มตาม grp (นิ้ว) ---
  const fingers={};
  U.filter(i=>i.lvl==='digit').forEach(i=>{(fingers[i.grp]=fingers[i.grp]||[]).push(i)});
  let hand=0; const fdet=[];
  Object.keys(fingers).forEach(grp=>{
    const arr=fingers[grp], df=arr[0].df||0, thumb=!!arr[0].thumb;
    const raw=thumb?sum(arr.map(i=>i.nat)):combine(arr.map(i=>i.nat));   // หัวแม่มือบวกตรง · อื่นตารางค่ารวม
    const c=capAt(raw,CAPS.digit); if(c.capped)caps.push('นิ้ว('+grp+') → '+CAPS.digit+'%');
    hand+=round(c.v*df); fdet.push({grp,val:c.v,raw,df,thumb,n:arr.length,capped:c.capped});
  });
  const hc=capAt(hand,CAPS.hand); if(hc.capped)caps.push('มือ → '+CAPS.hand+'%'); hand=hc.v;
  const fingersUE=hand>0?h2u(hand):0;
  // --- ภูมิภาคอื่นของแขน: จัดกลุ่มตาม grp (บวกตรงในกลุ่มเดียวกัน) ---
  const regs={};
  U.filter(i=>i.lvl!=='digit').forEach(i=>{(regs[i.grp]=regs[i.grp]||[]).push(i)});
  const regVals=[];
  Object.keys(regs).forEach(grp=>{
    const c=capAt(sum(regs[grp].map(i=>i.nat)),CAPS.ue); if(c.capped)caps.push(grp+' → '+CAPS.ue+'%');
    regVals.push({grp,val:c.v,capped:c.capped});
  });
  const ueParts=[fingersUE,...regVals.map(r=>r.val)].filter(x=>x>0);
  const uec=capAt(combine(ueParts),CAPS.ue); if(uec.capped)caps.push('แขนรวม → '+CAPS.ue+'%');
  const ueTotal=uec.v;
  // --- ขา ---
  const lec=capAt(combine(L.map(i=>i.nat)),CAPS.leg); if(lec.capped)caps.push('ขารวม → '+CAPS.leg+'%');
  const leTotal=lec.v;
  // --- อวัยวะ → ทั้งร่างกาย ---
  const ueBody=ueTotal>0?u2w(ueTotal):0, leBody=leTotal>0?le2wp(leTotal):0;
  const body=(U.length&&L.length)?combine([ueBody,leBody].filter(x=>x>0)):ueBody+leBody;
  return {ueTotal,leTotal,ueBody,leBody,body,hand,fingersUE,fdet,regVals,
          hasUE:U.length>0,hasLE:L.length>0,caps};
}
function netAdjust(cdx,mods){if(!mods.length)return{net:null,grade:'B',bumped:false};
 let m=mods.slice(),b=false,n=m.reduce((s,v)=>s+(v-cdx),0);
 if(cdx===4&&n<=0&&m.every(v=>v===4)){m=m.map(v=>v+1);n=m.reduce((s,v)=>s+(v-cdx),0);b=true}
 return{net:n,grade:n<=-1?'A':(n>=1?'C':'B'),bumped:b}}
/*__ENGINE_END__*/

// ---- exports (เพิ่มเพื่อใช้เป็น ES module · ไม่แตะลอจิกด้านบน) ----
export { DF, round, d2h, h2u, u2w, pair, combine, sum, le2wp, capAt, buildCaps, aggregate, netAdjust };
