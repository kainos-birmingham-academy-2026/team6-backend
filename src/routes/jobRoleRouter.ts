import { Router } from "express";
import { JobRoleController } from "../controllers/jobRoleController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { UserRole } from "../models/userRole";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();

const controller = new JobRoleController(new JobRoleService());

// All job role endpoints require a valid token.
jobRoleRouter.use(authenticateToken);

jobRoleRouter.post("/", controller.createJobRole.bind(controller));

jobRoleRouter.get("/:id", controller.getJobRoleInfoById.bind(controller));

jobRoleRouter.put("/:id", controller.updateJobRole.bind(controller));

jobRoleRouter.delete("/:id", controller.deleteJobRole.bind(controller));

export default jobRoleRouter;
