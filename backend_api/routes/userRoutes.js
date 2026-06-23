const express = require("express");
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword, // 👈 INI YANG KELUPAAN DITAMBAH TADI BOS!
  forgotPasswordLocal,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/userController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/forgot-password-local", forgotPasswordLocal); // 👈 Rute untuk Lupa Password

// Jalur rahasia! Harus lewat satpam (protect) dulu
router.get("/profile", protect, getUserProfile);

// 👇 Jalur Ganti Password Barricade
router.put("/change-password/:id", changePassword);

// Buka jalur baru untuk Edit Profil
router.put("/update/:id", updateProfile);

// === JALUR ADMIN (User Management) ===
router.get("/", protect, isAdmin, getAllUsers);
router.put("/:id/role", protect, isAdmin, updateUserRole);
router.delete("/:id", protect, isAdmin, deleteUser);

module.exports = router;
