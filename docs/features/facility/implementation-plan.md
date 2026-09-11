# Implementation Plan: Room & Facility Booking

---

## 1. ข้อมูลภาพรวม (Overview)
- **Feature Name:** Room & Facility Booking (`facility`)
- **Objective:** พัฒนาระบบบริหารจัดการห้องสอบวิทยานิพนธ์ ห้องประชุม และสิ่งอำนวยความสะดวก พร้อมอัลกอริทึมป้องกันเวลาชนกัน และการเชื่อมต่อห้องสอบออนไลน์
- **Stack:** Next.js 16 (App Router), React 19, Prisma 6 (MySQL 8.4 LTS), Tailwind CSS 4 (Liyon Design System), Zod

---

## 2. ขั้นตอนการดำเนินงาน 7 เฟส (7-Phase Implementation Roadmap)

### Phase 1: Database Schema & Migration
- เพิ่ม Enums `RoomType`, `BookingType`, `BookingStatus`, `MeetingPlatform`
- เพิ่มโมเดล `FacilityRoom` และ `RoomBooking` ใน `prisma/schema.prisma`
- เชื่อมความสัมพันธ์กับ `Tenant` และ `Petition`
- รัน migration `npx prisma migrate dev --name add_facility_feature`

### Phase 2: Foundation, Permissions & i18n
- สร้าง `src/features/facility/permissions.ts` กำหนด `facility:read` และ `facility:manage`
- ลงทะเบียนใน `src/permissions.ts`
- สร้าง `src/features/facility/messages.ts` สองภาษา (ไทยและอังกฤษ) ครบถ้วน
- ลงทะเบียนใน `src/i18n/index.ts` และทดสอบด้วย `index.test.ts`

### Phase 3: Domain Logic, Validation Schemas & Unit Tests
- สร้าง Zod schemas ใน `src/features/facility/_internal/schemas.ts`
- พัฒนาบริการหลักใน `src/features/facility/_internal/services/facility.service.ts`:
  - CRUD ห้องและสิ่งอำนวยความสะดวก
  - อัลกอริทึมตรวจสอบการชนกันของช่วงเวลา (Interval Collision Guard)
  - ฟังก์ชันตรวจสอบเวลาว่างของห้อง (`checkRoomAvailability`)
  - ฟังก์ชันสร้างการจอง และปรับสถานะ
  - สถิติการใช้งาน (`getFacilityStats`)
- สร้าง Unit tests ใน `src/features/facility/_internal/services/facility.service.test.ts`

### Phase 4: Server Actions & Public Module API
- สร้าง `src/features/facility/_internal/actions.ts` และ re-export ผ่าน `src/features/facility/actions.ts`
- สร้าง `src/features/facility/server.ts` และ `src/features/facility/index.ts`
- ตรวจสอบความถูกต้องของขอบเขตโมดูลด้วย `npm run deps:check`

### Phase 5: Admin Console UI (`/facility`)
- สร้าง `src/app/(admin)/facility/page.tsx`
- สร้าง `src/app/(admin)/facility/_components/facility-client.tsx` (KPI stats, แท็บ Schedule และ Rooms Management)
- สร้าง `src/app/(admin)/facility/_components/room-form-dialog.tsx`
- สร้าง `src/app/(admin)/facility/_components/booking-detail-dialog.tsx`
- อัปเดต `sidebar-nav.ts` และ `sidebar-nav.test.ts`

### Phase 6: Public Portal UI (`/portal/facility`)
- เพิ่มเมนูใน `src/app/portal/layout.tsx`
- สร้าง `src/app/portal/facility/page.tsx` และ `_components/facility-portal-view.tsx`
  - ทำเนียบห้องและสิ่งอำนวยความสะดวก
  - ฟอร์มตรวจสอบความพร้อมและจองห้องออนไลน์แบบเรียลไทม์

### Phase 7: Integration Tests, Seed Data & Quality Gates
- สร้าง `src/features/facility/_internal/services/facility.service.int.test.ts`
- Seed ข้อมูลห้องและรายการจองตัวอย่างใน `prisma/seed.ts`
- รันครบ 6 ประตูคุณภาพ `npm run check` 100% เขียวล้วน
- รัน `npm run db:seed`
