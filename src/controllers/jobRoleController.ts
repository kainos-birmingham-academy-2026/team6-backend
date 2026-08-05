import { Request, Response } from "express";
import { JobRoleService } from "../services/jobRoleService";


export class JobRoleController {

    constructor(private readonly jobRoleService: JobRoleService) {}

    async getAllJobRoles(req: Request, res: Response) {
        try {
            const jobRoles = await this.jobRoleService.findAllJobRoles();
            res.status(200).json(jobRoles);
        } catch (error) {
            res.status(500).json({ error: "Failed to fetch job roles" });
        }
    }
    


}