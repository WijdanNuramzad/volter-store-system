const dbPool = require("../config/database");

// 1. Fungsi Mengirim Form Order Jasa (user_id dari JWT token)
const buatOrderJasa = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    const {
      judul_project,
      kategori,
      platform,
      skala,
      tema,
      link_referensi,
      urgensi,
      estimasi_budget,
      deskripsi,
    } = req.body;

    if (!judul_project || !deskripsi) {
      return res
        .status(400)
        .json({ message: "Data krusial pesanan tidak lengkap!" });
    }

    const query = `
      INSERT INTO custom_requests 
      (user_id, judul_project, kategori, platform, skala, tema, link_referensi, urgensi, estimasi_budget, deskripsi) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      buyer_id,
      judul_project,
      kategori,
      platform || "Lainnya",
      skala || "Standar",
      tema || "Bebas",
      link_referensi || "",
      urgensi || "Santai",
      estimasi_budget || "Tunggu Penawaran",
      deskripsi,
    ];

    await dbPool.query(query, values);

    res
      .status(201)
      .json({ message: "Request order jasa berhasil dikirim ke Volter! 🚀" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal membuat order jasa" });
  }
};

// 2. Fungsi Melihat Progress Order Aktif (user_id dari JWT token)
const getOrderAktif = async (req, res) => {
  try {
    const buyer_id = req.user.id; // 🔒 Dari token
    const [results] = await dbPool.query(
      "SELECT * FROM custom_requests WHERE user_id = ? ORDER BY created_at DESC",
      [buyer_id],
    );
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data order aktif" });
  }
};

// 3. FUNGSI ADMIN 1: Ambil semua orderan
const getAllOrdersAdmin = async (req, res) => {
  try {
    const [results] = await dbPool.query(
      "SELECT * FROM custom_requests ORDER BY created_at DESC",
    );
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil semua order" });
  }
};

// 4. FUNGSI ADMIN 2: Update Progress & Status (Ditambah Harga Tawaran & Link Hasil)
const updateProgressOrder = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { progress, status, harga_tawaran, result_link } = req.body;

    // COALESCE mencegah data lama tertimpa NULL jika admin tidak mengisi form secara penuh
    await dbPool.query(
      "UPDATE custom_requests SET progress = COALESCE(?, progress), status = COALESCE(?, status), harga_tawaran = COALESCE(?, harga_tawaran), result_link = COALESCE(?, result_link) WHERE id = ?",
      [progress, status, harga_tawaran, result_link, order_id],
    );
    res
      .status(200)
      .json({ message: "Status dan Progress berhasil diperbarui! ⚡" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui order" });
  }
};

// 5. FUNGSI ADMIN 3: Ambil Data Statistik Dashboard
const getDashboardStats = async (req, res) => {
  try {
    const [pendapatanToko] = await dbPool.query(
      `SELECT SUM(assets.harga) as total_toko FROM orders JOIN assets ON orders.asset_id = assets.id WHERE orders.status = 'lunas'`,
    );
    const [orderAktif] = await dbPool.query(
      `SELECT COUNT(*) as jumlah_aktif FROM custom_requests WHERE status != 'Selesai'`,
    );
    const [asetTerjual] = await dbPool.query(
      `SELECT COUNT(*) as jumlah_terjual FROM orders WHERE status = 'lunas'`,
    );

    res.status(200).json({
      pendapatan: pendapatanToko[0].total_toko || 0,
      order_aktif: orderAktif[0].jumlah_aktif || 0,
      aset_terjual: asetTerjual[0].jumlah_terjual || 0,
    });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil data dashboard" });
  }
};

// 6. FUNGSI BARU: Kirim Ulasan (Testimoni)
const submitReview = async (req, res) => {
  try {
    const { order_id } = req.params;
    const { rating, ulasan } = req.body;
    await dbPool.query(
      "UPDATE custom_requests SET rating = ?, ulasan = ? WHERE id = ?",
      [rating, ulasan, order_id],
    );
    res
      .status(200)
      .json({ message: "Ulasan berhasil dikirim! Terima kasih! ⭐" });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengirim ulasan" });
  }
};

// FUNGSI BAYAR KLIEN: Ubah status dari Menunggu Pembayaran jadi IN PROGRESS
const bayarOrderJasa = async (req, res) => {
  try {
    const { order_id } = req.params;
    let bukti_pembayaran = null;
    
    if (req.file) {
      bukti_pembayaran = req.file.filename;
    }

    if (bukti_pembayaran) {
      await dbPool.query(
        "UPDATE custom_requests SET status = 'Menunggu Verifikasi', bukti_pembayaran = ? WHERE id = ?",
        [bukti_pembayaran, order_id],
      );
    } else {
      await dbPool.query(
        "UPDATE custom_requests SET status = 'Menunggu Verifikasi' WHERE id = ?",
        [order_id],
      );
    }

    res
      .status(200)
      .json({ message: "Bukti terkirim! Menunggu verifikasi tim Volter." });
  } catch (error) {
    res.status(500).json({ message: "Gagal memproses pembayaran" });
  }
};

module.exports = {
  buatOrderJasa,
  getOrderAktif,
  getAllOrdersAdmin,
  updateProgressOrder,
  getDashboardStats,
  submitReview,
  bayarOrderJasa,
};
