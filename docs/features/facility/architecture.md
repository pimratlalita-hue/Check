# Facility & Scheduling Architecture (สถาปัตยกรรมระบบจองห้องสอบและสิ่งอำนวยความสะดวก)

---

## 1. ขอบเขตสถาปัตยกรรม (Architecture Scope)

ฟีเจอร์ `facility` ถูกออกแบบตามรูปแบบ **Modular Monolith** โดยแยกการจัดการตรรกะทางธุรกิจทั้งหมดไว้ภายใต้ `src/features/facility/`:

```text
src/features/facility/
├── index.ts                      # Public Client-safe helpers, constants, types
├── server.ts                     # Public Server data queries for Server Components
├── actions.ts                    # Public Server Actions for Mutations
├── permissions.ts                # Permission definitions (facility:read, facility:manage)
├── messages.ts                   # i18n Dictionary (th & en)
└── _internal/                    # Private feature internals
    ├── schemas.ts                # Zod schemas with localized validation
    └── services/                 # Pure business logic, overlap engine & database queries
        ├── facility.service.ts
        ├── facility.service.test.ts
        └── facility.service.int.test.ts
```

---

## 2. โครงสร้างเส้นทาง (Routes Structure)

### 2.1 Admin Console (ผู้ดูแลอาคารสถานที่ / เจ้าหน้าที่คณะ)
- `/facility`: หน้าบริหารจัดการห้องและตารางการใช้ห้อง
  - แดชบอร์ดสรุปสถิติ: จำนวนห้องทั้งหมด, การจองวันนี้, การสอบวิทยานิพนธ์, อัตราการใช้งาน
  - แถบแท็บสลับ 2 มุมมอง:
    1. **ตารางและรายการจองห้อง (Bookings & Schedule):** DataTable แสดงรายการจองพร้อมสถานะ (StatusPill), ตัวกรองประเภทห้อง, ปุ่มตรวจสอบรายละเอียดและอนุมัติ/ยกเลิก
    2. **จัดการข้อมูลห้อง (Rooms Management):** DataTable รายการห้อง, รหัส, ความจุ, อุปกรณ์, สถานะเปิด/ปิด, ปุ่มเพิ่ม/แก้ไขห้อง
  - โมดอลฟอร์มจัดการห้อง (`RoomFormDialog`)
  - โมดอลรายละเอียดการจองและการพิจารณา (`BookingDetailDialog`)

### 2.2 Public Portal (นิสิต / คณาจารย์ / สาธารณะ)
- `/portal/facility`: หน้าระบบจองห้องและสำรวจสิ่งอำนวยความสะดวก
  - แถบสลับระดับประเภทห้อง (ทั้งหมด, ห้องสอบวิทยานิพนธ์, ห้องประชุม, ห้องปฏิบัติการคอมพิวเตอร์, ห้องบรรยาย)
  - การ์ดห้องแสดงรูปภาพ, ข้อมูลอาคาร, ชั้น, ความจุที่นั่ง, และไอคอนสิ่งอำนวยความสะดวก
  - ฟอร์มตรวจสอบเวลาว่างและจองห้องออนไลน์แบบเรียลไทม์ (Online Room Booking)
  - รองรับการระบุห้องสอบ On-site และ Online/Hybrid พร้อมใส่ลิงก์ Zoom, MS Teams, หรือ Google Meet

---

## 3. การปฏิบัติตามหลัก Modular Monolith

1. ห้ามไฟล์ภายนอก import ตรงจาก `src/features/facility/_internal/`
2. อนุญาตให้ import ผ่าน entry points 3 ตัวเท่านั้น:
   - `src/features/facility/index.ts` (Client)
   - `src/features/facility/server.ts` (Server queries)
   - `src/features/facility/actions.ts` (Server actions)
3. ตรวจสอบขอบเขตความสัมพันธ์อัตโนมัติผ่าน `npm run deps:check`
