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

// Recruitment Admins and Applicants can both view job roles; create/update/delete
// are restricted to Admins.
jobRoleRouter.get(
  "/",
  authorizeRoles(UserRole.Admin, UserRole.User),
  controller.getAllJobRoles.bind(controller),
);

jobRoleRouter.post(
  "/",
  authorizeRoles(UserRole.Admin),
  controller.createJobRole.bind(controller),
);

jobRoleRouter.get(
  "/:id",
  authorizeRoles(UserRole.Admin, UserRole.User),
  controller.getJobRoleInfoById.bind(controller),
);

jobRoleRouter.put(
  "/:id",
  authorizeRoles(UserRole.Admin),
  controller.updateJobRole.bind(controller),
);

jobRoleRouter.delete(
  "/:id",
  authorizeRoles(UserRole.Admin),
  controller.deleteJobRole.bind(controller),
);

export default jobRoleRouter;
