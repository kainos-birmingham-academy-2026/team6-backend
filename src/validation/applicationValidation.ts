import { z } from "zod";

export const applyForJobRoleSchema = z.object({
  jobRoleId: z.number().int().positive("Job role ID must be positive"),
});

export type ApplyForJobRoleInput = z.infer<typeof applyForJobRoleSchema>;
