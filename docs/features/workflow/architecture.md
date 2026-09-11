# Workflow & Approval Architecture (สถาปัตยกรรมระบบคำร้องและอนุมัติเอกสารออนไลน์)

---

## 1. ขอบเขตสถาปัตยกรรม (Architecture Scope)

ฟีเจอร์ `workflow` ถูกออกแบบตามรูปแบบ **Modular Monolith** โดยแยกการจัดการตรรกะทางธุรกิจทั้งหมดไว้ภายใต้ `src/features/workflow/`:

```text
src/features/workflow/
├── index.ts                      # Public Client-safe helpers, constants, types
├── server.ts                     # Public Server data queries for Server Components
├── actions.ts                    # Public Server Actions for Mutations
├── permissions.ts                # Permission definitions (workflow:read, workflow:manage)
├── messages.ts                   # i18n Dictionary (th & en)
└── _internal/                    # Private feature internals
    ├── schemas.ts                # Zod schemas with localized validation
    └── services/                 # Pure business logic, state machine & database queries
        ├── workflow.service.ts
        ├── workflow.service.test.ts
        └── workflow.service.int.test.ts
```

---

## 2. โครงสร้างเส้นทาง (Routes Structure)

### 2.1 Admin Console (อาจารย์ที่ปรึกษา / ประธานหลักสูตร / สำนักงานคณะ)
- `/workflow`: หน้าตรวจสอบและพิจารณาคำร้องวิชาการ
  - บัตรสถิติ KPI: คำร้องทั้งหมด, รอพิจารณา (Pending), อนุมัติเสร็จสิ้น (Completed), ส่งกลับแก้ไข/ปฏิเสธ (Returned/Rejected)
  - แท็บตัวกรองสถานะ: ทั้งหมด (All), รอการพิจารณา (Pending), อนุมัติแล้ว (Completed), ส่งกลับ/ปฏิเสธ (Issues)
  - ตาราง Liyon `DataTable` แสดงคำร้อง พร้อม StatusPill และ Current Step Indicator
  - โมดอลพิจารณาคำร้อง `PetitionReviewDialog`:
    - แสดงข้อมูลผู้ยื่น, หลักสูตร, อาจารย์ที่ปรึกษา, รายละเอียดคำร้อง, ลิงก์ไฟล์แนบ
    - แถบแสดงสถานะ 4 ขั้นตอน (Visual Stepper)
    - บันทึกประวัติกิจกรรมและข้อคิดเห็น (Audit Activity Trail)
    - แบบฟอร์มอนุมัติ/ส่งกลับแก้ไข/ปฏิเสธ พร้อมช่องระบุความคิดเห็น

### 2.2 Public Portal (นิสิต / ผู้ยื่นคำร้อง)
- `/portal/petitions`: หน้าพอร์ทัลบริการคำร้องออนไลน์สำหรับนิสิต
  - **แท็บ 1: ยื่นคำร้องออนไลน์ (Submit Online Petition)**:
    - ฟอร์มกรอกข้อมูลนิสิต (รหัสนิสิต, ชื่อ-สกุล, อีเมล, เบอร์โทร)
    - เลือกหลักสูตร และอาจารย์ที่ปรึกษา
    - เลือกประเภทคำร้อง (เค้าโครงวิทยานิพนธ์, สอบจบ, ลาพัก, ขยายเวลา, คำร้องทั่วไป)
    - กรอกรายละเอียด ระบุชื่อหัวข้อวิทยานิพนธ์ (ไทย/อังกฤษ) และลิงก์เอกสารแนบ
    - สร้างหมายเลขคำร้องอัตโนมัติ (เช่น `REQ-2026-0001`) เมื่อยื่นสำเร็จ
  - **แท็บ 2: ติดตามสถานะคำร้อง (Track Petition)**:
    - ค้นหาด้วยหมายเลขคำร้อง (Tracking No.) หรือรหัสนิสิต
    - แสดงบัตรสรุปสถานะปัจจุบัน พร้อม Stepper 4 ขั้นตอน
    - แสดงประวัติการดำเนินการ (Audit Timeline) และข้อคิดเห็นจากผู้พิจารณา

---

## 3. การปฏิบัติตามหลัก Modular Monolith

1. ห้ามไฟล์ภายนอก import ตรงจาก `src/features/workflow/_internal/`
2. อนุญาตให้ import ผ่าน entry points 3 ตัวเท่านั้น:
   - `src/features/workflow/index.ts` (Client)
   - `src/features/workflow/server.ts` (Server queries)
   - `src/features/workflow/actions.ts` (Server actions)
3. ตรวจสอบขอบเขตความสัมพันธ์อัตโนมัติผ่าน `npm run deps:check`
