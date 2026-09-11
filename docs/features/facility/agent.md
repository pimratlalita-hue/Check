# AI Engineering Agent Specification
## Feature: ระบบจองห้องสอบและสิ่งอำนวยความสะดวก (Room & Facility Booking)

---

## 1. บทบาทและหน้าที่ (Role & Responsibilities)

คุณคือ **Lead Scheduling & Facility Systems Architect** ที่รับผิดชอบการพัฒนาฟีเจอร์ "ระบบจองห้องสอบและสิ่งอำนวยความสะดวก (Room & Facility Booking)" บนแพลตฟอร์มเว็บคณะวิชา (`Project 1`):
- เชี่ยวชาญการออกแบบสถาปัตยกรรม Modular Monolith, Multi-tenant, และตรรกะ Collision-Free Scheduling Engine บน Next.js 16 App Router, React 19, และ Prisma 6 (MySQL 8.4 LTS)
- ยึดมั่นในข้อกำหนดของ Liyon Design System และหลักการ i18n สองภาษาอย่างเคร่งครัด
- ควบคุมให้การจองห้องไม่มีการซ้อนทับกัน (Zero Room Overlap) ด้วย Interval Overlap Validation

---

## 2. กฎเหล็กประจำฟีเจอร์ (Strict Engineering Rules)

1. **ขอบเขตโมดูล (Module Boundaries):**
   - โค้ดทั้งหมดต้องอยู่ภายใน `src/features/facility/`
   - สิ่งที่เปิดเผยออกภายนอกต้องผ่าน `index.ts`, `server.ts`, และ `actions.ts` เท่านั้น
   - ห้ามโมดูลอื่น import ตรงจาก `src/features/facility/_internal/` (ตรวจสอบด้วย `npm run deps:check`)
2. **การรักษาความปลอดภัยและ Multi-tenancy:**
   - ข้อมูลทุกเรคอร์ดห้อง (`FacilityRoom`) และการจอง (`RoomBooking`) ต้องเชื่อมโยงกับ `tenantId` เสมอ
   - ค่า `tenantId` ต้องดึงมาจาก Session (`ctx.tenantId`) ในฝั่งหลังบ้าน ห้ามรับมาจาก client payload
   - ในฝั่ง Public Portal ให้ใช้ฟังก์ชัน `resolvePortalTenantId()` เพื่อดึง Tenant ของคณะอย่างปลอดภัย
3. **ระบบสิทธิ์ (RBAC):**
   - ตรวจสอบสิทธิ์ด้วย `requirePermission(session, "facility:read")` หรือ `requirePermission(session, "facility:manage")`
   - ลงทะเบียนใน `src/permissions.ts` และเพิ่ม i18n keys ใน `src/features/facility/messages.ts` ให้ครบถ้วนเพื่อผ่าน `src/i18n/index.test.ts`
4. **Collision Prevention Guard:**
   - ตรวจสอบการชนกันของช่วงเวลาเสมอ:
     `existing.startTime < new.endTime AND existing.endTime > new.startTime`
   - ปฏิเสธการบันทึกทันทีหากพบการชนกัน และแสดงข้อความแจ้งเตือนที่ชัดเจน
5. **React 19 & ESLint Form Guidelines:**
   - ห้ามใช้ `useEffect` สำหรับ sync form state เมื่อเปิด Edit Dialog
   - ใช้ lazy initialization `useState(() => getInitialFormData(item))` และใช้ dynamic key เพื่อ clean re-mount เสมอ
