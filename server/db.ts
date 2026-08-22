import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB File Path
const dbPath = process.env.DATABASE_URL || path.join(__dirname, "..", "quickmed.db");

// Initialize Database Instance
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Initialize Tables
export function initDb() {
  // Ensure uploads folder exists
  const uploadsDir = path.join(__dirname, "..", "uploads", "prescriptions");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE,
      phone TEXT UNIQUE,
      role TEXT NOT NULL,
      password_hash TEXT,
      badge TEXT,
      avatar TEXT,
      vehicle_type TEXT,
      location TEXT,
      verification_status TEXT DEFAULT 'approved',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // OTP Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS otp_codes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      phone TEXT NOT NULL,
      code TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Pharmacies Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS pharmacies (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      license_no TEXT UNIQUE NOT NULL,
      gst_no TEXT,
      owner_aadhar TEXT,
      pharmacist_reg_no TEXT,
      category TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      rating TEXT DEFAULT '5.0 ★',
      verification_status TEXT DEFAULT 'pending',
      rejection_reason TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Prescriptions Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS prescriptions (
      id TEXT PRIMARY KEY,
      patient_id TEXT,
      patient_name TEXT,
      patient_phone TEXT,
      file_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      ocr_json TEXT,
      verification_status TEXT DEFAULT 'pending',
      pharmacist_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Orders Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      patient_id TEXT NOT NULL,
      pharmacy_id TEXT NOT NULL,
      items_json TEXT NOT NULL,
      status TEXT DEFAULT 'placed',
      otp_code TEXT,
      total_amount REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("✅ SQLite Database initialized successfully at:", dbPath);
}
