const jwt = require("jsonwebtoken");
require("dotenv").config();

// ✅ Middleware 1: Verifikasi JWT - Wajib login
const protect = (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({
        message: "Akses ditolak! Token tidak sah atau sudah kedaluwarsa.",
      });
    }
  } else {
    return res.status(401).json({
      message: "Akses ditolak! Kamu belum login (tidak ada token).",
    });
  }
};

// ✅ Middleware 2: Verifikasi Role Admin - Harus Admin
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      message: "Akses ditolak! Area ini hanya untuk Admin Volter. 🚫",
    });
  }
};

// ✅ Fungsi untuk verifikasi token Socket.IO (tanpa Express middleware)
const verifySocketToken = (token) => {
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
};

module.exports = { protect, isAdmin, verifySocketToken };
