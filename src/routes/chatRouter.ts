import { Router } from "express";
import rateLimit from "express-rate-limit";
import { ChatController } from "../controllers/chatController";
import { ChatService } from "../services/chatService";

const chatRouter = Router();

const controller = new ChatController(new ChatService());

const chatLimiter = rateLimit({
  windowMs: 60_000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many questions. Please wait a moment and try again." },
});

chatRouter.post("/", chatLimiter, controller.askQuestion.bind(controller));

export default chatRouter;
