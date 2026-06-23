const express = require("express");
const {
  beliAset,
  getLibrary,
  simulasiBayar,
  getRiwayatTransaksi,
} = require("../controllers/orderController");
const { protect, isAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

// Jalur POST untuk beli (Protected - user_id dari token)
router.post("/", protect, beliAset);

// Simulasi bayar - ubah status pending → lunas (Protected)
router.post("/simulasi-bayar", protect, simulasiBayar);

// Library: aset yang sudah dimiliki (Protected)
router.get("/library", protect, getLibrary);

// Riwayat transaksi (Protected)
router.get("/riwayat", protect, getRiwayatTransaksi);

module.exports = router;
