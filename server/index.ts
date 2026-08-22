import { createServer } from "http";
import path from "path";
import { app } from "./app";
import { seedDatabase } from "./seed";

const server = createServer(app);
const port = process.env.PORT || 3000;

// Initialize & Seed Database
seedDatabase()
  .then(() => {
    server.listen(port, () => {
      console.log(`🚀 QuickMed Real Backend Server running on http://localhost:${port}/`);
    });
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    server.listen(port, () => {
      console.log(`🚀 QuickMed Server running on http://localhost:${port}/ (with memory fallback)`);
    });
  });
