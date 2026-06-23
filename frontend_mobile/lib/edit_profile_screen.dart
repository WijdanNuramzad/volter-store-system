import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class EditProfileScreen extends StatefulWidget {
  @override
  _EditProfileScreenState createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  // Controllers
  final TextEditingController _namaController = TextEditingController();
  final TextEditingController _robloxController = TextEditingController();
  final TextEditingController _kontakController = TextEditingController();
  String _email = ""; // Read-only
  String _jenisKelamin = "Laki-laki";

  bool _isLoading = false;
  int _userId = 0;

  @override
  void initState() {
    super.initState();
    _loadCurrentData();
  }

  Future<void> _loadCurrentData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _userId = prefs.getInt('user_id') ?? 0;
      _email =
          prefs.getString('user_email') ??
          "email@volter.com"; // Pastikan key 'user_email' disave saat login
      _namaController.text = prefs.getString('user_nama') ?? "";
      _robloxController.text = prefs.getString('user_roblox') ?? "";
      _kontakController.text = prefs.getString('user_kontak') ?? "";
      _jenisKelamin = prefs.getString('user_jk') ?? "Laki-laki";
    });
  }

  Future<void> _simpanProfil() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.put(
        Uri.parse('${AppConstants.kBaseUrl}/api/users/update/$_userId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'nama': _namaController.text,
          'roblox_username': _robloxController.text,
          'kontak_wa_discord': _kontakController.text,
          'jenis_kelamin': _jenisKelamin,
        }),
      );

      if (response.statusCode == 200) {
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user_nama', _namaController.text);
        await prefs.setString('user_roblox', _robloxController.text);
        await prefs.setString('user_kontak', _kontakController.text);
        await prefs.setString('user_jk', _jenisKelamin);

        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Profil Ter-update! ⚡'),
            backgroundColor: Colors.greenAccent,
          ),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e'), backgroundColor: Colors.redAccent),
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
        title: Text(
          'SETTING IDENTITAS',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        backgroundColor: bgPrimary,
        elevation: 0,
        iconTheme: IconThemeData(color: accentCyan),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // UBAH FOTO SECTION
            Center(
              child: Column(
                children: [
                  Stack(
                    alignment: Alignment.bottomRight,
                    children: [
                      Container(
                        width: 110,
                        height: 110,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          border: Border.all(color: accentCyan, width: 3),
                          image: DecorationImage(
                            image: NetworkImage(
                              'https://api.dicebear.com/7.x/avataaars/png?seed=${_namaController.text}',
                            ),
                            fit: BoxFit.cover,
                          ),
                        ),
                      ),
                      CircleAvatar(
                        backgroundColor: accentCyan,
                        radius: 18,
                        child: Icon(
                          Icons.camera_alt,
                          size: 18,
                          color: bgPrimary,
                        ),
                      ),
                    ],
                  ),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      "UBAH FOTO",
                      style: TextStyle(
                        color: accentCyan,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
            ),

            SizedBox(height: 20),

            // FORM FIELDS
            _buildLabel("EMAIL (PERMANEN)"),
            _buildTextField(
              _namaController,
              "Email",
              Icons.email,
              enabled: false,
              initialValue: _email,
            ),

            _buildLabel("NAMA PANGGILAN"),
            _buildTextField(
              _namaController,
              "Contoh: Volter Pro",
              Icons.person,
            ),

            _buildLabel("USERNAME ROBLOX"),
            _buildTextField(
              _robloxController,
              "Contoh: Volter_Gamer123",
              Icons.videogame_asset,
            ),

            _buildLabel("WHATSAPP / DISCORD"),
            _buildTextField(
              _kontakController,
              "Contoh: volter#1234",
              Icons.contact_phone,
            ),

            _buildLabel("JENIS KELAMIN"),
            _buildDropdown(),

            SizedBox(height: 40),

            // TOMBOL SIMPAN
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _isLoading ? null : _simpanProfil,
                child: _isLoading
                    ? CircularProgressIndicator(color: bgPrimary)
                    : Text(
                        'KONFIRMASI PERUBAHAN ⚡',
                        style: TextStyle(
                          color: bgPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(top: 20, bottom: 8),
      child: Text(
        label,
        style: TextStyle(
          color: textGrey,
          fontSize: 10,
          fontWeight: FontWeight.bold,
          letterSpacing: 1.5,
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String hint,
    IconData icon, {
    bool enabled = true,
    String? initialValue,
  }) {
    return TextFormField(
      controller: initialValue == null ? controller : null,
      initialValue: initialValue,
      enabled: enabled,
      style: TextStyle(color: enabled ? textWhite : textGrey),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: textGrey.withOpacity(0.5)),
        filled: true,
        fillColor: bgSurface,
        prefixIcon: Icon(icon, color: enabled ? accentCyan : textGrey),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide.none,
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: accentCyan),
        ),
      ),
    );
  }

  Widget _buildDropdown() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: _jenisKelamin,
          dropdownColor: bgSurface,
          isExpanded: true,
          style: TextStyle(color: textWhite),
          items: ["Laki-laki", "Perempuan", "Lainnya"].map((String value) {
            return DropdownMenuItem<String>(value: value, child: Text(value));
          }).toList(),
          onChanged: (val) => setState(() => _jenisKelamin = val!),
        ),
      ),
    );
  }
}
