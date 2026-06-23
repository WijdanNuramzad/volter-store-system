const express = require("express");
const {
  buatOrderJasa,
  getOrderAktif,
  getAllOrdersAdmin,
  updateProgressOrder,
  getDashboardStats,
  submitReview,
  bayarOrderJasa,
} = require("../controllers/customOrderController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Rute untuk Pelanggan (semua harus login)
router.post("/", protect, buatOrderJasa);
router.get("/my-orders", protect, getOrderAktif); // ← user_id dari token
router.post("/review/:order_id", protect, submitReview);
router.put("/pay/:order_id", protect, bayarOrderJasa);

// Rute Khusus Admin (harus login + role admin)
router.get("/admin/all", protect, isAdmin, getAllOrdersAdmin);
router.put("/admin/update/:order_id", protect, isAdmin, updateProgressOrder);
router.get("/admin/dashboard/stats", protect, isAdmin, getDashboardStats);

module.exports = router;
