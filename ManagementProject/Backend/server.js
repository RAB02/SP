const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
const PORT = 8080;

// Middleware
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.use("/admin", adminRoutes);
app.use("/", userRoutes);
app.use(
  "/uploads/apartments",
  express.static(path.join(__dirname, "uploads", "apartments"))
);

let db;

// Proper async initialization + start server only AFTER DB is ready
async function startServer() {
  try {
    // Open database
    db = await open({
      filename: "./db/new_management.db",
      driver: sqlite3.Database,
    });

    app.locals.db = db;
    console.log("Database connected successfully");

    // Create MaintenanceRequests table
    await db.exec(`
      CREATE TABLE IF NOT EXISTS MaintenanceRequests (
        request_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        selected_issues TEXT NOT NULL,
        additional_details TEXT,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES Users(user_id)
      )
    `);
    console.log("MaintenanceRequests table ready");

    // Create RentalApplications table + ensure apartment_id exists
    await db.exec(`
      CREATE TABLE IF NOT EXISTS RentalApplications (
        application_id INTEGER PRIMARY KEY AUTOINCREMENT,
        apartment_id INTEGER,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT,
        date_of_birth DATE,
        ssn TEXT,
        employer TEXT,
        job_title TEXT,
        monthly_income DECIMAL(10,2),
        employment_length TEXT,
        current_address TEXT,
        rent_amount DECIMAL(10,2),
        landlord_name TEXT,
        landlord_phone TEXT,
        consent_to_background_check BOOLEAN DEFAULT 0,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (apartment_id) REFERENCES Apartments(apartment_id)
      )
    `);
    console.log("RentalApplications table ready");

    // Add apartment_id column if missing (safe check)
    const tableInfo = await db.all("PRAGMA table_info(RentalApplications)");
    if (!tableInfo.some(col => col.name === 'apartment_id')) {
      await db.exec("ALTER TABLE RentalApplications ADD COLUMN apartment_id INTEGER");
      console.log("Added missing apartment_id column");
    } else {
      console.log("apartment_id column already exists");
    }

    // Start the server only after everything is ready
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error("Failed to start server:", err);
    process.exit(1); // Stop the process if DB fails
  }
}

// Start everything
startServer();