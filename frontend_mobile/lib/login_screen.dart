import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'home_screen.dart';
import 'admin_panel_screen.dart';
import 'register_screen.dart';

class LoginScreen extends StatefulWidget {
  @override
  _LoginScreenState createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  // Alat pengendali input teks
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  bool _isLoading = false;
  String _pesanError = '';

  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A); // Deep Slate
  final Color bgSurface = const Color(0xFF1E293B); // Slate Surface
  final Color accentCyan = const Color(0xFF00F0FF); // Cyber Cyan
  final Color accentPurple = const Color(0xFF8B5CF6); // Electric Purple
  final Color textWhite = const Color(0xFFF8FAFC); // Ice White
  final Color textGrey = const Color(0xFF94A3B8); // Cool Grey

  // Fungsi sakti untuk Login
  Future<void> _loginYuk() async {
    setState(() {
      _isLoading = true;
      _pesanError = '';
    });

    try {
      // 1. Hubungi Satpam (Server Node.js)
      // ✅ Endpoint: POST /api/users/login — sama persis dengan Web
      // ✅ Request body: { email, password } — sama persis dengan Web
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/users/login'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
        }),
      );

      // 2. Baca jawaban dari server
      // ✅ Response: { token, userData: { id, nama, role } } — sama persis dengan Web
      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        // LOGIN SUKSES! 🎉

        final String token = data['token'];
        final Map<String, dynamic> userData = data['userData'];
        final String role = userData['role'] ?? AppConstants.kRoleBuyer;

        // 3. ✅ Simpan Token JWT ke SharedPreferences (key seragam via AppConstants)
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString(AppConstants.kTokenKey, token);
        await prefs.setString(AppConstants.kUserNamaKey, userData['nama'] ?? '');
        await prefs.setInt(AppConstants.kUserIdKey, userData['id'] ?? 0);
        await prefs.setString(AppConstants.kUserRoleKey, role);
        await prefs.setString(AppConstants.kUserEmailKey, _emailController.text.trim());

        // 4. ✅ Navigasi berdasarkan Role — sama logikanya dengan Web (Login.jsx)
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              'Selamat datang, ${userData['nama']}! 🚀',
              style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold),
            ),
            backgroundColor: accentCyan,
            behavior: SnackBarBehavior.floating,
          ),
        );

        if (role == AppConstants.kRoleAdmin) {
          // Admin → Langsung ke Panel Admin (sama seperti Web navigate ke /admin)
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => AdminPanelScreen()),
          );
        } else {
          // Buyer / Seller → Ke Halaman Utama
          Navigator.pushReplacement(
            context,
            MaterialPageRoute(builder: (context) => HomeScreen()),
          );
        }
      } else {
        // LOGIN GAGAL ❌
        setState(() {
          _pesanError = data['message'] ?? 'Login Gagal';
        });
      }
    } catch (e) {
      setState(() {
        _pesanError =
            'Waduh, gagal terhubung ke server nih. Pastikan server nyala!';
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary, // Tema Deep Slate
      body: Center(
        child: SingleChildScrollView(
          padding: EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo Glow Cyberpunk
              Container(
                padding: EdgeInsets.all(16),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  boxShadow: [
                    BoxShadow(
                      color: accentCyan.withOpacity(0.2),
                      blurRadius: 40,
                      spreadRadius: 10,
                    ),
                  ],
                ),
                child: Icon(Icons.bolt, size: 100, color: accentCyan),
              ),
              SizedBox(height: 16),
              Text(
                'VOLTER',
                style: TextStyle(
                  fontSize: 36,
                  fontWeight: FontWeight.w900,
                  color: textWhite,
                  letterSpacing: 8,
                  fontFamily: 'Poppins',
                ),
              ),
              SizedBox(height: 8),
              Text(
                'COMMUNITY SYSTEM',
                style: TextStyle(
                  color: accentPurple,
                  fontSize: 14,
                  letterSpacing: 3,
                  fontWeight: FontWeight.bold,
                ),
              ),
              SizedBox(height: 48),

              // Tampilkan Pesan Error (Kalau ada)
              if (_pesanError.isNotEmpty)
                Container(
                  padding: EdgeInsets.all(12),
                  margin: EdgeInsets.only(bottom: 24),
                  decoration: BoxDecoration(
                    color: Colors.redAccent.withOpacity(0.1),
                    border: Border.all(color: Colors.redAccent),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    children: [
                      Icon(Icons.error_outline, color: Colors.redAccent),
                      SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          _pesanError,
                          style: TextStyle(color: Colors.redAccent),
                        ),
                      ),
                    ],
                  ),
                ),

              // Kotak Input Email
              TextField(
                controller: _emailController,
                style: TextStyle(color: textWhite),
                decoration: InputDecoration(
                  hintText: 'Alamat Email',
                  hintStyle: TextStyle(color: textGrey),
                  filled: true,
                  fillColor: bgSurface,
                  prefixIcon: Icon(Icons.email_outlined, color: accentCyan),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.transparent),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: accentCyan,
                      width: 2,
                    ), // Glow border saat diklik
                  ),
                ),
              ),
              SizedBox(height: 20),

              // Kotak Input Password
              TextField(
                controller: _passwordController,
                obscureText: true,
                style: TextStyle(color: textWhite),
                decoration: InputDecoration(
                  hintText: 'Password',
                  hintStyle: TextStyle(color: textGrey),
                  filled: true,
                  fillColor: bgSurface,
                  prefixIcon: Icon(Icons.lock_outline, color: accentCyan),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(color: Colors.transparent),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: BorderSide(
                      color: accentCyan,
                      width: 2,
                    ), // Glow border saat diklik
                  ),
                ),
              ),
              SizedBox(height: 40),

              // Tombol Login Futuristik
              SizedBox(
                width: double.infinity,
                height: 55,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentCyan,
                    foregroundColor: bgPrimary,
                    elevation: 10,
                    shadowColor: accentCyan.withOpacity(0.5),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: _isLoading ? null : _loginYuk,
                  child: _isLoading
                      ? CircularProgressIndicator(color: bgPrimary)
                      : Text(
                          'MASUK SEKARANG',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 1.5,
                          ),
                        ),
                ),
              ),

              // Tambahan: Tulisan Register (Opsional, siap di-link nanti)
              SizedBox(height: 24),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Belum punya akun? ', style: TextStyle(color: textGrey)),
                  GestureDetector(
                    onTap: () {
                      // ✅ Navigasi ke RegisterScreen
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => RegisterScreen(),
                        ),
                      );
                    },
                    child: Text(
                      'Daftar di sini',
                      style: TextStyle(
                        color: accentCyan,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
