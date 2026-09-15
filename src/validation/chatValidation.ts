import { z } from "zod";

export const chatRequestSchema = z.object({
  question: z
    .string()
    .trim()
    .min(3, "Question must be at least 3 characters")
    .max(500, "Question must be 500 characters or fewer"),
});

export type ChatRequest = z.infer<typeof chatRequestSchema>;
