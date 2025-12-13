const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT;

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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let db;

// Proper async initialization + start server only AFTER DB is ready
async function startServer() {
  try {
    // Open database
    db = await open({
      filename: process.env.DATABASE_URL,
      driver: sqlite3.Database,
    });

    app.locals.db = db;
    console.log("Database connected successfully");

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