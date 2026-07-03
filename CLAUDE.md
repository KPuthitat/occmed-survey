# CLAUDE.md — คู่มือโปรเจกต์ OCCUMED Walkthrough Survey

## ภาพรวมโปรเจกต์
เว็บแอปเดินสำรวจสถานประกอบการด้านอาชีวเวชศาสตร์ (occupational medicine walk-through survey) แบบ **single-file HTML** ไฟล์เดียว เปิดในเบราว์เซอร์ได้ทันที **ไม่มี build step** — ทุกอย่าง (HTML / CSS / JS) อยู่ในไฟล์เดียว

- **ไฟล์หลัก:** `OCCUMED_Walkthrough_Survey.html`
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
   (ดึงจาก repo → คัดลอกไป `/var/www/occmed/index.html`)

---

## ข้อควรระวัง
- ⚠️ **อย่าแตะ IKIGAI OS** หรือระบบอื่นบนเซิร์ฟเวอร์
- ✅ **ทดสอบว่า HTML เปิดได้จริงก่อน commit** ทุกครั้ง
- 📄 **รักษาโครงสร้าง single-file เสมอ** — ห้ามแยกไฟล์
- 🔒 **ห้ามแก้/ลบ `SB_DEFAULT`** (Supabase URL + key)
- 🎨 **ห้ามเปลี่ยน Design System** (สี / ฟอนต์ / พ.ศ. / ปุ่มคัดลอก)
- 🩺 **ระวังคำว่า "แพทย์อาชีวเวชศาสตร์" (occupational medicine physician):** ให้มีเป็นตัวเลือกได้ แต่ต้องมี **"แพทย์" (ธรรมดา)** ให้เลือกด้วยเสมอ — อย่าบังคับให้เป็นแพทย์เฉพาะทางอาชีวเวชศาสตร์เท่านั้น
