"use server";

import { runAction, type ActionResult } from "@/shared/lib/result";
import { getLocale } from "@/shared/lib/i18n/server";
import { zodErrorMap } from "@/shared/lib/i18n/zod-locale";
import {
  validateThesisTitleInputSchema,
  summarizeConceptNoteInputSchema,
  generateAdvisoryFeedbackInputSchema,
  type ThesisTitleValidationResult,
  type ConceptNoteSummaryResult,
  type AdvisoryFeedbackResult,
} from "./schemas";
import {
  validateThesisTitle,
  summarizeConceptNote,
  generateAdvisoryFeedback,
} from "./services/ai.service";

export async function validateThesisTitleAction(
  input: unknown
): Promise<ActionResult<ThesisTitleValidationResult>> {
  return runAction(async () => {
    const locale = await getLocale();
    const parsed = validateThesisTitleInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });
    return validateThesisTitle(parsed);
  });
}

export async function summarizeConceptNoteAction(
  input: unknown
): Promise<ActionResult<ConceptNoteSummaryResult>> {
  return runAction(async () => {
    const locale = await getLocale();
    const parsed = summarizeConceptNoteInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });
    return summarizeConceptNote(parsed);
  });
}

export async function generateAdvisoryFeedbackAction(
  input: unknown
): Promise<ActionResult<AdvisoryFeedbackResult>> {
  return runAction(async () => {
    const locale = await getLocale();
    const parsed = generateAdvisoryFeedbackInputSchema.parse(input, {
      error: zodErrorMap(locale),
    });
    return generateAdvisoryFeedback(parsed);
  });
}
