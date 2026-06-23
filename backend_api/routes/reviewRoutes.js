const express = require("express");
const { createReview, getReviewsByAsset } = require("../controllers/reviewController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Route untuk mengirim ulasan (Harus login)
router.post("/", protect, createReview);

// Route untuk mengambil daftar ulasan berdasarkan asset_id (Publik)
router.get("/:asset_id", getReviewsByAsset);

module.exports = router;
