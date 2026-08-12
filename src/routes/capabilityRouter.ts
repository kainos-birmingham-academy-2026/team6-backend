import { Router } from "express";
import { CapabilityController } from "../controllers/capabilityController";
import { CapabilityService } from "../services/capabilityService";

const capabilityRouter = Router();

const controller = new CapabilityController(new CapabilityService());

capabilityRouter.get("/", controller.getAllCapabilities.bind(controller));

export default capabilityRouter;
