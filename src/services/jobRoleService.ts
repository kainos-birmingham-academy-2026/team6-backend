import type { JobRole } from "../models/jobRole";

export class JobRoleService {

    private jobRoles: JobRole[] = [
       new JobRole (1, "Software Engineer", "New York", 101, 5, new Date("2024-12-31"), "open"),
       new JobRole (2, "Data Analyst", "San Francisco", 102, 4, new Date("2024-11-30"), "open"),
       new JobRole (3, "Project Manager", "Chicago", 103, 6, new Date("2024-10-15"), "closed"),
       new JobRole (4, "UX Designer", "Los Angeles", 104, 5, new Date("2024-09-30"), "open"),
       new JobRole (5, "DevOps Engineer", "Seattle", 105, 7, new Date("2024-08-31"), "closed")
    ];

    async findAllJobRoles(): Promise<JobRole[]> {
        return this.jobRoles;
    }

}