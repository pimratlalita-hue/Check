export { WORKFLOW_P, WORKFLOW_PERMISSIONS } from "./permissions";
export {
  petitionTypeEnum,
  petitionStatusEnum,
  approvalActionEnum,
  type PetitionType,
  type PetitionStatus,
  type ApprovalAction,
  type SubmitPetitionInput,
  type ProcessPetitionActionInput,
  type ListPetitionsQueryInput,
  type TrackPetitionQueryInput,
} from "./_internal/schemas";
export type {
  PetitionDto,
  PetitionActivityDto,
  PetitionListResult,
  WorkflowStats,
  WorkflowFormData,
} from "./_internal/services/workflow.service";
export {
  degreeLevelEnum,
  englishTestTypeEnum,
  publicationTypeEnum,
  checkThesisPrerequisitesInputSchema,
  evaluateThesisPrerequisites,
  ENGLISH_MIN_SCORES,
  type DegreeLevel,
  type EnglishTestType,
  type PublicationType,
  type CheckThesisPrerequisitesInput,
  type ThesisPrerequisitesResult,
} from "./_internal/services/prerequisite.service";
export { ThesisPrerequisiteWidget } from "./components/thesis-prerequisite-widget";
export { DefenseEvaluationWidget } from "./components/defense-evaluation-widget";
export type { SystemNotification, NotificationType } from "./_internal/services/notification.service";
export type { StoredDocumentMetadata } from "./_internal/services/document-storage.service";


