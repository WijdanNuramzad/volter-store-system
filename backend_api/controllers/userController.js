const dbPool = require("../config/database");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken"); // Tambahan mesin JWT

// === FITUR REGISTER ===
const registerUser = async (req, res) => {
  try {
    const { nama, email, password } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await dbPool.query(
      "INSERT INTO users (nama, email, password) VALUES (?, ?, ?)",
      [nama, email, hashedPassword],
    );

    res.status(201).json({
      message: "Yeay! Akun Volter berhasil dibuat! ⚡",
      userId: result.insertId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Waduh, ada error di server nih.",
      error: error.message,
    });
  }
};

// === FITUR LOGIN ===
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Cari user berdasarkan email
    const [users] = await dbPool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Username tidak ditemukan di sistem Volter!" });
    }

    const user = users[0];

    // 2. Cek kecocokan password yang diketik dengan yang diacak di database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Password kamu salah!" });
    }

    // 3. Buat "Kartu Pass" (Token JWT)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }, // Kartu pass berlaku 1 hari
    );

    // 4. Kirim kartu pass ke user
    res.json({
      message: "Login berhasil! Selamat datang kembali. 🚀",
      token: token,
      userData: {
        id: user.id,
        nama: user.nama,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Waduh, ada error di server nih.",
      error: error.message,
    });
  }
};

// === FITUR PROFIL (CONTOH RUTE RAHASIA) ===
const getUserProfile = async (req, res) => {
  try {
    // req.user.id ini didapat dari hasil kerja satpam (authMiddleware) tadi
    const [users] = await dbPool.query(
      "SELECT id, nama, email, roblox_username, kontak_wa_discord, jenis_kelamin, role FROM users WHERE id = ?",
      [req.user.id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    res.json({
      message: "Berhasil masuk area rahasia!",
      profile: users[0],
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// === FITUR UPDATE NAMA PROFIL ===
const updateProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, roblox_username, kontak_wa_discord, jenis_kelamin } =
      req.body;

    if (!nama) {
      return res.status(400).json({ message: "Nama tidak boleh kosong Bos!" });
    }

    await dbPool.query(
      "UPDATE users SET nama = ?, roblox_username = ?, kontak_wa_discord = ?, jenis_kelamin = ? WHERE id = ?",
      [nama, roblox_username, kontak_wa_discord, jenis_kelamin, id],
    );

    res.status(200).json({ message: "Identitas berhasil diperbarui! ⚡" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};

// 👇 === FITUR BARU: GANTI PASSWORD BARRICADE ===
const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { oldPassword, newPassword } = req.body;

    // 1. Ambil password lama dari database
    const [users] = await dbPool.query(
      "SELECT password FROM users WHERE id = ?",
      [id],
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User tidak ditemukan!" });
    }

    // 2. Bandingkan password lama (bcrypt.compare)
    const isMatch = await bcrypt.compare(oldPassword, users[0].password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Password lama salah, akses ditolak! ❌" });
    }

    // 3. Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update ke database
    await dbPool.query("UPDATE users SET password = ? WHERE id = ?", [
      hashedNewPassword,
      id,
    ]);

    res
      .status(200)
      .json({ message: "Password berhasil diperbarui! Sistem aman. ⚡" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal merombak password" });
  }
};

// 👇 === FITUR BARU: LUPA PASSWORD LOKAL (TANPA EMAIL SUNGGUHAN) ===
const forgotPasswordLocal = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // 1. Cek apakah email ada di database
    const [users] = await dbPool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "Email tidak ditemukan di sistem kami." });
    }

    // 2. Hash password baru
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    // 3. Update password di database
    await dbPool.query("UPDATE users SET password = ? WHERE email = ?", [
      hashedNewPassword,
      email,
    ]);

    res.status(200).json({ message: "Password berhasil direset! Silakan login." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mereset password" });
  }
};

// === FITUR ADMIN: MENGAMBIL SEMUA USER ===
const getAllUsers = async (req, res) => {
  try {
    const [users] = await dbPool.query(
      "SELECT id, nama, email, roblox_username, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json({ data: users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengambil data user" });
  }
};

// === FITUR ADMIN: MENGUBAH ROLE USER ===
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Role tidak valid!" });
    }

    await dbPool.query("UPDATE users SET role = ? WHERE id = ?", [role, id]);
    res.status(200).json({ message: `Role user berhasil diubah menjadi ${role}!` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengubah role user" });
  }
};

// === FITUR ADMIN: MENGHAPUS USER ===
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Jangan izinkan admin menghapus akunnya sendiri jika sedang login
    if (req.user.id === parseInt(id)) {
      return res.status(400).json({ message: "Tidak dapat menghapus akun Anda sendiri!" });
    }

    await dbPool.query("DELETE FROM users WHERE id = ?", [id]);
    res.status(200).json({ message: "User berhasil dihapus!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal menghapus user" });
  }
};

// 👇 Jangan lupa, changePassword dan forgotPasswordLocal sudah ditambahkan ke ekspor!
module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateProfile,
  changePassword,
  forgotPasswordLocal,
  getAllUsers,
  updateUserRole,
  deleteUser,
};
