import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { registerRoutes } from "./routes";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  // Parse JSON bodies
  app.use(express.json());

  // Register API routes with Zod input validation & rate limiters
  registerRoutes(app);

  // Serve uploaded prescriptions
  const uploadsPath = path.resolve(__dirname, "..", "uploads");
  app.use("/uploads", express.static(uploadsPath));

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(express.static(staticPath));

  return app;
}

export const app = createApp();
