import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { UserRole } from "../models/userRole";
import { ApplicationService } from "../services/applicationService";

const applicationRouter = Router();

const applicationService = new ApplicationService();
const controller = new ApplicationController(applicationService);

applicationRouter.use(authenticateToken);

applicationRouter.get(
  "/",
  authorizeRoles(UserRole.Admin, UserRole.User),
  controller.getMyApplications.bind(controller),
);

applicationRouter.get(
  "/job-role/:id",
  authorizeRoles(UserRole.Admin),
  controller.getApplicationsByJobRoleId.bind(controller),
);

applicationRouter.post(
  "/:id/hire",
  authorizeRoles(UserRole.Admin),
  controller.hireApplicant.bind(controller),
);

applicationRouter.put(
  "/:id/hire",
  authorizeRoles(UserRole.Admin),
  controller.hireApplicant.bind(controller),
);

applicationRouter.post(
  "/:id/reject",
  authorizeRoles(UserRole.Admin),
  controller.rejectApplicant.bind(controller),
);

applicationRouter.put(
  "/:id/reject",
  authorizeRoles(UserRole.Admin),
  controller.rejectApplicant.bind(controller),
);

export default applicationRouter;
