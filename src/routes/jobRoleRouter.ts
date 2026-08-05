import { Router } from "express";
import { JobRoleService } from "../services/jobRoleService";
import { JobRoleController } from "../controllers/jobRoleController";

const jobRoleRouter = Router();

const controller = new JobRoleController(new JobRoleService());

jobRoleRouter.get("/", controller.getAllJobRoles.bind(controller));
export default jobRoleRouter;