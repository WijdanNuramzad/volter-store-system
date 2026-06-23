import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class TransactionHistoryScreen extends StatefulWidget {
  @override
  _TransactionHistoryScreenState createState() =>
      _TransactionHistoryScreenState();
}

class _TransactionHistoryScreenState extends State<TransactionHistoryScreen> {
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);
  final Color accentPurple = const Color(0xFF8B5CF6);

  List<dynamic> _riwayatList = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchRiwayat();
  }

  Future<void> _fetchRiwayat() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    if (userId == 0) return;

    try {
      // ✅ FIX: Pakai endpoint /api/orders/riwayat (tanpa userId), kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/orders/riwayat'),
        headers: headers,
      );

      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _riwayatList = data['data'];
        });
      }
    } catch (e) {
      print('Sinyal radar terputus: $e');
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
          'RIWAYAT TRANSAKSI',
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
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentCyan))
          : _riwayatList.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _riwayatList.length,
              itemBuilder: (context, index) {
                final item = _riwayatList[index];
                return _buildTransactionCard(item);
              },
            ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.receipt_long, size: 80, color: textGrey.withOpacity(0.5)),
          SizedBox(height: 16),
          Text(
            'Belum Ada Transaksi',
            style: TextStyle(
              color: textWhite,
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Kamu belum pernah membeli map/aset apapun.',
            style: TextStyle(color: textGrey),
          ),
        ],
      ),
    );
  }

  Widget _buildTransactionCard(dynamic item) {
    // Logika warna status
    Color statusColor = textGrey;
    String statusText = item['status'] ?? 'Unknown';
    if (statusText.toLowerCase() == 'selesai' ||
        statusText.toLowerCase() == 'success')
      statusColor = Colors.greenAccent;
    if (statusText.toLowerCase() == 'pending')
      statusColor = Colors.orangeAccent;
    if (statusText.toLowerCase() == 'batal') statusColor = Colors.redAccent;

    // Format tanggal (opsional jika dari MySQL formatnya string ISO)
    String tanggal = item['tanggal_transaksi'] != null
        ? item['tanggal_transaksi'].toString().substring(0, 10)
        : 'Tanggal tidak diketahui';

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: accentCyan.withOpacity(0.2)),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  tanggal,
                  style: TextStyle(
                    color: textGrey,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Container(
                  padding: EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: statusColor.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(color: statusColor.withOpacity(0.5)),
                  ),
                  child: Text(
                    statusText.toUpperCase(),
                    style: TextStyle(
                      color: statusColor,
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
            SizedBox(height: 12),
            Row(
              children: [
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: bgPrimary,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(Icons.inventory_2, color: accentPurple),
                ),
                SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        item['nama_aset'] ?? 'Aset Volter',
                        style: TextStyle(
                          color: textWhite,
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      SizedBox(height: 4),
                      Text(
                        'Rp ${item['total_harga'] ?? 0}',
                        style: TextStyle(
                          color: accentCyan,
                          fontSize: 14,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
