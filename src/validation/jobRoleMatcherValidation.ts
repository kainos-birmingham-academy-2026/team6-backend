import { z } from "zod";

// Agreement scale: -2 Strongly disagree .. 2 Strongly agree.
export const matcherAnswerSchema = z.object({
  questionId: z.number().int(),
  agreement: z.number().int().min(-2).max(2),
});

export const matcherSubmitSchema = z.object({
  answers: z.array(matcherAnswerSchema).min(1, "At least one answer is required"),
});

export type MatcherSubmitRequest = z.infer<typeof matcherSubmitSchema>;
