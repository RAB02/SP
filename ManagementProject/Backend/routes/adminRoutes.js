const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyAdmin, verifyAdminStatus } = require("../middleware/authAdmin.js");

const router = express.Router();
const SECRET_KEY = "SECRET_KEY";

// We'll receive the db connection from server.js
let dbRef;
function setDatabase(db) {
  dbRef = db;
}

// Admin login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await dbRef.get("SELECT * FROM Admins WHERE email = ?", [email]);
    if (!admin) return res.status(400).json({ error: "Invalid admin username" });

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) return res.status(400).json({ error: "Invalid password" });

    const token = jwt.sign(
      { id: admin.admin_id, email: admin.email, role: "admin" },
      SECRET_KEY,
      { expiresIn: "1h" }
    );

    res.cookie("adminToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: "Admin login successful",
      admin: { id: admin.id, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Admin logout
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ success: true, message: "Admin logged out" });
});

// Verify admin
router.get("/verify", verifyAdminStatus);

// Admin dashboard
router.get("/dashboard", verifyAdmin, async (req, res) => {
  try {
    const apartments = await dbRef.all("SELECT * FROM Apartments");
    const users = await dbRef.all("SELECT * FROM Users");
    const stats = await dbRef.get(`
      SELECT
        SUM(CASE WHEN is_occupied = 1 THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN is_occupied = 0 THEN 1 ELSE 0 END) AS vacant
      FROM Apartments;
    `);

    res.json({
      apartmentCount: apartments.length,
      userCount: users.length,
      apartments,
      users,
      occupied: stats.occupied,
      vacant: stats.vacant,
      adminEmail: req.admin.email,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Leases
router.get("/lease", verifyAdmin, async (req, res) => {
  try {
    const leases = await dbRef.all(`
      SELECT 
        l.lease_id,
        l.apartment_id,
        l.user_id,
        l.start_date,
        l.end_date,
        l.rent_amount,
        l.status,
        a.address,
        u.email
      FROM Leases l
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      JOIN Users u ON l.user_id = u.user_id
      ORDER BY l.start_date DESC;
    `);
    res.json({ leases });
  } catch (err) {
    console.error("Error fetching leases:", err);
    res.status(500).json({ error: "Failed to fetch leases" });
  }
});

router.post("/lease", verifyAdmin, async (req, res) => {
  const { apartment_id, user_id, start_date, end_date, rent_amount } = req.body;
  if (!apartment_id || !user_id || !start_date || !end_date || !rent_amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await dbRef.run(
      `INSERT INTO Leases (apartment_id, user_id, start_date, end_date, rent_amount, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [apartment_id, user_id, start_date, end_date, rent_amount]
    );

    await dbRef.run(
      `UPDATE Apartments SET is_occupied = 1 WHERE apartment_id = ?`,
      [apartment_id]
    );

    res.json({ message: "Lease created and apartment marked as occupied" });
  } catch (err) {
    console.error("Error creating lease:", err);
    res.status(500).json({ error: "Failed to create lease" });
  }
});

router.put("/lease/:id/end", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const lease = await dbRef.get("SELECT apartment_id FROM Leases WHERE lease_id = ?", [id]);
    if (!lease) return res.status(404).json({ error: "Lease not found" });

    await dbRef.run("UPDATE Leases SET status = 0 WHERE lease_id = ?", [id]);
    await dbRef.run("UPDATE Apartments SET is_occupied = 0 WHERE apartment_id = ?", [lease.apartment_id]);

    res.json({ message: "Lease ended and apartment marked as vacant" });
  } catch (err) {
    console.error("Error ending lease:", err);
    res.status(500).json({ error: "Failed to end lease" });
  }
});

module.exports = { router, setDatabase };