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
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

let db;

(async () => {
  try {
    db = await open({
      filename: "./db/new_management.db",
      driver: sqlite3.Database,
    });

    app.locals.db = db;

  } catch (err) {
    console.error("Error initializing database:", err);
  }
})();

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));