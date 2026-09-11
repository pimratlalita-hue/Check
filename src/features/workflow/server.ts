import "server-only";

export {
  listPetitions,
  getPetitionById,
  getWorkflowStats,
  processPetitionAction,
  submitPublicPetition,
  trackPublicPetition,
  getPublicPetitionDetail,
  resolvePortalTenantId,
  getPublicWorkflowFormData,
  type PetitionDto,
  type PetitionActivityDto,
  type PetitionListResult,
  type WorkflowStats,
  type WorkflowFormData,
} from "./_internal/services/workflow.service";
export { WORKFLOW_P, WORKFLOW_PERMISSIONS } from "./permissions";
