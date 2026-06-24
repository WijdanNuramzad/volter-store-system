import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'constants.dart';
import 'login_screen.dart';

class LibraryScreen extends StatefulWidget {
  @override
  _LibraryScreenState createState() => _LibraryScreenState();
}

class _LibraryScreenState extends State<LibraryScreen> with SingleTickerProviderStateMixin {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color accentGreen = const Color(0xFF22C55E);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  bool _isLoading = true;
  List<dynamic> _koleksiAset = [];
  List<dynamic> _koleksiOrder = [];
  bool _isLoggedIn = false;
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _ambilIsiBrankas();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
      final headers = await AppConstants.getAuthHeaders();

      // Fetch library (aset digital)
      final resLibrary = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/orders/library'),
        headers: headers,
      );

      // Fetch custom orders
      final resOrders = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/my-orders'),
        headers: headers,
      );

      setState(() {
        if (resLibrary.statusCode == 200) {
          final data = jsonDecode(resLibrary.body);
          _koleksiAset = data['data'] ?? [];
        }
        if (resOrders.statusCode == 200) {
          final data = jsonDecode(resOrders.body);
          _koleksiOrder = data['data'] ?? data ?? [];
        }
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _downloadFile(String? fileUrl) async {
    if (fileUrl == null || fileUrl.isEmpty) {
      _tampilkanPesan('Link file rusak atau tidak ditemukan! 🚨', isSuccess: false);
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
        content: Text(pesan, style: TextStyle(color: isSuccess ? bgPrimary : Colors.white, fontWeight: FontWeight.bold)),
        backgroundColor: isSuccess ? accentCyan : Colors.redAccent,
        duration: Duration(seconds: 2),
      ),
    );
  }

  // ── Helper: Feature hint row ──
  Widget _buildFeatureHint(IconData icon, String label, String desc) {
    return Container(
      margin: EdgeInsets.only(bottom: 10),
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: textGrey.withOpacity(0.15)),
      ),
      child: Row(
        children: [
          Container(
            width: 40, height: 40,
            decoration: BoxDecoration(
              color: accentCyan.withOpacity(0.1),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, color: accentCyan, size: 20),
          ),
          SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 13)),
              Text(desc, style: TextStyle(color: textGrey, fontSize: 11)),
            ],
          ),
        ],
      ),
    );
  }

  // ── Kartu Aset Digital ──
  Widget _buildLibraryCard(dynamic asset) {
    String namaKarya = asset['nama'] ?? 'Aset Misterius';
    String imageUrlDb = asset['image_url'] ?? '';
    String urlGambarUtama = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/identicon/png?seed=$namaKarya';
    String fileUrl = asset['file_url'] ?? '';
    String orderId = asset['order_id']?.toString() ?? 'TRX-???';
    String tglBeli = asset['tanggal_beli'] ?? '';
    int qty = asset['qty'] ?? 1;
    String hargaSatuan = _formatRupiah(asset['harga']);
    double totalHargaDb = double.tryParse(asset['total_harga']?.toString() ?? '0') ?? 0;
    String totalHarga = totalHargaDb > 0 ? _formatRupiah(totalHargaDb) : hargaSatuan;

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: accentGreen.withOpacity(0.25)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(children: [
                  Icon(Icons.storefront, size: 18, color: accentCyan),
                  SizedBox(width: 8),
                  Text('Volter Store', style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 14)),
                ]),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: accentGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(color: accentGreen.withOpacity(0.4)),
                  ),
                  child: Text('✓ SELESAI', style: TextStyle(color: accentGreen, fontWeight: FontWeight.bold, fontSize: 11)),
                ),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.15), height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: Image.network(
                    urlGambarUtama,
                    width: 80, height: 80, fit: BoxFit.cover,
                    errorBuilder: (c, e, s) => Container(
                      width: 80, height: 80, color: bgPrimary,
                      child: Icon(Icons.broken_image, color: textGrey),
                    ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(namaKarya, style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 15), maxLines: 2, overflow: TextOverflow.ellipsis),
                    SizedBox(height: 6),
                    Text('Digital Asset · x$qty', style: TextStyle(color: textGrey, fontSize: 12)),
                    SizedBox(height: 4),
                    Text(hargaSatuan, style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, fontSize: 14)),
                  ],
                )),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.15), height: 1),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Total Pesanan:', style: TextStyle(color: textGrey, fontSize: 13)),
                Text(totalHarga, style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, fontSize: 15)),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.15), height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text('No. Pesanan: $orderId', style: TextStyle(color: textGrey, fontSize: 11)),
                  SizedBox(height: 4),
                  Text('Tanggal: ${_formatTanggal(tglBeli)}', style: TextStyle(color: textGrey, fontSize: 11)),
                ]),
                ElevatedButton.icon(
                  onPressed: () => _downloadFile(fileUrl),
                  icon: Icon(Icons.download, size: 16, color: bgPrimary),
                  label: Text('UNDUH', style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentCyan,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                    padding: EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    elevation: 0,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── Kartu Custom Order ──
  Widget _buildOrderCard(dynamic order) {
    final String status = order['status'] ?? 'Menunggu';
    final int progress = order['progress'] ?? 0;
    final double harga = double.tryParse(order['harga_tawaran']?.toString() ?? '0') ?? 0;
    final bool isHargaDeal = harga > 0;

    Color statusColor;
    if (status.toLowerCase().contains('selesai')) {
      statusColor = accentGreen;
    } else if (status.toLowerCase().contains('progress') || status.toLowerCase().contains('proses')) {
      statusColor = accentCyan;
    } else if (status.toLowerCase().contains('pembayaran') || status.toLowerCase().contains('quotation')) {
      statusColor = accentPurple;
    } else {
      statusColor = const Color(0xFFF59E0B);
    }

    return Container(
      margin: EdgeInsets.only(bottom: 14),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: statusColor.withOpacity(0.3)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(order['judul_project'] ?? 'Project Custom', style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 15), maxLines: 2, overflow: TextOverflow.ellipsis),
                    SizedBox(height: 4),
                    Text('${order['kategori'] ?? '-'} · ${order['platform'] ?? 'Roblox Studio'}', style: TextStyle(color: textGrey, fontSize: 12)),
                  ],
                ),
              ),
              SizedBox(width: 8),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: statusColor.withOpacity(0.4)),
                ),
                child: Text(status.toUpperCase(), style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 10, letterSpacing: 0.5)),
              ),
            ],
          ),
          SizedBox(height: 14),
          // Progress Bar
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Progress Pengerjaan', style: TextStyle(color: textGrey, fontSize: 12)),
              Text('$progress%', style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, fontSize: 12)),
            ],
          ),
          SizedBox(height: 6),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: progress / 100,
              backgroundColor: bgPrimary,
              valueColor: AlwaysStoppedAnimation<Color>(accentCyan),
              minHeight: 8,
            ),
          ),
          SizedBox(height: 14),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('Harga Deal', style: TextStyle(color: textGrey, fontSize: 11)),
                Text(
                  isHargaDeal ? _formatRupiah(harga) : 'Tunggu Penawaran',
                  style: TextStyle(color: isHargaDeal ? accentPurple : textGrey, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ]),
            ],
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return Scaffold(
        backgroundColor: bgPrimary,
        body: Center(child: CircularProgressIndicator(color: accentCyan)),
      );
    }

    if (!_isLoggedIn) {
      return Scaffold(
        backgroundColor: bgPrimary,
        appBar: AppBar(
          title: Text('🔐 BRANKAS DIGITAL', style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, letterSpacing: 1.2, fontFamily: 'Poppins')),
          backgroundColor: bgPrimary, elevation: 0, centerTitle: true,
        ),
        body: SingleChildScrollView(
          padding: EdgeInsets.all(24),
          child: Column(
            children: [
              SizedBox(height: 32),
              Container(
                width: 100, height: 100,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: LinearGradient(colors: [accentCyan.withOpacity(0.15), accentPurple.withOpacity(0.15)]),
                  border: Border.all(color: accentCyan.withOpacity(0.3), width: 1.5),
                ),
                child: Icon(Icons.lock_outline_rounded, size: 48, color: accentCyan),
              ),
              SizedBox(height: 24),
              Text('Brankas Digital', style: TextStyle(color: textWhite, fontSize: 22, fontWeight: FontWeight.bold, fontFamily: 'Poppins')),
              SizedBox(height: 10),
              Text(
                'Masuk untuk membuka brankas dan melihat semua aset digital & riwayat custom order kamu.',
                textAlign: TextAlign.center,
                style: TextStyle(color: textGrey, fontSize: 14, height: 1.6),
              ),
              SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: () => Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => LoginScreen()),
                  ).then((_) {
                    setState(() => _isLoading = true);
                    _ambilIsiBrankas();
                  }),
                  icon: Icon(Icons.login_rounded, color: bgPrimary),
                  label: Text('Masuk Sekarang', style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold, fontSize: 15)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: accentCyan,
                    padding: EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                ),
              ),
              SizedBox(height: 32),
              Align(
                alignment: Alignment.centerLeft,
                child: Text('Apa yang ada di Brankas?', style: TextStyle(color: textGrey, fontSize: 13, fontWeight: FontWeight.bold, letterSpacing: 0.5)),
              ),
              SizedBox(height: 12),
              _buildFeatureHint(Icons.inventory_2_outlined, 'Aset Digital Saya', 'Semua aset yang sudah kamu beli'),
              _buildFeatureHint(Icons.receipt_long_outlined, 'Riwayat Custom Order', 'Status dan progress pesanan custom'),
              _buildFeatureHint(Icons.download_rounded, 'Download File', 'Unduh file aset kapan saja'),
              SizedBox(height: 24),
            ],
          ),
        ),
      );
    }

    // === USER LOGGED IN: Tab View ===
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        title: Text('🔐 BRANKAS DIGITAL', style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, letterSpacing: 1.2, fontFamily: 'Poppins')),
        backgroundColor: bgPrimary, elevation: 0, centerTitle: true,
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: accentCyan,
          indicatorWeight: 2,
          labelColor: accentCyan,
          unselectedLabelColor: textGrey,
          tabs: [
            Tab(text: '📦 Aset Saya'),
            Tab(text: '📋 Custom Order'),
          ],
        ),
      ),
      body: RefreshIndicator(
        color: accentCyan,
        backgroundColor: bgSurface,
        onRefresh: _ambilIsiBrankas,
        child: TabBarView(
          controller: _tabController,
          children: [
            // TAB 1: ASET DIGITAL
            _koleksiAset.isEmpty
                ? Center(
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.inventory_2_outlined, size: 72, color: textGrey.withOpacity(0.4)),
                      SizedBox(height: 16),
                      Text('Brankas masih kosong', style: TextStyle(color: textWhite, fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Beli aset dari etalase untuk menyimpannya di sini', style: TextStyle(color: textGrey, fontSize: 13), textAlign: TextAlign.center),
                    ]),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    physics: AlwaysScrollableScrollPhysics(),
                    itemCount: _koleksiAset.length,
                    itemBuilder: (context, index) => _buildLibraryCard(_koleksiAset[index]),
                  ),

            // TAB 2: CUSTOM ORDER
            _koleksiOrder.isEmpty
                ? Center(
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.receipt_long_outlined, size: 72, color: textGrey.withOpacity(0.4)),
                      SizedBox(height: 16),
                      Text('Belum ada request', style: TextStyle(color: textWhite, fontSize: 18, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      Text('Buat request custom order untuk memulai!', style: TextStyle(color: textGrey, fontSize: 13)),
                    ]),
                  )
                : ListView.builder(
                    padding: EdgeInsets.all(16),
                    physics: AlwaysScrollableScrollPhysics(),
                    itemCount: _koleksiOrder.length,
                    itemBuilder: (context, index) => _buildOrderCard(_koleksiOrder[index]),
                  ),
          ],
        ),
      ),
    );
  }

}
