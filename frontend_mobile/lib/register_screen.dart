import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'constants.dart';
import 'login_screen.dart';

class RegisterScreen extends StatefulWidget {
  @override
  _RegisterScreenState createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen>
    with SingleTickerProviderStateMixin {
  // ─── Controller Input ───────────────────────────────────────────
  final TextEditingController _namaController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _konfirmasiController = TextEditingController();

  bool _isLoading = false;
  bool _showPassword = false;
  bool _showKonfirmasi = false;
  String _pesanError = '';

  // ─── Animasi ────────────────────────────────────────────────────
  late AnimationController _animController;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  // ─── Palet Warna Cyberpunk Volter ───────────────────────────────
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _fadeAnim = CurvedAnimation(
      parent: _animController,
      curve: Curves.easeOut,
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animController, curve: Curves.easeOut));
    _animController.forward();
  }

  @override
  void dispose() {
    _animController.dispose();
    _namaController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _konfirmasiController.dispose();
    super.dispose();
  }

  // ─── Validasi sisi klien ─────────────────────────────────────────
  String? _validasi() {
    final nama = _namaController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final konfirmasi = _konfirmasiController.text;

    if (nama.isEmpty) return 'Nama tidak boleh kosong.';
    if (nama.length < 3) return 'Nama minimal 3 karakter.';
    if (email.isEmpty) return 'Email tidak boleh kosong.';
    if (!RegExp(r'^[\w\.-]+@[\w\.-]+\.\w{2,}$').hasMatch(email)) {
      return 'Format email tidak valid.';
    }
    if (password.isEmpty) return 'Password tidak boleh kosong.';
    if (password.length < 6) return 'Password minimal 6 karakter.';
    if (konfirmasi != password) return 'Konfirmasi password tidak cocok.';
    return null; // semua valid
  }

  // ─── Kirim ke Backend ────────────────────────────────────────────
  Future<void> _daftarYuk() async {
    final errorValidasi = _validasi();
    if (errorValidasi != null) {
      setState(() => _pesanError = errorValidasi);
      return;
    }

    setState(() {
      _isLoading = true;
      _pesanError = '';
    });

    try {
      // ✅ Endpoint: POST /api/users/register (publik, tidak butuh token)
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/users/register'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nama': _namaController.text.trim(),
          'email': _emailController.text.trim(),
          'password': _passwordController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // ✅ Registrasi berhasil → Navigasi ke Login
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              '${data['message']} Silakan login.',
              style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold),
            ),
            backgroundColor: accentCyan,
            behavior: SnackBarBehavior.floating,
            duration: const Duration(seconds: 3),
          ),
        );
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => LoginScreen()),
        );
      } else {
        // ❌ Error dari server (misal: email sudah terdaftar)
        setState(() {
          _pesanError = data['message'] ?? 'Pendaftaran gagal.';
        });
      }
    } catch (e) {
      setState(() {
        _pesanError = 'Gagal terhubung ke server. Pastikan server nyala!';
      });
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  // ─── Widget helper: Input Field ──────────────────────────────────
  Widget _buildInputField({
    required TextEditingController controller,
    required String hint,
    required IconData prefixIcon,
    bool obscure = false,
    bool? showObscure,
    VoidCallback? onToggleObscure,
    TextInputType keyboardType = TextInputType.text,
  }) {
    return TextField(
      controller: controller,
      obscureText: obscure && !(showObscure ?? false),
      keyboardType: keyboardType,
      style: TextStyle(color: textWhite),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: textGrey),
        filled: true,
        fillColor: bgSurface,
        prefixIcon: Icon(prefixIcon, color: accentCyan),
        suffixIcon: obscure
            ? IconButton(
                icon: Icon(
                  (showObscure ?? false)
                      ? Icons.visibility_off_outlined
                      : Icons.visibility_outlined,
                  color: textGrey,
                ),
                onPressed: onToggleObscure,
              )
            : null,
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: bgSurface),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: accentCyan, width: 2),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      // ─── AppBar tipis ──────────────────────────────────────────
      appBar: AppBar(
        backgroundColor: bgPrimary,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_ios, color: accentCyan, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          'BUAT AKUN BARU',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            fontSize: 16,
          ),
        ),
        centerTitle: true,
      ),
      body: FadeTransition(
        opacity: _fadeAnim,
        child: SlideTransition(
          position: _slideAnim,
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ─── Header ───────────────────────────────────────
                Center(
                  child: Column(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(18),
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: accentPurple.withOpacity(0.1),
                          border: Border.all(
                            color: accentPurple.withOpacity(0.4),
                            width: 2,
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: accentPurple.withOpacity(0.2),
                              blurRadius: 30,
                              spreadRadius: 5,
                            ),
                          ],
                        ),
                        child: Icon(
                          Icons.person_add_alt_1,
                          size: 48,
                          color: accentPurple,
                        ),
                      ),
                      const SizedBox(height: 20),
                      Text(
                        'Gabung Volter Community',
                        style: TextStyle(
                          color: textWhite,
                          fontSize: 22,
                          fontWeight: FontWeight.w900,
                          fontFamily: 'Poppins',
                        ),
                      ),
                      const SizedBox(height: 6),
                      Text(
                        'Daftar gratis. Akses ribuan aset gaming.',
                        style: TextStyle(color: textGrey, fontSize: 13),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 36),

                // ─── Pesan Error ───────────────────────────────────
                if (_pesanError.isNotEmpty) ...[
                  Container(
                    padding: const EdgeInsets.all(14),
                    decoration: BoxDecoration(
                      color: Colors.redAccent.withOpacity(0.08),
                      border: Border.all(color: Colors.redAccent.withOpacity(0.6)),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.error_outline, color: Colors.redAccent, size: 20),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            _pesanError,
                            style: const TextStyle(
                              color: Colors.redAccent,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(height: 20),
                ],

                // ─── Field: Nama ───────────────────────────────────
                _buildLabel('Nama Lengkap'),
                const SizedBox(height: 8),
                _buildInputField(
                  controller: _namaController,
                  hint: 'Contoh: Wijdan Nuramzad',
                  prefixIcon: Icons.badge_outlined,
                ),
                const SizedBox(height: 20),

                // ─── Field: Email ──────────────────────────────────
                _buildLabel('Alamat Email'),
                const SizedBox(height: 8),
                _buildInputField(
                  controller: _emailController,
                  hint: 'contoh@email.com',
                  prefixIcon: Icons.email_outlined,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 20),

                // ─── Field: Password ───────────────────────────────
                _buildLabel('Password'),
                const SizedBox(height: 8),
                _buildInputField(
                  controller: _passwordController,
                  hint: 'Minimal 6 karakter',
                  prefixIcon: Icons.lock_outline,
                  obscure: true,
                  showObscure: _showPassword,
                  onToggleObscure: () =>
                      setState(() => _showPassword = !_showPassword),
                ),
                const SizedBox(height: 20),

                // ─── Field: Konfirmasi Password ────────────────────
                _buildLabel('Konfirmasi Password'),
                const SizedBox(height: 8),
                _buildInputField(
                  controller: _konfirmasiController,
                  hint: 'Ulangi password kamu',
                  prefixIcon: Icons.lock_person_outlined,
                  obscure: true,
                  showObscure: _showKonfirmasi,
                  onToggleObscure: () =>
                      setState(() => _showKonfirmasi = !_showKonfirmasi),
                ),
                const SizedBox(height: 36),

                // ─── Tombol Daftar ─────────────────────────────────
                SizedBox(
                  width: double.infinity,
                  height: 55,
                  child: ElevatedButton.icon(
                    onPressed: _isLoading ? null : _daftarYuk,
                    icon: _isLoading
                        ? const SizedBox()
                        : const Icon(Icons.rocket_launch, size: 20),
                    label: _isLoading
                        ? SizedBox(
                            height: 22,
                            width: 22,
                            child: CircularProgressIndicator(
                              color: bgPrimary,
                              strokeWidth: 2.5,
                            ),
                          )
                        : const Text(
                            'DAFTAR SEKARANG',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w900,
                              letterSpacing: 1.5,
                            ),
                          ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentPurple,
                      foregroundColor: textWhite,
                      disabledBackgroundColor: accentPurple.withOpacity(0.4),
                      elevation: 10,
                      shadowColor: accentPurple.withOpacity(0.5),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ─── Link ke Login ─────────────────────────────────
                Center(
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        'Sudah punya akun? ',
                        style: TextStyle(color: textGrey),
                      ),
                      GestureDetector(
                        onTap: () => Navigator.pushReplacement(
                          context,
                          MaterialPageRoute(
                            builder: (context) => LoginScreen(),
                          ),
                        ),
                        child: Text(
                          'Login di sini',
                          style: TextStyle(
                            color: accentCyan,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 32),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildLabel(String text) {
    return Text(
      text,
      style: TextStyle(
        color: textGrey,
        fontSize: 12,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.2,
      ),
    );
  }
}
