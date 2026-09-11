# AI Coding Instructions & Architectural Rules
## Feature: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & PR Management)

---

## 1. กฎเหล็กสถาปัตยกรรม Modular Monolith
1. **ขอบเขตโฟลเดอร์:**
   - โค้ดเชิงธุรกิจทั้งหมดต้องอยู่ภายใน `src/features/news/` เท่านั้น
   - หน้า UI เชื่อมโยงอยู่ที่:
     - Portal View: `src/app/(portal)/news/`
     - Admin View: `src/app/(admin)/news/`
2. **Public API Boundaries:**
   - ภายนอกสามารถเรียกใช้เฉพาะไฟล์ต่อไปนี้:
     - `src/features/news/index.ts` — DTO types และ Client-safe helpers
     - `src/features/news/server.ts` — Server queries สำหรับ Server Components
     - `src/features/news/actions.ts` — Server Actions สำหรับ Mutations
   - ห้าม Feature อื่น import โค้ดจาก `src/features/news/_internal/` โดยเด็ดขาด (บังคับตรวจด้วย `npm run deps:check`)
3. **Multi-Tenancy:**
   - ทุกคำสั่ง Query และ Mutation ต้องมี `tenantId` จาก Session (`ctx.tenantId`) เสมอ ห้ามรับ `tenantId` ตรงจาก client payload

---

## 2. กฎการเขียน Server Actions และ Validation
1. ทุก Server Action ต้องห่อด้วย `runAction(...)` จาก `@/shared/lib/actions` เพื่อคืนค่าแบบ `ActionResult<T>`
2. ต้องตรวจสอบ Input DTO ด้วย Zod Schema ร่วมกับ `zodErrorMap(locale)` สำหรับข้อความ Error สองภาษา
3. ก่อนดำเนินการที่แก้ไขข้อมูล ต้องตรวจสอบสิทธิ์ด้วย `requirePermission(session, "news:manage")` หรือสิทธิ์ที่เกี่ยวข้องเสมอ
4. การเปลี่ยนแปลงข้อมูลสำคัญต้องบันทึก `audit_logs` ผ่าน `writeAudit(...)`

---

## 3. กฎการใช้ภาษา (i18n)
1. **ห้ามฮาร์ดโค้ดข้อความ UI เป็นอันขาด:** ทุกข้อความที่แสดงแก่ผู้ใช้ต้องใช้ `t("news....")`
2. กำหนดชุดคำแปลสองภาษา (TH/EN) ไว้ใน `src/features/news/messages.ts` และลงทะเบียนใน `src/i18n/index.ts`
3. จัดรูปแบบวันที่ด้วย `formatDate(date, locale)` เพื่อแสดง พ.ศ. เมื่อใช้ภาษาไทย และ ค.ศ. เมื่อใช้ภาษาอังกฤษ

---

## 4. กฎการออกแบบ UI (Liyon Design System)
1. ฝั่ง Admin Console ต้องใช้ Component จาก `@/shared/components/liyon`:
   - `LiyonCard`, `DataTable`, `StatusPill`, `LiyonDialog`, `LiyonField`, `LiyonSelect`
2. ตารางแสดงรายการข่าวต้องมีสถานะ `empty` และ `error` ครบถ้วน
3. แสดงสถานะข่าวด้วย `StatusPill`:
   - `PUBLISHED` -> `tone="ok"`
   - `DRAFT` -> `tone="off"`
   - `ARCHIVED` -> `tone="warn"`
