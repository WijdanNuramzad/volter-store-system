import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class CartScreen extends StatefulWidget {
  @override
  _CartScreenState createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  List<Map<String, dynamic>> _cartItems = [];
  bool _isLoading = true;
  int _totalHarga = 0;
  bool _isPilihSemua = false;

  @override
  void initState() {
    super.initState();
    _ambilIsiKeranjang();
  }

  String _formatRupiah(dynamic hargaAsli) {
    int harga = double.tryParse(hargaAsli.toString())?.toInt() ?? 0;
    String strHarga = harga.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
    return 'Rp $strHarga';
  }

  Future<void> _ambilIsiKeranjang() async {
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
          // 👇 Kita modifikasi datanya: Tambahkan status Centang & Kuantitas awal
          _cartItems = (data['data'] as List).map((item) {
            return Map<String, dynamic>.from(item)..addAll({
              'isSelected': false,
              'qty': 1, // Default kuantitas 1
            });
          }).toList();

          _hitungTotal();
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  // 👇 KALKULATOR CERDAS: Hanya hitung yang dicentang!
  void _hitungTotal() {
    int total = 0;
    bool allSelected = _cartItems.isNotEmpty;

    for (var item in _cartItems) {
      if (item['isSelected'] == true) {
        int harga = double.tryParse(item['harga'].toString())?.toInt() ?? 0;
        int qty = item['qty'] as int;
        total += (harga * qty);
      } else {
        allSelected =
            false; // Jika ada 1 yang tidak dicentang, matikan "Pilih Semua"
      }
    }

    setState(() {
      _totalHarga = total;
      _isPilihSemua = allSelected && _cartItems.isNotEmpty;
    });
  }

  // Aksi Centang 1 Item
  void _toggleCentangItem(int index, bool? value) {
    setState(() {
      _cartItems[index]['isSelected'] = value ?? false;
      _hitungTotal();
    });
  }

  // Aksi Centang "Pilih Semua"
  void _togglePilihSemua(bool? value) {
    setState(() {
      _isPilihSemua = value ?? false;
      for (var item in _cartItems) {
        item['isSelected'] = _isPilihSemua;
      }
      _hitungTotal();
    });
  }

  // Aksi Tombol Plus Minus
  void _ubahKuantitas(int index, int delta) {
    setState(() {
      int currentQty = _cartItems[index]['qty'];
      if (currentQty + delta > 0) {
        _cartItems[index]['qty'] = currentQty + delta;
        _hitungTotal(); // Hitung ulang totalnya
      }
    });
  }

  Future<void> _hapusItem(int cartId) async {
    try {
      // ✅ FIX: Tambah Authorization header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.delete(
        Uri.parse('${AppConstants.kBaseUrl}/api/cart/$cartId'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        _ambilIsiKeranjang();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Barang dibuang! 🗑️'),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {}
  }

  void _prosesCheckout() {
    // Cek apakah ada barang yang dicentang
    bool adaYangDicentang = _cartItems.any(
      (item) => item['isSelected'] == true,
    );

    if (!adaYangDicentang) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Pilih minimal 1 barang dulu, Bos! 🛒'),
          backgroundColor: Colors.orangeAccent,
        ),
      );
      return;
    }
    _tampilkanSukses();
  }

  Future<void> _tampilkanSukses() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;
    if (userId == 0) return;

    // 👇 LOGIKA BARU: Saring hanya barang yang dicentang untuk dikirim ke Backend
    List<Map<String, dynamic>> barangDicentang = _cartItems
        .where((item) => item['isSelected'] == true)
        .toList();

    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) =>
          Center(child: CircularProgressIndicator(color: accentCyan)),
    );

    try {
      // ✅ FIX: Pakai endpoint /api/cart/checkout (tanpa userId), kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/cart/checkout'),
        headers: headers,
        body: jsonEncode({'items': barangDicentang}),
      );
      Navigator.pop(context);

      if (response.statusCode == 200 || response.statusCode == 201) {
        _tampilkanLayarQRISPalsu(userId);
      } else {
        throw Exception('Gagal Checkout');
      }
    } catch (e) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Error jaringan / Server menolak!'),
          backgroundColor: Colors.redAccent,
        ),
      );
    }
  }

  void _tampilkanLayarQRISPalsu(int userId) {
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
              _formatRupiah(_totalHarga), // Sesuai dengan yang dicentang
              style: TextStyle(
                color: accentCyan,
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 16),
            Text(
              '(Mode Demo: Tekan tombol di bawah untuk simulasi pembayaran lunas)',
              textAlign: TextAlign.center,
              style: TextStyle(
                color: Colors.orangeAccent,
                fontSize: 12,
                fontStyle: FontStyle.italic,
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

      _ambilIsiKeranjang(); // Refresh setelah lunas

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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        title: Text(
          'KERANJANG SAYA',
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
          ? Center(child: CircularProgressIndicator(color: accentCyan))
          : _cartItems.isEmpty
          ? _buildEmptyCart()
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    padding: EdgeInsets.all(16),
                    itemCount: _cartItems.length,
                    itemBuilder: (context, index) => _buildCartItem(index),
                  ),
                ),
                _buildCheckoutSection(),
              ],
            ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.shopping_basket_outlined,
            size: 100,
            color: textGrey.withOpacity(0.3),
          ),
          SizedBox(height: 16),
          Text(
            'Keranjang masih kosong, Bos!',
            style: TextStyle(color: textGrey, fontSize: 18),
          ),
        ],
      ),
    );
  }

  Widget _buildCartItem(int index) {
    var item = _cartItems[index];
    String namaKarya = item['nama'] ?? 'Aset Misterius';
    String imageUrlDb = item['image_url'] ?? '';
    String urlGambarUtama = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/identicon/png?seed=$namaKarya';

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      padding: EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: item['isSelected']
              ? accentCyan
              : accentPurple.withOpacity(0.3),
          width: item['isSelected'] ? 2 : 1,
        ),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          // 👇 CHECKBOX ITEM
          Checkbox(
            value: item['isSelected'],
            activeColor: accentCyan,
            checkColor: bgPrimary,
            side: BorderSide(color: textGrey),
            onChanged: (value) => _toggleCentangItem(index, value),
          ),

          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: bgPrimary,
              borderRadius: BorderRadius.circular(12),
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
                  item['nama'],
                  style: TextStyle(
                    color: textWhite,
                    fontWeight: FontWeight.bold,
                    fontSize: 15,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                SizedBox(height: 4),
                Text(
                  _formatRupiah(item['harga']),
                  style: TextStyle(
                    color: accentCyan,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                SizedBox(height: 12),

                // 👇 TOMBOL PLUS MINUS QTY
                Row(
                  children: [
                    _buildQtyBtn(
                      icon: Icons.remove,
                      onTap: () => _ubahKuantitas(index, -1),
                    ),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 12),
                      child: Text(
                        '${item['qty']}',
                        style: TextStyle(
                          color: textWhite,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    _buildQtyBtn(
                      icon: Icons.add,
                      onTap: () => _ubahKuantitas(index, 1),
                    ),
                  ],
                ),
              ],
            ),
          ),

          // Tombol Hapus Pojok
          IconButton(
            onPressed: () => _hapusItem(item['cart_id']),
            icon: Icon(Icons.delete_outline, color: Colors.redAccent),
          ),
        ],
      ),
    );
  }

  Widget _buildQtyBtn({required IconData icon, required VoidCallback onTap}) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(4),
      child: Container(
        padding: EdgeInsets.all(4),
        decoration: BoxDecoration(
          border: Border.all(color: textGrey.withOpacity(0.5)),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Icon(icon, size: 16, color: textWhite),
      ),
    );
  }

  Widget _buildCheckoutSection() {
    return Container(
      padding: EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.5),
            blurRadius: 10,
            offset: Offset(0, -2),
          ),
        ],
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 👇 CHECKBOX PILIH SEMUA
              Row(
                children: [
                  Checkbox(
                    value: _isPilihSemua,
                    activeColor: accentCyan,
                    checkColor: bgPrimary,
                    side: BorderSide(color: textGrey),
                    onChanged: _togglePilihSemua,
                  ),
                  Text('Pilih Semua', style: TextStyle(color: textWhite)),
                ],
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    'Total Tagihan',
                    style: TextStyle(color: textGrey, fontSize: 12),
                  ),
                  Text(
                    _formatRupiah(_totalHarga),
                    style: TextStyle(
                      color: accentCyan,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ],
          ),
          SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 50,
            child: ElevatedButton(
              onPressed: _totalHarga > 0
                  ? _prosesCheckout
                  : () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(
                          content: Text('Pilih barangnya dulu dong! 🛒'),
                          backgroundColor: Colors.orangeAccent,
                        ),
                      );
                    },
              style: ElevatedButton.styleFrom(
                backgroundColor: _totalHarga > 0
                    ? accentCyan
                    : textGrey.withOpacity(0.5),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              child: Text(
                'CHECKOUT SEKARANG',
                style: TextStyle(
                  color: _totalHarga > 0
                      ? bgPrimary
                      : textWhite.withOpacity(0.5),
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  letterSpacing: 1.5,
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
