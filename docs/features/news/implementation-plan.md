# Step-by-Step Implementation Plan
## Feature: ระบบจัดการข่าวสารประชาสัมพันธ์ (News & PR Management)

---

## แผนปฏิบัติการแบ่งตามขั้นตอน (Task-by-Task Checklist)

### เฟส 1: การขยาย Database Schema & Migration
- [x] **Task 1.1:** เพิ่มโมเดล `NewsArticle`, `NewsAttachment` และ Enums (`NewsCategory`, `NewsStatus`) ใน `prisma/schema.prisma`
- [x] **Task 1.2:** เพิ่มความสัมพันธ์ `newsArticles NewsArticle[]` ในโมเดล `Tenant`
- [x] **Task 1.3:** รัน `npx prisma migrate dev --name add_news_feature` เพื่อสร้างตารางใน MySQL
- [x] **Task 1.4:** ตรวจสอบการสร้าง Prisma Client ด้วย `npx prisma generate`

### เฟส 2: กำหนดโครงสร้าง Core Module & Types
- [x] **Task 2.1:** สร้างโฟลเดอร์ `src/features/news/` และ `src/features/news/_internal/`
- [x] **Task 2.2:** สร้าง `src/features/news/permissions.ts` กำหนดสิทธิ์ `news:read`, `news:manage`, `news:publish`
- [x] **Task 2.3:** ลงทะเบียนชุดสิทธิ์ใหม่ใน `src/permissions.ts`
- [x] **Task 2.4:** สร้าง `src/features/news/messages.ts` สำหรับพจนานุกรม TH/EN และลงทะเบียนใน `src/i18n/index.ts`
- [x] **Task 2.5:** สร้าง `src/features/news/_internal/schemas.ts` สำหรับ Zod Input Validation

### เฟส 3: Business Logic & Data Services
- [x] **Task 3.1:** สร้าง `src/features/news/_internal/services/news.service.ts`:
  - `listNews(tenantId, query)`: ดึงรายการข่าวพร้อมการแบ่งหน้าและตัวกรอง
  - `getNewsBySlug(tenantId, slug)`: ดึงรายละเอียดข่าวสำหรับหน้า Portal + เพิ่ม viewCount
  - `getNewsById(tenantId, id)`: ดึงรายละเอียดข่าวสำหรับหน้าแก้ไขใน Admin
  - `createNews(tenantId, data, authorId)`: สร้างข่าวใหม่
  - `updateNews(tenantId, data)`: แก้ไขเนื้อหาข่าว
  - `deleteNews(tenantId, id)`: ลบข่าว
  - `togglePinNews(tenantId, id)`: ปักหมุด/ถอดหมุด
  - `changeNewsStatus(tenantId, id, status)`: เปลี่ยนสถานะข่าว
- [x] **Task 3.2:** เขียน Unit Tests ใน `src/features/news/_internal/services/news.service.test.ts`

### เฟส 4: Server Actions & Public API
- [x] **Task 4.1:** สร้าง `src/features/news/server.ts` สำหรับ export ฟังก์ชัน query ที่ Server Components เรียกใช้
- [x] **Task 4.2:** สร้าง `src/features/news/actions.ts` สำหรับ Server Actions พร้อม `runAction` และ RBAC guards
- [x] **Task 4.3:** สร้าง `src/features/news/index.ts` สำหรับ export public DTOs

### เฟส 5: Admin Console UI (ระบบหลังบ้าน)
- [x] **Task 5.1:** เพิ่มเมนู "ข่าวสารประชาสัมพันธ์" ในแถบเมนูข้าง [sidebar-nav.ts](file:///Users/lalitapimrat/Documents/check/Project%201/src/components/layout/sidebar-nav.ts)
- [x] **Task 5.2:** สร้างหน้าจัดการข่าว [src/app/(admin)/news/page.tsx](file:///Users/lalitapimrat/Documents/check/Project%201/src/app/(admin)/news/page.tsx)
- [x] **Task 5.3:** สร้าง Client Component ตารางข่าวพร้อมตัวกรองและปุ่มจัดการด้วย Liyon components
- [x] **Task 5.4:** สร้าง Modal Form สำหรับสร้าง/แก้ไขข่าวสาร

### เฟส 6: Public Portal UI (หน้าบ้านสาธารณะ)
- [x] **Task 6.1:** สร้างหน้ารายการข่าวสาธารณะ [src/app/portal/news/page.tsx](file:///Users/lalitapimrat/Documents/check/Project%201/src/app/portal/news/page.tsx) มี Featured Banner และตัวกรองหมวดหมู่
- [x] **Task 6.2:** สร้างหน้ารายละเอียดข่าว [src/app/portal/news/[slug]/page.tsx](file:///Users/lalitapimrat/Documents/check/Project%201/src/app/portal/news/[slug]/page.tsx) แสดงเนื้อหาฉบับเต็ม, view counter และดาวน์โหลดไฟล์แนบ

### เฟส 7: ตรวจสอบมาตรฐานและ Quality Gate
- [x] **Task 7.1:** รัน `npm run type-check` ตรวจสอบ Type ปลอดภัย 100%
- [x] **Task 7.2:** รัน `npm run lint` และ `npm run deps:check`
- [x] **Task 7.3:** รัน `npm run test` และ `npm run test:integration`
- [x] **Task 7.4:** รัน `npm run check` ผ่านครบทุกรายการ (28 unit suites, 10 integration suites)
