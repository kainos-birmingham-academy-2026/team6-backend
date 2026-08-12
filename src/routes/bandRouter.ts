import { Router } from "express";
import { BandController } from "../controllers/bandController";
import { BandService } from "../services/bandService";

const bandRouter = Router();

const controller = new BandController(new BandService());

bandRouter.get("/", controller.getAllBands.bind(controller));

export default bandRouter;
