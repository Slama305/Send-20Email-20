import "dotenv/config";
import { createServer } from "./index";

const app = createServer();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`🔧 Backend API server running on http://localhost:${port}`);
  console.log(`📡 API endpoints: http://localhost:${port}/api`);
});

process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully");
  process.exit(0);
});
