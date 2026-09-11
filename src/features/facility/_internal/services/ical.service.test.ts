import { describe, it, expect } from "vitest";
import { formatIcsDateTime, escapeIcsText, generateBookingIcs } from "./ical.service";
import type { RoomBookingDto } from "./facility.service";

describe("iCalendar (RFC 5545) Service Tests", () => {
  it("formatIcsDateTime แปลงวันเวลาเป็นรูปแบบ RFC 5545 UTC (YYYYMMDDTHHMMSSZ) ได้ถูกต้อง", () => {
    const date = new Date("2026-09-15T09:30:00Z");
    const formatted = formatIcsDateTime(date);
    expect(formatted).toBe("20260915T093000Z");
  });

  it("escapeIcsText escape ตัวอักษรพิเศษตามมาตรฐาน RFC 5545 (comma, semicolon, newline, backslash)", () => {
    const raw = "หัวข้อ: ทดสอบ, สำหรับห้อง; มีขึ้นบรรทัดใหม่\nและเครื่องหมาย \\";
    const escaped = escapeIcsText(raw);
    expect(escaped).toContain("\\,");
    expect(escaped).toContain("\\;");
    expect(escaped).toContain("\\\\");
    expect(escaped).toContain("\\n");
  });

  it("generateBookingIcs สร้างเนื้อหา VCALENDAR และ VEVENT ครบถ้วนตามมาตรฐาน", () => {
    const booking: RoomBookingDto = {
      id: "booking-12345",
      tenantId: "tenant-demo",
      roomId: "room-501",
      roomCode: "ROOM-501",
      roomNameTh: "ห้องสอบวิทยานิพนธ์ 1",
      roomNameEn: "Thesis Defense Room 1",
      building: "อาคารวิจัย",
      title: "การสอบวิทยานิพนธ์: นายนิสิต มุ่งมั่น",
      purpose: "สอบปากเปล่าขั้นสุดท้ายวิทยานิพนธ์มหาบัณฑิต",
      type: "EXAM_DEFENSE",
      platform: "HYBRID",
      meetingUrl: "https://meet.google.com/abc-defg-hij",
      startTime: "2026-09-20T09:00:00.000Z",
      endTime: "2026-09-20T12:00:00.000Z",
      status: "CONFIRMED",
      bookedByName: "ผศ.ดร.สมชาย ใจดี",
      bookedByEmail: "somchai@univ.ac.th",
      bookedByPhone: "081-234-5678",
      attendeeCount: 15,
      petitionId: null,
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    };

    const ics = generateBookingIcs(booking);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("UID:gtmts-booking-12345@gtmts.local");
    expect(ics).toContain("DTSTART:20260920T090000Z");
    expect(ics).toContain("DTEND:20260920T120000Z");
    expect(ics).toContain("SUMMARY:การสอบวิทยานิพนธ์: นายนิสิต มุ่งมั่น");
    expect(ics).toContain("STATUS:CONFIRMED");
    expect(ics).toContain("ROOM-501");
    expect(ics).toContain("อาคาร อาคารวิจัย");
    expect(ics).toContain("URL;VALUE=URI:https://meet.google.com/abc-defg-hij");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("END:VCALENDAR");
  });

  it("generateBookingIcs รองรับห้องสอบ Online เต็มรูปแบบโดยใช้ URL เป็น Location", () => {
    const onlineBooking: RoomBookingDto = {
      id: "booking-online",
      tenantId: "tenant-demo",
      roomId: "room-online",
      title: "การสอบออนไลน์ผ่าน Zoom",
      purpose: "สอบเค้าโครง",
      type: "EXAM_PROPOSAL",
      platform: "ZOOM",
      meetingUrl: "https://zoom.us/j/1234567890",
      startTime: "2026-09-21T13:00:00.000Z",
      endTime: "2026-09-21T15:00:00.000Z",
      status: "CONFIRMED",
      bookedByName: "ศ.ดร.วิชาการ เข้มงวด",
      bookedByEmail: "wichakan@univ.ac.th",
      bookedByPhone: null,
      attendeeCount: 5,
      petitionId: null,
      createdAt: "2026-09-10T00:00:00.000Z",
      updatedAt: "2026-09-10T00:00:00.000Z",
    };

    const ics = generateBookingIcs(onlineBooking);

    expect(ics).toContain("LOCATION:https://zoom.us/j/1234567890");
    expect(ics).toContain("URL;VALUE=URI:https://zoom.us/j/1234567890");
  });
});
