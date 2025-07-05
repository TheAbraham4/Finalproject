const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");
  
  // Check if no token
  if (!token) {
    return res.status(401).json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: "Invalid token" });
  }
};