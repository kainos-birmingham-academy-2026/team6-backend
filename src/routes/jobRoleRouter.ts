import { Router } from "express";
import multer from "multer";
import { JobRoleController } from "../controllers/jobRoleController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { UserRole } from "../models/userRole";
import { ApplicationService } from "../services/applicationService";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleRouter = Router();

const upload = multer({ storage: multer.memoryStorage() });
const jobRoleService = new JobRoleService();
const applicationService = new ApplicationService();
const controller = new JobRoleController(jobRoleService, applicationService);

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

jobRoleRouter.post(
  "/:id/apply",
  authorizeRoles(UserRole.Admin, UserRole.User),
  upload.single("cv"),
  controller.applyForJobRole.bind(controller),
);

export default jobRoleRouter;
