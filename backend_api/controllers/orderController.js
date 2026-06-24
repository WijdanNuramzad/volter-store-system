const dbPool = require("../config/database");

// 1. Fungsi Beli Aset (user_id dari JWT token)
const beliAset = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    const { asset_id } = req.body;
    if (!asset_id) {
      return res.status(400).json({ message: "ID Aset kosong!" });
    }

    const [assetData] = await dbPool.query(
      "SELECT harga FROM assets WHERE id = ?",
      [asset_id],
    );
    if (assetData.length === 0) {
      return res.status(404).json({ message: "Barang tidak ditemukan!" });
    }

    const harga = parseFloat(assetData[0].harga);
    const statusPesanan = harga === 0 ? "lunas" : "pending";

    const [result] = await dbPool.query(
      "INSERT INTO orders (buyer_id, asset_id, status, qty, total_harga) VALUES (?, ?, ?, ?, ?)",
      [buyer_id, asset_id, statusPesanan, 1, harga],
    );

    res.status(201).json({
      message:
        harga === 0
          ? "Barang Gratis berhasil diklaim! ✅"
          : "Pesanan diamankan! ⏳",
      orderId: result.insertId,
      status: statusPesanan,
    });
  } catch (error) {
    console.error("Kasir Error:", error);
    res.status(500).json({ message: "Waduh, server kasir error!" });
  }
};

// 2. FUNGSI LIBRARY (user_id dari JWT token)
const getLibrary = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    const query = `
      SELECT orders.id AS order_id, orders.created_at AS tanggal_beli, orders.status, 
             orders.qty, orders.total_harga,
             assets.nama, assets.harga, assets.image_url, 
             assets.link_file AS file_url 
      FROM orders 
      JOIN assets ON orders.asset_id = assets.id 
      WHERE orders.buyer_id = ? AND orders.status = 'lunas'
      ORDER BY orders.created_at DESC
    `;
    const [assets] = await dbPool.query(query, [buyer_id]);
    res.status(200).json({ data: assets });
  } catch (error) {
    console.error("Library Error:", error);
    res.status(500).json({ message: "Gagal memuat Library!" });
  }
};

// 3. FUNGSI SIMULASI BAYAR (user_id dari JWT token)
const simulasiBayar = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    await dbPool.query(
      "UPDATE orders SET status = 'lunas' WHERE buyer_id = ? AND status = 'pending'",
      [buyer_id],
    );
    res
      .status(200)
      .json({ message: "Pembayaran simulasi berhasil! Gembok terbuka!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal simulasi bayar" });
  }
};

// 4. FUNGSI RIWAYAT TRANSAKSI (user_id dari JWT token)
const getRiwayatTransaksi = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    const [riwayat] = await dbPool.query(
      `SELECT orders.id, orders.status, orders.created_at AS tanggal_transaksi, 
              assets.id AS asset_id, assets.nama AS nama_aset, assets.harga AS total_harga, assets.image_url
       FROM orders 
       JOIN assets ON orders.asset_id = assets.id 
       WHERE orders.buyer_id = ? 
       ORDER BY orders.id DESC`,
      [buyer_id],
    );
    res.status(200).json({ data: riwayat });
  } catch (error) {
    console.error("Riwayat Error:", error);
    res.status(500).json({ message: "Gagal memuat riwayat transaksi!" });
  }
};

module.exports = { beliAset, getLibrary, simulasiBayar, getRiwayatTransaksi };
