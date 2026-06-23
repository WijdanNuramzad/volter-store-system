import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'constants.dart';
import 'product_detail_screen.dart';
import 'login_screen.dart';
import 'library_screen.dart';
import 'admin_panel_screen.dart';
import 'cart_screen.dart';
import 'custom_order_screen.dart';
import 'profile_screen.dart';

class HomeScreen extends StatefulWidget {
  @override
  _HomeScreenState createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  List<dynamic> _assets = [];
  List<dynamic> _filteredAssets = [];
  final TextEditingController _searchController = TextEditingController();

  bool _isLoading = true;
  String _namaUser = 'Tamu Spesial';
  String _userRole = 'guest';
  int _selectedIndex = 0;

  int _jumlahKeranjang = 0;

  final List<String> _kategoriList = [
    'Semua',
    'Map',
    'Script',
    '3D Model',
    'Audio',
  ];
  String _kategoriTerpilih = 'Semua';

  @override
  void initState() {
    super.initState();
    _siapkanData();
  }

  Future<void> _siapkanData() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _namaUser = prefs.getString('user_nama') ?? 'Tamu Spesial';
      _userRole = prefs.getString('user_role') ?? 'guest';
    });
    await _ambilDataKatalog();
    await _ambilJumlahKeranjang();
  }

  Future<void> _refreshBeranda() async {
    await _ambilDataKatalog();
    await _ambilJumlahKeranjang();
  }

  Future<void> _ambilJumlahKeranjang() async {
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
          _jumlahKeranjang = data['data'].length;
        });
      }
    } catch (e) {
      print('Error keranjang: $e');
    }
  }

  Future<void> _ambilDataKatalog() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/assets'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _assets = data['data'];
          _filteredAssets = List.from(_assets);
          _isLoading = false;
        });
        _jalankanFilter();
      }
    } catch (e) {
      print('Error: $e');
      setState(() => _isLoading = false);
    }
  }

  void _jalankanFilter() {
    String keyword = _searchController.text.toLowerCase();
    setState(() {
      _filteredAssets = _assets.where((asset) {
        String namaAsset = asset['nama'].toString().toLowerCase();
        bool masukPencarian = namaAsset.contains(keyword);
        bool masukKategori = true;
        if (_kategoriTerpilih != 'Semua') {
          masukKategori = namaAsset.contains(_kategoriTerpilih.toLowerCase());
        }
        return masukPencarian && masukKategori;
      }).toList();
    });
  }

  void _onItemTapped(int index) {
    setState(() => _selectedIndex = index);
    if (index == 0) _ambilJumlahKeranjang();
  }

  String _formatRupiah(dynamic hargaAsli) {
    int harga = int.tryParse(hargaAsli.toString().split('.')[0]) ?? 0;
    String strHarga = harga.toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]}.',
    );
    return 'Rp $strHarga';
  }

  // --- DESAIN KARTU PRODUK (SUDAH DIROMBAK BACA GAMBAR ASLI 🖼️) ---
  Widget _buildAssetCard(dynamic asset) {
    bool isFree =
        asset['is_free'] == 1 ||
        asset['harga'] == 0 ||
        asset['harga'] == "0.00";
    String namaKarya = asset['nama'] ?? 'Aset Misterius';

    // 👇 LOGIKA PINTAR: Ambil URL Gambar dari Database
    String imageUrlDb = asset['image_url'] ?? '';
    String urlGambarUtama = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/identicon/png?seed=$namaKarya';

    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => ProductDetailScreen(asset: asset),
          ),
        ).then((_) => _ambilJumlahKeranjang());
      },
      child: Container(
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: accentCyan.withOpacity(0.3), width: 1),
          boxShadow: [
            BoxShadow(
              color: accentCyan.withOpacity(0.05),
              blurRadius: 10,
              spreadRadius: 1,
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Container(
                width: double.infinity,
                decoration: BoxDecoration(
                  color: bgPrimary,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                  // 👇 GAMBARNYA SEKARANG DITARIK DARI NODE.JS
                  image: DecorationImage(
                    image: NetworkImage(urlGambarUtama),
                    fit: BoxFit.cover,
                  ),
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.all(12.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    namaKarya,
                    style: TextStyle(
                      color: textWhite,
                      fontWeight: FontWeight.bold,
                      fontSize: 13,
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Container(
                        padding: EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: isFree
                              ? Colors.greenAccent.withOpacity(0.1)
                              : accentPurple.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: isFree ? Colors.greenAccent : accentPurple,
                          ),
                        ),
                        child: Text(
                          isFree ? 'GRATIS' : _formatRupiah(asset['harga']),
                          style: TextStyle(
                            color: isFree ? Colors.greenAccent : accentPurple,
                            fontWeight: FontWeight.bold,
                            fontSize: 11,
                          ),
                        ),
                      ),
                      Icon(Icons.shopping_cart, size: 16, color: accentCyan),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // --- TAB 1: HOME (BERANDA) FULL SCROLL ---
  Widget _buildHomeTab() {
    return _isLoading
        ? Center(child: CircularProgressIndicator(color: accentCyan))
        : RefreshIndicator(
            color: accentCyan,
            backgroundColor: bgSurface,
            onRefresh: _refreshBeranda,
            child: SingleChildScrollView(
              physics: AlwaysScrollableScrollPhysics(),
              padding: const EdgeInsets.all(16.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Halo, $_namaUser! Siap mabar hari ini? ⚡',
                    style: TextStyle(
                      color: textWhite,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      fontFamily: 'Poppins',
                    ),
                  ),
                  SizedBox(height: 20),

                  SingleChildScrollView(
                    scrollDirection: Axis.horizontal,
                    child: Row(
                      children: _kategoriList.map((kategori) {
                        bool isSelected = kategori == _kategoriTerpilih;
                        return GestureDetector(
                          onTap: () {
                            setState(() => _kategoriTerpilih = kategori);
                            _jalankanFilter();
                          },
                          child: Container(
                            margin: EdgeInsets.only(right: 12),
                            padding: EdgeInsets.symmetric(
                              horizontal: 16,
                              vertical: 8,
                            ),
                            decoration: BoxDecoration(
                              color: isSelected ? accentPurple : bgSurface,
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: isSelected
                                    ? accentPurple
                                    : accentCyan.withOpacity(0.3),
                              ),
                            ),
                            child: Text(
                              kategori,
                              style: TextStyle(
                                color: isSelected ? textWhite : textGrey,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                  SizedBox(height: 24),

                  Text(
                    'KARYA TERBARU VOLTER',
                    style: TextStyle(
                      color: textGrey,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  SizedBox(height: 16),

                  _filteredAssets.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.only(top: 40.0),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.search_off,
                                  size: 64,
                                  color: textGrey.withOpacity(0.5),
                                ),
                                SizedBox(height: 16),
                                Text(
                                  'Waduh, barang tidak ditemukan.',
                                  style: TextStyle(
                                    color: textGrey,
                                    fontSize: 16,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        )
                      : GridView.builder(
                          shrinkWrap: true,
                          physics: NeverScrollableScrollPhysics(),
                          gridDelegate:
                              SliverGridDelegateWithFixedCrossAxisCount(
                                crossAxisCount: 2,
                                crossAxisSpacing: 16,
                                mainAxisSpacing: 16,
                                childAspectRatio: 0.70,
                              ),
                          itemCount: _filteredAssets.length,
                          itemBuilder: (context, index) {
                            return _buildAssetCard(_filteredAssets[index]);
                          },
                        ),
                ],
              ),
            ),
          );
  }

  // --- WIDGET SEARCH BAR UNTUK APPBAR ---
  Widget _buildSearchAppBar() {
    return Container(
      height: 40,
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: accentCyan.withOpacity(0.5)),
      ),
      child: TextField(
        controller: _searchController,
        onChanged: (value) => _jalankanFilter(),
        style: TextStyle(color: textWhite, fontSize: 14),
        decoration: InputDecoration(
          hintText: 'Cari map, script, atau model 3D...',
          hintStyle: TextStyle(color: textGrey, fontSize: 13),
          prefixIcon: Icon(Icons.search, color: accentCyan, size: 20),
          border: InputBorder.none,
          contentPadding: EdgeInsets.symmetric(vertical: 10),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> _pages = [
      _buildHomeTab(),
      LibraryScreen(),
      CustomOrderScreen(),
      ProfileScreen(),
    ];

    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary,
        elevation: 0,
        title: _selectedIndex == 0
            ? _buildSearchAppBar()
            : Text(
                'VOLTER STORE',
                style: TextStyle(
                  color: accentCyan,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.5,
                  fontFamily: 'Poppins',
                ),
              ),
        centerTitle: false,
        actions: [
          Stack(
            alignment: Alignment.center,
            children: [
              IconButton(
                icon: Icon(Icons.shopping_cart, color: accentCyan),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(builder: (context) => CartScreen()),
                  ).then((_) => _ambilJumlahKeranjang());
                },
              ),
              if (_jumlahKeranjang > 0)
                Positioned(
                  right: 4,
                  top: 4,
                  child: Container(
                    padding: EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: Colors.redAccent,
                      shape: BoxShape.circle,
                    ),
                    constraints: BoxConstraints(minWidth: 18, minHeight: 18),
                    child: Center(
                      child: Text(
                        '$_jumlahKeranjang',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ),
            ],
          ),
          // Tombol chat global telah dicabut karena sistem kini menggunakan private chat per-order
          SizedBox(width: 8),
        ],
      ),
      body: _pages[_selectedIndex],
      bottomNavigationBar: Theme(
        data: ThemeData(canvasColor: bgSurface),
        child: BottomNavigationBar(
          currentIndex: _selectedIndex,
          onTap: _onItemTapped,
          selectedItemColor: accentCyan,
          unselectedItemColor: textGrey,
          showUnselectedLabels: true,
          type: BottomNavigationBarType.fixed,
          items: const <BottomNavigationBarItem>[
            BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Beranda'),
            BottomNavigationBarItem(
              icon: Icon(Icons.inventory_2),
              label: 'Brankas',
            ),
            BottomNavigationBarItem(
              icon: Icon(Icons.design_services),
              label: 'Jasa Custom',
            ),
            BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Saya'),
          ],
        ),
      ),
    );
  }
}
