import { z } from "zod";

const optionalText = (schema: z.ZodType<string>) =>
  z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null ? undefined : value,
    schema.optional(),
  );

export const jobRoleSchema = z.object({
  roleName: z.string().trim().min(1, "Role name is required"),
  location: z.string().trim().min(1, "Location is required"),
  capabilityId: z.coerce.number().int().positive("Capability is required"),
  bandId: z.coerce.number().int().positive("Band is required"),
  closingDate: z.coerce.date({ message: "A valid closing date is required" }),
  description: optionalText(z.string().trim().min(1)),
  responsibilities: optionalText(z.string().trim().min(1)),
  sharepointUrl: optionalText(
    z.string().trim().url("Sharepoint URL must be a valid URL"),
  ),
  numberOfOpenPositions: z.preprocess(
    (value) =>
      value === "" || value === undefined || value === null ? undefined : value,
    z.coerce.number().int().positive().optional(),
  ),
});

export const createJobRoleSchema = jobRoleSchema;

export const updateJobRoleSchema = jobRoleSchema;

export type CreateJobRoleInput = z.infer<typeof createJobRoleSchema>;
export type UpdateJobRoleInput = z.infer<typeof updateJobRoleSchema>;

export const sortableJobRoleColumns = [
  "roleName",
  "location",
  "capabilityName",
  "bandName",
  "closingDate",
  "statusName",
] as const;

export const jobRoleSortQuerySchema = z.object({
  sortBy: z.enum(sortableJobRoleColumns).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export type SortableJobRoleColumn = (typeof sortableJobRoleColumns)[number];
export type JobRoleSortQuery = z.infer<typeof jobRoleSortQuerySchema>;

