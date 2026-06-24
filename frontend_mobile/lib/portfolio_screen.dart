import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'constants.dart';
import 'product_detail_screen.dart';

class PortfolioScreen extends StatefulWidget {
  @override
  _PortfolioScreenState createState() => _PortfolioScreenState();
}

class _PortfolioScreenState extends State<PortfolioScreen> {
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color accentGreen = const Color(0xFF22C55E);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  List<dynamic> _assets = [];
  List<dynamic> _filtered = [];
  bool _isLoading = true;
  String _kategoriTerpilih = 'Semua';
  final TextEditingController _searchController = TextEditingController();

  // Warna per kategori
  final Map<String, Color> _katColors = {
    'Map': const Color(0xFF00F0FF),
    'Script': const Color(0xFF8B5CF6),
    '3D Model': const Color(0xFFF59E0B),
    'Audio': const Color(0xFF22C55E),
    'UI/UX': const Color(0xFFEC4899),
    'Plugin': const Color(0xFFF97316),
  };

  final Map<String, IconData> _katIcons = {
    'Map': Icons.map_outlined,
    'Script': Icons.code_rounded,
    '3D Model': Icons.view_in_ar_rounded,
    'Audio': Icons.music_note_rounded,
    'UI/UX': Icons.palette_outlined,
    'Plugin': Icons.extension_outlined,
  };

  @override
  void initState() {
    super.initState();
    _fetchAssets();
    _searchController.addListener(_applyFilter);
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  Future<void> _fetchAssets() async {
    setState(() => _isLoading = true);
    try {
      final res = await http.get(Uri.parse('${AppConstants.kBaseUrl}/api/assets'));
      if (res.statusCode == 200) {
        final data = jsonDecode(res.body);
        setState(() {
          _assets = data['data'] ?? [];
          _filtered = List.from(_assets);
          _isLoading = false;
        });
        _applyFilter();
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  void _applyFilter() {
    final q = _searchController.text.toLowerCase();
    setState(() {
      _filtered = _assets.where((a) {
        final nama = (a['nama'] ?? '').toString().toLowerCase();
        final kat = (a['kategori'] ?? '').toString();
        final matchSearch = q.isEmpty || nama.contains(q);
        final matchKat = _kategoriTerpilih == 'Semua' || kat == _kategoriTerpilih;
        return matchSearch && matchKat;
      }).toList();
    });
  }

  String _formatRupiah(dynamic harga) {
    int h = double.tryParse(harga.toString())?.toInt() ?? 0;
    if (h == 0) return 'GRATIS';
    return 'Rp ' + h.toString().replaceAllMapped(RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'), (m) => '${m[1]}.');
  }

  List<String> get _kategoriList {
    final List<String> cats = ['Semua'];
    final Set<String> found = {};
    for (var a in _assets) {
      final k = a['kategori']?.toString() ?? '';
      if (k.isNotEmpty) found.add(k);
    }
    cats.addAll(found);
    return cats;
  }

  Widget _buildAssetCard(dynamic asset) {
    final bool isFree = asset['is_free'] == 1 || asset['harga'] == 0 || asset['harga'] == '0.00';
    final String nama = asset['nama'] ?? 'Aset';
    final String imageUrlDb = asset['image_url'] ?? '';
    final String imgUrl = imageUrlDb.isNotEmpty
        ? '${AppConstants.kBaseUrl}$imageUrlDb'
        : 'https://api.dicebear.com/7.x/shapes/svg?seed=$nama';
    final String kat = asset['kategori'] ?? '';
    final Color katColor = _katColors[kat] ?? accentCyan;
    final IconData katIcon = _katIcons[kat] ?? Icons.star_outline;

    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (context) => ProductDetailScreen(asset: asset)),
      ),
      child: Container(
        decoration: BoxDecoration(
          color: bgSurface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: katColor.withOpacity(0.25)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Thumbnail
            Expanded(
              child: Stack(
                children: [
                  ClipRRect(
                    borderRadius: BorderRadius.vertical(top: Radius.circular(15)),
                    child: Image.network(
                      imgUrl, width: double.infinity, fit: BoxFit.cover,
                      errorBuilder: (c, e, s) => Container(
                        color: bgPrimary,
                        child: Center(child: Icon(Icons.broken_image, color: textGrey, size: 32)),
                      ),
                    ),
                  ),
                  // Kategori badge
                  Positioned(
                    top: 8, left: 8,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: katColor.withOpacity(0.85),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(katIcon, size: 10, color: Colors.white),
                          SizedBox(width: 4),
                          Text(kat.isNotEmpty ? kat : 'Karya', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                  ),
                  // Price badge
                  Positioned(
                    top: 8, right: 8,
                    child: Container(
                      padding: EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isFree ? accentGreen.withOpacity(0.9) : accentPurple.withOpacity(0.9),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(isFree ? 'GRATIS' : 'PREMIUM', style: TextStyle(color: Colors.white, fontSize: 9, fontWeight: FontWeight.bold)),
                    ),
                  ),
                ],
              ),
            ),
            // Info
            Padding(
              padding: EdgeInsets.all(12),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(nama, style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 12), maxLines: 2, overflow: TextOverflow.ellipsis),
                  SizedBox(height: 6),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _formatRupiah(asset['harga']),
                        style: TextStyle(color: isFree ? accentGreen : katColor, fontWeight: FontWeight.bold, fontSize: 12),
                      ),
                      Icon(Icons.arrow_forward_ios_rounded, size: 12, color: textGrey),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary, elevation: 0,
        title: Text('🖼️ PORTOFOLIO', style: TextStyle(color: accentPurple, fontWeight: FontWeight.bold, letterSpacing: 1.2, fontFamily: 'Poppins')),
        centerTitle: true,
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: EdgeInsets.fromLTRB(16, 8, 16, 0),
            child: Container(
              height: 44,
              decoration: BoxDecoration(
                color: bgSurface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: accentPurple.withOpacity(0.4)),
              ),
              child: TextField(
                controller: _searchController,
                style: TextStyle(color: textWhite, fontSize: 14),
                decoration: InputDecoration(
                  hintText: 'Cari karya...',
                  hintStyle: TextStyle(color: textGrey, fontSize: 13),
                  prefixIcon: Icon(Icons.search, color: accentPurple, size: 20),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                  suffixIcon: _searchController.text.isNotEmpty
                      ? IconButton(icon: Icon(Icons.clear, color: textGrey, size: 18), onPressed: () { _searchController.clear(); _applyFilter(); })
                      : null,
                ),
              ),
            ),
          ),

          // Kategori Filter Chips
          SizedBox(
            height: 52,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              itemCount: _kategoriList.length,
              itemBuilder: (context, i) {
                final kat = _kategoriList[i];
                final isSelected = kat == _kategoriTerpilih;
                final katColor = kat != 'Semua' ? (_katColors[kat] ?? accentCyan) : accentCyan;
                return GestureDetector(
                  onTap: () { setState(() => _kategoriTerpilih = kat); _applyFilter(); },
                  child: Container(
                    margin: EdgeInsets.only(right: 8),
                    padding: EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                    decoration: BoxDecoration(
                      color: isSelected ? katColor : bgSurface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: isSelected ? katColor : textGrey.withOpacity(0.3)),
                      boxShadow: isSelected ? [BoxShadow(color: katColor.withOpacity(0.3), blurRadius: 8)] : [],
                    ),
                    child: Text(kat, style: TextStyle(color: isSelected ? bgPrimary : textGrey, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                );
              },
            ),
          ),

          // Stats row
          if (!_isLoading)
            Padding(
              padding: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: Row(children: [
                Text('${_filtered.length} karya', style: TextStyle(color: textGrey, fontSize: 12)),
              ]),
            ),

          // Grid
          Expanded(
            child: _isLoading
                ? Center(child: CircularProgressIndicator(color: accentPurple))
                : _filtered.isEmpty
                ? Center(
                    child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                      Icon(Icons.search_off, size: 64, color: textGrey.withOpacity(0.4)),
                      SizedBox(height: 12),
                      Text('Karya tidak ditemukan', style: TextStyle(color: textWhite, fontSize: 16, fontWeight: FontWeight.bold)),
                      SizedBox(height: 8),
                      TextButton(
                        onPressed: () { setState(() => _kategoriTerpilih = 'Semua'); _searchController.clear(); },
                        child: Text('Reset Filter', style: TextStyle(color: accentCyan)),
                      ),
                    ]),
                  )
                : RefreshIndicator(
                    color: accentPurple,
                    backgroundColor: bgSurface,
                    onRefresh: _fetchAssets,
                    child: GridView.builder(
                      padding: EdgeInsets.all(16),
                      physics: AlwaysScrollableScrollPhysics(),
                      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
                        crossAxisCount: 2,
                        crossAxisSpacing: 14,
                        mainAxisSpacing: 14,
                        childAspectRatio: 0.68,
                      ),
                      itemCount: _filtered.length,
                      itemBuilder: (context, i) => _buildAssetCard(_filtered[i]),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
