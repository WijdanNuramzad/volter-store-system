const express = require("express");
const { getWishlist, toggleWishlist, checkIsWishlisted } = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Semua rute wishlist butuh login (protect middleware)
router.get("/", protect, getWishlist);
router.post("/toggle/:assetId", protect, toggleWishlist);
router.get("/check/:assetId", protect, checkIsWishlisted);

module.exports = router;
