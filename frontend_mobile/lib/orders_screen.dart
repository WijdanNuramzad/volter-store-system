import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class OrdersScreen extends StatefulWidget {
  @override
  _OrdersScreenState createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  bool _isLoading = true;
  List<dynamic> _myOrders = [];

  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  @override
  void initState() {
    super.initState();
    _fetchMyOrders();
  }

  // 👇 INI FUNGSI YANG SUDAH DIPASANG RADAR PENYADAP 👇
  Future<void> _fetchMyOrders() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final int userId = prefs.getInt('user_id') ?? 0;

      print("RADAR 1: User ID yang sedang login adalah = $userId");

      if (userId == 0) {
        print("RADAR 2: User belum login / ID tidak ditemukan!");
        setState(() => _isLoading = false);
        return;
      }

      final url = '${AppConstants.kBaseUrl}/api/orders/buyer/$userId';
      print("RADAR 3: Menghubungi URL = $url");

      final response = await http.get(Uri.parse(url));

      print("RADAR 4: Status Code = ${response.statusCode}");
      print("RADAR 5: Isi balasan = ${response.body}");

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _myOrders = data['data'];
          _isLoading = false;
        });
        print("RADAR 6: Sukses memasukkan ${_myOrders.length} data ke layar!");
      } else {
        print("RADAR 7: Server menolak ngasih data.");
        setState(() => _isLoading = false);
      }
    } catch (e) {
      print("🚨 RADAR ERROR CRASH: $e");
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
          'BRANKAS KARYA',
          style: TextStyle(
            color: accentCyan,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
            fontFamily: 'Poppins',
          ),
        ),
        centerTitle: true,
        automaticallyImplyLeading: false,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentCyan))
          : _myOrders.isEmpty
          ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.inventory_2,
                    size: 80,
                    color: textGrey.withOpacity(0.5),
                  ),
                  SizedBox(height: 16),
                  Text(
                    'Brankas masih kosong.',
                    style: TextStyle(color: textGrey, fontSize: 16),
                  ),
                  Text(
                    'Ayo hunting karya dulu! 🛒',
                    style: TextStyle(
                      color: accentCyan,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            )
          : ListView.builder(
              padding: EdgeInsets.all(24),
              itemCount: _myOrders.length,
              itemBuilder: (context, index) {
                final order = _myOrders[index];
                final bool isFree =
                    order['is_free'] == 1 || order['harga'] == 0;

                return Container(
                  margin: EdgeInsets.only(bottom: 16),
                  decoration: BoxDecoration(
                    color: bgSurface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: accentPurple.withOpacity(0.3)),
                    boxShadow: [
                      BoxShadow(
                        color: bgPrimary,
                        blurRadius: 10,
                        offset: Offset(0, 5),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Expanded(
                              child: Text(
                                order['nama'],
                                style: TextStyle(
                                  color: textWhite,
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                  fontFamily: 'Poppins',
                                ),
                              ),
                            ),
                            Container(
                              padding: EdgeInsets.symmetric(
                                horizontal: 8,
                                vertical: 4,
                              ),
                              decoration: BoxDecoration(
                                color: isFree
                                    ? Colors.greenAccent.withOpacity(0.1)
                                    : accentCyan.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                isFree ? 'GRATIS' : 'Rp ${order['harga']}',
                                style: TextStyle(
                                  color: isFree
                                      ? Colors.greenAccent
                                      : accentCyan,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 8),
                        Text(
                          'Dari Kreator ID: ${order['seller_id']}',
                          style: TextStyle(color: textGrey, fontSize: 12),
                        ),
                        SizedBox(height: 16),

                        SizedBox(
                          width: double.infinity,
                          height: 45,
                          child: ElevatedButton.icon(
                            onPressed: () {
                              ScaffoldMessenger.of(context).showSnackBar(
                                SnackBar(
                                  content: Text(
                                    'Mengakses Link: ${order['link_file']}',
                                    style: TextStyle(
                                      color: bgPrimary,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  backgroundColor: accentCyan,
                                  behavior: SnackBarBehavior.floating,
                                  duration: Duration(seconds: 4),
                                ),
                              );
                            },
                            icon: Icon(Icons.cloud_download, color: bgPrimary),
                            label: Text(
                              'DOWNLOAD ASET',
                              style: TextStyle(
                                color: bgPrimary,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 1.2,
                              ),
                            ),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: accentCyan,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
    );
  }
}
