import React from "react";
import { AttendancePortalView } from "./_components/attendance-portal-view";

export const metadata = {
  title: "ระบบเช็คชื่อเข้าห้องสอบวิทยานิพนธ์ (Biometric PDPA Check-in) | Graduate School",
  description: "ระบบยืนยันตัวตนด้วยข้อมูลชีวมิติสำหรับการสอบเค้าโครงและสอบปากเปล่าวิทยานิพนธ์",
};

export default function CandidateAttendancePage() {
  return <AttendancePortalView />;
}
