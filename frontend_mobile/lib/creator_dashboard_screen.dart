import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'constants.dart';
import 'upload_asset_screen.dart';

class CreatorDashboardScreen extends StatefulWidget {
  @override
  _CreatorDashboardScreenState createState() => _CreatorDashboardScreenState();
}

class _CreatorDashboardScreenState extends State<CreatorDashboardScreen> {
  String _namaUser = 'Creator';
  int? _sellerId;
  List<dynamic> _myAssets = [];
  bool _isLoadingAssets = true;

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
    _loadCreatorData();
  }

  Future<void> _loadCreatorData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _namaUser = prefs.getString('user_nama') ?? 'Creator';
      _sellerId = prefs.getInt('user_id');
    });
    _fetchMyAssets(); // Panggil data karya setelah tau ID-nya
  }

  Future<void> _fetchMyAssets() async {
    if (_sellerId == null) return;
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/assets/seller/$_sellerId'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _myAssets = data['data'];
          _isLoadingAssets = false;
        });
      }
    } catch (e) {
      print('Error fetching my assets: $e');
      setState(() => _isLoadingAssets = false);
    }
  }

  Widget _buildStatCard(
    String title,
    String value,
    IconData icon,
    Color color,
  ) {
    return Container(
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: color.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: color.withOpacity(0.1),
            blurRadius: 10,
            spreadRadius: 1,
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Icon(icon, color: color, size: 28),
              Text(
                title,
                style: TextStyle(
                  color: textGrey,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
          SizedBox(height: 16),
          Text(
            value,
            style: TextStyle(
              color: textWhite,
              fontSize: 22,
              fontWeight: FontWeight.w900,
              fontFamily: 'Poppins',
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
        elevation: 0,
        title: Text(
          'WORKSPACE',
          style: TextStyle(
            color: accentCyan,
            fontFamily: 'Poppins',
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        iconTheme: IconThemeData(color: accentCyan),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Welcome back,',
              style: TextStyle(color: textGrey, fontSize: 16),
            ),
            Text(
              '$_namaUser! 🛠️',
              style: TextStyle(
                color: textWhite,
                fontSize: 28,
                fontWeight: FontWeight.bold,
                fontFamily: 'Poppins',
              ),
            ),
            SizedBox(height: 32),

            GridView.count(
              crossAxisCount: 2,
              crossAxisSpacing: 16,
              mainAxisSpacing: 16,
              shrinkWrap: true,
              physics: NeverScrollableScrollPhysics(),
              children: [
                _buildStatCard(
                  'TOTAL ASET',
                  '${_myAssets.length}',
                  Icons.inventory_2,
                  accentCyan,
                ), // <-- Update dinamis!
                _buildStatCard(
                  'TERJUAL',
                  '0x',
                  Icons.shopping_cart_checkout,
                  accentPurple,
                ),
                _buildStatCard(
                  'PENDAPATAN',
                  'Rp 0',
                  Icons.account_balance_wallet,
                  Colors.greenAccent,
                ),
                _buildStatCard(
                  'RATING',
                  '0.0 ⭐',
                  Icons.star,
                  Colors.yellowAccent,
                ),
              ],
            ),
            SizedBox(height: 40),

            SizedBox(
              width: double.infinity,
              height: 60,
              child: ElevatedButton.icon(
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => UploadAssetScreen(),
                    ),
                  ).then((value) {
                    if (value == true) {
                      _fetchMyAssets(); // Refresh otomatis kalau habis upload!
                    }
                  });
                },
                icon: Icon(Icons.cloud_upload, color: bgPrimary, size: 28),
                label: Text(
                  'UPLOAD ASET BARU',
                  style: TextStyle(
                    color: bgPrimary,
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 1.5,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  elevation: 15,
                  shadowColor: accentCyan.withOpacity(0.5),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ),
            ),
            SizedBox(height: 32),

            Text(
              'KARYA SAYA',
              style: TextStyle(
                color: textGrey,
                fontWeight: FontWeight.bold,
                letterSpacing: 1.5,
              ),
            ),
            SizedBox(height: 16),

            // 👇 BAGIAN INI YANG KITA UBAH JADI DINAMIS 👇
            _isLoadingAssets
                ? Center(child: CircularProgressIndicator(color: accentCyan))
                : _myAssets.isEmpty
                ? Container(
                    width: double.infinity,
                    padding: EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: bgSurface.withOpacity(0.5),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: textGrey.withOpacity(0.2)),
                    ),
                    child: Column(
                      children: [
                        Icon(
                          Icons.architecture,
                          size: 48,
                          color: textGrey.withOpacity(0.5),
                        ),
                        SizedBox(height: 16),
                        Text(
                          'Belum ada karya yang diunggah.',
                          style: TextStyle(color: textGrey),
                        ),
                      ],
                    ),
                  )
                : ListView.builder(
                    shrinkWrap: true,
                    physics: NeverScrollableScrollPhysics(),
                    itemCount: _myAssets.length,
                    itemBuilder: (context, index) {
                      final asset = _myAssets[index];
                      return Container(
                        margin: EdgeInsets.only(bottom: 12),
                        decoration: BoxDecoration(
                          color: bgSurface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: accentPurple.withOpacity(0.3),
                          ),
                        ),
                        child: ListTile(
                          leading: Icon(Icons.gamepad, color: accentCyan),
                          title: Text(
                            asset['nama'],
                            style: TextStyle(
                              color: textWhite,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          subtitle: Text(
                            asset['is_free'] == 1
                                ? 'GRATIS'
                                : 'Rp ${asset['harga']}',
                            style: TextStyle(color: Colors.greenAccent),
                          ),
                          trailing: Icon(
                            Icons.arrow_forward_ios,
                            color: textGrey,
                            size: 16,
                          ),
                        ),
                      );
                    },
                  ),
          ],
        ),
      ),
    );
  }
}
