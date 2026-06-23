const dbPool = require("../config/database");

// 1. Fungsi untuk Buyer mendaftar jadi Creator (Fase Pengajuan)
const applySeller = async (req, res) => {
  const { user_id, portfolio_link, spesialisasi, discord_id } = req.body;

  try {
    // Cek apakah user sudah pernah daftar dan masih pending
    const [existing] = await dbPool.query(
      `SELECT * FROM seller_applications WHERE user_id = ? AND status = 'pending'`,
      [user_id],
    );

    if (existing.length > 0) {
      return res.status(400).json({
        message: "Kamu sudah mendaftar, mohon tunggu antrean ACC Admin ya!",
      });
    }

    // Masukkan data ke ruang tunggu
    await dbPool.query(
      `INSERT INTO seller_applications (user_id, portfolio_link, spesialisasi, discord_id) 
             VALUES (?, ?, ?, ?)`,
      [user_id, portfolio_link, spesialisasi, discord_id],
    );

    res.status(201).json({
      message: "Pendaftaran berhasil dikirim! Menunggu review Admin.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error saat mendaftar Creator." });
  }
};

// 2. Fungsi untuk Admin melihat daftar antrean (Fase Verifikasi)
const getApplications = async (req, res) => {
  try {
    // Gabungkan tabel aplikasi dengan nama user
    const [applications] = await dbPool.query(
      `SELECT s.*, u.nama, u.email 
             FROM seller_applications s 
             JOIN users u ON s.user_id = u.id 
             WHERE s.status = 'pending'
             ORDER BY s.tanggal_apply ASC`,
    );
    res.status(200).json({ data: applications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memuat data pendaftar." });
  }
};

// 3. Fungsi Sakti Admin untuk ACC atau Tolak (Fase Keputusan)
const reviewApplication = async (req, res) => {
  const { id } = req.params; // ID dari seller_applications
  const { status, alasan_penolakan } = req.body; // status isinya 'approved' atau 'rejected'

  try {
    // Cari tau ini aplikasi punya user ID berapa
    const [appData] = await dbPool.query(
      `SELECT user_id FROM seller_applications WHERE id = ?`,
      [id],
    );
    if (appData.length === 0)
      return res.status(404).json({ message: "Data tidak ditemukan." });

    const userId = appData[0].user_id;

    // Update status di tabel pendaftaran
    await dbPool.query(
      `UPDATE seller_applications SET status = ?, alasan_penolakan = ? WHERE id = ?`,
      [status, alasan_penolakan || null, id],
    );

    // JIKA DI-APPROVE, UBAH ROLE USER JADI SELLER!
    if (status === "approved") {
      await dbPool.query(`UPDATE users SET role = 'seller' WHERE id = ?`, [
        userId,
      ]);
    }

    res.status(200).json({ message: `Aplikasi berhasil di-${status}!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memproses review." });
  }
};

module.exports = { applySeller, getApplications, reviewApplication };
