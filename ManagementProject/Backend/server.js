const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3");
const { open } = require("sqlite");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const { verifyAdmin, verifyAdminStatus } = require("./middleware/authAdmin.js");
const SECRET_KEY = "SECRET_KEY";

PORT = 8080;

// connect to db
let db;
(async () => {
  db = await open({
    filename: "./db/new_management.db",
    driver: sqlite3.Database,
  });
})();
app = express();
app.use(express.static(path.join(__dirname, "static")));
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(cookieParser());

app.get("/rentals", async (req, res) => {
  const { minPrice, maxPrice, minBeds, minBaths } = req.query;

  let query = "SELECT * FROM Apartments WHERE 1=1 AND is_occupied = 0";
  const params = [];

  if (minPrice) {
    query += " AND pricing  >= ?";
    params.push(minPrice);
  }

  if (maxPrice) {
    query += " AND pricing <= ?";
    params.push(maxPrice);
  }

  if (minBeds) {
    query += " AND bed >= ?";
    params.push(minBeds);
  }

  if (minBaths) {
    query += " AND bath >= ?";
    params.push(minBaths);
  }

  try {
    const rentals = await db.all(query, params);
    const rentalsWithImage = await Promise.all(
      rentals.map(async (rental) => {
        const image = await db.get(
          "SELECT image_url FROM ApartmentImages WHERE apartment_id = ? LIMIT 1",
          [rental.apartment_id]
        );

        return {
          ...rental,
          Img: image ? image.image_url : null,
        };
      })
    );
    console.log(rentalsWithImage);
    res.json(rentalsWithImage);
  } catch (error) {
    console.error("Error fetching filtered rentals:", error);
    res.status(500).json({ error: "Failed to fetch rentals" });
  }
});

const bcrypt = require("bcrypt");

app.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await db.run(
      "INSERT INTO Users (username, email, password_hash) VALUES (?, ?, ?)",
      [name, email, hashedPassword]
    );

    res.json({
      message: "User registered successfully!",
      userId: result.lastID,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Error inserting into database" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db.get("SELECT * FROM Users WHERE email = ?", [email]);

    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }

    // Compare provided password with stored hashed password
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = jwt.sign(
      {
        id: user.user_id,
        email: user.email,
        username: user.username,
        role: "user",
      },
      SECRET_KEY,
      { expiresIn: "1h" } // expires in 1 hour
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: false, // set to true in production with HTTPS
      sameSite: "lax",
      maxAge: 60 * 60 * 1000, // 1 hour
    });

    res.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });
    console.log("User logged in:", user.email, user.username, user.user_id);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/verify", (req, res) => {
  const token = req.cookies?.userToken;
  if (!token) {
    return res.status(401).json({ loggedIn: false });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    res.json({
      loggedIn: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
      },
    });
  } catch (err) {
    res.status(401).json({ loggedIn: false });
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ success: true, message: "User logged out" });
});

app.get("/rentals/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const rental = await db.get(
      "SELECT * FROM Apartments WHERE apartment_id = ?",
      [id]
    );

    if (!rental) {
      return res.status(404).json({ error: "Rental not found" });
    }
    const images = await db.all(
      "SELECT image_url FROM ApartmentImages WHERE apartment_id = ?",
      [id]
    );
    const descriptions = await db.all(
      "SELECT description FROM ApartmentImages WHERE apartment_id = ?",
      [id]
    );
    console.log("Images:", images); // 👈 log image rows
    console.log("Descriptions:", descriptions); // 👈 log description rows

    // Combine into one object
    const rentalWithImages = {
      ...rental,
      Img: images || [],
      Des: descriptions || [],
    };

    console.log("Final combined object:", rentalWithImages); // 👈 optional, for verification
    res.json(rentalWithImages);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    res.status(500).json({ error: "Failed to fetch rental details" });
  }
});

app.post("/admin/login", async (req, res) => {
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

    // ✅ Set cookie
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

app.post("/admin/logout", (req, res) => {
  res.clearCookie("adminToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ success: true, message: "Admin logged out" });
});

app.get("/admin/verify", verifyAdminStatus);

app.get("/admin/dashboard", verifyAdmin, async (req, res) => {
  try {
    const apartments = await db.all("SELECT * FROM Apartments");
    const users = await db.all("SELECT * FROM Users");
    const stats = await db.get(`
      SELECT
        SUM(CASE WHEN is_occupied = 1 THEN 1 ELSE 0 END) AS occupied,
        SUM(CASE WHEN is_occupied = 0 THEN 1 ELSE 0 END) AS vacant
      FROM Apartments;
    `);

    console.log(apartments);
    console.log(users);
    console.log(stats);

    res.json({
      apartmentCount: apartments.length,
      userCount: users.length,
      apartments: apartments,
      users: users,
      occupied: stats.occupied,
      vacant: stats.vacant,
      adminEmail: req.admin.email,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

app.get("/admin/lease", verifyAdmin, async (req, res) => {
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

app.post("/admin/lease", verifyAdmin, async (req, res) => {
  const { apartment_id, user_id, start_date, end_date, rent_amount } = req.body;

  if (!apartment_id || !user_id || !start_date || !end_date || !rent_amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Create a new lease
    await db.run(
      `INSERT INTO Leases (apartment_id, user_id, start_date, end_date, rent_amount, status)
       VALUES (?, ?, ?, ?, ?, 1)`,
      [apartment_id, user_id, start_date, end_date, rent_amount]
    );

    // Mark the apartment as occupied
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

app.put("/admin/lease/:id/end", verifyAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    // Get apartment_id tied to the lease
    const lease = await db.get(
      "SELECT apartment_id FROM Leases WHERE lease_id = ?",
      [id]
    );
    if (!lease) {
      return res.status(404).json({ error: "Lease not found" });
    }

    // Mark lease as inactive
    await db.run("UPDATE Leases SET status = 0 WHERE lease_id = ?", [id]);

    // Mark apartment as vacant
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

app.get("/admin/payments", verifyAdmin, async (req, res) => {


});

// Initialize MaintenanceRequests table if it doesn't exist
(async () => {
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
})();

// Middleware to verify user token
const verifyUser = (req, res, next) => {
  const token = req.cookies?.userToken;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - Please log in" });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// POST endpoint for maintenance requests
app.post("/maintenance/request", verifyUser, async (req, res) => {
  try {
    const { selectedIssues, additionalDetails } = req.body;
    const userId = req.user.id;

    if (!selectedIssues || selectedIssues.length === 0) {
      return res.status(400).json({ 
        error: "Please select at least one maintenance issue" 
      });
    }

    // Convert array to JSON string for storage
    const issuesJson = JSON.stringify(selectedIssues);

    const result = await db.run(
      `INSERT INTO MaintenanceRequests (user_id, selected_issues, additional_details, status)
       VALUES (?, ?, ?, 'pending')`,
      [userId, issuesJson, additionalDetails || ""]
    );

    res.json({
      success: true,
      message: "Maintenance request submitted successfully",
      requestId: result.lastID,
    });

    console.log(`Maintenance request created: ID ${result.lastID} by user ${userId}`);
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    res.status(500).json({ error: "Failed to submit maintenance request" });
  }
});

// GET endpoint to retrieve user's maintenance requests
app.get("/maintenance/requests", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const requests = await db.all(
      `SELECT request_id, selected_issues, additional_details, status, created_at
       FROM MaintenanceRequests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    // Parse JSON strings back to arrays
    const parsedRequests = requests.map((req) => ({
      ...req,
      selected_issues: JSON.parse(req.selected_issues),
    }));

    res.json({ requests: parsedRequests });
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

app.get("/tenants/profile", verifyUser, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log("Fetching leases for user ID:", userId);

    const result = await db.all(
      `
      SELECT
        a.apartment_id AS id,
        a.apartment_name AS apartment,
        a.bed AS bed,
        a.bath AS bath,
        a.pricing AS pricing,
        (
          SELECT image_url
          FROM ApartmentImages
          WHERE apartment_id = a.apartment_id
          LIMIT 1
        ) AS img,
        l.start_date,
        l.end_date,
        l.status
      FROM Leases l
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      WHERE l.user_id = ?
        AND l.status = 1
      `,
      [userId]
    );

    res.json({ leases: result });
  } catch (err) {
    console.error("Lease fetch error:", err);
    res.status(500).json({ error: "Could not load leases" });
  }
});

app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
