const express = require("express");
const multer = require("multer");
const path = require("path");
const {
  getAllAssets,
  getAssetById, // 👈 Import fungsi detail barang
  createAsset,
  updateAsset, // 👈 Import fungsi Edit
  deleteAsset, // 👈 Import fungsi Hapus
} = require("../controllers/assetController");

const router = express.Router();

// === KONFIGURASI MESIN PENANGKAP FILE (MULTER) ===
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (file.fieldname === "gambar") {
      cb(null, "public/uploads/images/");
    } else if (file.fieldname === "file_aset") {
      cb(null, "public/uploads/assets/");
    }
  },
  filename: function (req, file, cb) {
    // Membuat nama file unik berdasarkan waktu agar tidak tertimpa
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// === RUTE ===
router.get("/", getAllAssets);
router.get("/:id", getAssetById); // 👈 Rute untuk Detail Produk


// Rute POST ini dikawal oleh Multer untuk menangkap 2 file sekaligus
router.post(
  "/",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "file_aset", maxCount: 1 },
  ]),
  createAsset,
);

// 👇 TAMBAHAN RUTE BARU UNTUK EDIT & HAPUS 👇

// Rute Edit (PUT) - Dikawal Multer juga karena admin mungkin mau ganti file/gambar
router.put(
  "/:id",
  upload.fields([
    { name: "gambar", maxCount: 1 },
    { name: "file_aset", maxCount: 1 },
  ]),
  updateAsset,
);

// Rute Hapus (DELETE) - Tidak butuh Multer karena hanya mengirim ID untuk dihapus
router.delete("/:id", deleteAsset);

module.exports = router;
