const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyUser } = require("../middleware/authUser");
const router = express.Router();
const Stripe = require("stripe");
const { use } = require("react");
require("dotenv").config();
const SECRET_KEY = process.env.SECRET_API;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

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

    console.log("Images:", images);

    // helper to normalize URLs
    const normalizeImageUrl = (url) => {
      if (!url) {
        return "https://via.placeholder.com/288x224?text=No+Image";
      }

      // already full http/https url (like your Pexels ones)
      if (url.startsWith("http")) {
        return url;
      }

      // local path from uploads
      const path = url.startsWith("/") ? url : `/${url}`;
      return `http://localhost:8080${path}`;
    };

    // convert [{ image_url: "..." }] -> ["..."]
    const imageUrls = images.map((row) => normalizeImageUrl(row.image_url));

    const rentalWithImages = {
      ...rental,
      Img: imageUrls, // now an array of strings
    };

    console.log("Final combined object:", rentalWithImages);
    res.json(rentalWithImages);
  } catch (error) {
    console.error("Error fetching rental details:", error);
    res.status(500).json({ error: "Failed to fetch rental details" });
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

// NEW ROUTE
// GET /tenants/leases/active
router.get("/tenants/leases/active", verifyUser, async (req, res) => {
  const db = req.app.locals.db;
  try {
    const userId = req.user.id;

    const leases = await db.all(
      `
      SELECT
        l.lease_id AS id,
        a.address,
        a.apartment_name
      FROM Leases l
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      WHERE l.user_id = ? AND l.status = 1
      ORDER BY l.start_date DESC
      `,
      [userId]
    );

    // Format exactly how the frontend expects it
    const formatted = leases.map((lease) => ({
      id: lease.id,
      propertyAddress: lease.address
        ? lease.address
        : lease.apartment_name || "My Apartment",
      unitNumber: null, // we don't have unit number → frontend will just show address
      isCurrent: true,
    }));

    res.json({ leases: formatted });
  } catch (err) {
    console.error("Error fetching active leases:", err);
    res.status(500).json({ error: "Failed to load your properties" });
  }
});

// UPDATED MAINTENANCE ROUTE – now saves lease_id
router.post("/maintenance/request", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const { selectedIssues, additionalDetails, leaseId } = req.body; // leaseId optional
    const userId = req.user.id;

    if (!selectedIssues || selectedIssues.length === 0) {
      return res
        .status(400)
        .json({ error: "Please select at least one maintenance issue" });
    }

    const issuesJson = JSON.stringify(selectedIssues);

    const result = await db.run(
      `INSERT INTO MaintenanceRequests (user_id, lease_id, selected_issues, additional_details, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, leaseId || null, issuesJson, additionalDetails || ""]
    );

    res.json({
      success: true,
      message: "Maintenance request submitted successfully",
      requestId: result.lastID,
    });

    console.log(
      `Maintenance request created: ID ${
        result.lastID
      } by user ${userId}, lease: ${leaseId || "none selected"}`
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
      `SELECT request_id, selected_issues, additional_details, status, created_at, lease_id
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
    const userId = req.user.id ?? req.user.user_id;
    if (!userId)
      return res.status(401).json({ error: "User not authenticated" });

    const result = await db.all(
      `
    SELECT
      l.lease_id AS lease_id,
      a.apartment_id,
      a.apartment_name AS apartment,
      a.bed,
      a.bath,
      a.pricing,
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
      AND (l.status = 1 OR LOWER(l.status) = 'active')
    ORDER BY l.start_date DESC;
    `,
      [userId]
    );

    const normalizeImageUrl = (url) => {
      if (!url) return null;
      if (url.startsWith("http")) return url;
      const path = url.startsWith("/") ? url : `/${url}`;
      return `http://localhost:8080${path}`;
    };

    const leases = result.map((row) => ({
      ...row,
      img: normalizeImageUrl(row.img),
    }));

    res.json({ leases });
  } catch (err) {
    console.error("Lease fetch error:", err);
    res.status(500).json({ error: "Could not load leases" });
  }
});

router.get("/tenants/payments/:lease_id", verifyUser, async (req, res) => {
  const db = req.app.locals.db;
  const { lease_id } = req.params;

  try {
    const user_id = req.user.id ?? req.user.user_id;
    if (!user_id)
      return res.status(401).json({ error: "User not authenticated" });

    const row = await db.get(
      `
      SELECT
        l.lease_id,
        l.rent_amount,
        l.start_date,
        l.end_date,
        l.status,
        a.apartment_id,
        a.apartment_name AS apartment,
        a.address,
        a.bed,
        a.bath,
        a.pricing,
        u.username,
        u.email
      FROM Leases l
      JOIN Apartments a ON l.apartment_id = a.apartment_id
      JOIN Users u ON l.user_id = u.user_id
      WHERE l.lease_id = ?
        AND l.user_id = ?;
      `,
      [lease_id, user_id]
    );

    if (!row) {
      return res.status(404).json({ error: "Lease not found for this user" });
    }

    res.json({
      lease_id: row.lease_id,
      user_id: user_id,
      rent_amount: row.rent_amount,
      apartment_id: row.apartment_id,
      apartment: row.apartment,
      address: row.address,
      pricing: row.pricing,
      name: row.username,
      email: row.email,
    });
  } catch (err) {
    console.error("Error fetching lease payment info:", err);
    res.status(500).json({ error: "Failed to fetch lease payment info" });
  }
});

router.post("/tenants/payments", verifyUser, async (req, res) => {
  const db = req.app.locals.db;
  const { lease_id, payment_date, method, stripe_payment_intent_id } = req.body;

  if (!lease_id || !payment_date || !method || !stripe_payment_intent_id) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const user_id = req.user.id ?? req.user.user_id;
    if (!user_id)
      return res.status(401).json({ error: "User not authenticated" });

    // Make sure lease belongs to this user
    const lease = await db.get(
      `SELECT lease_id FROM Leases WHERE lease_id = ? AND user_id = ?`,
      [lease_id, user_id]
    );
    if (!lease)
      return res.status(404).json({ error: "Lease not found for this user" });

    // Verify Stripe payment
    const pi = await stripe.paymentIntents.retrieve(stripe_payment_intent_id);

    if (pi.status !== "succeeded") {
      return res
        .status(400)
        .json({ error: `Payment not completed. Status: ${pi.status}` });
    }

    // Optional: verify PI belongs to this lease
    if (
      pi.metadata?.lease_id &&
      String(pi.metadata.lease_id) !== String(lease_id)
    ) {
      return res
        .status(400)
        .json({ error: "PaymentIntent does not match this lease." });
    }

    const amountFromStripe = (pi.amount_received ?? pi.amount) / 100;

    const result = await db.run(
      `INSERT INTO Payments (lease_id, amount, payment_date, method, status, stripe_payment_intent_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        lease_id,
        amountFromStripe,
        payment_date,
        method,
        "Paid",
        stripe_payment_intent_id,
      ]
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
        u.username,
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

    res.status(201).json({
      message: "Payment created successfully",
      payment: {
        id: row.payment_id,
        name: row.username,
        tenantName: row.email,
        apartment: row.address,
        leaseLabel: row.address,
        amount: row.amount,
        method: row.method,
        status: row.status,
        date: row.payment_date,
      },
    });
  } catch (err) {
    console.error("Error creating payment:", err);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

router.post("/stripe/create-payment-intent", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const user_id = req.user.id ?? req.user.user_id;
    const { lease_id } = req.body;

    if (!user_id)
      return res.status(401).json({ error: "User not authenticated" });
    if (!lease_id) return res.status(400).json({ error: "Missing lease_id" });

    const lease = await db.get(
      `SELECT lease_id, rent_amount
       FROM Leases
       WHERE lease_id = ? AND user_id = ?`,
      [lease_id, user_id]
    );

    if (!lease)
      return res.status(404).json({ error: "Lease not found for this user" });

    const amountCents = Math.round(Number(lease.rent_amount) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      return res.status(400).json({ error: "Invalid rent amount" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        lease_id: String(lease.lease_id),
        user_id: String(user_id),
      },
      automatic_payment_methods: { enabled: true },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: lease.rent_amount,
    });
  } catch (err) {
    console.error("Stripe create PI error:", err);
    res.status(500).json({ error: "Failed to create payment intent" });
  }
});

// POST /apply
router.post("/apply", verifyUser, async (req, res) => {
  const db = req.app.locals.db;

  try {
    const {
      apartmentId,
      firstName,
      lastName,
      email,
      phone,
      dob,
      ssn,
      employer,
      jobTitle,
      monthlyIncome,
      employmentLength,
      currentAddress,
      rentAmount,
      landlordName,
      landlordPhone,
      consent,
    } = req.body;

    // Use the logged-in user's email to ensure applications are properly associated
    const userEmail = req.user.email;

    // Validate required fields
    if (!firstName || !lastName || !phone) {
      return res.status(400).json({
        error:
          "Missing required fields: first name, last name, and phone are required",
      });
    }

    const result = await db.run(
      `INSERT INTO RentalApplications (
        apartment_id, first_name, last_name, email, phone, date_of_birth, ssn,
        employer, job_title, monthly_income, employment_length,
        current_address, rent_amount, landlord_name, landlord_phone,
        consent_to_background_check, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'submitted')`,
      [
        apartmentId || null,
        firstName,
        lastName,
        userEmail, // Use logged-in user's email
        phone,
        dob || null,
        ssn || null,
        employer || null,
        jobTitle || null,
        monthlyIncome || null,
        employmentLength || null,
        currentAddress || null,
        rentAmount || null,
        landlordName || null,
        landlordPhone || null,
        consent ? 1 : 0,
      ]
    );

    res.json({
      success: true,
      message: "Application submitted successfully",
      applicationId: result.lastID,
    });

    console.log(
      `Rental application created: ID ${result.lastID} for ${userEmail}${
        apartmentId ? ` (Apartment ID: ${apartmentId})` : ""
      }`
    );
  } catch (error) {
    console.error("Error creating rental application:", error);
    res.status(500).json({ error: "Failed to submit application" });
  }
});

// GET - List all applications for the current logged-in user
router.get("/applications", async (req, res) => {
  try {
    const token = req.cookies.userToken;
    if (!token) return res.status(401).json({ error: "No token" });

    const decoded = jwt.verify(token, SECRET_KEY);
    const userEmail = decoded.email?.trim();

    const applications = await req.app.locals.db.all(
      `
      SELECT 
        ra.application_id,
        ra.status,
        ra.created_at,
        a.apartment_name   AS property_name,
        a.address          AS property_address,
        a.pricing          AS monthly_rent
      FROM RentalApplications ra
      LEFT JOIN Apartments a ON ra.apartment_id = a.apartment_id
      WHERE LOWER(ra.email) = LOWER(?)
      ORDER BY ra.created_at DESC
    `,
      [userEmail]
    );

    const result = applications.map((app) => {
      // Normalize status: 'pending' should be 'submitted' for frontend compatibility
      let status = app.status || "submitted";
      if (status.toLowerCase() === "pending") {
        status = "submitted";
      }
      // Map old statuses to new simplified statuses
      if (status === "rejected" || status === "leased") {
        status = "approved";
      }

      return {
        application_id: app.application_id,
        property_name: app.property_name || app.property_address || "Apartment",
        property_address: app.property_address,
        status: status,
        created_at: app.created_at,
        monthly_rent: app.monthly_rent || null,
        move_in_date: null,
        pets: null,
        applicants: 1,
      };
    });

    res.json({ applications: result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed" });
  }
});

module.exports = router;
