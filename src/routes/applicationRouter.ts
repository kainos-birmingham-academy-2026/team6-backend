import { Router } from "express";
import { ApplicationController } from "../controllers/applicationController";
import { authenticateToken, authorizeRoles } from "../middleware/authMiddleware";
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

export default applicationRouter;
