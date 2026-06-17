import "dotenv/config";
import { createApp } from "./app.js";
import { migrate } from "./db/migrate.js";

const PORT = parseInt(process.env.PORT ?? "3001", 10);

async function start() {
  await migrate();
  const app = createApp();
  app.listen(PORT, () => {
    console.log(`Notes API running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
