const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { verifyUser } = require("../middleware/authUser");
const Stripe = require("stripe");
require("dotenv").config();
const router = express.Router();
const SECRET_KEY = process.env.SECRET_API;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// GET /rentals
router.get("/rentals", async (req, res) => {
  const supabase = req.app.locals.supabase;
  const { minPrice, maxPrice, minBeds, minBaths } = req.query;

  const userId = Number(req.user?.id);
  if (!userId) {
    return res.status(400).json({ error: "Invalid user id" });
  }

  // const { data, error } = await supabase
  //   .from("ApartmentImages")
  //   .select("*");

  console.log("DATA:", data);
  console.log("ERROR:", error);

  // let query = supabase
  //   .from("Apartments")
  //   .select("*, ApartmentImages(image_url)")
  //   .eq("is_occupied", false);

  const minP = Number(minPrice);
  const maxP = Number(maxPrice);
  const minB = Number(minBeds);
  const minBa = Number(minBaths);

  if (!isNaN(minP)) query = query.gte("pricing", minP);
  if (!isNaN(maxP)) query = query.lte("pricing", maxP);
  if (!isNaN(minB)) query = query.gte("bed", minB);
  if (!isNaN(minBa)) query = query.gte("bath", minBa);

  // const { data, error } = await query;
  // if (error) return res.status(500).json({ error });

  const rentals = data.map((r) => ({
    ...r,
    Img: r.ApartmentImages?.[0]?.image_url || null,
  }));

  res.json(rentals);
});

// GET /rentals/:id
router.get("/rentals/:id", async (req, res) => {
  const supabase = req.app.locals.supabase;
  const id = req.params.id;

  const { data: rental } = await supabase
    .from("Apartments")
    .select("*, ApartmentImages(image_url)")
    .eq("apartment_id", id)
    .single();

  if (!rental) return res.status(404).json({ error: "Rental not found" });

  const normalizeImageUrl = (url) => {
    if (!url) return "https://via.placeholder.com/288x224?text=No+Image";
    if (url.startsWith("http")) return url;
    const path = url.startsWith("/") ? url : `/${url}`;
    return `http://localhost:8080${path}`;
  };

  const imageUrls = rental.ApartmentImages.map((img) =>
    normalizeImageUrl(img.image_url)
  );

  res.json({
    ...rental,
    Img: imageUrls,
  });
});

// // POST /signup
// router.post("/signup", async (req, res) => {
//   const supabase = req.app.locals.supabase;
//   const { name, email, password, phone } = req.body;

//   // 1️⃣ Create auth user
//   const { data: authData, error: authError } =
//     await supabase.auth.signUp({
//       email,
//       password,
//     });

//   if (authError) {
//     return res.status(400).json({ error: authError.message });
//   }

//   const userId = authData.user.id;

//   // 2️⃣ Insert profile row
//   const { error: profileError } = await supabase
//     .from("Users")
//     .insert({
//       id: userId,
//       name: name,
//       email: email,
//       phone: phone,
//     });

//   if (profileError) {
//     return res.status(500).json({ error: profileError.message });
//   }

//   res.json({ success: true });
// });

// POST /login
router.post("/login", async (req, res) => {
  const supabase = req.app.locals.supabase;
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,

    password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }
  console.log("DATA:", data);
  res.json({
    success: true,
    user: {
      id: data.user.id,
      username: data.user.username,
      email: data.user.email,
    },
    session: data.session,
  });
});

// GET /tenants/leases/active
router.get("/tenants/leases/active", verifyUser, async (req, res) => {
  const supabase = req.app.locals.supabase;
  const userId = req.user.id;

  const { data } = await supabase
    .from("Leases")
    .select("lease_id, Apartments(address, apartment_name)")
    .eq("user_id", userId)
    .eq("status", 1)
    .order("start_date", { ascending: false });

  const formatted = data.map((l) => ({
    id: l.lease_id,
    propertyAddress:
      l.Apartments.address || l.Apartments.apartment_name || "My Apartment",
    unitNumber: null,
    isCurrent: true,
  }));

  res.json({ leases: formatted });
});

// POST /maintenance/request
router.post("/maintenance/request", verifyUser, async (req, res) => {
  const supabase = req.app.locals.supabase;
  const { selectedIssues, additionalDetails, leaseId } = req.body;
  const userId = req.user.id;

  const issuesJson = JSON.stringify(selectedIssues);

  const { data, error } = await supabase.from("MaintenanceRequests").insert({
    user_id: userId,
    lease_id: leaseId || null,
    selected_issues: issuesJson,
    additional_details: additionalDetails || "",
    status: "pending",
  }).select().single();

  if (error) return res.status(500).json({ error });

  res.json({
    success: true,
    message: "Maintenance request submitted successfully",
    requestId: data.request_id,
  });
});

// GET /maintenance/requests
router.get("/maintenance/requests", verifyUser, async (req, res) => {
  const supabase = req.app.locals.supabase;
  const userId = req.user.id;

  const { data } = await supabase
    .from("MaintenanceRequests")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const parsed = data.map((r) => ({
    ...r,
    selected_issues: JSON.parse(r.selected_issues),
  }));

  res.json({ requests: parsed });
});

// STRIPE CREATE PAYMENT INTENT
router.post("/stripe/create-payment-intent", verifyUser, async (req, res) => {
  const supabase = req.app.locals.supabase;
  const userId = req.user.id;
  const { lease_id } = req.body;

  const { data: lease } = await supabase
    .from("Leases")
    .select("lease_id, rent_amount")
    .eq("lease_id", lease_id)
    .eq("user_id", userId)
    .single();

  if (!lease) return res.status(404).json({ error: "Lease not found" });

  const amountCents = Math.round(Number(lease.rent_amount) * 100);

  const paymentIntent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: "usd",
    metadata: {
      lease_id: String(lease.lease_id),
      user_id: String(userId),
    },
    automatic_payment_methods: { enabled: true },
  });

  res.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    amount: lease.rent_amount,
  });
});

module.exports = router;
