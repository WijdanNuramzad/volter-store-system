const express = require("express");
const router = express.Router();
const {
  applySeller,
  getApplications,
  reviewApplication,
} = require("../controllers/sellerController");

// Rute untuk Buyer (Apply)
router.post("/apply", applySeller);

// Rute untuk Admin (Melihat & Review)
router.get("/applications", getApplications);
router.put("/review/:id", reviewApplication);

module.exports = router;
