import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class CreateRequestScreen extends StatefulWidget {
  @override
  _CreateRequestScreenState createState() => _CreateRequestScreenState();
}

class _CreateRequestScreenState extends State<CreateRequestScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  int _currentStep = 0;

  // Controllers
  final TextEditingController _judulController = TextEditingController();
  final TextEditingController _linkController = TextEditingController();
  final TextEditingController _deskripsiController = TextEditingController();

  // Dropdown States
  String _kategori = 'Map';
  String _platform = 'Roblox Studio';
  String _skala = 'Menengah (Standar)';
  String _tema = 'Cyberpunk';
  String _urgensi = 'Santai (Standar)';
  String _budget = 'Rp 50.000 - Rp 150.000';

  // --- KUMPULAN WIDGET INPUT KHUSUS ---
  Widget _buildTextField(
    String label,
    TextEditingController controller, {
    int lines = 1,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: TextField(
        controller: controller,
        maxLines: lines,
        style: TextStyle(color: textWhite),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: textGrey),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: textGrey.withOpacity(0.3)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: accentCyan),
          ),
          filled: true,
          fillColor: bgPrimary,
        ),
      ),
    );
  }

  Widget _buildDropdown(
    String label,
    String currentValue,
    List<String> items,
    Function(String?) onChanged,
  ) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16.0),
      child: DropdownButtonFormField<String>(
        value: currentValue,
        dropdownColor: bgSurface,
        style: TextStyle(color: textWhite),
        decoration: InputDecoration(
          labelText: label,
          labelStyle: TextStyle(color: textGrey),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: textGrey.withOpacity(0.3)),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: accentCyan),
          ),
          filled: true,
          fillColor: bgPrimary,
        ),
        items: items.map((String value) {
          return DropdownMenuItem<String>(value: value, child: Text(value));
        }).toList(),
        onChanged: onChanged,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary,
        elevation: 0,
        title: Text(
          'FORM REQUEST JASA',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        iconTheme: IconThemeData(color: accentCyan),
      ),
      body: Theme(
        // Tema khusus agar Stepper menyatu dengan Dark Mode
        data: ThemeData(
          canvasColor: bgPrimary,
          colorScheme: ColorScheme.dark(
            primary: accentCyan,
            secondary: accentPurple,
            surface: bgSurface,
            onSurface: textWhite,
          ),
        ),
        child: Stepper(
          type: StepperType.vertical,
          currentStep: _currentStep,
          // 👇 FUNGSI TEMBAK DATA KE BACKEND NODE.JS ADA DI SINI
          onStepContinue: () async {
            if (_currentStep < 3) {
              setState(() => _currentStep += 1);
            } else {
              // Validasi agar judul dan deskripsi tidak kosong
              if (_judulController.text.isEmpty ||
                  _deskripsiController.text.isEmpty) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Judul dan Deskripsi wajib diisi Bos! ⚠️'),
                    backgroundColor: Colors.orangeAccent,
                  ),
                );
                return;
              }

              // Menampilkan loading indikator opsional
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: Text('Mengirim data ke markas... 📡'),
                  backgroundColor: bgSurface,
                ),
              );

              // Proses Tembak Data ke Backend
              final prefs = await SharedPreferences.getInstance();
              final int userId = prefs.getInt('user_id') ?? 0;

              try {
                final response = await http.post(
                  Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders'),
                  headers: {'Content-Type': 'application/json'},
                  body: jsonEncode({
                    'buyer_id': userId,
                    'judul_project': _judulController.text,
                    'kategori': _kategori,
                    'platform': _platform,
                    'skala': _skala,
                    'tema': _tema,
                    'link_referensi': _linkController.text,
                    'urgensi': _urgensi,
                    'estimasi_budget': _budget,
                    'deskripsi': _deskripsiController.text,
                  }),
                );

                if (response.statusCode == 201) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Request Berhasil Dikirim ke Markas! 🚀'),
                      backgroundColor: accentPurple,
                    ),
                  );
                  Navigator.pop(
                    context,
                    true,
                  ); // Kembali ke menu utama dan beri sinyal sukses
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('Gagal mengirim request ❌'),
                      backgroundColor: Colors.redAccent,
                    ),
                  );
                }
              } catch (e) {
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('Koneksi terputus dari Markas 📡'),
                    backgroundColor: Colors.redAccent,
                  ),
                );
              }
            }
          },
          onStepCancel: () {
            if (_currentStep > 0) {
              setState(() => _currentStep -= 1);
            }
          },
          controlsBuilder: (BuildContext context, ControlsDetails details) {
            return Padding(
              padding: const EdgeInsets.only(top: 24.0),
              child: Row(
                children: [
                  Expanded(
                    child: ElevatedButton(
                      onPressed: details.onStepContinue,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _currentStep == 3
                            ? accentPurple
                            : accentCyan,
                        padding: EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      child: Text(
                        _currentStep == 3 ? 'KIRIM REQUEST' : 'SELANJUTNYA',
                        style: TextStyle(
                          color: bgPrimary,
                          fontWeight: FontWeight.bold,
                          letterSpacing: 1.2,
                        ),
                      ),
                    ),
                  ),
                  if (_currentStep > 0) SizedBox(width: 12),
                  if (_currentStep > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: details.onStepCancel,
                        style: OutlinedButton.styleFrom(
                          padding: EdgeInsets.symmetric(vertical: 14),
                          side: BorderSide(color: textGrey),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: Text(
                          'KEMBALI',
                          style: TextStyle(
                            color: textGrey,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            );
          },
          steps: [
            // STEP 1: INFO DASAR
            Step(
              title: Text(
                'Informasi Dasar',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                'Identitas utama project-mu',
                style: TextStyle(color: textGrey, fontSize: 12),
              ),
              isActive: _currentStep >= 0,
              state: _currentStep > 0 ? StepState.complete : StepState.indexed,
              content: Column(
                children: [
                  SizedBox(height: 16),
                  _buildTextField(
                    'Judul Project (Maks 50 Karakter)',
                    _judulController,
                  ),
                  _buildDropdown(
                    'Kategori Jasa',
                    _kategori,
                    ['Map', 'Script', '3D Model', 'Audio', 'UI/UX'],
                    (val) => setState(() => _kategori = val!),
                  ),
                  _buildDropdown(
                    'Platform / Engine Tujuan',
                    _platform,
                    ['Roblox Studio', 'Unity', 'Unreal Engine', 'Web/Figma'],
                    (val) => setState(() => _platform = val!),
                  ),
                ],
              ),
            ),

            // STEP 2: SPESIFIKASI VISUAL
            Step(
              title: Text(
                'Spesifikasi & Visual',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                'Tingkat kerumitan dan tema',
                style: TextStyle(color: textGrey, fontSize: 12),
              ),
              isActive: _currentStep >= 1,
              state: _currentStep > 1 ? StepState.complete : StepState.indexed,
              content: Column(
                children: [
                  SizedBox(height: 16),
                  _buildDropdown('Skala Project', _skala, [
                    'Kecil (Cepat)',
                    'Menengah (Standar)',
                    'Besar (Kompleks)',
                  ], (val) => setState(() => _skala = val!)),
                  _buildDropdown('Tema / Gaya Visual', _tema, [
                    'Cyberpunk',
                    'Low-Poly',
                    'Realistic',
                    'Sci-Fi',
                    'Pixel Art / Anime',
                    'Medieval',
                    'Lainnya (Tulis di deskripsi)',
                  ], (val) => setState(() => _tema = val!)),
                ],
              ),
            ),

            // STEP 3: LOGISTIK
            Step(
              title: Text(
                'Referensi & Logistik',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                'Waktu dan ekspektasi biaya',
                style: TextStyle(color: textGrey, fontSize: 12),
              ),
              isActive: _currentStep >= 2,
              state: _currentStep > 2 ? StepState.complete : StepState.indexed,
              content: Column(
                children: [
                  SizedBox(height: 16),
                  _buildTextField('Link Referensi (Opsional)', _linkController),
                  Text(
                    'Contoh: Link Google Drive, Pinterest, atau YouTube',
                    style: TextStyle(color: textGrey, fontSize: 11),
                  ),
                  SizedBox(height: 16),
                  _buildDropdown(
                    'Tingkat Urgensi',
                    _urgensi,
                    ['Santai (Standar)', 'Express (Prioritas + Biaya)'],
                    (val) => setState(() => _urgensi = val!),
                  ),
                  _buildDropdown(
                    'Estimasi Budget Klien',
                    _budget,
                    [
                      '< Rp 50.000',
                      'Rp 50.000 - Rp 150.000',
                      '> Rp 150.000',
                      'Belum Yakin (Tunggu Penawaran)',
                    ],
                    (val) => setState(() => _budget = val!),
                  ),
                ],
              ),
            ),

            // STEP 4: DESKRIPSI FINAL
            Step(
              title: Text(
                'Deskripsi Detail',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
              ),
              subtitle: Text(
                'Ceritakan spesifikasi lengkapnya',
                style: TextStyle(color: textGrey, fontSize: 12),
              ),
              isActive: _currentStep >= 3,
              content: Column(
                children: [
                  SizedBox(height: 16),
                  _buildTextField(
                    'Deskripsikan fitur atau bentuk yang kamu mau sedetail mungkin...',
                    _deskripsiController,
                    lines: 5,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
