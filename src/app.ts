import express from "express";

export function createApp() {
  const app = express();

  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "UP", time: new Date().toISOString() });
  });

  return app;
}
