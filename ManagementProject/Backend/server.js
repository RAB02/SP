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

// DB init
let db;

async function initializeDatabase() {
  db = await open({
    filename: "./db/new_management.db",
    driver: sqlite3.Database,
  });
  
  app.locals.db = db;

  // Initialize MaintenanceRequests table if it doesn't exist
  try {
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
  } catch (err) {
    console.error("Error creating MaintenanceRequests table:", err);
  }

  // Initialize RentalApplications table if it doesn't exist
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS RentalApplications (
        application_id INTEGER PRIMARY KEY AUTOINCREMENT,
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
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("RentalApplications table ready");
  } catch (err) {
    console.error("Error creating RentalApplications table:", err);
  }
}

// Start server after database is initialized
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to initialize database:", err);
    process.exit(1);
  });
