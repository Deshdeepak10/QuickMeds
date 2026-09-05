import { db, initDb } from "./db";
import bcrypt from "bcryptjs";

export async function seedDatabase() {
  initDb();

  // Check if admin exists
  const existingAdmin = db.prepare("SELECT * FROM users WHERE email = ?").get("compliance@arogyaswift.in");
  if (!existingAdmin) {
    const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
    const patientPasswordHash = await bcrypt.hash("Patient@123", 10);
    const pharmacyPasswordHash = await bcrypt.hash("Pharmacy@123", 10);
    const riderPasswordHash = await bcrypt.hash("Rider@123", 10);

    // Seed Users
    const insertUser = db.prepare(`
      INSERT OR IGNORE INTO users (id, name, email, phone, role, password_hash, badge, avatar, vehicle_type, location, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertUser.run(
      "u-admin-999",
      "ArogyaSwift Compliance Officer",
      "compliance@arogyaswift.in",
      "+911204991200",
      "admin",
      adminPasswordHash,
      "Super Admin #SA-001",
      "👑",
      null,
      "Ghaziabad Head Office",
      "approved"
    );

    insertUser.run(
      "u-patient-101",
      "Sarah Chen",
      "sarah.chen@example.com",
      "9876543210",
      "patient",
      patientPasswordHash,
      "Patient #P-8821",
      "👩‍💼",
      null,
      "Raj Nagar Extension, Ghaziabad",
      "approved"
    );

    insertUser.run(
      "u-pharmacy-202",
      "Apollo Express Pharmacy (Ghaziabad)",
      "hub.ghaziabad@apollopharmacy.in",
      "9876511223",
      "pharmacy",
      pharmacyPasswordHash,
      "Licensed Hub #UP-2021-00921",
      "🏥",
      null,
      "Kavi Nagar Main Rd, Ghaziabad",
      "approved"
    );

    insertUser.run(
      "u-rider-303",
      "Vikram Singh",
      "vikram.rider@arogyaswift.in",
      "9876599887",
      "rider",
      riderPasswordHash,
      "Express Courier #R-4402",
      "🏍️",
      "EV Scooter",
      "Ghaziabad Central Zone",
      "approved"
    );

    // Seed Pharmacies
    const insertPharmacy = db.prepare(`
      INSERT OR IGNORE INTO pharmacies (id, owner_name, shop_name, license_no, gst_no, category, address, phone, email, rating, verification_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertPharmacy.run(
      "p1",
      "Pharm. Priya Nair",
      "Apollo Pharmacy - Express Hub (Raj Nagar, Ghaziabad)",
      "UP-2021-00921",
      "09AABCA1234F1Z5",
      "Certified Retail Hub",
      "Kavi Nagar Main Rd, Ghaziabad",
      "9876543210",
      "hub.ghaziabad@apollopharmacy.in",
      "4.9 ★",
      "approved"
    );

    insertPharmacy.run(
      "p2",
      "Pharm. Suresh Kumar",
      "MedPlus Superstore (Indirapuram, Ghaziabad)",
      "UP-2019-04120",
      "09AACCM5678G2Z1",
      "Retail Pharmacy Hub",
      "Shipra Sun City, Indirapuram, Ghaziabad",
      "9876512345",
      "indirapuram@medplus.in",
      "4.7 ★",
      "approved"
    );

    console.log("🌱 Database seeded with initial users and pharmacies!");
  }
}
