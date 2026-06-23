import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';
import 'login_screen.dart';
import 'cart_screen.dart';

class ProductDetailScreen extends StatefulWidget {
  final dynamic asset;

  ProductDetailScreen({required this.asset});

  @override
  _ProductDetailScreenState createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  bool _isLoading = false;
  bool _isCartLoading = false;
  int _cartCount = 0; // 👇 Tambahan: Variabel untuk simpan jumlah barang

  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  @override
  void initState() {
    super.initState();
    _getCartCount(); // Panggil saat layar pertama dibuka
  }

  // 👇 FUNGSI UNTUK MENGHITUNG ISI KERANJANG
  Future<void> _getCartCount() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;
    if (userId == 0) return;

    try {
      // ✅ FIX: Pakai endpoint tanpa userId di URL, kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/cart'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _cartCount = (data['data'] as List).length;
        });
      }
    } catch (e) {
      print("Error ambil jumlah keranjang: $e");
    }
  }

  double _getHargaAman() {
    return double.tryParse(widget.asset['harga'].toString()) ?? 0.0;
  }

  String _formatRupiah(dynamic hargaAsli) {
    int harga = double.tryParse(hargaAsli.toString())?.toInt() ?? 0;
    String strHarga = harga.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
    return 'Rp $strHarga';
  }

  Future<void> _prosesPembelian() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    if (userId == 0) {
      _usirKeLogin();
      return;
    }

    setState(() => _isLoading = true);

    try {
      final Map<String, dynamic> dataOrder = {
        'asset_id': widget.asset['id'],
      };

      // ✅ FIX: Tambah Authorization header (buyer_id dibaca dari token di backend)
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/orders'),
        headers: headers,
        body: jsonEncode(dataOrder),
      );

      if (response.statusCode == 201) {
        final responseData = jsonDecode(response.body);
        if (responseData['status'] == 'pending') {
          _tampilkanLayarQRISPalsu(userId, _getHargaAman().toInt());
        } else {
          _tampilkanPesan(responseData['message'], isSuccess: true);
          Future.delayed(Duration(seconds: 2), () => Navigator.pop(context));
        }
      } else {
        throw Exception('Gagal memproses transaksi');
      }
    } catch (e) {
      _tampilkanPesan(
        e.toString().replaceAll('Exception: ', ''),
        isSuccess: false,
      );
    } finally {
      setState(() => _isLoading = false);
    }
  }

  void _tampilkanLayarQRISPalsu(int userId, int harga) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        backgroundColor: bgSurface,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Column(
          children: [
            Icon(Icons.qr_code_scanner, size: 80, color: accentCyan),
            SizedBox(height: 16),
            Text(
              'SCAN QRIS VOLTER',
              style: TextStyle(
                color: textWhite,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              padding: EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(Icons.qr_code_2, size: 120, color: Colors.black),
            ),
            SizedBox(height: 24),
            Text('Total Tagihan:', style: TextStyle(color: textGrey)),
            Text(
              _formatRupiah(harga),
              style: TextStyle(
                color: accentCyan,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              Navigator.pop(context);
            },
            child: Text('BAYAR NANTI', style: TextStyle(color: textGrey)),
          ),
          ElevatedButton.icon(
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.greenAccent,
              foregroundColor: bgPrimary,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onPressed: () => _eksekusiSihirLunas(userId),
            icon: Icon(Icons.check_circle_outline),
            label: Text(
              'SIMULASI LUNAS',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _eksekusiSihirLunas(int userId) async {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: Colors.greenAccent)),
    );
    try {
      // ✅ FIX: Pakai endpoint /api/orders/simulasi-bayar (tanpa userId), kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/orders/simulasi-bayar'),
        headers: headers,
      );
      Navigator.pop(context);
      Navigator.pop(context);
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('✅ Pembayaran Berhasil! Brankas Terbuka!'),
          backgroundColor: Colors.greenAccent,
        ),
      );
    } catch (e) {
      Navigator.pop(context);
    }
  }

  Future<void> _tambahKeKeranjang() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    if (userId == 0) {
      _usirKeLogin();
      return;
    }

    setState(() => _isCartLoading = true);

    try {
      // ✅ FIX: Tambah Authorization header (user_id dibaca dari token di backend)
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/cart'),
        headers: headers,
        body: jsonEncode({'asset_id': widget.asset['id']}),
      );

      final responseData = jsonDecode(response.body);

      if (response.statusCode == 201) {
        _tampilkanPesan(responseData['message'], isSuccess: true);
        _getCartCount(); // 👇 Update angka di badge setelah berhasil tambah
      } else {
        _tampilkanPesan(
          responseData['message'] ?? 'Gagal masuk keranjang',
          isSuccess: false,
        );
      }
    } catch (e) {
      _tampilkanPesan('Error server, coba lagi nanti.', isSuccess: false);
    } finally {
      setState(() => _isCartLoading = false);
    }
  }

  void _usirKeLogin() {
    _tampilkanPesan(
      'Eits! Login atau Daftar dulu yuk! 👮‍♂️',
      isSuccess: false,
    );
    Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => LoginScreen()),
    );
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
        behavior: SnackBarBehavior.floating,
        duration: Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    double hargaAman = _getHargaAman();
    bool isFree = widget.asset['is_free'] == 1 || hargaAman == 0.0;
    String namaKarya = widget.asset['nama'] ?? 'Aset Misterius';
    String imageUrlDb = widget.asset['image_url'] ?? '';
    String urlGambarUtama = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/identicon/png?seed=$namaKarya';

    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary,
        elevation: 0,
        title: Text(
          'DETAIL KARYA',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontFamily: 'Poppins',
          ),
        ),
        iconTheme: IconThemeData(color: accentCyan),
        centerTitle: true,
        actions: [
          // 👇 ICON KERANJANG DENGAN BADGE ANGKA
          Badge(
            isLabelVisible: _cartCount > 0,
            label: Text(
              '$_cartCount',
              style: TextStyle(color: Colors.white, fontSize: 10),
            ),
            backgroundColor: Colors.redAccent,
            child: IconButton(
              icon: Icon(Icons.shopping_cart_outlined, color: accentCyan),
              onPressed: () async {
                await Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => CartScreen()),
                );
                _getCartCount(); // Refresh badge saat kembali dari keranjang
              },
            ),
          ),
          SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: double.infinity,
                    height: 250,
                    decoration: BoxDecoration(
                      color: bgSurface,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: accentPurple.withOpacity(0.5),
                        width: 2,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: accentPurple.withOpacity(0.2),
                          blurRadius: 15,
                          spreadRadius: 2,
                        ),
                      ],
                      image: DecorationImage(
                        image: NetworkImage(urlGambarUtama),
                        fit: BoxFit.cover,
                      ),
                    ),
                  ),
                  SizedBox(height: 32),
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          widget.asset['nama'],
                          style: TextStyle(
                            color: textWhite,
                            fontSize: 28,
                            fontWeight: FontWeight.w900,
                            fontFamily: 'Poppins',
                          ),
                        ),
                      ),
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isFree
                              ? Colors.greenAccent.withOpacity(0.1)
                              : accentCyan.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isFree ? Colors.greenAccent : accentCyan,
                          ),
                        ),
                        child: Text(
                          isFree ? 'GRATIS' : _formatRupiah(hargaAman),
                          style: TextStyle(
                            color: isFree ? Colors.greenAccent : accentCyan,
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ],
                  ),
                  SizedBox(height: 24),
                  Text(
                    'DESKRIPSI',
                    style: TextStyle(
                      color: textGrey,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.5,
                    ),
                  ),
                  SizedBox(height: 12),
                  Text(
                    widget.asset['deskripsi'] != null &&
                            widget.asset['deskripsi'].toString().isNotEmpty
                        ? widget.asset['deskripsi']
                        : 'Belum ada deskripsi untuk karya ini.',
                    style: TextStyle(
                      color: textWhite.withOpacity(0.8),
                      fontSize: 16,
                      height: 1.5,
                    ),
                  ),
                  SizedBox(height: 32),
                ],
              ),
            ),
          ),
          Container(
            padding: EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: bgPrimary,
              border: Border(top: BorderSide(color: bgSurface, width: 2)),
            ),
            child: Row(
              children: [
                Container(
                  height: 60,
                  width: 60,
                  decoration: BoxDecoration(
                    color: bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: accentCyan.withOpacity(0.5)),
                  ),
                  child: IconButton(
                    onPressed: _isCartLoading ? null : _tambahKeKeranjang,
                    icon: _isCartLoading
                        ? SizedBox(
                            height: 20,
                            width: 20,
                            child: CircularProgressIndicator(
                              color: accentCyan,
                              strokeWidth: 2,
                            ),
                          )
                        : Icon(
                            Icons.add_shopping_cart,
                            color: accentCyan,
                            size: 28,
                          ),
                  ),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: SizedBox(
                    height: 60,
                    child: ElevatedButton.icon(
                      onPressed: _isLoading ? null : _prosesPembelian,
                      icon: _isLoading
                          ? SizedBox()
                          : Icon(Icons.flash_on, color: bgPrimary),
                      label: _isLoading
                          ? CircularProgressIndicator(color: bgPrimary)
                          : Text(
                              isFree ? 'KLAIM GRATIS' : 'BELI SEKARANG',
                              style: TextStyle(
                                color: bgPrimary,
                                fontSize: 16,
                                fontWeight: FontWeight.w900,
                                letterSpacing: 1.2,
                              ),
                            ),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: isFree
                            ? Colors.greenAccent
                            : accentCyan,
                        elevation: 10,
                        shadowColor: isFree
                            ? Colors.greenAccent.withOpacity(0.5)
                            : accentCyan.withOpacity(0.5),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                      ),
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
}
