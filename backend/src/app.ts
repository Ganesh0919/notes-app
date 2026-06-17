import express from "express";
import cors from "cors";
import notesRouter from "./routes/notes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(",") ?? ["http://localhost:5173"],
      credentials: true,
    })
  );
  app.use(express.json({ limit: "1mb" }));

  app.use("/api", notesRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
