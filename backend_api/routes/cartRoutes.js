const express = require("express");
const router = express.Router();
const dbPool = require("../config/database");
const { protect } = require("../middleware/authMiddleware");

// 1. TAMBAH BARANG KE KERANJANG (Protected)
router.post("/", protect, async (req, res) => {
  const user_id = req.user.id; // 🔒 Diambil dari token, bukan dari body
  const { asset_id } = req.body;

  try {
    const [existing] = await dbPool.query(
      "SELECT * FROM cart WHERE user_id = ? AND asset_id = ?",
      [user_id, asset_id],
    );

    if (existing.length > 0) {
      return res
        .status(400)
        .json({ message: "Barang ini sudah ada di keranjangmu, Bos! ⚠️" });
    }

    await dbPool.query("INSERT INTO cart (user_id, asset_id) VALUES (?, ?)", [
      user_id,
      asset_id,
    ]);
    res.status(201).json({ message: "Berhasil mendarat di keranjang! 🛒" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. LIHAT ISI KERANJANG (Protected)
router.get("/", protect, async (req, res) => {
  const userId = req.user.id; // 🔒 Diambil dari token

  try {
    const query = `
      SELECT cart.id as cart_id, assets.* FROM cart 
      JOIN assets ON cart.asset_id = assets.id 
      WHERE cart.user_id = ?
      ORDER BY cart.created_at DESC
    `;
    const [results] = await dbPool.query(query, [userId]);
    res.json({ data: results });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. BUANG BARANG DARI KERANJANG (Protected)
router.delete("/:cart_id", protect, async (req, res) => {
  const cartId = req.params.cart_id;
  const userId = req.user.id;

  try {
    // Verifikasi bahwa cart item ini milik user yang sedang login
    const [cartItem] = await dbPool.query(
      "SELECT * FROM cart WHERE id = ? AND user_id = ?",
      [cartId, userId],
    );
    if (cartItem.length === 0) {
      return res.status(403).json({ message: "Item ini bukan milikmu!" });
    }
    await dbPool.query("DELETE FROM cart WHERE id = ?", [cartId]);
    res.json({ message: "Barang berhasil dibuang dari keranjang. 🗑️" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. CHECKOUT (Protected)
router.post("/checkout", protect, async (req, res) => {
  const userId = req.user.id; // 🔒 Diambil dari token
  const { items } = req.body;

  try {
    if (!items || items.length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada barang yang diproses!" });
    }

    for (let item of items) {
      const assetId = item.id;
      const cartId = item.cart_id;
      const qty = item.qty || 1;
      const hargaSatuan = parseFloat(item.harga) || 0;
      const totalHarga = hargaSatuan * qty;
      // Semua item langsung 'lunas' saat checkout (tidak ada payment gateway eksternal)
      const status = "lunas";

      try {
        await dbPool.query(
          "INSERT INTO orders (buyer_id, asset_id, status, qty, total_harga) VALUES (?, ?, ?, ?, ?)",
          [userId, assetId, status, qty, totalHarga],
        );

        if (cartId) {
          await dbPool.query("DELETE FROM cart WHERE id = ?", [cartId]);
        }
      } catch (insertErr) {
        console.log("Gagal proses barang:", insertErr.message);
      }
    }

    res.status(200).json({ message: "Checkout Sukses! Lanjut bayar. ⚡" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
