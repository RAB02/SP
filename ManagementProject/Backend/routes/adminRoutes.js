const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const {
  verifyAdmin,
  verifyAdminStatus,
} = require("../middleware/authAdmin.js");
require("dotenv").config();
const router = express.Router();
const SECRET_KEY = "SECRET_KEY"; // same as in server.js

// POST /admin/login
router.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  try {
    const admin = await db.get("SELECT * FROM Admins WHERE email = ?", [email]);
    if (!admin)
      return res.status(400).json({ error: "Invalid admin username" });

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

    console.log("✅ Admin logged in:", admin.email);
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /admin/logout
router.post("/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ success: true, message: "Admin logged out" });
});

// GET /admin/verify
router.get("/verify", verifyAdminStatus);

// GET /admin/dashboard
router.get("/dashboard", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const apartments = await db.all("SELECT * FROM Apartments");
    const users = await db.all("SELECT * FROM Users");
    const stats = await db.get(`
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

// GET /admin/lease
router.get("/lease", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const leases = await db.all(`
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

// POST /admin/lease
router.post("/lease", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { apartment_id, user_id, start_date, end_date, rent_amount } = req.body;

  if (!apartment_id || !user_id || !start_date || !end_date || !rent_amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    await db.run(
      `INSERT INTO Leases (apartment_id, user_id, start_date, end_date, rent_amount, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [apartment_id, user_id, start_date, end_date, rent_amount]
    );

    await db.run(
      `UPDATE Apartments SET is_occupied = 1 WHERE apartment_id = ?`,
      [apartment_id]
    );

    res.json({ message: "Lease created and apartment marked as occupied" });
  } catch (err) {
    console.error("Error creating lease:", err);
    res.status(500).json({ error: "Failed to create lease" });
  }
});

// PUT /admin/lease/:id/end
router.put("/lease/:id/end", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;

  try {
    const lease = await db.get(
      "SELECT apartment_id FROM Leases WHERE lease_id = ?",
      [id]
    );
    if (!lease) {
      return res.status(404).json({ error: "Lease not found" });
    }

    await db.run("UPDATE Leases SET status = 0 WHERE lease_id = ?", [id]);
    await db.run(
      "UPDATE Apartments SET is_occupied = 0 WHERE apartment_id = ?",
      [lease.apartment_id]
    );

    res.json({ message: "Lease ended and apartment marked as vacant" });
  } catch (err) {
    console.error("Error ending lease:", err);
    res.status(500).json({ error: "Failed to end lease" });
  }
});

// GET /admin/payments
router.get("/payments", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const leases = await db.all(`
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
      WHERE l.status = 1
      ORDER BY l.start_date DESC;
    `);

    const paymentRows = await db.all(`
      SELECT
        p.payment_id,
        p.amount,
        p.payment_date,
        p.method,
        p.status,
        l.lease_id,
        u.email,
        a.address
      FROM Payments p
      JOIN Leases l ON p.lease_id = l.lease_id
      JOIN Users u ON l.user_id = u.user_id
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      ORDER BY p.payment_date DESC, p.payment_id DESC;
    `);

    const payments = paymentRows.map((row) => ({
      id: row.payment_id,
      tenantName: row.email,
      apartment: row.address,
      leaseLabel: `Lease #${row.lease_id} – ${row.address}`,
      amount: row.amount,
      method: row.method,
      status: row.status,
      date: row.payment_date,
    }));

    res.json({ leases, payments });
  } catch (err) {
    console.error("Error fetching payments data:", err);
    res.status(500).json({ error: "Failed to fetch payments data" });
  }
});

// POST /admin/payments
router.post("/payments", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { lease_id, amount, payment_date, method, status } = req.body;

  if (!lease_id || !amount || !payment_date || !method || !status) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const result = await db.run(
      `INSERT INTO Payments (lease_id, amount, payment_date, method, status)
       VALUES (?, ?, ?, ?, ?)`,
      [lease_id, amount, payment_date, method, status]
    );

    const paymentId = result.lastID;

    const row = await db.get(
      `
      SELECT
        p.payment_id,
        p.amount,
        p.payment_date,
        p.method,
        p.status,
        l.lease_id,
        u.email,
        a.address
      FROM Payments p
      JOIN Leases l ON p.lease_id = l.lease_id
      JOIN Users u ON l.user_id = u.user_id
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      WHERE p.payment_id = ?;
      `,
      [paymentId]
    );

    const payment = {
      id: row.payment_id,
      tenantName: row.email,
      apartment: row.address,
      leaseLabel: row.address,
      amount: row.amount,
      method: row.method,
      status: row.status,
      date: row.payment_date,
    };

    res.status(201).json({
      message: "Payment created successfully",
      payment,
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // uploads/apartments relative to this file
    cb(null, path.join(__dirname, "..", "uploads", "apartments"));
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, unique + ext);
  },
});

const upload = multer({ storage });

router.post(
  "/add-lease",
  verifyAdmin,
  upload.array("images"),
  async (req, res) => {
    const db = req.app.locals.db;
    try {
      const { apartment_name, address, lat, lng, bed, bath, pricing } =
        req.body;

      const latNum = parseFloat(lat);
      const lonNum = parseFloat(lng);

      const result = await db.run(
        `INSERT INTO Apartments
          (apartment_name, address, bed, bath, pricing, lat, lon, is_occupied)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0)`,
        [
          apartment_name,
          address,
          bed || null,
          bath || null,
          pricing || null,
          latNum,
          lonNum,
        ]
      );

      const apartmentId = result.lastID;

      // 2) Insert images into ApartmentImages
      const files = req.files || [];
      for (const file of files) {
        const relUrl = `/uploads/apartments/${file.filename}`;

        await db.run(
          `INSERT INTO ApartmentImages (apartment_id, image_url)
           VALUES (?, ?)`,
          [apartmentId, relUrl]
        );
      }

      res.json({
        message: "Apartment and images saved",
        apartment_id: apartmentId,
        images_saved: files.length,
      });
    } catch (err) {
      console.error("Error adding apartment:", err);
      res.status(500).json({ error: "Failed to add apartment" });
    }
  }
);

router.get("/applicants", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const applicants = await db.all(`
      SELECT * From RentalApplications
      JOIN Apartments ON RentalApplications.apartment_id = Apartments.apartment_id
    `);

    console.log("Applicants:", applicants);

    res.json({ applicants });
  } catch (err) {
    console.error("Error fetching applicants:", err);
    res.status(500).json({ error: "Failed to fetch applicants" });
  }
});

router.patch("/applicants/:id/status", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { status } = req.body;

  const normalized = (status || "").toLowerCase();
  const allowed = ["pending", "approved", "rejected"];

  if (!allowed.includes(normalized)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  try {
    const result = await db.run(
      `UPDATE RentalApplications
       SET status = ?
       WHERE application_id = ?`,
      [normalized, id]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json({ message: "Status updated", id, status: normalized });
  } catch (err) {
    console.error("Error updating application status:", err);
    res.status(500).json({ error: "Failed to update application status" });
  }
});

router.get("/maintenance", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const requests = await db.all(`
      SELECT
        m.request_id,
        m.user_id,
        u.username,
        u.email,
        m.selected_issues,
        m.additional_details,
        m.status,
        m.created_at,
        m.lease_id,
        a.address,
        a.apartment_name
      FROM MaintenanceRequests m
      LEFT JOIN Users u ON m.user_id = u.user_id
      LEFT JOIN Leases l ON m.lease_id = l.lease_id
      LEFT JOIN Apartments a ON l.apartment_id = a.apartment_id
      ORDER BY m.created_at DESC;
    `);

    const parsed = requests.map((row) => {
      let parsedIssues = row.selected_issues;
      if (typeof parsedIssues === "string") {
        try {
          parsedIssues = JSON.parse(parsedIssues);
        } catch {
          // keep original string if it is not JSON
        }
      }

      return {
        ...row,
        selected_issues: parsedIssues,
      };
    });

    console.log("Maintenance Requests:", parsed);
    res.json({ requests: parsed });
  } catch (err) {
    console.error("Error fetching maintenance requests:", err);
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

router.patch("/maintenance/:id/status", verifyAdmin, async (req, res) => {
  const db = req.app.locals.db;
  const { id } = req.params;
  const { status } = req.body;

  const normalized = (status || "").toLowerCase();
  const allowed = ["pending", "in_progress", "completed"];

  if (!allowed.includes(normalized)) {
    return res.status(400).json({ error: "Invalid status value" });
  }

  const result = await db.run(
    `UPDATE MaintenanceRequests
     SET status = ?
     WHERE request_id = ?`,
    [normalized, id]
  );

  if (result.changes === 0) {
    return res.status(404).json({ error: "Request not found" });
  }

  res.json({ message: "Status updated", request_id: id, status: normalized });
});

module.exports = router;
