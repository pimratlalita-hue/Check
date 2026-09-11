# Implementation Plan: 7 Phases
## Feature: ทำเนียบบุคลากรและอาจารย์ (Faculty & Staff Directory)

---

## สรุปแผนการพัฒนา 7 เฟส (7-Phase Roadmap)

### Phase 1: Database Schema & Migration
- [ ] เพิ่ม Enum `StaffType` และ `AcademicRank` ใน `prisma/schema.prisma`
- [ ] เพิ่ม Model `Department` และ `StaffProfile` ใน `prisma/schema.prisma` พร้อมผูก Relation กับ `Tenant` และ `User`
- [ ] รัน Migration บน MySQL `ums_dev` สร้าง Migration file: `add_staff_feature`
- [ ] รัน `prisma generate` เพื่ออัปเดต Prisma Client
- [ ] รีสตาร์ต Next.js development server เพื่อโหลดโมเดลใหม่

### Phase 2: Feature Foundation, Permissions & i18n
- [ ] สร้างโครงสร้างไดเรกทอรี `src/features/staff/`
- [ ] กำหนด Permission codes ใน `src/features/staff/permissions.ts` (`staff:read`, `staff:manage`)
- [ ] ลงทะเบียน Permission ใน `src/permissions.ts`
- [ ] จัดทำพจนานุกรมแปลภาษาไทยและอังกฤษใน `src/features/staff/messages.ts`
- [ ] ลงทะเบียนพจนานุกรมใน `src/i18n/index.ts`

### Phase 3: Core Domain Logic & Unit Tests
- [ ] สร้าง Zod validation schema ใน `src/features/staff/_internal/schemas/staff.schema.ts`
- [ ] สร้าง Repository ใน `src/features/staff/_internal/repositories/staff.repository.ts`
- [ ] สร้าง Business Service ใน `src/features/staff/_internal/services/staff.service.ts`
- [ ] เขียน Unit Tests ใน `src/features/staff/_internal/services/staff.service.test.ts` (Vitest) ให้ผ่าน 100%

### Phase 4: Server Actions & Public API
- [ ] สร้าง Server Actions ใน `src/features/staff/actions.ts` พร้อมการตรวจสอบสิทธิ์และ Audit Logging
- [ ] สร้าง Server Queries ใน `src/features/staff/server.ts` สำหรับ Server Components
- [ ] สร้าง Public Exports และ Types ใน `src/features/staff/index.ts`

### Phase 5: Admin Console UI (`/staff`)
- [ ] สร้างหน้า Server Component `src/app/(admin)/staff/page.tsx`
- [ ] สร้าง Client Components: `staff-client.tsx`, `staff-dialog.tsx`, `department-dialog.tsx` ตามมาตรฐาน Liyon
- [ ] เพิ่มเมนู "ทำเนียบบุคลากร" ใน `src/components/layout/sidebar-nav.ts`
- [ ] ปรับปรุง Unit Test `src/components/layout/sidebar-nav.test.ts` ให้ผ่าน

### Phase 6: Public Portal Directory UI (`/portal/staff` & `/portal/staff/[id]`)
- [ ] สร้างหน้ารายชื่อคณาจารย์และบุคลากร `src/app/portal/staff/page.tsx` (แถบผู้บริหาร, แท็บภาควิชา, ค้นหาแบบ Real-time)
- [ ] สร้างหน้ารายละเอียดโปรไฟล์คณาจารย์ `src/app/portal/staff/[id]/page.tsx` (ประวัติการศึกษา, ความเชี่ยวชาญ, ลิงก์งานวิจัย)
- [ ] เพิ่มลิงก์ "ทำเนียบบุคลากร" ในส่วน Navbar ของ `src/app/portal/layout.tsx`

### Phase 7: Verification, Integration Tests & Mock Data Seeding
- [ ] สร้าง Integration Tests ใน `src/features/staff/_internal/services/staff.service.int.test.ts`
- [ ] เพิ่มข้อมูล Mock Data คณาจารย์ 8-10 ท่านและภาควิชาใน `prisma/seed.ts`
- [ ] รันการตรวจสอบความถูกต้องทั้งระบบ (`npm run check`): type-check, lint, deps:check, test ให้เขียว 100%
- [ ] ตรวจสอบการทำงานจริงบนเบราว์เซอร์
