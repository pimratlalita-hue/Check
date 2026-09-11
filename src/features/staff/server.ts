import "server-only";

export {
  listStaffProfiles,
  getStaffProfileById,
  listDepartments,
  getDepartmentById,
  resolvePortalTenantId,
  getPublicStaffDirectory,
  getPublicStaffDetail,
  type StaffProfileDto,
  type StaffListResult,
  type DepartmentDto,
  type PublicDirectoryData,
} from "./_internal/services/staff.service";
export { STAFF_P, STAFF_PERMISSIONS } from "./permissions";
