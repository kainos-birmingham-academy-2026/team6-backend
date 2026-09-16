import { Router } from "express";
import { JobRoleMatcherController } from "../controllers/jobRoleMatcherController";
import {
  authenticateToken,
  authorizeRoles,
} from "../middleware/authMiddleware";
import { UserRole } from "../models/userRole";
import { JobRoleService } from "../services/jobRoleService";

const jobRoleMatcherRouter = Router();

const controller = new JobRoleMatcherController(new JobRoleService());

jobRoleMatcherRouter.use(authenticateToken);

jobRoleMatcherRouter.get(
  "/questions",
  authorizeRoles(UserRole.Admin, UserRole.User),
  controller.getQuestions.bind(controller),
);

jobRoleMatcherRouter.post(
  "/submit",
  authorizeRoles(UserRole.Admin, UserRole.User),
  controller.submitAnswers.bind(controller),
);

export default jobRoleMatcherRouter;
