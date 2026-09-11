# Curriculum Management Architecture (สถาปัตยกรรมระบบจัดการหลักสูตรการศึกษา)

---

## 1. ขอบเขตสถาปัตยกรรม (Architecture Scope)

ฟีเจอร์ `curriculum` ถูกออกแบบตามรูปแบบ **Modular Monolith** โดยแยกการจัดการตรรกะทางธุรกิจทั้งหมดไว้ภายใต้ `src/features/curriculum/`:

```text
src/features/curriculum/
├── index.ts                      # Public Client-safe helpers, constants, types
├── server.ts                     # Public Server data queries for Server Components
├── actions.ts                    # Public Server Actions for Mutations
├── permissions.ts                # Permission definitions (curriculum:read, curriculum:manage)
├── messages.ts                   # i18n Dictionary (th & en)
└── _internal/                    # Private feature internals
    ├── schemas.ts                # Zod schemas with localized validation
    └── services/                 # Pure business logic & database queries
        ├── curriculum.service.ts
        ├── curriculum.service.test.ts
        └── curriculum.service.int.test.ts
```

---

## 2. โครงสร้างเส้นทาง (Routes Structure)

### 2.1 Admin Console (ผู้ดูแลระบบ/เจ้าหน้าที่หลักสูตร)
- `/curriculum`: หน้าจัดการหลักสูตรการศึกษาหลัก
  - แสดง DataTable รายการหลักสูตร พร้อม Filter ระดับปริญญา (BACHELOR, MASTER, DOCTORAL, CERTIFICATE) และสถานะ (DRAFT, ACTIVE, REVISED, ARCHIVED)
  - ฟอร์มสร้าง/แก้ไขหลักสูตร (LiyonDialog พร้อม Dynamic Key & Lazy Initial State)
  - การจัดการรายวิชาในโครงสร้างหลักสูตร (ProgramCourse Management)

### 2.2 Public Portal (นิสิต/ผู้สนใจศึกษาต่อ/สาธารณะ)
- `/portal/curriculum`: หน้าแสดงรายการหลักสูตรทั้งหมดของคณะ
  - แถบสลับระดับการศึกษา (ปริญญาตรี / ปริญญาโท / ปริญญาเอก / ประกาศนียบัตร)
  - บัตรหลักสูตร (Program Cards) แสดงชื่อไทย-อังกฤษ, จำนวนหน่วยกิต, ระยะเวลาศึกษา, ค่าธรรมเนียม, หมวดหมู่หลักสูตร
- `/portal/curriculum/[slug]`: หน้าแสดงรายละเอียดหลักสูตรอย่างเจาะลึก
  - วัตถุประสงค์และผลลัพธ์การเรียนรู้ (Program Learning Outcomes - PLOs)
  - โครงสร้างหลักสูตรและรายวิชาแบ่งตามหมวดหมู่ (General Ed, Core, Major Electives, Free Electives)
  - แนวทางการประกอบอาชีพหลังสำเร็จการศึกษา (Career Paths)
  - ดาวน์โหลดเอกสาร มคอ.2 (Curriculum Handbook PDF)
  - อาจารย์ประจำหลักสูตร / อาจารย์ผู้รับผิดชอบหลักสูตร

---

## 3. การปฏิบัติตามหลัก Modular Monolith

1. ห้ามไฟล์ภายนอก import ตรงจาก `src/features/curriculum/_internal/`
2. อนุญาตให้ import ผ่าน entry points 3 ตัวเท่านั้น:
   - `src/features/curriculum/index.ts` (Client)
   - `src/features/curriculum/server.ts` (Server queries)
   - `src/features/curriculum/actions.ts` (Server actions)
3. ตรวจสอบขอบเขตความสัมพันธ์อัตโนมัติผ่าน `npm run deps:check`
