import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'constants.dart';

class LibraryScreen extends StatefulWidget {
  @override
  _LibraryScreenState createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  bool _isLoading = true;
  List<dynamic> _koleksiAset = [];
  bool _isLoggedIn = false;

  @override
  void initState() {
    super.initState();
    _ambilIsiBrankas();
  }

  String _formatRupiah(dynamic hargaAsli) {
    int harga = double.tryParse(hargaAsli.toString())?.toInt() ?? 0;
    String strHarga = harga.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
    return 'Rp $strHarga';
  }

  String _formatTanggal(String? tgl) {
    if (tgl == null || tgl.isEmpty) return '-';
    try {
      DateTime dt = DateTime.parse(tgl).toLocal();
      return '${dt.day.toString().padLeft(2, '0')}-${dt.month.toString().padLeft(2, '0')}-${dt.year}';
    } catch (e) {
      return tgl.split('T')[0];
    }
  }

  Future<void> _ambilIsiBrankas() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    if (userId == 0) {
      setState(() {
        _isLoggedIn = false;
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoggedIn = true);

    try {
      // ✅ FIX: Pakai endpoint /api/orders/library, kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/orders/library'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _koleksiAset = data['data'];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _downloadFile(String? fileUrl) async {
    if (fileUrl == null || fileUrl.isEmpty) {
      _tampilkanPesan(
        'Link file rusak atau tidak ditemukan! 🚨',
        isSuccess: false,
      );
      return;
    }
    final Uri url = Uri.parse('${AppConstants.kBaseUrl}$fileUrl');
    try {
      if (!await launchUrl(url, mode: LaunchMode.externalApplication)) {
        throw Exception('Tidak bisa membuka browser');
      }
    } catch (e) {
      _tampilkanPesan('Gagal mengunduh file.', isSuccess: false);
    }
  }

  void _tampilkanPesan(String pesan, {required bool isSuccess}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          pesan,
          style: TextStyle(
            color: isSuccess ? bgPrimary : Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        backgroundColor: isSuccess ? accentCyan : Colors.redAccent,
        duration: Duration(seconds: 2),
      ),
    );
  }

  Widget _buildLibraryCard(dynamic asset) {
    String namaKarya = asset['nama'] ?? 'Aset Misterius';
    String imageUrlDb = asset['image_url'] ?? '';
    String urlGambarUtama = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/identicon/png?seed=$namaKarya';
    String fileUrl = asset['file_url'] ?? '';

    String orderId = asset['order_id']?.toString() ?? 'TRX-???';
    String tglBeli = asset['tanggal_beli'] ?? '';

    // 👇 MENGAMBIL DATA QTY & TOTAL HARGA ASLI DARI DATABASE
    int qty = asset['qty'] ?? 1;
    String hargaSatuan = _formatRupiah(asset['harga']);
    String totalHarga = asset['total_harga'] != null
        ? _formatRupiah(asset['total_harga'])
        : hargaSatuan;

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textGrey.withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Icon(Icons.storefront, size: 18, color: accentCyan),
                    SizedBox(width: 8),
                    Text(
                      'Volter Store',
                      style: TextStyle(
                        color: textWhite,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                  ],
                ),
                Text(
                  'PESANAN SELESAI',
                  style: TextStyle(
                    color: Colors.greenAccent,
                    fontWeight: FontWeight.bold,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.2), height: 1),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    color: bgPrimary,
                    borderRadius: BorderRadius.circular(8),
                    image: DecorationImage(
                      image: NetworkImage(urlGambarUtama),
                      fit: BoxFit.cover,
                    ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        namaKarya,
                        style: TextStyle(
                          color: textWhite,
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 8),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            'Digital Asset',
                            style: TextStyle(color: textGrey, fontSize: 12),
                          ),
                          // 👇 TEKS x1 SEKARANG DIGANTI MENJADI DINAMIS!
                          Text(
                            'x$qty',
                            style: TextStyle(color: textGrey, fontSize: 12),
                          ),
                        ],
                      ),
                      SizedBox(height: 4),
                      Align(
                        alignment: Alignment.centerRight,
                        child: Text(
                          hargaSatuan, // Ini harga per 1 pcs
                          style: TextStyle(
                            color: accentCyan,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.2), height: 1),

          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Total Pesanan:',
                  style: TextStyle(color: textWhite, fontSize: 13),
                ),
                // 👇 TEKS TOTAL HARGA SEKARANG MEMBACA DARI DATABASE
                Text(
                  totalHarga,
                  style: TextStyle(
                    color: accentCyan,
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.2), height: 1),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'No. Pesanan: $orderId',
                      style: TextStyle(color: textGrey, fontSize: 11),
                    ),
                    SizedBox(height: 4),
                    Text(
                      'Tanggal: ${_formatTanggal(tglBeli)}',
                      style: TextStyle(color: textGrey, fontSize: 11),
                    ),
                  ],
                ),
                ElevatedButton.icon(
                  onPressed: () => _downloadFile(fileUrl),
                  icon: Icon(Icons.download, size: 16, color: bgPrimary),
                  label: Text(
                    'UNDUH FILE',
                    style: TextStyle(
                      color: bgPrimary,
                      fontWeight: FontWeight.bold,
                      fontSize: 12,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentCyan,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                ),
              ],
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
        title: Text(
          'RIWAYAT PESANAN',
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
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentPurple))
          : !_isLoggedIn
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.lock_outline,
                    size: 80,
                    color: textGrey.withOpacity(0.5),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Brankas Terkunci',
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  SizedBox(height: 8),
                  Text(
                    'Login dulu untuk melihat koleksi asetmu.',
                    style: TextStyle(color: textGrey),
                  ),
                ],
              ),
            )
          : _koleksiAset.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.receipt_long,
                    size: 80,
                    color: textGrey.withOpacity(0.5),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Belum Ada Pesanan',
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          : RefreshIndicator(
              color: accentPurple,
              backgroundColor: bgSurface,
              onRefresh: _ambilIsiBrankas,
              child: ListView.builder(
                padding: EdgeInsets.all(16),
                physics: AlwaysScrollableScrollPhysics(),
                itemCount: _koleksiAset.length,
                itemBuilder: (context, index) {
                  return _buildLibraryCard(_koleksiAset[index]);
                },
              ),
            ),
    );
  }
}
