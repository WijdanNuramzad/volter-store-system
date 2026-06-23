const dbPool = require("../config/database");

// 1. Tampilkan Semua Barang di Etalase Toko (Home Screen)
const getAllAssets = async (req, res) => {
  try {
    const [assets] = await dbPool.query(
      "SELECT * FROM assets ORDER BY created_at DESC",
    );
    res.json({
      message: "Berhasil mengambil data katalog Volter Store!",
      data: assets,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengambil data aset", error: error.message });
  }
};

// 2. Admin Tambah Barang Baru (Dengan Mesin Penangkap File 🛠️)
const createAsset = async (req, res) => {
  try {
    const { nama, deskripsi, harga, kategori } = req.body;

    // Multer akan menyimpan file fisik di req.files
    const imageFile =
      req.files && req.files["gambar"] ? req.files["gambar"][0].filename : null;
    const assetFile =
      req.files && req.files["file_aset"]
        ? req.files["file_aset"][0].filename
        : null;

    // Logika Pintar: Kalau harga 0, otomatis status is_free jadi 1 (True)
    const isFree = harga == 0 || harga === "0" ? 1 : 0;

    const query = `
      INSERT INTO assets (nama, deskripsi, kategori, image_url, link_file, harga, is_free) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      nama,
      deskripsi || "",
      kategori || null,
      imageFile ? `/uploads/images/${imageFile}` : "",
      assetFile ? `/uploads/assets/${assetFile}` : "",
      harga || 0,
      isFree,
    ];

    const [result] = await dbPool.query(query, values);

    res.status(201).json({
      message: "Aset baru beserta filenya berhasil ditambahkan ke etalase! 🚀",
      assetId: result.insertId,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res
      .status(500)
      .json({ message: "Gagal menambahkan aset", error: error.message });
  }
};

// 👇 INI TAMBAHAN BARUNYA BOS:

// 3. Admin Edit Barang (Bisa update teks saja, atau sekalian ganti file)
const updateAsset = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, deskripsi, harga, kategori } = req.body;

    // Cek apakah ada file baru yang diupload, kalau nggak ada biarkan null
    const imageFile =
      req.files && req.files["gambar"] ? req.files["gambar"][0].filename : null;
    const assetFile =
      req.files && req.files["file_aset"]
        ? req.files["file_aset"][0].filename
        : null;

    const isFree = harga == 0 || harga === "0" ? 1 : 0;

    // Ambil data lama dulu buat ngecek file lama
    const [oldAsset] = await dbPool.query("SELECT * FROM assets WHERE id = ?", [
      id,
    ]);
    if (oldAsset.length === 0) {
      return res.status(404).json({ message: "Aset tidak ditemukan!" });
    }

    // Tentukan path: pakai file baru kalau ada, kalau nggak ada tetep pakai yang lama di database
    const imageUrl = imageFile
      ? `/uploads/images/${imageFile}`
      : oldAsset[0].image_url;
    const linkFile = assetFile
      ? `/uploads/assets/${assetFile}`
      : oldAsset[0].link_file;

    const query = `
      UPDATE assets 
      SET nama = ?, deskripsi = ?, kategori = ?, image_url = ?, link_file = ?, harga = ?, is_free = ?
      WHERE id = ?
    `;
    const values = [
      nama,
      deskripsi || "",
      kategori !== undefined ? (kategori || null) : oldAsset[0].kategori,
      imageUrl,
      linkFile,
      harga || 0,
      isFree,
      id,
    ];

    await dbPool.query(query, values);

    res.json({ message: "Data karya berhasil diperbarui! ⚡" });
  } catch (error) {
    console.error("Update error:", error);
    res
      .status(500)
      .json({ message: "Gagal mengupdate aset", error: error.message });
  }
};

// 4. Admin Hapus Barang
const deleteAsset = async (req, res) => {
  try {
    const { id } = req.params;
    await dbPool.query("DELETE FROM assets WHERE id = ?", [id]);
    res.json({ message: "Karya berhasil dihapus dari etalase! 🗑️" });
  } catch (error) {
    console.error("Delete error:", error);
    res
      .status(500)
      .json({ message: "Gagal menghapus aset", error: error.message });
  }
};

// 5. Ambil Detail Barang Berdasarkan ID
const getAssetById = async (req, res) => {
  try {
    const { id } = req.params;
    const [asset] = await dbPool.query("SELECT * FROM assets WHERE id = ?", [id]);
    
    if (asset.length === 0) {
      return res.status(404).json({ message: "Aset tidak ditemukan!" });
    }
    
    res.json({ data: asset[0] });
  } catch (error) {
    console.error("Get Asset By ID error:", error);
    res.status(500).json({ message: "Gagal mengambil detail aset", error: error.message });
  }
};

// 👇 Jangan lupa, updateAsset, deleteAsset, dan getAssetById di-ekspor di sini
module.exports = { getAllAssets, getAssetById, createAsset, updateAsset, deleteAsset };
