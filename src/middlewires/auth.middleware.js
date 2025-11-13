require("dotenv").config();
const jwt = require("jsonwebtoken");
const { pool } = require("../db/connection");

exports.authGuard = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Token required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev");

    const [rows] = await pool.execute(
      "SELECT id, name, email FROM users WHERE id = ? LIMIT 1",
      [decoded.id]
    );

    if (!rows.length) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = rows[0];

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
