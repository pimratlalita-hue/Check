export { AI_P, AI_PERMISSIONS } from "./permissions";
export {
  validateThesisTitleInputSchema,
  thesisTitleValidationResultSchema,
  summarizeConceptNoteInputSchema,
  conceptNoteSummaryResultSchema,
  generateAdvisoryFeedbackInputSchema,
  advisoryFeedbackResultSchema,
  type ValidateThesisTitleInput,
  type ThesisTitleValidationResult,
  type SummarizeConceptNoteInput,
  type ConceptNoteSummaryResult,
  type GenerateAdvisoryFeedbackInput,
  type AdvisoryFeedbackResult,
  generateEnglishNewsInputSchema,
  generatedEnglishNewsResultSchema,
  type GenerateEnglishNewsInput,
  type GeneratedEnglishNewsResult,
} from "./_internal/schemas";
export { ThesisTitleAiWidget } from "./components/thesis-title-ai-widget";
export { ConceptNoteSummarizerWidget } from "./components/concept-note-summarizer-widget";
export { AdvisoryFeedbackAiWidget } from "./components/advisory-feedback-ai-widget";

