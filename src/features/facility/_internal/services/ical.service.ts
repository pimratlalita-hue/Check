import type { RoomBookingDto } from "./facility.service";

/**
 * Format a Date object or ISO string into RFC 5545 UTC datetime string: YYYYMMDDTHHMMSSZ
 */
export function formatIcsDateTime(dateInput: Date | string): string {
  const d = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  const pad = (n: number) => String(n).padStart(2, "0");

  const year = d.getUTCFullYear();
  const month = pad(d.getUTCMonth() + 1);
  const day = pad(d.getUTCDate());
  const hours = pad(d.getUTCHours());
  const minutes = pad(d.getUTCMinutes());
  const seconds = pad(d.getUTCSeconds());

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in text fields per RFC 5545 specifications:
 * Backslash (\), semicolon (;), comma (,), and newline (\n)
 */
export function escapeIcsText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Generate a complete RFC 5545 iCalendar (.ics) string for a room/defense booking.
 */
export function generateBookingIcs(booking: RoomBookingDto): string {
  const now = new Date();
  const dtStamp = formatIcsDateTime(now);
  const dtStart = formatIcsDateTime(booking.startTime);
  const dtEnd = formatIcsDateTime(booking.endTime);

  const uid = `gtmts-${booking.id}@gtmts.local`;
  const summary = escapeIcsText(booking.title || "Thesis Defense / Academic Session");

  // Determine Location
  const isOnline =
    booking.platform === "ZOOM" ||
    booking.platform === "MS_TEAMS" ||
    booking.platform === "GOOGLE_MEET";

  let locationStr = "";
  if (isOnline) {
    locationStr = booking.meetingUrl || `Online Meeting (${booking.platform})`;
  } else {
    const roomParts = [
      booking.roomCode,
      booking.roomNameTh || booking.roomNameEn,
      booking.building ? `อาคาร ${booking.building}` : "",
    ].filter(Boolean);
    locationStr = roomParts.join(" - ") || "On-site Room";
    if (booking.platform === "HYBRID" && booking.meetingUrl) {
      locationStr += ` (Online: ${booking.meetingUrl})`;
    }
  }
  const location = escapeIcsText(locationStr);

  // Description text
  const descLines: string[] = [];
  if (booking.purpose) {
    descLines.push(`วัตถุประสงค์ / Purpose: ${booking.purpose}`);
  }
  descLines.push(`ผู้จอง / Booked by: ${booking.bookedByName} (${booking.bookedByEmail})`);
  if (booking.type) {
    descLines.push(`ประเภทการจอง: ${booking.type}`);
  }
  if (booking.meetingUrl) {
    descLines.push(`ลิงก์การประชุม: ${booking.meetingUrl}`);
  }
  descLines.push("ระบบบริหารจัดการและติดตามวิทยานิพนธ์ (GTMTS)");
  const description = escapeIcsText(descLines.join("\n"));

  const status = booking.status === "CONFIRMED" ? "CONFIRMED" : "TENTATIVE";

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Faculty of Humanities//GTMTS Thesis System//TH",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    `STATUS:${status}`,
    ...(booking.meetingUrl ? [`URL;VALUE=URI:${escapeIcsText(booking.meetingUrl)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return lines.join("\r\n");
}

/**
 * Trigger browser file download of .ics calendar file.
 */
export function downloadBookingIcs(booking: RoomBookingDto): void {
  if (typeof window === "undefined") return;

  const icsContent = generateBookingIcs(booking);
  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const safeTitle = (booking.title || "booking")
    .replace(/[^a-zA-Z0-9ก-๙_-]/g, "_")
    .slice(0, 30);
  const filename = `defense_${booking.roomCode || "session"}_${safeTitle}.ics`;

  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
