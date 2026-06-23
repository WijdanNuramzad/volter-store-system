import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class CreatorFormScreen extends StatefulWidget {
  @override
  _CreatorFormScreenState createState() => _CreatorFormScreenState();
}

class _CreatorFormScreenState extends State<CreatorFormScreen> {
  final TextEditingController _portfolioController = TextEditingController();
  final TextEditingController _discordController = TextEditingController();

  String? _spesialisasiTerpilih;
  bool _isLoading = false;

  final List<String> _pilihanSpesialisasi = [
    'Builder (Map Maker)',
    'Scripter (Programmer)',
    'UI/UX Designer',
    '3D Modeler / Animator',
  ];

  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  Future<void> _kirimPendaftaran() async {
    // Validasi kosong
    if (_portfolioController.text.isEmpty ||
        _discordController.text.isEmpty ||
        _spesialisasiTerpilih == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Semua kolom wajib diisi, Komandan!'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      final prefs = await SharedPreferences.getInstance();
      final int userId = prefs.getInt('user_id') ?? 0;

      if (userId == 0) throw Exception('Sesi tidak valid.');

      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/sellers/apply'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'user_id': userId,
          'portfolio_link': _portfolioController.text,
          'spesialisasi': _spesialisasiTerpilih,
          'discord_id': _discordController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 201) {
        // SUKSES KIRIM PENDAFTARAN
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              data['message'],
              style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold),
            ),
            backgroundColor: accentCyan,
          ),
        );
        Navigator.pop(context); // Kembali ke profil
      } else {
        throw Exception(data['message'] ?? 'Gagal mengirim form');
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.redAccent,
        ),
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary,
        elevation: 0,
        title: Text(
          'APPLY CREATOR',
          style: TextStyle(
            color: accentPurple,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        iconTheme: IconThemeData(color: accentPurple),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header Info
            Container(
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: accentPurple.withOpacity(0.1),
                border: Border.all(color: accentPurple.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  Icon(Icons.rocket_launch, size: 40, color: accentPurple),
                  SizedBox(width: 16),
                  Expanded(
                    child: Text(
                      'Buka Toko & Jual Karyamu!\nAdmin akan mereview portofolio kamu dalam 1x24 Jam.',
                      style: TextStyle(color: textWhite, height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            SizedBox(height: 32),

            // 1. Dropdown Spesialisasi
            Text(
              'KATEGORI SPESIALISASI',
              style: TextStyle(color: textGrey, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            Container(
              padding: EdgeInsets.symmetric(horizontal: 16),
              decoration: BoxDecoration(
                color: bgSurface,
                borderRadius: BorderRadius.circular(12),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  value: _spesialisasiTerpilih,
                  isExpanded: true,
                  dropdownColor: bgSurface,
                  hint: Text(
                    'Pilih keahlian utamamu',
                    style: TextStyle(color: textGrey),
                  ),
                  icon: Icon(Icons.arrow_drop_down, color: accentCyan),
                  style: TextStyle(color: textWhite, fontSize: 16),
                  items: _pilihanSpesialisasi.map((String value) {
                    return DropdownMenuItem<String>(
                      value: value,
                      child: Text(value),
                    );
                  }).toList(),
                  onChanged: (newValue) {
                    setState(() => _spesialisasiTerpilih = newValue);
                  },
                ),
              ),
            ),
            SizedBox(height: 24),

            // 2. Input Link Portofolio
            Text(
              'LINK PORTOFOLIO (WAJIB)',
              style: TextStyle(color: textGrey, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            TextField(
              controller: _portfolioController,
              style: TextStyle(color: textWhite),
              decoration: InputDecoration(
                hintText: 'Link Game Roblox / YouTube / GDrive',
                hintStyle: TextStyle(color: textGrey.withOpacity(0.5)),
                filled: true,
                fillColor: bgSurface,
                prefixIcon: Icon(Icons.link, color: accentCyan),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: accentCyan),
                ),
              ),
            ),
            SizedBox(height: 24),

            // 3. Input Discord ID
            Text(
              'USERNAME / ID DISCORD',
              style: TextStyle(color: textGrey, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 8),
            TextField(
              controller: _discordController,
              style: TextStyle(color: textWhite),
              decoration: InputDecoration(
                hintText: 'Contoh: volter_yudistira#1234',
                hintStyle: TextStyle(color: textGrey.withOpacity(0.5)),
                filled: true,
                fillColor: bgSurface,
                prefixIcon: Icon(Icons.discord, color: accentCyan),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: accentCyan),
                ),
              ),
            ),
            SizedBox(height: 48),

            // Tombol Submit
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _kirimPendaftaran,
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentPurple,
                  foregroundColor: textWhite,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 10,
                  shadowColor: accentPurple.withOpacity(0.5),
                ),
                child: _isLoading
                    ? CircularProgressIndicator(color: textWhite)
                    : Text(
                        'KIRIM PENGAJUAN',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.5,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
