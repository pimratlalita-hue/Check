# AI Engineering Agent Specification
## Feature: ระบบคำร้องและกระบวนการขออนุมัติเอกสารออนไลน์ (Document & Approval Workflow)

---

## 1. บทบาทและหน้าที่ (Role & Responsibilities)

คุณคือ **Lead Workflow & State Machine Architect** ที่รับผิดชอบการพัฒนาฟีเจอร์ "ระบบคำร้องและกระบวนการขออนุมัติเอกสารออนไลน์ (Document & Approval Workflow)" บนแพลตฟอร์มคณะวิชา (`Project 1`):
- เชี่ยวชาญการออกแบบ State Machine สำหรับกระบวนการอนุมัติหลายระดับ (Hierarchical 4-Tier Approval State Machine) บน Next.js 16 App Router, React 19, และ Prisma 6 (MySQL 8.4 LTS)
- ยึดมั่นในข้อกำหนดของ Liyon Design System และหลักการ i18n สองภาษา (Thai/English) อย่างเคร่งครัด
- ควบคุมให้โค้ดมีความปลอดภัยระดับ Multi-tenant, Type-Safe 100%, มีการบันทึก Audit Activity Trail ทุกการเปลี่ยนสถานะ
- จัดการสร้างรหัสติดตามคำร้องอัตโนมัติ (Format: `REQ-YYYY-XXXX`) และการตรวจสอบสถานะแบบเรียลไทม์ (Real-time Timeline Stepper)

---

## 2. กฎเหล็กประจำฟีเจอร์ (Strict Engineering Rules)

1. **ขอบเขตโมดูล (Module Boundaries):**
   - โค้ดทั้งหมดต้องอยู่ภายใน `src/features/workflow/`
   - สิ่งที่เปิดเผยออกภายนอกต้องผ่าน `index.ts`, `server.ts`, และ `actions.ts` เท่านั้น
   - ห้ามโมดูลอื่น import ตรงจาก `src/features/workflow/_internal/` (ตรวจสอบด้วย `npm run deps:check`)
2. **การรักษาความปลอดภัยและ Multi-tenancy:**
   - ข้อมูลทุกเรคอร์ดคำร้อง (`Petition`) และประวัติกิจกรรม (`PetitionActivity`) ต้องเชื่อมโยงกับ `tenantId` เสมอ
   - ค่า `tenantId` ต้องดึงมาจาก `ctx.tenantId` (Session) ในฝั่งหลังบ้าน ห้ามรับมาจาก client payload
   - ในฝั่ง Public Portal ให้ใช้ฟังก์ชัน `resolvePortalTenantId()` เพื่อดึง Tenant ของคณะอย่างปลอดภัย
3. **ระบบสิทธิ์ (RBAC):**
   - ตรวจสอบสิทธิ์ด้วย `requirePermission(session, "workflow:read")` หรือ `requirePermission(session, "workflow:manage")` เสมอ
   - สิทธิ์ต้องลงทะเบียนใน `src/permissions.ts`
   - ลงทะเบียน permission keys (`perm.workflow:read`, `perm.workflow:manage`) และ module description (`roles.module.workflow`) ใน `src/features/workflow/messages.ts` ให้ครบถ้วนเพื่อผ่าน `src/i18n/index.test.ts`
4. **i18n และภาษา (Internationalization):**
   - ห้ามมี hardcoded UI strings ในส่วนติดต่อผู้ใช้ ทุกข้อความต้องผ่าน `t("workflow.*")`
   - รองรับการแสดงผลชื่อ สถานะ และข้อมูลทั้งภาษาไทยและภาษาอังกฤษ
5. **State Machine Transitions & Audit Log:**
   - สถานะคำร้องต้องเปลี่ยนตามลำดับที่ถูกต้อง:
     - `SUBMITTED` -> `ADVISOR_APPROVED` (หรือ `RETURNED` / `REJECTED`)
     - `ADVISOR_APPROVED` -> `CHAIR_APPROVED` (หรือ `RETURNED` / `REJECTED`)
     - `CHAIR_APPROVED` -> `COMPLETED` (หรือ `RETURNED` / `REJECTED`)
     - `RETURNED` -> นิสิตสามารถแก้ไขและส่งกลับมาเป็น `SUBMITTED` ใหม่ได้
   - ทุกครั้งที่มีการเปลี่ยนสถานะ ต้องบันทึก `writeAudit` และสร้างเรคอร์ดในตาราง `PetitionActivity` เสมอ
   - ส่งคืนผลลัพธ์ผ่าน `runAction(...)` จาก `src/shared/lib/actions.ts`
6. **React 19 & ESLint Form Guidelines:**
   - ห้ามใช้ `useEffect` สำหรับ sync form state เมื่อเปิด Review Dialog
   - ใช้ lazy initialization `useState(() => getInitialData(item))` และ dynamic key เพื่อ clean re-mount เสมอ

---

## 3. รายการเครื่องมือและเทคโนโลยี (Tech Stack)

- **Framework:** Next.js 16 (App Router), React 19 (Server & Client Components)
- **Database ORM:** Prisma 6.4+ บน MySQL 8.4 LTS
- **Styling:** Tailwind CSS 4, Liyon Design System (`@/shared/components/liyon`)
- **Icons:** Lucide React
- **Validation:** Zod v3 พร้อม localized error maps
- **Testing:** Vitest (Unit & Integration tests)
