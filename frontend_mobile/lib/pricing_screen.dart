import 'package:flutter/material.dart';
import 'custom_order_screen.dart';

class PricingScreen extends StatefulWidget {
  @override
  _PricingScreenState createState() => _PricingScreenState();
}

class _PricingScreenState extends State<PricingScreen> {
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color accentGreen = const Color(0xFF22C55E);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  final List<Map<String, dynamic>> _packages = [
    {
      'name': 'Basic',
      'icon': '🌱',
      'tagline': 'Cocok untuk kebutuhan sederhana',
      'color': 0xFF22C55E,
      'harga': 'Mulai Rp 20.000',
      'range': 'Rp 20.000 – Rp 75.000',
      'popular': false,
      'features': [
        {'label': '1 Map / Script sederhana', 'ok': true},
        {'label': 'Ukuran project kecil', 'ok': true},
        {'label': 'Revisi 2x', 'ok': true},
        {'label': 'Estimasi 1-3 hari', 'ok': true},
        {'label': 'File source disertakan', 'ok': true},
        {'label': 'Prioritas pengerjaan', 'ok': false},
        {'label': 'Konsultasi desain', 'ok': false},
        {'label': 'Revisi unlimited', 'ok': false},
      ],
      'note': 'Trap system, GUI sederhana, map lobby kecil',
    },
    {
      'name': 'Standard',
      'icon': '⚡',
      'tagline': 'Pilihan paling populer',
      'color': 0xFF00F0FF,
      'harga': 'Mulai Rp 100.000',
      'range': 'Rp 100.000 – Rp 350.000',
      'popular': true,
      'features': [
        {'label': '1 Map / Script menengah', 'ok': true},
        {'label': 'Ukuran project medium', 'ok': true},
        {'label': 'Revisi 5x', 'ok': true},
        {'label': 'Estimasi 3-7 hari', 'ok': true},
        {'label': 'File source disertakan', 'ok': true},
        {'label': 'Prioritas pengerjaan', 'ok': true},
        {'label': 'Konsultasi desain (1 sesi)', 'ok': true},
        {'label': 'Revisi unlimited', 'ok': false},
      ],
      'note': 'Game system, RPG map, Admin panel, Obby kompleks',
    },
    {
      'name': 'Premium',
      'icon': '👑',
      'tagline': 'Kualitas terbaik tanpa kompromi',
      'color': 0xFF8B5CF6,
      'harga': 'Mulai Rp 400.000',
      'range': 'Rp 400.000 – Rp 1.500.000+',
      'popular': false,
      'features': [
        {'label': 'Project kompleks / full game', 'ok': true},
        {'label': 'Ukuran project besar', 'ok': true},
        {'label': 'Revisi Unlimited', 'ok': true},
        {'label': 'Estimasi sesuai scope', 'ok': true},
        {'label': 'Source + dokumentasi', 'ok': true},
        {'label': 'Prioritas TERTINGGI', 'ok': true},
        {'label': 'Konsultasi unlimited', 'ok': true},
        {'label': 'After-sales support 30 hari', 'ok': true},
      ],
      'note': 'Full game, sistem ekonomi, 3D build kompleks',
    },
  ];

  final List<Map<String, dynamic>> _layanan = [
    {'icon': '🗺️', 'nama': 'Map Building', 'mulai': 'Rp 20.000', 'estimasi': '1 – 14 hari', 'color': 0xFF00F0FF, 'desc': 'Map dari konsep sederhana hingga open world'},
    {'icon': '💻', 'nama': 'Scripting Luau', 'mulai': 'Rp 30.000', 'estimasi': '2 – 10 hari', 'color': 0xFF8B5CF6, 'desc': 'Game system, AI, ekonomi, hingga UI'},
    {'icon': '🎲', 'nama': '3D Modeling', 'mulai': 'Rp 50.000', 'estimasi': '3 – 14 hari', 'color': 0xFFF59E0B, 'desc': 'Model 3D custom untuk character & props'},
    {'icon': '🎨', 'nama': 'UI/UX Design', 'mulai': 'Rp 25.000', 'estimasi': '2 – 7 hari', 'color': 0xFFEC4899, 'desc': 'GUI custom sesuai tema game kamu'},
    {'icon': '🎵', 'nama': 'Audio & SFX', 'mulai': 'Rp 15.000', 'estimasi': '1 – 5 hari', 'color': 0xFF22C55E, 'desc': 'Sound effect dan musik latar Roblox'},
    {'icon': '🔧', 'nama': 'Plugin & Tools', 'mulai': 'Rp 75.000', 'estimasi': '3 – 7 hari', 'color': 0xFFF97316, 'desc': 'Plugin Roblox Studio custom'},
  ];

  final List<Map<String, String>> _faq = [
    {'q': 'Bagaimana cara memesan custom order?', 'a': 'Login ke akun Volter Store, lalu buka menu "Jasa Custom" dan isi form request. Tim kami akan memberikan penawaran dalam 1×24 jam.'},
    {'q': 'Apakah harga bisa dinegosiasi?', 'a': 'Ya! Harga yang tertera adalah estimasi. Harga final ditentukan setelah diskusi sesuai kompleksitas project kamu.'},
    {'q': 'Berapa lama estimasi pengerjaan?', 'a': 'Basic 1-3 hari, Standard 3-7 hari, Premium sesuai scope. Estimasi detail diberikan saat konfirmasi order.'},
    {'q': 'Apakah file source code disertakan?', 'a': 'Ya, semua paket menyertakan file source. Paket Premium juga dilengkapi dokumentasi teknis.'},
  ];

  final Set<int> _openFaq = {};

  Widget _buildPackageCard(Map<String, dynamic> pkg) {
    final Color color = Color(pkg['color']);
    final bool popular = pkg['popular'];
    final List features = pkg['features'];

    return Container(
      margin: EdgeInsets.only(bottom: 20),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withOpacity(popular ? 0.5 : 0.25), width: popular ? 1.5 : 1),
        boxShadow: popular ? [BoxShadow(color: color.withOpacity(0.2), blurRadius: 20, spreadRadius: 2)] : [],
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: EdgeInsets.all(20),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.vertical(top: Radius.circular(19)),
              gradient: popular
                  ? LinearGradient(colors: [color.withOpacity(0.12), bgSurface])
                  : null,
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                if (popular)
                  Container(
                    margin: EdgeInsets.only(bottom: 12),
                    padding: EdgeInsets.symmetric(horizontal: 12, vertical: 5),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(colors: [color, accentPurple]),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text('⭐ PALING POPULER', style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold, fontSize: 11, letterSpacing: 0.5)),
                  ),
                Row(children: [
                  Text(pkg['icon'], style: TextStyle(fontSize: 28)),
                  SizedBox(width: 12),
                  Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(pkg['name'], style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 20, fontFamily: 'Poppins')),
                    Text(pkg['tagline'], style: TextStyle(color: textGrey, fontSize: 12)),
                  ]),
                ]),
                SizedBox(height: 16),
                Text(pkg['harga'], style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 22, fontFamily: 'Poppins')),
                Text('Range: ${pkg['range']}', style: TextStyle(color: textGrey, fontSize: 12)),
                Text('* Harga final sesuai diskusi', style: TextStyle(color: textGrey, fontSize: 11, fontStyle: FontStyle.italic)),
              ],
            ),
          ),
          Divider(color: textGrey.withOpacity(0.15), height: 1),
          // Features
          Padding(
            padding: EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                ...features.map<Widget>((f) => Padding(
                  padding: EdgeInsets.only(bottom: 10),
                  child: Row(children: [
                    Container(
                      width: 20, height: 20,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: f['ok'] ? color.withOpacity(0.15) : Colors.transparent,
                        border: Border.all(color: f['ok'] ? color.withOpacity(0.5) : textGrey.withOpacity(0.3)),
                      ),
                      child: Icon(
                        f['ok'] ? Icons.check : Icons.close,
                        size: 12,
                        color: f['ok'] ? color : textGrey.withOpacity(0.4),
                      ),
                    ),
                    SizedBox(width: 10),
                    Text(f['label'], style: TextStyle(color: f['ok'] ? textWhite : textGrey.withOpacity(0.5), fontSize: 13, fontWeight: f['ok'] ? FontWeight.w500 : FontWeight.normal)),
                  ]),
                )).toList(),
                SizedBox(height: 8),
                Container(
                  padding: EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: bgPrimary,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: textGrey.withOpacity(0.15)),
                  ),
                  child: Text('💡 ${pkg['note']}', style: TextStyle(color: textGrey, fontSize: 12, height: 1.5)),
                ),
                SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: () => Navigator.push(
                      context,
                      MaterialPageRoute(builder: (_) => CustomOrderScreen()),
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: popular ? color : Colors.transparent,
                      side: popular ? null : BorderSide(color: color.withOpacity(0.5)),
                      padding: EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                    child: Text(
                      popular ? '🚀 Pesan Sekarang' : 'Mulai Request',
                      style: TextStyle(color: popular ? bgPrimary : color, fontWeight: FontWeight.bold, fontSize: 14),
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

  Widget _buildLayananCard(Map<String, dynamic> l) {
    final Color color = Color(l['color']);
    return Container(
      margin: EdgeInsets.only(bottom: 12),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: color.withOpacity(0.2)),
      ),
      child: Row(children: [
        Container(
          width: 48, height: 48,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Center(child: Text(l['icon'], style: TextStyle(fontSize: 22))),
        ),
        SizedBox(width: 14),
        Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(l['nama'], style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 14)),
          Text(l['desc'], style: TextStyle(color: textGrey, fontSize: 12), maxLines: 1, overflow: TextOverflow.ellipsis),
          SizedBox(height: 6),
          Row(children: [
            Container(
              padding: EdgeInsets.symmetric(horizontal: 8, vertical: 3),
              decoration: BoxDecoration(color: color.withOpacity(0.1), borderRadius: BorderRadius.circular(8), border: Border.all(color: color.withOpacity(0.3))),
              child: Text('Mulai ${l['mulai']}', style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 11)),
            ),
            SizedBox(width: 8),
            Row(children: [
              Icon(Icons.access_time, size: 11, color: textGrey),
              SizedBox(width: 3),
              Text(l['estimasi'], style: TextStyle(color: textGrey, fontSize: 11)),
            ]),
          ]),
        ])),
      ]),
    );
  }

  Widget _buildFaqItem(int i, Map<String, String> faq) {
    final bool open = _openFaq.contains(i);
    return Container(
      margin: EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: open ? accentCyan.withOpacity(0.3) : textGrey.withOpacity(0.15)),
      ),
      child: InkWell(
        onTap: () => setState(() { open ? _openFaq.remove(i) : _openFaq.add(i); }),
        borderRadius: BorderRadius.circular(12),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: Text(faq['q']!, style: TextStyle(color: textWhite, fontWeight: FontWeight.w600, fontSize: 13))),
                Icon(open ? Icons.remove : Icons.add, color: open ? accentCyan : textGrey, size: 18),
              ],
            ),
          ),
          if (open) ...[
            Divider(color: textGrey.withOpacity(0.15), height: 1),
            Padding(
              padding: EdgeInsets.fromLTRB(16, 12, 16, 16),
              child: Text(faq['a']!, style: TextStyle(color: textGrey, fontSize: 13, height: 1.6)),
            ),
          ],
        ]),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        backgroundColor: bgPrimary, elevation: 0, centerTitle: true,
        title: Text('💰 HARGA LAYANAN', style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, letterSpacing: 1.2, fontFamily: 'Poppins')),
      ),
      body: SingleChildScrollView(
        padding: EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Hero card
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [accentCyan.withOpacity(0.08), accentPurple.withOpacity(0.08)],
                ),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: accentCyan.withOpacity(0.2)),
              ),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text('💎 Harga Transparan', style: TextStyle(color: accentCyan, fontWeight: FontWeight.bold, fontSize: 18, fontFamily: 'Poppins')),
                SizedBox(height: 8),
                Text('Pilih paket yang sesuai kebutuhanmu atau diskusikan langsung dengan tim Volter. Konsultasi awal GRATIS!', style: TextStyle(color: textGrey, fontSize: 13, height: 1.6)),
              ]),
            ),
            SizedBox(height: 24),

            // Paket Harga
            _buildSectionHeader('PAKET LAYANAN', 'Pilih Paket yang Tepat', accentCyan),
            SizedBox(height: 16),
            ..._packages.map((pkg) => _buildPackageCard(pkg)).toList(),

            // Kategori Layanan
            _buildSectionHeader('KATEGORI JASA', 'Layanan Kami', accentPurple),
            SizedBox(height: 16),
            ..._layanan.map((l) => _buildLayananCard(l)).toList(),
            SizedBox(height: 8),

            // FAQ
            _buildSectionHeader('FAQ', 'Pertanyaan Umum', accentCyan),
            SizedBox(height: 16),
            ..._faq.asMap().entries.map((e) => _buildFaqItem(e.key, e.value)).toList(),
            SizedBox(height: 24),

            // CTA Bottom
            Container(
              width: double.infinity,
              padding: EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(colors: [accentCyan.withOpacity(0.08), accentPurple.withOpacity(0.08)]),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: accentPurple.withOpacity(0.25)),
              ),
              child: Column(children: [
                Text('Masih bingung pilih paket?', style: TextStyle(color: textWhite, fontWeight: FontWeight.bold, fontSize: 16, fontFamily: 'Poppins')),
                SizedBox(height: 8),
                Text('Konsultasikan kebutuhanmu dengan tim Volter secara gratis!', textAlign: TextAlign.center, style: TextStyle(color: textGrey, fontSize: 13)),
                SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => CustomOrderScreen())),
                    icon: Icon(Icons.chat_bubble_outline, color: bgPrimary, size: 18),
                    label: Text('Mulai Konsultasi', style: TextStyle(color: bgPrimary, fontWeight: FontWeight.bold)),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: accentCyan,
                      padding: EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      elevation: 0,
                    ),
                  ),
                ),
              ]),
            ),
            SizedBox(height: 40),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String eyebrow, String title, Color color) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text(eyebrow, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold, letterSpacing: 2)),
      SizedBox(height: 4),
      Text(title, style: TextStyle(color: textWhite, fontSize: 20, fontWeight: FontWeight.bold, fontFamily: 'Poppins')),
    ]);
  }
}
