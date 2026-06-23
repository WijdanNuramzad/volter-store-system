const dbPool = require("../config/database");

// 1. Ambil semua wishlist user
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    // Mengambil data aset beserta informasi harga dll
    const query = `
      SELECT w.id as wishlist_id, a.* 
      FROM wishlists w 
      JOIN assets a ON w.asset_id = a.id 
      WHERE w.user_id = ? 
      ORDER BY w.created_at DESC
    `;
    const [wishlistItems] = await dbPool.query(query, [userId]);
    res.json({ data: wishlistItems });
  } catch (error) {
    console.error("Gagal mengambil wishlist:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// 2. Tambah/Hapus dari wishlist (Toggle)
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;

    // Cek apakah sudah ada di wishlist
    const [existing] = await dbPool.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND asset_id = ?", 
      [userId, assetId]
    );

    if (existing.length > 0) {
      // Jika ada, hapus
      await dbPool.query("DELETE FROM wishlists WHERE id = ?", [existing[0].id]);
      res.json({ message: "Aset dihapus dari wishlist", isWishlisted: false });
    } else {
      // Jika belum ada, tambah
      await dbPool.query(
        "INSERT INTO wishlists (user_id, asset_id) VALUES (?, ?)", 
        [userId, assetId]
      );
      res.json({ message: "Aset ditambahkan ke wishlist", isWishlisted: true });
    }
  } catch (error) {
    console.error("Gagal toggle wishlist:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

// 3. Cek apakah aset sudah di-wishlist oleh user
const checkIsWishlisted = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assetId } = req.params;
    
    const [existing] = await dbPool.query(
      "SELECT id FROM wishlists WHERE user_id = ? AND asset_id = ?", 
      [userId, assetId]
    );

    res.json({ isWishlisted: existing.length > 0 });
  } catch (error) {
    console.error("Gagal mengecek status wishlist:", error);
    res.status(500).json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = {
  getWishlist,
  toggleWishlist,
  checkIsWishlisted
};
