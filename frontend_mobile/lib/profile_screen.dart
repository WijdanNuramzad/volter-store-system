import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'edit_profile_screen.dart';
import 'transaction_history_screen.dart';
import 'login_screen.dart';
import 'change_password_screen.dart';
// ChatScreen dihilangkan karena dipanggil dari order
// 👇 IMPORT LAYAR ADMIN
import 'admin_panel_screen.dart';

class ProfileScreen extends StatefulWidget {
  @override
  _ProfileScreenState createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  String _username = "";
  String _role = "";
  bool _isLoggedIn = false; // 👈 RADAR PENDETEKSI STATUS LOGIN

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    setState(() {
      // Kalau userId lebih dari 0, berarti ada yang login!
      if (userId > 0) {
        _isLoggedIn = true;
        _username = prefs.getString('user_nama') ?? "Customer";
        _role = prefs.getString('user_role') ?? "USER";
      } else {
        // Kalau 0, berarti Guest (Tamu)
        _isLoggedIn = false;
      }
    });
  }

  Future<void> _logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.clear(); // Hapus semua data sesi

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Sistem Dinonaktifkan. Berhasil Logout ⚡'),
        backgroundColor: accentCyan,
      ),
    );

    // Lempar kembali ke layar Login
    Navigator.pushAndRemoveUntil(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
      (route) => false,
    );
  }

  // 👇 TAMPILAN JIKA BELUM LOGIN (GUEST)
  Widget _buildGuestView() {
    return Scaffold(
      backgroundColor: bgPrimary,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.lock_person,
              size: 100,
              color: textGrey.withOpacity(0.5),
            ),
            SizedBox(height: 16),
            Text(
              'Kamu Belum Login',
              style: TextStyle(
                color: textWhite,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'Akses fitur penuh dengan masuk ke akunmu.',
              style: TextStyle(color: textGrey),
            ),
            SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => LoginScreen()),
                );
              },
              icon: Icon(Icons.login, color: bgPrimary),
              label: Text(
                'LOGIN / DAFTAR',
                style: TextStyle(
                  color: bgPrimary,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                ),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: accentCyan,
                padding: EdgeInsets.symmetric(horizontal: 32, vertical: 16),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    // 🛑 CEK GERBANG: Kalau belum login, tampilkan layar gembok!
    if (!_isLoggedIn) {
      return _buildGuestView();
    }

    // ✅ KALAU SUDAH LOGIN, TAMPILKAN KARTU IDENTITAS CYBERPUNK
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        title: Text(
          'KARTU IDENTITAS',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        backgroundColor: bgPrimary,
        elevation: 0,
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // === 1. HEADER PROFIL ===
            Center(
              child: Column(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      border: Border.all(color: accentCyan, width: 3),
                      image: DecorationImage(
                        image: NetworkImage(
                          'https://api.dicebear.com/7.x/avataaars/png?seed=${_username}',
                        ),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  SizedBox(height: 16),
                  Text(
                    _username.toUpperCase(),
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 24,
                      fontWeight: FontWeight.w900,
                      letterSpacing: 1.2,
                    ),
                  ),
                  SizedBox(height: 8),
                  Container(
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 6),
                    decoration: BoxDecoration(
                      color: _role.toUpperCase() == 'ADMIN'
                          ? accentPurple.withOpacity(0.1)
                          : accentCyan.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                        color: _role.toUpperCase() == 'ADMIN'
                            ? accentPurple.withOpacity(0.5)
                            : accentCyan.withOpacity(0.5),
                      ),
                    ),
                    child: Text(
                      _role.toUpperCase(),
                      style: TextStyle(
                        color: _role.toUpperCase() == 'ADMIN'
                            ? accentPurple
                            : accentCyan,
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 2,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 40),

            // 👇 === SEKSI RAHASIA KHUSUS ADMIN === 👇
            if (_role.toUpperCase() == 'ADMIN') ...[
              _buildSectionTitle('RUANG KOMANDO (ADMIN)'),
              _buildMenuTile(
                icon: Icons.admin_panel_settings,
                title: 'Masuk Markas Admin',
                iconColor: accentPurple,
                onTap: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => AdminPanelScreen()),
                  );
                },
              ),
              SizedBox(height: 24),
            ],

            // === 2. AKTIVITAS SAYA ===
            _buildSectionTitle('AKTIVITAS SAYA'),
            _buildMenuTile(
              icon: Icons.receipt_long,
              title: 'Riwayat Transaksi',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => TransactionHistoryScreen(),
                  ),
                );
              },
            ),
            _buildMenuTile(
              icon: Icons.star_rate,
              title: 'Ulasan Saya',
              onTap: () {},
            ),
            SizedBox(height: 24),

            // === 3. PENGATURAN AKUN ===
            _buildSectionTitle('PENGATURAN AKUN'),
            _buildMenuTile(
              icon: Icons.person_outline,
              title: 'Edit Profil',
              onTap: () async {
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => EditProfileScreen()),
                );
                if (result == true) _loadProfileData();
              },
            ),
            _buildMenuTile(
              icon: Icons.lock_outline,
              title: 'Keamanan & Password',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ChangePasswordScreen(),
                  ),
                );
              },
            ),
            SizedBox(height: 24),

            // === 4. PUSAT BANTUAN ===
            _buildSectionTitle('PUSAT BANTUAN'),
            // Tombol Comm-Link global telah dicabut karena menggunakan private room per-order
            _buildMenuTile(
              icon: Icons.info_outline,
              title: 'Tentang Volter',
              onTap: () {},
            ),
            SizedBox(height: 32),

            // === 5. DANGER ZONE (TOMBOL LOGOUT AKTIF) ===
            SizedBox(
              width: double.infinity,
              height: 55,
              child: OutlinedButton.icon(
                icon: Icon(Icons.logout, color: Colors.redAccent),
                label: Text(
                  'LOGOUT SYSTEM',
                  style: TextStyle(
                    color: Colors.redAccent,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: Colors.redAccent.withOpacity(0.5),
                    width: 2,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  backgroundColor: Colors.redAccent.withOpacity(0.1),
                ),
                onPressed: _logout,
              ),
            ),
            SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: Text(
        title,
        style: TextStyle(
          color: textGrey,
          fontSize: 12,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildMenuTile({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
    Color? iconColor, // 👈 Tambahan parameter untuk warna ikon spesifik
  }) {
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textGrey.withOpacity(0.1)),
      ),
      child: ListTile(
        leading: Container(
          padding: EdgeInsets.all(8),
          decoration: BoxDecoration(
            color: bgPrimary,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, color: iconColor ?? accentCyan, size: 20),
        ),
        title: Text(
          title,
          style: TextStyle(
            color: textWhite,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
        ),
        trailing: Icon(Icons.chevron_right, color: textGrey),
        onTap: onTap,
      ),
    );
  }
}
