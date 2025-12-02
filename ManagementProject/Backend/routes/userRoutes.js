// routes/userRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyUser } = require("../middleware/authUser");
const router = express.Router();
const SECRET_KEY = "SECRET_KEY";

// GET /rentals
router.get("/rentals", async (req, res) => {
  const db = req.app.locals.db;
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

// POST /signup
router.post("/signup", async (req, res) => {
  const db = req.app.locals.db;

  try {
    const { name, email, password } = req.body;
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

// POST /login
router.post("/login", async (req, res) => {
  const db = req.app.locals.db;
  const { email, password } = req.body;

  try {
    const user = await db.get("SELECT * FROM Users WHERE email = ?", [email]);

    if (!user) {
      return res.status(400).json({ message: "Invalid username" });
    }

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
      { expiresIn: "1h" }
    );

    res.cookie("userToken", token, {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
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

// GET /verify
router.get("/verify", (req, res) => {
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

// POST /logout
router.post("/logout", (req, res) => {
  res.clearCookie("userToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.json({ success: true, message: "User logged out" });
});

// GET /rentals/:id
router.get("/rentals/:id", async (req, res) => {
  const db = req.app.locals.db;

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
    console.log("Images:", images);
    console.log("Descriptions:", descriptions);

    const rentalWithImages = {
      ...rental,
      Img: images || [],
      Des: descriptions || [],
    };

    console.log("Final combined object:", rentalWithImages);
    res.json(rentalWithImages);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    res.status(500).json({ error: "Failed to fetch rental details" });
  }
});

// POST /maintenance/request
router.post("/maintenance/request", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const { selectedIssues, additionalDetails } = req.body;
    const userId = req.user.id;

    if (!selectedIssues || selectedIssues.length === 0) {
      return res
        .status(400)
        .json({ error: "Please select at least one maintenance issue" });
    }

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

    console.log(
      `Maintenance request created: ID ${result.lastID} by user ${userId}`
    );
  } catch (error) {
    console.error("Error creating maintenance request:", error);
    res.status(500).json({ error: "Failed to submit maintenance request" });
  }
});

// GET /maintenance/requests
router.get("/maintenance/requests", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const userId = req.user.id;
    const requests = await db.all(
      `SELECT request_id, selected_issues, additional_details, status, created_at
       FROM MaintenanceRequests
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    const parsedRequests = requests.map((row) => ({
      ...row,
      selected_issues: JSON.parse(row.selected_issues),
    }));

    res.json({ requests: parsedRequests });
  } catch (error) {
    console.error("Error fetching maintenance requests:", error);
    res.status(500).json({ error: "Failed to fetch maintenance requests" });
  }
});

// GET /tenants/profile
router.get("/tenants/profile", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

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

module.exports = router;