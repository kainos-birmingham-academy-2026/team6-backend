import type { JobRoleResponse } from "./JobRoleResponse";

export type JobRolePageResponse = {
  items: JobRoleResponse[];
  total: number;
  limit: number;
  offset: number;
};
