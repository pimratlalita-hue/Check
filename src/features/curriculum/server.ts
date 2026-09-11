import "server-only";

export {
  listPrograms,
  getProgramById,
  getProgramBySlug,
  listProgramCourses,
  listPublicPrograms,
  getPublicProgramDetail,
  resolvePortalTenantId,
  type ProgramDto,
  type ProgramCourseDto,
  type ProgramListResult,
} from "./_internal/services/curriculum.service";
export { CURRICULUM_P, CURRICULUM_PERMISSIONS } from "./permissions";
