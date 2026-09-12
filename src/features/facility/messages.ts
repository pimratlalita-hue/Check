import type { Dictionary } from "@/shared/lib/i18n/translate";

export const MESSAGES: Dictionary = {
  // Navigation & titles
  "facility.nav": { th: "ห้องและสิ่งอำนวยความสะดวก", en: "Rooms & Facilities" },
  "facility.title": { th: "จัดการห้องและสิ่งอำนวยความสะดวก", en: "Rooms & Facilities Management" },
  "facility.description": {
    th: "บริหารจัดการห้องสอบวิทยานิพนธ์ ห้องประชุม แล็บคอมพิวเตอร์ และตารางการจองห้อง",
    en: "Manage thesis defense rooms, meeting spaces, computer labs, and reservations",
  },
  "facility.portalTitle": { th: "บริการจองห้องและสิ่งอำนวยความสะดวก", en: "Room & Facility Services" },
  "facility.portalSubtitle": {
    th: "สำรวจสิ่งอำนวยความสะดวก ตรวจสอบตารางเวลาว่าง และจองห้องสอบวิทยานิพนธ์/ห้องประชุมออนไลน์ คณะมนุษยศาสตร์",
    en: "Explore facilities, check real-time availability, and reserve thesis exam and meeting rooms, Faculty of Humanities",
  },

  // Tabs & filters
  "facility.tab.schedule": { th: "ตารางและการจองห้อง", en: "Bookings & Schedule" },
  "facility.tab.rooms": { th: "จัดการข้อมูลห้อง", en: "Rooms Management" },
  "facility.tab.all": { th: "การจองทั้งหมด", en: "All Bookings" },
  "facility.tab.today": { th: "การจองวันนี้", en: "Today's Bookings" },
  "facility.tab.confirmed": { th: "อนุมัติแล้ว", en: "Confirmed" },
  "facility.tab.pending": { th: "รออนุมัติ", en: "Pending Review" },
  "facility.portalTab.rooms": { th: "สำรวจห้องและสิ่งอำนวยความสะดวก", en: "Explore Rooms" },
  "facility.portalTab.book": { th: "จองห้องออนไลน์", en: "Book a Room" },

  // KPI Stats
  "facility.stats.totalRooms": { th: "จำนวนห้องทั้งหมด", en: "Total Rooms" },
  "facility.stats.todayBookings": { th: "การจองวันนี้", en: "Today's Bookings" },
  "facility.stats.examSessions": { th: "การสอบวิทยานิพนธ์", en: "Defense Exams" },
  "facility.stats.pendingApproval": { th: "รอการตรวจสอบ", en: "Pending Approval" },

  // Room Types
  "facility.roomType.EXAM_ROOM": { th: "ห้องสอบวิทยานิพนธ์", en: "Thesis Defense Room" },
  "facility.roomType.MEETING_ROOM": { th: "ห้องประชุม", en: "Meeting Room" },
  "facility.roomType.LAB": { th: "ห้องปฏิบัติการคอมพิวเตอร์/AI", en: "Computer & AI Lab" },
  "facility.roomType.AUDITORIUM": { th: "ห้องประชุมใหญ่ / หอประชุม", en: "Auditorium" },
  "facility.roomType.SMART_CLASSROOM": { th: "ห้องเรียนอัจฉริยะ", en: "Smart Classroom" },

  // Booking Types
  "facility.bookingType.EXAM_DEFENSE": { th: "สอบเค้าโครง / สอบจบวิทยานิพนธ์", en: "Thesis Proposal / Defense Exam" },
  "facility.bookingType.ACADEMIC_MEETING": { th: "ประชุมคณะกรรมการวิชาการ", en: "Academic Committee Meeting" },
  "facility.bookingType.SEMINAR": { th: "สัมมนา / บรรยายพิเศษ", en: "Seminar / Workshop" },
  "facility.bookingType.TEACHING": { th: "การเรียนการสอน / ติวพิเศษ", en: "Teaching & Tutoring" },
  "facility.bookingType.GENERAL": { th: "การใช้งานทั่วไป", en: "General Purpose" },

  // Booking Statuses
  "facility.status.CONFIRMED": { th: "อนุมัติแล้ว", en: "Confirmed" },
  "facility.status.PENDING": { th: "รอการตรวจสอบ", en: "Pending Approval" },
  "facility.status.CANCELLED": { th: "ยกเลิกแล้ว", en: "Cancelled" },
  "facility.status.REJECTED": { th: "ปฏิเสธการจอง", en: "Rejected" },

  // Meeting Platforms
  "facility.platform.ON_SITE": { th: "ในสถานที่จริง (On-site)", en: "On-site" },
  "facility.platform.ZOOM": { th: "Zoom Meetings", en: "Zoom" },
  "facility.platform.MS_TEAMS": { th: "Microsoft Teams", en: "MS Teams" },
  "facility.platform.GOOGLE_MEET": { th: "Google Meet", en: "Google Meet" },
  "facility.platform.HYBRID": { th: "ผสมผสาน (Hybrid On-site + Online)", en: "Hybrid" },

  // Form labels & fields
  "facility.roomCode": { th: "รหัสห้อง", en: "Room Code" },
  "facility.roomNameTh": { th: "ชื่อห้อง (ภาษาไทย)", en: "Room Name (Thai)" },
  "facility.roomNameEn": { th: "ชื่อห้อง (ภาษาอังกฤษ)", en: "Room Name (English)" },
  "facility.building": { th: "อาคาร", en: "Building" },
  "facility.floor": { th: "ชั้น", en: "Floor" },
  "facility.capacity": { th: "ความจุ (ที่นั่ง)", en: "Capacity (Seats)" },
  "facility.seats": { th: "ที่นั่ง", en: "seats" },
  "facility.facilitiesLabel": { th: "สิ่งอำนวยความสะดวก / อุปกรณ์", en: "Facilities & Amenities" },
  "facility.imageUrl": { th: "รูปภาพห้อง (URL)", en: "Room Image (URL)" },
  "facility.descriptionLabel": { th: "รายละเอียดห้อง", en: "Description" },
  "facility.statusLabel": { th: "สถานะเปิดใช้งาน", en: "Active Status" },
  "facility.createRoom": { th: "เพิ่มห้องใหม่", en: "Add Room" },
  "facility.editRoom": { th: "แก้ไขข้อมูลห้อง", en: "Edit Room" },
  "facility.deleteRoom": { th: "ลบห้อง", en: "Delete Room" },
  "facility.deleteRoomConfirm": {
    th: "คุณแน่ใจหรือไม่ว่าต้องการลบห้องนี้? ประวัติการจองทั้งหมดจะถูกลบไปด้วย",
    en: "Are you sure you want to delete this room? All booking records will also be deleted.",
  },
  "facility.selectRoom": { th: "-- เลือกห้อง --", en: "-- Select Room --" },
  "facility.selectRoomType": { th: "-- เลือกประเภทห้อง --", en: "-- Select Room Type --" },
  "facility.selectPlatform": { th: "-- เลือกรูปแบบการประชุม --", en: "-- Select Platform --" },
  "facility.bookingTitle": { th: "หัวข้อการจอง", en: "Booking Title" },
  "facility.bookingPurpose": { th: "วัตถุประสงค์ / รายละเอียดเพิ่มเติม", en: "Purpose / Description" },
  "facility.startTime": { th: "เวลาเริ่มต้น", en: "Start Time" },
  "facility.endTime": { th: "เวลาสิ้นสุด", en: "End Time" },
  "facility.meetingUrl": { th: "ลิงก์ห้องประชุมออนไลน์", en: "Virtual Meeting Link" },
  "facility.bookedByName": { th: "ชื่อผู้จอง", en: "Booked By" },
  "facility.bookedByEmail": { th: "อีเมลติดต่อ", en: "Email Address" },
  "facility.bookedByPhone": { th: "เบอร์โทรศัพท์", en: "Phone Number" },
  "facility.attendeeCount": { th: "จำนวนผู้เข้าร่วม (โดยประมาณ)", en: "Estimated Attendees" },
  "facility.petitionId": { th: "เชื่อมโยงกับคำร้องขอสอบวิทยานิพนธ์", en: "Linked Petition" },
  "facility.checkAvailability": { th: "ตรวจสอบเวลาว่าง", en: "Check Availability" },
  "facility.available": { th: "ห้องว่าง สามารถจองช่วงเวลานี้ได้", en: "Room is available for this time slot" },
  "facility.unavailable": { th: "ห้องไม่ว่าง มีการจองซ้อนทับในช่วงเวลานี้แล้ว", en: "Room is unavailable due to an existing booking" },
  "facility.bookNow": { th: "ยืนยันการจองห้อง", en: "Confirm Booking" },
  "facility.bookingDetails": { th: "รายละเอียดการจองห้อง", en: "Booking Details" },
  "facility.bookingSuccess": { th: "จองห้องเรียบร้อยแล้ว", en: "Room booked successfully" },
  "facility.roomCreatedSuccess": { th: "เพิ่มห้องใหม่เรียบร้อยแล้ว", en: "Room added successfully" },
  "facility.roomUpdatedSuccess": { th: "แก้ไขข้อมูลห้องเรียบร้อยแล้ว", en: "Room updated successfully" },
  "facility.roomDeletedSuccess": { th: "ลบห้องเรียบร้อยแล้ว", en: "Room deleted successfully" },
  "facility.bookingUpdatedSuccess": { th: "อัปเดตสถานะการจองเรียบร้อยแล้ว", en: "Booking status updated" },
  "facility.bookingCancelledSuccess": { th: "ยกเลิกการจองเรียบร้อยแล้ว", en: "Booking cancelled" },
  "facility.action.approve": { th: "อนุมัติการจอง", en: "Approve Booking" },
  "facility.action.reject": { th: "ปฏิเสธการจอง", en: "Reject Booking" },
  "facility.action.cancel": { th: "ยกเลิกการจอง", en: "Cancel Booking" },
  "facility.action.exportIcs": { th: "ส่งออกนัดหมาย .ics (iCalendar)", en: "Export .ics (iCalendar)" },
  "facility.empty": { th: "ไม่พบข้อมูลห้องหรือการจอง", en: "No rooms or bookings found" },
  "facility.emptyDesc": { th: "ยังไม่มีข้อมูลที่ตรงกับเงื่อนไขการค้นหา", en: "There are no records matching your search" },
  "facility.col.room": { th: "ห้อง", en: "Room" },
  "facility.col.building": { th: "อาคาร/ชั้น", en: "Building / Floor" },
  "facility.col.type": { th: "ประเภทห้อง", en: "Room Type" },
  "facility.col.capacity": { th: "ความจุ", en: "Capacity" },
  "facility.col.status": { th: "สถานะ", en: "Status" },
  "facility.col.actions": { th: "จัดการ", en: "Actions" },
  "facility.col.time": { th: "วัน-เวลาที่จอง", en: "Booking Time" },
  "facility.col.title": { th: "หัวข้อ/กิจกรรม", en: "Title / Event" },
  "facility.col.bookedBy": { th: "ผู้จอง", en: "Booked By" },
  "facility.col.platform": { th: "รูปแบบ", en: "Platform" },
  "facility.searchPlaceholder": { th: "ค้นหาด้วยรหัสห้อง, ชื่อห้อง, หรือผู้จอง...", en: "Search by room code, name, or booker..." },
  "facility.filterByType": { th: "ประเภทห้อง", en: "Room Type" },

  // Role permissions UI
  "roles.module.facility": { th: "ระบบจองห้องสอบและสิ่งอำนวยความสะดวก", en: "Rooms & Facility Module" },
  "perm.facility:read": { th: "ดูข้อมูลห้องและตารางการใช้ห้องในระบบหลังบ้าน", en: "View admin rooms & schedules" },
  "perm.facility:manage": { th: "จัดการข้อมูลห้อง อนุมัติหรือยกเลิกการจองห้อง", en: "Manage rooms, approve & cancel bookings" }
};
