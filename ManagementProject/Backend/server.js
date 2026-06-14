const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { createClient } = require("@supabase/supabase-js");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8080;

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(
  cors({
    origin: [
      "https://apartment-management-967j.onrender.com"
    ],
    credentials: true,
  })
);
app.use(cookieParser());

// Make Supabase available in routes
app.locals.supabase = supabase;

app.use("/admin", adminRoutes);
app.use("/", userRoutes);
app.use(
  "/uploads/apartments",
  express.static(path.join(__dirname, "uploads", "apartments"))
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Start server (no DB open needed)
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(process.env.SUPABASE_URL);
});