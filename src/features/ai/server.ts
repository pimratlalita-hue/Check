import "server-only";

export {
  validateThesisTitle,
  summarizeConceptNote,
  generateAdvisoryFeedback,
} from "./_internal/services/ai.service";
export { AI_P, AI_PERMISSIONS } from "./permissions";
