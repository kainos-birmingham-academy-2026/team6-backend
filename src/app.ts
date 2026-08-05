import express from "express";
import jobRoleRouter from "./routes/jobRoleRouter";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "UP", time: new Date().toISOString() });
  });

  app.use("/job-roles", jobRoleRouter);

  return app;
}
