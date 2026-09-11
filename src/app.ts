import express from "express";
import applicationRouter from "./routes/applicationRouter";
import authRouter from "./routes/authRouter";
import bandRouter from "./routes/bandRouter";
import capabilityRouter from "./routes/capabilityRouter";
import chatRouter from "./routes/chatRouter";
import jobRoleRouter from "./routes/jobRoleRouter";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "UP", time: new Date().toISOString() });
  });

  app.use("/job-roles", jobRoleRouter);
  app.use("/capabilities", capabilityRouter);
  app.use("/bands", bandRouter);
  app.use("/auth", authRouter);
  app.use("/applications", applicationRouter);
  app.use("/chat", chatRouter);

  return app;
}
