import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DB File Path
const dbPath =
  process.env.DATABASE_URL ||
  (process.env.VERCEL ? path.join("/tmp", "arogyaswift.db") : path.join(__dirname, "..", "arogyaswift.db"));

// Initialize Database Instance
export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Initialize Tables
export function initDb() {
  // Ensure uploads folder exists
  const uploadsDir = process.env.VERCEL
    ? path.join("/tmp", "uploads", "prescriptions")
    : path.join(__dirname, "..", "uploads", "prescriptions");
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
      patient_name TEXT,
      patient_phone TEXT,
      patient_address TEXT,
      pharmacy_id TEXT NOT NULL,
      pharmacy_name TEXT,
      pharmacy_address TEXT,
      pharmacy_phone TEXT,
      rider_id TEXT,
      rider_name TEXT,
      rider_phone TEXT,
      rider_vehicle TEXT,
      items_json TEXT NOT NULL,
      status TEXT DEFAULT 'placed',
      pickup_otp TEXT DEFAULT '8514',
      delivery_otp TEXT DEFAULT '4829',
      total_amount REAL,
      delivery_fee REAL DEFAULT 35,
      is_emergency INTEGER DEFAULT 0,
      timeline_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Safely ensure new columns exist if orders table was already created in SQLite
  const existingOrderColumns = (db.prepare("PRAGMA table_info(orders)").all() as any[]).map((c) => c.name);
  const requiredColumns: { name: string; type: string; dflt?: string }[] = [
    { name: "patient_name", type: "TEXT" },
    { name: "patient_phone", type: "TEXT" },
    { name: "patient_address", type: "TEXT" },
    { name: "pharmacy_name", type: "TEXT" },
    { name: "pharmacy_address", type: "TEXT" },
    { name: "pharmacy_phone", type: "TEXT" },
    { name: "rider_id", type: "TEXT" },
    { name: "rider_name", type: "TEXT" },
    { name: "rider_phone", type: "TEXT" },
    { name: "rider_vehicle", type: "TEXT" },
    { name: "pickup_otp", type: "TEXT", dflt: "'8514'" },
    { name: "delivery_otp", type: "TEXT", dflt: "'4829'" },
    { name: "delivery_fee", type: "REAL", dflt: "35" },
    { name: "is_emergency", type: "INTEGER", dflt: "0" },
    { name: "timeline_json", type: "TEXT" },
    { name: "updated_at", type: "DATETIME", dflt: "CURRENT_TIMESTAMP" },
  ];

  for (const col of requiredColumns) {
    if (!existingOrderColumns.includes(col.name)) {
      try {
        const defaultClause = col.dflt !== undefined ? ` DEFAULT ${col.dflt}` : "";
        db.exec(`ALTER TABLE orders ADD COLUMN ${col.name} ${col.type}${defaultClause}`);
      } catch (err: any) {
        // Ignore column already exists or table lock
      }
    }
  }

  console.log("✅ SQLite Database & Orders schema initialized successfully at:", dbPath);
}
