# Curriculum Feature Implementation Plan

---

## แผนการดำเนินงาน 7 ขั้นตอน (7-Phase Implementation Strategy)

- [x] **Phase 0: Blueprints & Specifications**
  - PRD (`docs/features/curriculum/prd.md`)
  - Agent Persona (`docs/features/curriculum/agent.md`)
  - Architecture Blueprint (`docs/features/curriculum/architecture.md`)
  - Schema Specification (`docs/features/curriculum/schema.md`)
  - Implementation Plan (`docs/features/curriculum/implementation-plan.md`)
  - Progress Tracker (`docs/features/curriculum/progress.md`)

- [x] **Phase 1: Database Schema & Migration**
  - ปรับปรุง `prisma/schema.prisma` เพิ่ม enums `DegreeLevel`, `ProgramType`, `ProgramStatus`, `CourseCategory`
  - เพิ่มโมเดล `Program` และ `ProgramCourse`
  - เพิ่ม relation `programs Program[]` ใน `Tenant` และ `Department`
  - รันไมเกรชัน `npx prisma migrate dev --name add_curriculum_feature`
  - รีสตาร์ต Next.js dev server เพื่อ sync Prisma client generated types

- [x] **Phase 2: Permissions & i18n Dictionary**
  - สร้าง `src/features/curriculum/permissions.ts` กำหนด `curriculum:read` และ `curriculum:manage`
  - ลงทะเบียนใน `src/permissions.ts`
  - สร้าง `src/features/curriculum/messages.ts` พร้อมคีย์ `roles.module.curriculum`, `perm.curriculum:*`, และ `curriculum.*` ทั้ง th และ en
  - ลงทะเบียนใน `src/i18n/index.ts`

- [x] **Phase 3: Domain Logic, Zod Validation & Unit Tests**
  - สร้าง `src/features/curriculum/_internal/schemas.ts` พร้อม localized error maps
  - สร้าง `src/features/curriculum/_internal/services/curriculum.service.ts` สำหรับ CRUD และ Query
  - สร้าง `src/features/curriculum/_internal/services/curriculum.service.test.ts`
  - รัน `npx vitest run src/features/curriculum/_internal/services/curriculum.service.test.ts` (12 tests passed)

- [x] **Phase 4: Server Actions & Public Feature API**
  - สร้าง `src/features/curriculum/_internal/actions.ts` และ re-export ที่ `src/features/curriculum/actions.ts`
  - สร้าง `src/features/curriculum/server.ts` และ `src/features/curriculum/index.ts`
  - ตรวจสอบความถูกต้องของสถาปัตยกรรมด้วย `npm run deps:check` (0 violations)

- [x] **Phase 5: Admin Console UI (`/curriculum`)**
  - พัฒนาหน้าจัดการหลักสูตร `src/app/(admin)/curriculum/page.tsx`
  - พัฒนา Client Component `curriculum-client.tsx` (Liyon DataTable, Filter Tabs, Status Pills)
  - พัฒนา Dialog `curriculum-dialog.tsx` (Lazy initial state, no useEffect anti-pattern)
  - พัฒนา Dialog `courses-dialog.tsx` (จัดการโครงสร้างรายวิชาในหลักสูตร)
  - เพิ่มเมนูใน `src/components/layout/sidebar-nav.ts` พร้อมอัปเดตแบบทดสอบ `sidebar-nav.test.ts`

- [x] **Phase 6: Public Portal UI (`/portal/curriculum`)**
  - เพิ่มเมนู "หลักสูตรการศึกษา" ใน `src/app/portal/layout.tsx`
  - พัฒนาหน้าแสดงรายการหลักสูตร `/portal/curriculum/page.tsx` (Degree level tabs, cards, credit & duration badges)
  - พัฒนาหน้ารายละเอียดหลักสูตร `/portal/curriculum/[slug]/page.tsx` (PLOs, โครงสร้างรายวิชา, อาชีพ, ดาวน์โหลด มคอ.2)

- [x] **Phase 7: Integration Tests, Seed Data & Quality Gate**
  - สร้าง `src/features/curriculum/_internal/services/curriculum.service.int.test.ts`
  - เพิ่มข้อมูล Mock Data หลักสูตร 5 หลักสูตรครบทุกระดับการศึกษาใน `prisma/seed.ts`
  - รันการตรวจสอบคุณภาพครบวงจร `npm run check` (161 unit tests, 60 integration tests ผ่าน 100%)
  - รัน `npm run db:seed` เพื่อเตรียมข้อมูลให้หน้าจอพร้อมใช้งานจริง
