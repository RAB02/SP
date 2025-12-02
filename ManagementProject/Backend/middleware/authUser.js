const jwt = require("jsonwebtoken");
const SECRET_KEY = "SECRET_KEY"; // same key you're using elsewhere

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
    console.error("verifyUser error:", err);
    res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = { verifyUser };