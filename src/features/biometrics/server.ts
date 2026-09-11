import "server-only";

export {
  computeSyntheticFaceHash,
  recordAttendance,
  listAttendances,
  getDailyAttendanceStats,
  updateAttendanceStatus,
  resolvePortalTenantId,
} from "./_internal/services/biometrics.service";
