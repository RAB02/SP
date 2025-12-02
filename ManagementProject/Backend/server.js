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

(async () => {
  try {
    db = await open({
      filename: "./db/new_management.db",
      driver: sqlite3.Database,
    });

    app.locals.db = db;

    // await db.exec(`
    //   CREATE TABLE IF NOT EXISTS MaintenanceRequests (
    //     request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    //     user_id INTEGER NOT NULL,
    //     selected_issues TEXT NOT NULL,
    //     additional_details TEXT,
    //     status TEXT DEFAULT 'pending',
    //     created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    //     FOREIGN KEY (user_id) REFERENCES Users(user_id)
    //   )
    // `);

  } catch (err) {
    console.error("Error initializing database:", err);
  }
})();

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));