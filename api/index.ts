import { app } from "../server/app";
import { initDb } from "../server/db";
import { seedDatabase } from "../server/seed";

// Initialize and seed SQLite database on first serverless invocation
try {
  initDb();
  seedDatabase().catch((err) => {
    console.warn("Vercel seedDatabase notice:", err);
  });
} catch (err) {
  console.error("Vercel DB init error:", err);
}

export default app;
