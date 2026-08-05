import express from "express";

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ status: "UP", timestamp: new Date().toISOString() });
});

const PORT = 3000;

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/health`);
});
