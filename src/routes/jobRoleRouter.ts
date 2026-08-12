import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();

const controller = new JobRoleController(new JobRoleService());

jobRoleRouter.get("/", controller.getAllJobRoles.bind(controller));

jobRoleRouter.post("/", controller.createJobRole.bind(controller));

jobRoleRouter.get("/:id", controller.getJobRoleInfoById.bind(controller));

jobRoleRouter.put("/:id", controller.updateJobRole.bind(controller));

jobRoleRouter.delete("/:id", controller.deleteJobRole.bind(controller));

export default jobRoleRouter;
