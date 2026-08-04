const express = require("express");

const app = express();
const port = Number(process.env.PORT) || 3000;

app.get("/health", (_req, res) => {
  res.json({
    status: "UP",
    time: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`API server run ning on port ${port}`);
});
