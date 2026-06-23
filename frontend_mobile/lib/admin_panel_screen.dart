import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'constants.dart';
// 👇 IMPORT LAYAR UPLOAD & CHAT
import 'upload_asset_screen.dart';
import 'chat_screen.dart';

class AdminPanelScreen extends StatefulWidget {
  @override
  _AdminPanelScreenState createState() => _AdminPanelScreenState();
}

class _AdminPanelScreenState extends State<AdminPanelScreen> {
  // === PALET WARNA CYBERPUNK ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  List<dynamic> _allRequests = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchAllRequests();
  }

  // 1. Ambil Semua Data Request dari Backend
  Future<void> _fetchAllRequests() async {
    setState(() => _isLoading = true);
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/admin/all'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _allRequests = data['data'];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("Error Admin Fetch: $e");
      setState(() => _isLoading = false);
    }
  }

  // 2. Fungsi Tembak Update ke Backend
  Future<void> _updateRequest(
    int id,
    String status,
    int progress,
    String harga,
  ) async {
    try {
      String hargaMurni = harga.replaceAll(RegExp(r'[^0-9]'), '');

      final response = await http.put(
        Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/admin/update/$id'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'status': status,
          'progress': progress,
          'harga_tawaran': hargaMurni.isEmpty ? 0 : int.parse(hargaMurni),
        }),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Status berhasil diupdate! ⚡'),
            backgroundColor: Colors.greenAccent,
          ),
        );
        _fetchAllRequests();
      }
    } catch (e) {
      print("Error Update: $e");
    }
  }

  // 3. Modal Detail & Update
  void _tampilkanDetailRequest(dynamic req) {
    double hargaDouble = 0;
    if (req['harga_tawaran'] != null) {
      hargaDouble = double.tryParse(req['harga_tawaran'].toString()) ?? 0;
    }
    TextEditingController _hargaController = TextEditingController(
      text: hargaDouble > 0 ? hargaDouble.toInt().toString() : '',
    );

    String statusDb = (req['status'] ?? 'PENDING').toString().toUpperCase();
    List<String> statusOpsi = [
      'PENDING',
      'QUOTATION',
      'MENUNGGU PEMBAYARAN',
      'IN PROGRESS',
      'SELESAI',
    ];
    String _statusTerpilih = statusOpsi.contains(statusDb)
        ? statusDb
        : 'PENDING';

    double _progressValue =
        double.tryParse(req['progress']?.toString() ?? '0') ?? 0;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateModal) {
            return Container(
              height: MediaQuery.of(context).size.height * 0.85,
              padding: EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: bgSurface,
                borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                border: Border.all(color: accentPurple, width: 2),
              ),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Text(
                            req['judul_project'],
                            style: TextStyle(
                              color: accentCyan,
                              fontSize: 20,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                        IconButton(
                          icon: Icon(Icons.close, color: textGrey),
                          onPressed: () => Navigator.pop(context),
                        ),
                      ],
                    ),
                    Divider(color: textGrey.withOpacity(0.3)),
                    SizedBox(height: 16),

                    _buildInfoRow('Kategori', req['kategori']),
                    _buildInfoRow('Platform', req['platform']),
                    _buildInfoRow('Skala', req['skala']),
                    _buildInfoRow('Tema', req['tema']),
                    _buildInfoRow('Urgensi', req['urgensi']),
                    _buildInfoRow('Budget Klien', req['estimasi_budget']),
                    SizedBox(height: 16),
                    Text(
                      'Deskripsi:',
                      style: TextStyle(color: textGrey, fontSize: 12),
                    ),
                    SizedBox(height: 4),
                    Container(
                      padding: EdgeInsets.all(12),
                      width: double.infinity,
                      decoration: BoxDecoration(
                        color: bgPrimary,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        req['deskripsi'],
                        style: TextStyle(color: textWhite),
                      ),
                    ),
                    SizedBox(height: 24),
                    Divider(color: textGrey.withOpacity(0.3)),
                    SizedBox(height: 16),

                    // 👇 TOMBOL CHAT KLIEN
                    SizedBox(
                      width: double.infinity,
                      height: 45,
                      child: OutlinedButton.icon(
                        icon: Icon(Icons.chat, color: accentCyan),
                        label: Text(
                          '💬 CHAT KLIEN',
                          style: TextStyle(
                            color: accentCyan,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: accentCyan),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (context) => ChatScreen(
                                orderId: req['id'],
                                judulProject: req['judul_project'],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                    SizedBox(height: 24),

                    Text(
                      'KENDALI ADMIN (BERIKAN PENAWARAN)',
                      style: TextStyle(
                        color: accentPurple,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1.2,
                      ),
                    ),
                    SizedBox(height: 16),

                    TextField(
                      controller: _hargaController,
                      keyboardType: TextInputType.number,
                      style: TextStyle(color: textWhite),
                      decoration: InputDecoration(
                        labelText: 'Harga Tawaran (Rp)',
                        labelStyle: TextStyle(color: textGrey),
                        filled: true,
                        fillColor: bgPrimary,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: textGrey),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: accentCyan),
                        ),
                        prefixIcon: Icon(Icons.attach_money, color: accentCyan),
                      ),
                    ),
                    SizedBox(height: 16),

                    DropdownButtonFormField<String>(
                      value: _statusTerpilih,
                      dropdownColor: bgPrimary,
                      style: TextStyle(color: textWhite),
                      decoration: InputDecoration(
                        labelText: 'Update Status',
                        labelStyle: TextStyle(color: textGrey),
                        filled: true,
                        fillColor: bgPrimary,
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: textGrey),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(color: accentCyan),
                        ),
                      ),
                      items: statusOpsi
                          .map(
                            (s) => DropdownMenuItem(value: s, child: Text(s)),
                          )
                          .toList(),
                      onChanged: (val) =>
                          setStateModal(() => _statusTerpilih = val!),
                    ),
                    SizedBox(height: 16),

                    Text(
                      'Progress: ${_progressValue.toInt()}%',
                      style: TextStyle(
                        color: textWhite,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Slider(
                      value: _progressValue,
                      min: 0,
                      max: 100,
                      divisions: 10,
                      activeColor: accentCyan,
                      inactiveColor: bgPrimary,
                      label: '${_progressValue.toInt()}%',
                      onChanged: (val) =>
                          setStateModal(() => _progressValue = val),
                    ),
                    SizedBox(height: 24),

                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: accentPurple,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        onPressed: () {
                          Navigator.pop(context);
                          _updateRequest(
                            req['id'],
                            _statusTerpilih,
                            _progressValue.toInt(),
                            _hargaController.text,
                          );
                        },
                        child: Text(
                          'UPDATE PROJECT',
                          style: TextStyle(
                            color: textWhite,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.2,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String? value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(label, style: TextStyle(color: textGrey, fontSize: 13)),
          ),
          Text(':', style: TextStyle(color: textGrey, fontSize: 13)),
          SizedBox(width: 8),
          Expanded(
            child: Text(
              value ?? '-',
              style: TextStyle(
                color: textWhite,
                fontSize: 13,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary,
        title: Text(
          'MARKAS ADMIN',
          style: TextStyle(
            color: accentPurple,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        iconTheme: IconThemeData(color: accentPurple),
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentPurple))
          : _allRequests.isEmpty
          ? Center(
              child: Text(
                "Belum ada request masuk, Bos!",
                style: TextStyle(color: textGrey),
              ),
            )
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _allRequests.length,
              itemBuilder: (context, index) {
                final req = _allRequests[index];
                return GestureDetector(
                  onTap: () => _tampilkanDetailRequest(req),
                  child: Container(
                    margin: EdgeInsets.only(bottom: 12),
                    padding: EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: bgSurface,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: accentPurple.withOpacity(0.3)),
                      boxShadow: [
                        BoxShadow(
                          color: accentPurple.withOpacity(0.05),
                          blurRadius: 10,
                        ),
                      ],
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                req['judul_project'],
                                style: TextStyle(
                                  color: textWhite,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16,
                                ),
                                maxLines: 1,
                                overflow: TextOverflow.ellipsis,
                              ),
                              SizedBox(height: 4),
                              Text(
                                '${req['kategori']} • ${req['skala']}',
                                style: TextStyle(color: textGrey, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 6,
                          ),
                          decoration: BoxDecoration(
                            color: accentCyan.withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(
                            (req['status'] ?? 'PENDING')
                                .toString()
                                .toUpperCase(),
                            style: TextStyle(
                              color: accentCyan,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
      // 👇 TOMBOL MASUK KE GUDANG UPLOAD
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => UploadAssetScreen()),
          );
        },
        backgroundColor: accentPurple,
        icon: Icon(Icons.upload_file, color: textWhite),
        label: Text(
          'TAMBAH ASET',
          style: TextStyle(
            color: textWhite,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }
}
