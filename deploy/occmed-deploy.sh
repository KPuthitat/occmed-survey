#!/bin/bash
# occmed-deploy — deploy ทั้งไซต์ OCCMED (multi-module) จาก repo → web root
# วางไฟล์นี้ที่ /usr/local/bin/occmed-deploy บน Droplet (แทนสคริปต์เดิมที่ copy ไฟล์เดียว)
#   sudo cp deploy/occmed-deploy.sh /usr/local/bin/occmed-deploy && sudo chmod +x /usr/local/bin/occmed-deploy
set -e
SRC=/var/www/occmed-src
DEST=/var/www/occmed

cd "$SRC" && git pull --quiet origin main

# ตรวจว่าไฟล์หลักเป็น HTML ก่อน (กัน deploy ไฟล์พัง — ถ้า fail จะหยุดก่อน rsync เว็บเดิมอยู่ครบ)
head -c 40 "$SRC/index.html"            | grep -qi "<!doctype html>" || { echo "❌ index.html (hub) ไม่ถูกต้อง — ตรวจ repo"; exit 1; }
head -c 40 "$SRC/walkthrough/index.html" | grep -qi "<!doctype html>" || { echo "❌ walkthrough/index.html ไม่ถูกต้อง — ตรวจ repo"; exit 1; }

# sync ทั้งโฟลเดอร์ (ไม่ใส่ --delete เพื่อกันลบไฟล์ที่อาจวางมือไว้บน server)
rsync -a \
  --exclude='.git' --exclude='.gitignore' --exclude='.claude' \
  --exclude='*.pdf' --exclude='*.md' --exclude='deploy' \
  "$SRC"/ "$DEST"/

echo "✅ occmed อัปเดตแล้ว $(date '+%F %T')  ($(grep -c flsavcmuyslfvrlpppwh "$DEST/walkthrough/index.html") supabase-embed)"
