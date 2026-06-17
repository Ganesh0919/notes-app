import "dotenv/config";
import { migrate } from "./migrate.js";

migrate()
  .then(() => process.exit(0))
  .catch((err: unknown) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
