# Implementation Plan: Academic Document & Approval Workflow

---

## 1. ข้อมูลภาพรวม (Overview)
- **Feature Name:** Document & Approval Workflow (`workflow`)
- **Objective:** พัฒนาระบบยื่นและพิจารณาคำร้องวิชาการออนไลน์แบบไร้กระดาษ พร้อม State Machine 4 ระดับ และการติดตามสถานะคำร้องแบบเรียลไทม์
- **Stack:** Next.js 16 (App Router), React 19, Prisma 6 (MySQL 8.4 LTS), Tailwind CSS 4 (Liyon Design System), Zod

---

## 2. ขั้นตอนการดำเนินงาน 7 เฟส (7-Phase Implementation Roadmap)

### Phase 1: Database Schema & Migration
- เพิ่ม Enums `PetitionType`, `PetitionStatus`, `ApprovalAction` ใน `prisma/schema.prisma`
- เพิ่มโมเดล `Petition` และ `PetitionActivity` พร้อม Foreign Keys เชื่อมกับ `Tenant`, `Program`, และ `StaffProfile`
- รัน migration `npx prisma migrate dev --name add_workflow_feature`
- ตรวจสอบความถูกต้องของตารางใน MySQL 8.4

### Phase 2: Foundation, Permissions & i18n
- สร้าง `src/features/workflow/permissions.ts` กำหนด `workflow:read` และ `workflow:manage`
- ลงทะเบียนใน `src/permissions.ts`
- สร้าง `src/features/workflow/messages.ts` รองรับ 2 ภาษา (ไทยและอังกฤษ) ครอบคลุมทั้งสถานะ ประเภทคำร้อง ขั้นตอน และการแจ้งเตือน
- ลงทะเบียนใน `src/i18n/index.ts`
- รันการตรวจสอบ `src/i18n/index.test.ts`

### Phase 3: Domain Logic, Validation Schemas & Unit Tests
- สร้าง `src/features/workflow/_internal/schemas.ts` พร้อม validation messages
- พัฒนา `src/features/workflow/_internal/services/workflow.service.ts`:
  - ฟังก์ชันสร้าง Tracking Number อัตโนมัติ `REQ-YYYY-XXXX`
  - ตรรกะ State Machine การเลื่อนระดับการอนุมัติ (Approve, Return, Reject)
  - ฟังก์ชันสร้างเรคอร์ด `PetitionActivity` อัตโนมัติ
  - ฟังก์ชันสำหรับ Public Portal: `submitPublicPetition`, `trackPublicPetition`, `getPublicPetitionDetail`
  - ฟังก์ชันสำหรับ Admin: `listPetitions`, `getPetitionById`, `processPetitionAction`, `getWorkflowStats`
- สร้าง Unit Tests ใน `src/features/workflow/_internal/services/workflow.service.test.ts`

### Phase 4: Server Actions & Public Module API
- สร้าง `src/features/workflow/_internal/actions.ts` และ re-export ผ่าน `src/features/workflow/actions.ts`
- สร้าง `src/features/workflow/server.ts` และ `src/features/workflow/index.ts`
- ตรวจสอบ Modular Monolith boundaries ด้วย `npm run deps:check`

### Phase 5: Admin Console UI (`/workflow`)
- สร้าง `src/app/(admin)/workflow/page.tsx`
- สร้าง `src/app/(admin)/workflow/_components/workflow-client.tsx`:
  - KPI Stat Cards: ทั้งหมด, รอพิจารณา, อนุมัติเสร็จสิ้น, ส่งกลับ/ปฏิเสธ
  - แท็บตัวกรองสถานะ
  - Liyon `DataTable` แสดงคำร้องและสถานะ
- สร้าง `src/app/(admin)/workflow/_components/petition-review-dialog.tsx`:
  - ข้อมูลคำร้อง, ผู้ยื่น, วิทยานิพนธ์, เอกสารแนบ
  - แถบแสดงสถานะ 4 ขั้นตอน (Visual Stepper)
  - ประวัติการดำเนินการ (Audit Timeline)
  - ฟอร์มพิจารณา (อนุมัติ / ส่งกลับแก้ไข / ปฏิเสธ)
- อัปเดต `sidebar-nav.ts` เพิ่มเมนู `/workflow` และอัปเดต `sidebar-nav.test.ts`

### Phase 6: Public Portal UI (`/portal/petitions`)
- เพิ่มเมนู "ยื่นคำร้องออนไลน์" ใน `src/app/portal/layout.tsx`
- สร้าง `src/app/portal/petitions/page.tsx` และ `_components/petitions-portal-view.tsx`
  - แท็บยื่นคำร้องออนไลน์ พร้อมสร้างหมายเลขคำร้อง
  - แท็บค้นหาและติดตามสถานะคำร้องแบบเรียลไทม์ พร้อม Timeline Stepper

### Phase 7: Integration Tests, Seed Data & Quality Gates
- สร้าง `src/features/workflow/_internal/services/workflow.service.int.test.ts`
- ปรับปรุง `prisma/seed.ts` สร้างข้อมูลตัวอย่างคำร้อง 6-8 รายการ
- รัน `npm run check` ครบทั้ง 6 ประตูคุณภาพ 100%
- รัน `npm run db:seed`
