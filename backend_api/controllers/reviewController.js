const dbPool = require("../config/database");

// 1. TAMBAH ULASAN BARU
const createReview = async (req, res) => {
  try {
    const user_id = req.user.id;
    const { asset_id, rating, review_text } = req.body;

    if (!asset_id || !rating) {
      return res.status(400).json({ message: "Asset ID dan Rating wajib diisi!" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating harus antara 1 sampai 5!" });
    }

    // Pastikan user benar-benar pernah membeli aset ini dan statusnya 'lunas'
    const [orders] = await dbPool.query(
      "SELECT id FROM orders WHERE buyer_id = ? AND asset_id = ? AND status = 'lunas'",
      [user_id, asset_id]
    );

    if (orders.length === 0) {
      return res.status(403).json({ message: "Anda harus membeli aset ini terlebih dahulu sebelum memberikan ulasan." });
    }

    // Cek apakah user sudah pernah mereview aset ini
    const [existingReview] = await dbPool.query(
      "SELECT id FROM reviews WHERE user_id = ? AND asset_id = ?",
      [user_id, asset_id]
    );

    if (existingReview.length > 0) {
      // Update review jika sudah ada
      await dbPool.query(
        "UPDATE reviews SET rating = ?, review_text = ? WHERE id = ?",
        [rating, review_text, existingReview[0].id]
      );
      return res.status(200).json({ message: "Ulasan berhasil diperbarui! 🌟" });
    }

    // Insert review baru
    await dbPool.query(
      "INSERT INTO reviews (user_id, asset_id, rating, review_text) VALUES (?, ?, ?, ?)",
      [user_id, asset_id, rating, review_text]
    );

    res.status(201).json({ message: "Ulasan berhasil dikirim! 🌟" });
  } catch (error) {
    console.error("Gagal menambahkan ulasan:", error);
    res.status(500).json({ message: "Server error gagal memproses ulasan." });
  }
};

// 2. AMBIL ULASAN PER ASET
const getReviewsByAsset = async (req, res) => {
  try {
    const { asset_id } = req.params;

    const query = `
      SELECT reviews.id, reviews.rating, reviews.review_text, reviews.created_at,
             users.nama AS user_name, users.roblox_username
      FROM reviews
      JOIN users ON reviews.user_id = users.id
      WHERE reviews.asset_id = ?
      ORDER BY reviews.created_at DESC
    `;

    const [reviews] = await dbPool.query(query, [asset_id]);
    res.status(200).json({ data: reviews });
  } catch (error) {
    console.error("Gagal mengambil daftar ulasan:", error);
    res.status(500).json({ message: "Gagal memuat ulasan." });
  }
};

module.exports = { createReview, getReviewsByAsset };
