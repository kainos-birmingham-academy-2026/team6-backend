import "dotenv/config";

import { createApp } from "./app";

const PORT = Number(process.env.PORT ?? 3000);
const app = createApp();

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📝 Try: http://localhost:${PORT}/health`);
});
