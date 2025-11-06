import jwt from "jsonwebtoken";
const SECRET_KEY = "SECRET_KEY";

/**
 * 🔹 Shared verification logic — used by both middleware and verify route
 */
function decodeAdminToken(req) {
  const token = req.cookies?.adminToken;
  if (!token) return { valid: false, reason: "No token found" };

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (decoded.role !== "admin") {
      return { valid: false, reason: "Not admin" };
    }
    return { valid: true, decoded };
  } catch (err) {
    return { valid: false, reason: "Invalid or expired token" };
  }
}

/**
 * 🔹 Route handler — used for /admin/verify (lightweight login check)
 */
export function verifyAdminStatus(req, res) {
  const { valid, decoded, reason } = decodeAdminToken(req);
  if (!valid) {
    return res.status(401).json({ loggedIn: false, message: reason });
  }

  return res.json({
    loggedIn: true,
    admin: {
      id: decoded.id,
      email: decoded.email,
    },
  });
}

/**
 * 🔹 Middleware — protects admin routes (e.g. /admin/dashboard)
 */
export function verifyAdmin(req, res, next) {
  const { valid, decoded, reason } = decodeAdminToken(req);
  if (!valid) {
    console.error("verifyAdmin:", reason);
    return res.status(401).json({ error: reason });
  }

  req.admin = decoded;
  next();
}
