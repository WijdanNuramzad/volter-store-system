import 'package:flutter/material.dart';
import 'package:file_picker/file_picker.dart';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';
import 'constants.dart';

class UploadAssetScreen extends StatefulWidget {
  @override
  _UploadAssetScreenState createState() => _UploadAssetScreenState();
}

class _UploadAssetScreenState extends State<UploadAssetScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  final _formKey = GlobalKey<FormState>();

  // Controllers
  final TextEditingController _namaController = TextEditingController();
  final TextEditingController _deskripsiController = TextEditingController();
  final TextEditingController _hargaController = TextEditingController();

  // Variabel Penampung File
  PlatformFile? _gambarTerpilih;
  PlatformFile? _fileAsetTerpilih;
  bool _isLoading = false;

  // Fungsi Pilih Gambar Thumbnail (DIPERBARUI UNTUK WEB 🌐)
  Future<void> _pilihGambar() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
      withData: true, // 👈 WAJIB ADA AGAR WEB BISA MEMBACA FILE
    );
    if (result != null) {
      setState(() {
        _gambarTerpilih = result.files.first;
      });
    }
  }

  // Fungsi Pilih File Script/Map (DIPERBARUI UNTUK WEB 🌐)
  Future<void> _pilihFileAset() async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.any,
      withData: true, // 👈 WAJIB ADA AGAR WEB BISA MEMBACA FILE
    );
    if (result != null) {
      setState(() {
        _fileAsetTerpilih = result.files.first;
      });
    }
  }

  // Mesin Utama Pendorong Data ke Backend
  Future<void> _uploadData() async {
    if (!_formKey.currentState!.validate()) return;

    if (_gambarTerpilih == null || _fileAsetTerpilih == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Gambar dan File Aset Wajib Diisi! ⚠️'),
          backgroundColor: Colors.redAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      // 👈 KEMBALIKAN KE LOCALHOST JIKA PAKAI CHROME
      var request = http.MultipartRequest(
        'POST',
        Uri.parse('${AppConstants.kBaseUrl}/api/assets'),
      );

      // 1. Masukkan data teks
      request.fields['nama'] = _namaController.text;
      request.fields['deskripsi'] = _deskripsiController.text;

      String hargaMurni = _hargaController.text.replaceAll(
        RegExp(r'[^0-9]'),
        '',
      );
      request.fields['harga'] = hargaMurni.isEmpty ? '0' : hargaMurni;

      // 2. Masukkan File Gambar (LOGIKA PINTAR: CEK WEB / ANDROID 🧠)
      if (kIsWeb) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'gambar',
            _gambarTerpilih!.bytes!,
            filename: _gambarTerpilih!.name,
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath('gambar', _gambarTerpilih!.path!),
        );
      }

      // 3. Masukkan File Aset (LOGIKA PINTAR: CEK WEB / ANDROID 🧠)
      if (kIsWeb) {
        request.files.add(
          http.MultipartFile.fromBytes(
            'file_aset',
            _fileAsetTerpilih!.bytes!,
            filename: _fileAsetTerpilih!.name,
          ),
        );
      } else {
        request.files.add(
          await http.MultipartFile.fromPath(
            'file_aset',
            _fileAsetTerpilih!.path!,
          ),
        );
      }

      // 4. Kirim Paketnya
      var response = await request.send();

      if (response.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Aset Berhasil Diunggah ke Toko! 🚀'),
            backgroundColor: Colors.greenAccent,
          ),
        );
        Navigator.pop(context); // Kembali ke Markas Admin
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Gagal mengunggah. Pastikan server nyala.'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      print("Upload Error: $e");
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Terjadi kesalahan koneksi 🚨'),
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
        title: Text(
          'UPLOAD ASET BARU',
          style: TextStyle(
            color: accentPurple,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        iconTheme: IconThemeData(color: accentPurple),
      ),
      body: _isLoading
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(color: accentPurple),
                  SizedBox(height: 16),
                  Text(
                    "Sedang menyalurkan data...",
                    style: TextStyle(color: textWhite),
                  ),
                ],
              ),
            )
          : SingleChildScrollView(
              padding: EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildSectionTitle('INFORMASI ASET'),
                    _buildTextField(
                      controller: _namaController,
                      label: 'Nama Map / Script',
                      icon: Icons.title,
                      validator: (val) => val!.isEmpty ? 'Wajib diisi' : null,
                    ),
                    SizedBox(height: 16),
                    _buildTextField(
                      controller: _deskripsiController,
                      label: 'Deskripsi Detail',
                      icon: Icons.description,
                      maxLines: 4,
                    ),
                    SizedBox(height: 16),
                    _buildTextField(
                      controller: _hargaController,
                      label: 'Harga (Kosongi jika GRATIS)',
                      icon: Icons.attach_money,
                      keyboardType: TextInputType.number,
                    ),

                    SizedBox(height: 32),
                    _buildSectionTitle('FILE PENDUKUNG'),

                    _buildFilePickerBtn(
                      title: 'Upload Thumbnail (JPG/PNG)',
                      fileName: _gambarTerpilih?.name,
                      icon: Icons.image,
                      onTap: _pilihGambar,
                    ),
                    SizedBox(height: 16),

                    _buildFilePickerBtn(
                      title: 'Upload File Aset (ZIP/RAR)',
                      fileName: _fileAsetTerpilih?.name,
                      icon: Icons.folder_zip,
                      onTap: _pilihFileAset,
                      isPurple: true,
                    ),

                    SizedBox(height: 40),

                    SizedBox(
                      width: double.infinity,
                      height: 55,
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentPurple,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: _uploadData,
                        icon: Icon(Icons.cloud_upload, color: textWhite),
                        label: Text(
                          'UNGGAH KE TOKO',
                          style: TextStyle(
                            color: textWhite,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
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

  Widget _buildTextField({
    required TextEditingController controller,
    required String label,
    required IconData icon,
    int maxLines = 1,
    TextInputType? keyboardType,
    String? Function(String?)? validator,
  }) {
    return TextFormField(
      controller: controller,
      style: TextStyle(color: textWhite),
      maxLines: maxLines,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: label,
        labelStyle: TextStyle(color: textGrey),
        filled: true,
        fillColor: bgSurface,
        prefixIcon: Padding(
          padding: EdgeInsets.only(bottom: maxLines > 1 ? 60.0 : 0),
          child: Icon(icon, color: accentCyan),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: textGrey.withOpacity(0.3)),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: accentCyan),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.redAccent),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: BorderSide(color: Colors.redAccent),
        ),
      ),
    );
  }

  Widget _buildFilePickerBtn({
    required String title,
    String? fileName,
    required IconData icon,
    required VoidCallback onTap,
    bool isPurple = false,
  }) {
    Color themeColor = isPurple ? accentPurple : accentCyan;

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: fileName != null ? themeColor : textGrey.withOpacity(0.3),
            width: fileName != null ? 2 : 1,
          ),
        ),
        child: Row(
          children: [
            Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: themeColor.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Icon(icon, color: themeColor),
            ),
            SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      color: textWhite,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 4),
                  Text(
                    fileName ?? 'Belum ada file terpilih',
                    style: TextStyle(
                      color: fileName != null ? themeColor : textGrey,
                      fontSize: 12,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            if (fileName != null) Icon(Icons.check_circle, color: themeColor),
          ],
        ),
      ),
    );
  }
}
