# CLAUDE.md — คู่มือโปรเจกต์ OCCUMED Walkthrough Survey

## ภาพรวมโปรเจกต์
**OCCMED** เป็นชุดเครื่องมือด้านอาชีวเวชศาสตร์แบบ **multi-module** (static site, **ไม่มี build step**) — มี shell กลางที่ root ลิสต์โมดูล แต่ละโมดูลเปิดในเบราว์เซอร์ได้ทันที

- **โครงสร้าง:**
  - `/` = `index.html` — OCCMED hub (ลิสต์โมดูลจาก `shared/registry.js`)
  - `/walkthrough/` = `walkthrough/index.html` — โมดูลเดินสำรวจ (single-file เดิม **ห้ามแตะไส้ใน**)
  - `/impairment/gi/` = โมดูลประเมินการสูญเสียสมรรถภาพ ทางเดินอาหาร (logic แยกไฟล์ `engine.js` + `engine.test.js`, stateless ไม่แตะ DB)
  - `/shared/` = `theme.css` (token กลาง) + `registry.js` (**จุดเดียวที่ประกาศโมดูล**)
  - `/reference/` = หน้าอ้างอิง (เครื่องจักร / โลหะ)
- **โมดูลใหม่:** เพิ่มใน `shared/registry.js` ที่เดียว
- **Production:** https://occmed.ikigaimedihealth.com

### เจ้าของ / ผู้ใช้งาน
หมอเกฟ (CFO/CEO กลุ่ม IKIGAI) — ทำงานนอกออฟฟิศบ่อย จึงต้องเน้นใช้งานง่ายบนมือถือและมีปุ่มคัดลอกสำหรับ deploy เสมอ

กลุ่ม IKIGAI:
- คลินิก **IKIGAI MEDIHEALTH**
- ร้านอาหาร **IKIGAI WELTRADE** (NAMA PASTA SRIRACHA / HYPOPLARAEMIA)
- แล็บ **OMNIA HEALTH**

---

## Design System (บังคับ — ห้ามเปลี่ยน)
- **สี CI:** Navy `#0B2545` × Gold `#C8A046`
- **ฟอนต์ preview:** LINE Seed Sans TH (fallback: Noto Sans Thai / Sarabun)
- **วันที่:** แสดงเป็นพุทธศักราช (พ.ศ. = ค.ศ. + 543)
- **Mobile-first** เสมอ
- **ภาษา:** ไทยทางการ + คำเทคนิคภาษาอังกฤษในวงเล็บ
- **ปุ่มคัดลอก (copy-to-clipboard):** ทุก deliverable / ปุ่มส่งออก ต้องมีปุ่มคัดลอกสำหรับ deploy เสมอ (เพราะทำงานนอกออฟฟิศ)

---

## สถาปัตยกรรม

### 5 แท็บหลัก
1. ข้อมูลทั่วไป
2. แผนก & สิ่งคุกคาม
3. ประเมินความเสี่ยง
4. ตรวจสุขภาพ
5. สรุป & รายงาน

### Realtime Collaboration
- ผ่าน **Supabase** (broadcast + presence)
- เข้าห้องด้วย **รหัสสำรวจ + รหัสผ่านทีม**
- Supabase URL + publishable key ฝังในไฟล์แล้ว (ตัวแปร `SB_DEFAULT`) — **ห้ามลบหรือแก้ค่านี้**

### ความปลอดภัย
- เข้าถึงผ่าน **RPC** ที่ hash รหัสผ่าน (`survey_create` / `survey_join` / `survey_save`)
- ใช้ **RLS** (Row Level Security)

---

## วิธี Deploy ขึ้น Production
โฮสต์บน **Droplet (DigitalOcean)** ที่ https://occmed.ikigaimedihealth.com

ขั้นตอนหลังแก้ไฟล์เสร็จ:
1. `git add` + `git commit`
2. `git push` ขึ้น branch **main**
3. ผู้ใช้ SSH เข้า Droplet แล้วรัน `occmed-deploy`
   (`git pull origin main` ที่ `/var/www/occmed-src` → **rsync ทั้งไซต์** ไป `/var/www/occmed/`)
   - สคริปต์ deploy อยู่ในรีโป: **`deploy/occmed-deploy.sh`** (ต้นฉบับ) → วางที่ `/usr/local/bin/occmed-deploy`
   - มี `set -e` + เช็ค `<!doctype html>` ของ hub + walkthrough ก่อน rsync (ถ้าไฟล์พังจะหยุดก่อน เว็บเดิมไม่พัง)

---

## ข้อควรระวัง
- ⚠️ **อย่าแตะ IKIGAI OS** หรือระบบอื่นบนเซิร์ฟเวอร์
- ✅ **ทดสอบว่า HTML เปิดได้จริงก่อน commit** ทุกครั้ง
- 📄 **โมดูล walk-through คงเป็น single-file** (`walkthrough/index.html`) — ห้ามแยกไฟล์/แตะไส้ใน · โมดูลใหม่จัดไฟล์ได้ตามเหมาะสม (logic แยกจาก UI) แต่ยังเป็น static ไม่มี build/React
- 🔒 **ห้ามแก้/ลบ `SB_DEFAULT`** (Supabase URL + key)
- 🎨 **ห้ามเปลี่ยน Design System** (สี / ฟอนต์ / พ.ศ. / ปุ่มคัดลอก)
- 🩺 **ระวังคำว่า "แพทย์อาชีวเวชศาสตร์" (occupational medicine physician):** ให้มีเป็นตัวเลือกได้ แต่ต้องมี **"แพทย์" (ธรรมดา)** ให้เลือกด้วยเสมอ — อย่าบังคับให้เป็นแพทย์เฉพาะทางอาชีวเวชศาสตร์เท่านั้น
