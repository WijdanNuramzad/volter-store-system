import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:file_picker/file_picker.dart';
import 'dart:io';
import 'constants.dart';
import 'create_request_screen.dart';
import 'chat_screen.dart';

class CustomOrderScreen extends StatefulWidget {
  @override
  _CustomOrderScreenState createState() => _CustomOrderScreenState();
}

class _CustomOrderScreenState extends State<CustomOrderScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  List<dynamic> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _fetchOrders();
  }

  Future<void> _fetchOrders() async {
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    if (userId == 0) {
      setState(() => _isLoading = false);
      return;
    }

    try {
      // ✅ FIX: Pakai endpoint /api/custom-orders/my-orders, kirim token via header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/my-orders'),
        headers: headers,
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _orders = data['data'];
          _isLoading = false;
        });
      } else {
        setState(() => _isLoading = false);
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  Future<void> _prosesPembayaran(int orderId) async {
    FilePickerResult? result = await FilePicker.platform.pickFiles(
      type: FileType.image,
    );

    if (result != null && result.files.single.path != null) {
      File file = File(result.files.single.path!);
      
      setState(() => _isLoading = true);
      try {
        final headers = await AppConstants.getAuthHeaders();
        final request = http.MultipartRequest(
          'PUT',
          Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/pay/$orderId'),
        );
        request.headers.addAll(headers);
        request.files.add(await http.MultipartFile.fromPath('bukti_pembayaran', file.path));

        final response = await request.send();
        
        if (response.statusCode == 200) {
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('Pembayaran Berhasil! Bukti terkirim 🚀'),
                backgroundColor: Colors.greenAccent,
              ),
            );
          }
          _fetchOrders();
        } else {
          setState(() => _isLoading = false);
          if (context.mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text('Gagal mengirim bukti pembayaran.'), backgroundColor: Colors.redAccent),
            );
          }
        }
      } catch (e) {
        print(e);
        setState(() => _isLoading = false);
        if (context.mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Terjadi kesalahan koneksi.'), backgroundColor: Colors.redAccent),
          );
        }
      }
    }
  }

  // 👇 FUNGSI FORMAT RUPIAH YANG SUDAH KEBAL CRASH 🛠️
  String _formatRupiah(dynamic hargaAsli) {
    if (hargaAsli == null) return 'Tunggu Penawaran';

    // Ubah aman apapun yang masuk (String "0.00" atau int 0) menjadi double
    double hargaDouble = double.tryParse(hargaAsli.toString()) ?? 0;

    // Kalau harganya 0, berarti belum dikasih harga
    if (hargaDouble <= 0) return 'Tunggu Penawaran';

    // Format ribuan
    int harga = hargaDouble.toInt();
    String strHarga = harga.toString().replaceAllMapped(
      RegExp(r'\B(?=(\d{3})+(?!\d))'),
      (Match m) => '.',
    );
    return 'Rp $strHarga';
  }

  void _tampilkanFormUlasan(int orderId) {
    int _rating = 5;
    TextEditingController _ulasanController = TextEditingController();

    showDialog(
      context: context,
      builder: (context) {
        return StatefulBuilder(
          builder: (context, setStateDialog) {
            return AlertDialog(
              backgroundColor: bgSurface,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
                side: BorderSide(color: accentCyan),
              ),
              title: Text(
                'Nilai Karya Kami ⭐',
                style: TextStyle(color: textWhite, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              content: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Bagaimana hasil pengerjaannya?',
                    style: TextStyle(color: textGrey),
                  ),
                  SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(5, (index) {
                      return IconButton(
                        icon: Icon(
                          index < _rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 36,
                        ),
                        onPressed: () {
                          setStateDialog(() {
                            _rating = index + 1;
                          });
                        },
                      );
                    }),
                  ),
                  SizedBox(height: 16),
                  TextField(
                    controller: _ulasanController,
                    style: TextStyle(color: textWhite),
                    maxLines: 3,
                    decoration: InputDecoration(
                      hintText: 'Tulis ulasanmu di sini...',
                      hintStyle: TextStyle(color: textGrey),
                      filled: true,
                      fillColor: bgPrimary,
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(
                          color: textGrey.withOpacity(0.3),
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: accentCyan),
                      ),
                    ),
                  ),
                ],
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text('BATAL', style: TextStyle(color: textGrey)),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(backgroundColor: accentCyan),
                  onPressed: () async {
                    Navigator.pop(context);
                    await _kirimUlasan(
                      orderId,
                      _rating,
                      _ulasanController.text,
                    );
                  },
                  child: Text(
                    'KIRIM',
                    style: TextStyle(
                      color: bgPrimary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            );
          },
        );
      },
    );
  }

  Future<void> _kirimUlasan(int orderId, int rating, String ulasan) async {
    try {
      // ✅ FIX: Tambah Authorization header
      final headers = await AppConstants.getAuthHeaders();
      final response = await http.post(
        Uri.parse('${AppConstants.kBaseUrl}/api/custom-orders/review/$orderId'),
        headers: headers,
        body: jsonEncode({'rating': rating, 'ulasan': ulasan}),
      );

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Terima kasih atas ulasanmu! ⭐'),
            backgroundColor: Colors.amber,
          ),
        );
        _fetchOrders();
      }
    } catch (e) {
      print(e);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: bgPrimary,
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentCyan))
          : _orders.isEmpty
          ? _buildEmptyState()
          : ListView.builder(
              padding: EdgeInsets.all(16),
              itemCount: _orders.length,
              itemBuilder: (context, index) {
                final order = _orders[index];
                return _buildOrderCard(order);
              },
            ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => CreateRequestScreen()),
          ).then((_) {
            _fetchOrders();
          });
        },
        backgroundColor: accentCyan,
        icon: Icon(Icons.add, color: bgPrimary),
        label: Text(
          'BUAT REQUEST',
          style: TextStyle(
            color: bgPrimary,
            fontWeight: FontWeight.bold,
            letterSpacing: 1.2,
          ),
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.architecture, size: 100, color: textGrey.withOpacity(0.3)),
          SizedBox(height: 16),
          Text(
            'Belum ada request custom.',
            style: TextStyle(
              color: textGrey,
              fontSize: 18,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Ayo buat map impianmu sekarang! ⚡',
            style: TextStyle(color: textGrey, fontSize: 14),
          ),
        ],
      ),
    );
  }

  Widget _buildOrderCard(dynamic order) {
    int progress = order['progress'] ?? 0;
    String status = order['status'] ?? 'PENDING';
    int rating = order['rating'] ?? 0;

    // Terapkan format rupiah
    String hargaTawaran = _formatRupiah(order['harga_tawaran']);
    bool isHargaDeal = hargaTawaran != 'Tunggu Penawaran';

    Color statusColor = textGrey;
    if (status.toLowerCase().contains('selesai')) {
      statusColor = Colors.greenAccent;
    } else if (status.toLowerCase().contains('progress') ||
        status.toLowerCase().contains('proses')) {
      statusColor = accentCyan;
    } else if (status.toLowerCase().contains('pembayaran') ||
        status.toLowerCase().contains('quotation')) {
      statusColor = accentPurple;
    } else {
      statusColor = Colors.orangeAccent;
    }

    return Container(
      margin: EdgeInsets.only(bottom: 16),
      padding: EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: bgSurface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: statusColor.withOpacity(0.3)),
        boxShadow: [
          BoxShadow(
            color: statusColor.withOpacity(0.05),
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
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      order['judul_project'],
                      style: TextStyle(
                        color: textWhite,
                        fontWeight: FontWeight.bold,
                        fontSize: 18,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    SizedBox(height: 4),
                    Text(
                      order['kategori'],
                      style: TextStyle(color: textGrey, fontSize: 12),
                    ),
                  ],
                ),
              ),
              Container(
                padding: EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: statusColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: statusColor.withOpacity(0.5)),
                ),
                child: Text(
                  status.toUpperCase(),
                  style: TextStyle(
                    color: statusColor,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
              ),
            ],
          ),

          SizedBox(height: 16),
          Divider(color: textGrey.withOpacity(0.2)),
          SizedBox(height: 8),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Harga Deal:',
                style: TextStyle(color: textGrey, fontSize: 13),
              ),
              Text(
                hargaTawaran,
                style: TextStyle(
                  color: isHargaDeal ? accentPurple : textGrey,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ],
          ),

          SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Progress Pengerjaan',
                style: TextStyle(color: textGrey, fontSize: 12),
              ),
              Text(
                '$progress%',
                style: TextStyle(
                  color: accentCyan,
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
              ),
            ],
          ),
          SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: LinearProgressIndicator(
              value: progress / 100,
              minHeight: 10,
              backgroundColor: bgPrimary,
              valueColor: AlwaysStoppedAnimation<Color>(accentCyan),
            ),
          ),

          SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            height: 45,
            child: OutlinedButton.icon(
              icon: Icon(Icons.chat, color: accentCyan),
              label: Text(
                '💬 CHAT ADMIN',
                style: TextStyle(
                  color: accentCyan,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.2,
                ),
              ),
              style: OutlinedButton.styleFrom(
                side: BorderSide(color: accentCyan),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => ChatScreen(
                      orderId: order['id'],
                      judulProject: order['judul_project'],
                    ),
                  ),
                );
              },
            ),
          ),

          if (status.toUpperCase().contains('PEMBAYARAN') ||
              status.toUpperCase() == 'QUOTATION') ...[
            SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 45,
              child: ElevatedButton.icon(
                icon: Icon(Icons.payment, color: bgPrimary),
                label: Text(
                  'BAYAR SEKARANG',
                  style: TextStyle(
                    color: bgPrimary,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.2,
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                  ),
                ),
                onPressed: () => _prosesPembayaran(order['id']),
              ),
            ),
          ],

          if (status.toLowerCase() == 'selesai') ...[
            if (order['result_link'] != null && order['result_link'].toString().isNotEmpty) ...[
              SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 45,
                child: ElevatedButton.icon(
                  icon: Icon(Icons.download, color: bgPrimary),
                  label: Text(
                    'DOWNLOAD HASIL',
                    style: TextStyle(
                      color: bgPrimary,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1.2,
                    ),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.greenAccent,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () async {
                    final url = Uri.parse(order['result_link']);
                    if (await canLaunchUrl(url)) {
                      await launchUrl(url, mode: LaunchMode.externalApplication);
                    } else {
                      if (context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text('Tidak dapat membuka link hasil.'), backgroundColor: Colors.redAccent),
                        );
                      }
                    }
                  },
                ),
              ),
            ],
            SizedBox(height: 16),
            Divider(color: textGrey.withOpacity(0.2)),
            SizedBox(height: 8),
            rating == 0
                ? SizedBox(
                    width: double.infinity,
                    child: OutlinedButton.icon(
                      icon: Icon(Icons.star_border, color: Colors.amber),
                      label: Text(
                        'BERI ULASAN',
                        style: TextStyle(
                          color: Colors.amber,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      style: OutlinedButton.styleFrom(
                        side: BorderSide(color: Colors.amber.withOpacity(0.5)),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                      onPressed: () => _tampilkanFormUlasan(order['id']),
                    ),
                  )
                : Row(
                    children: [
                      Text(
                        'Penilaianmu: ',
                        style: TextStyle(color: textGrey, fontSize: 12),
                      ),
                      ...List.generate(
                        5,
                        (index) => Icon(
                          index < rating ? Icons.star : Icons.star_border,
                          color: Colors.amber,
                          size: 16,
                        ),
                      ),
                    ],
                  ),
          ],
        ],
      ),
    );
  }
}
