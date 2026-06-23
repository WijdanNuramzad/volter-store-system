import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:intl/intl.dart';
import 'constants.dart';

class ChatScreen extends StatefulWidget {
  final int orderId;
  final String judulProject;

  const ChatScreen({Key? key, required this.orderId, required this.judulProject}) : super(key: key);

  @override
  _ChatScreenState createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen> {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color accentPurple = const Color(0xFF8B5CF6);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  late IO.Socket socket;
  List<dynamic> _messages = [];
  final TextEditingController _msgController = TextEditingController();
  final ScrollController _scrollController = ScrollController();

  int _currentUserId = 0;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _initChatSystem();
  }

  Future<void> _initChatSystem() async {
    final prefs = await SharedPreferences.getInstance();
    setState(() {
      _currentUserId = prefs.getInt('user_id') ?? 0;
    });

    if (_currentUserId == 0) {
      // Jika tamu belum login
      setState(() => _isLoading = false);
      return;
    }

    await _fetchHistory();
    _connectSocket();
  }

  // 1. Tarik Riwayat Chat Lama dari MySQL
  Future<void> _fetchHistory() async {
    try {
      final response = await http.get(
        Uri.parse('${AppConstants.kBaseUrl}/api/chat/${widget.orderId}'),
      );
      if (response.statusCode == 200) {
        final data = jsonDecode(response.body);
        setState(() {
          _messages = data['data'];
          _isLoading = false;
        });
        _scrollToBottom();
      }
    } catch (e) {
      setState(() => _isLoading = false);
    }
  }

  // 2. Konek ke Radar Socket.io dengan JWT
  Future<void> _connectSocket() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString(AppConstants.kTokenKey);

    if (token == null) return;

    socket = IO.io(AppConstants.kBaseUrl, <String, dynamic>{
      'transports': ['websocket'],
      'autoConnect': false,
      'auth': {'token': token},
    });

    socket.connect();

    // Gabung ke Private Room
    socket.onConnect((_) {
      socket.emit('gabung_room', {'order_id': widget.orderId});
    });

    // Menerima Sinyal Pesan Baru secara Real-Time
    socket.on('terima_pesan', (data) {
      if (mounted) {
        setState(() {
          _messages.add(data);
        });
        _scrollToBottom();
      }
    });

    socket.on('error_akses', (err) {
      print("Socket Error: ${err}");
      socket.disconnect();
    });
  }

  // 3. Fungsi Tembak Pesan
  void _sendMessage() {
    if (_msgController.text.trim().isEmpty) return;

    // Pancarkan sinyal ke server private room
    socket.emit('kirim_pesan', {
      'order_id': widget.orderId,
      'pesan': _msgController.text.trim(),
    });

    _msgController.clear();
    _scrollToBottom();
  }

  void _scrollToBottom() {
    Future.delayed(Duration(milliseconds: 300), () {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  void dispose() {
    socket.disconnect(); // Matikan radar saat keluar layar
    _msgController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_currentUserId == 0) {
      return Scaffold(
        backgroundColor: bgPrimary,
        appBar: AppBar(
          title: Text('COMM LINK', style: TextStyle(color: accentCyan)),
          backgroundColor: bgPrimary,
        ),
        body: Center(
          child: Text(
            'Login dulu ya Bos untuk mulai chatting! 🔒',
            style: TextStyle(color: textGrey),
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: bgPrimary,
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.wifi_tethering, color: Colors.greenAccent, size: 20),
                SizedBox(width: 8),
                Text(
                  'COMM-LINK AKTIF',
                  style: TextStyle(
                    color: accentCyan,
                    fontWeight: FontWeight.bold,
                    letterSpacing: 1.5,
                    fontSize: 16,
                  ),
                ),
              ],
            ),
            Text(
              'Diskusi: ${widget.judulProject}',
              style: TextStyle(
                color: textGrey,
                fontSize: 12,
              ),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
        backgroundColor: bgSurface,
        iconTheme: IconThemeData(color: accentCyan),
        elevation: 0,
      ),
      body: _isLoading
          ? Center(child: CircularProgressIndicator(color: accentCyan))
          : Column(
              children: [
                Expanded(
                  child: ListView.builder(
                    controller: _scrollController,
                    padding: EdgeInsets.all(16),
                    itemCount: _messages.length,
                    itemBuilder: (context, index) {
                      final msg = _messages[index];
                      // Bedakan admin dan diri kita
                      final isMe = msg['sender_id'] == _currentUserId;
                      final senderName = msg['sender_name'] ?? 'U';
                      return _buildMessageBubble(
                        msg['pesan'],
                        isMe,
                        msg['timestamp'],
                        senderName,
                      );
                    },
                  ),
                ),
                _buildInputArea(),
              ],
            ),
    );
  }

  // Desain Balon Chat
  Widget _buildMessageBubble(String text, bool isMe, String? timestamp, String senderName) {
    String jam = "";
    if (timestamp != null) {
      DateTime dt = DateTime.parse(timestamp).toLocal();
      jam = DateFormat('HH:mm').format(dt);
    }

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: EdgeInsets.only(bottom: 12),
        padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.75,
        ),
        decoration: BoxDecoration(
          color: isMe ? accentCyan.withOpacity(0.2) : bgSurface,
          borderRadius: BorderRadius.only(
            topLeft: Radius.circular(16),
            topRight: Radius.circular(16),
            bottomLeft: isMe ? Radius.circular(16) : Radius.circular(4),
            bottomRight: isMe ? Radius.circular(4) : Radius.circular(16),
          ),
          border: Border.all(
            color: isMe
                ? accentCyan.withOpacity(0.5)
                : textGrey.withOpacity(0.2),
          ),
        ),
        child: Column(
          crossAxisAlignment: isMe
              ? CrossAxisAlignment.end
              : CrossAxisAlignment.start,
          children: [
            if (!isMe)
              Text(senderName, style: TextStyle(color: accentCyan, fontSize: 11, fontWeight: FontWeight.bold)),
            Text(text, style: TextStyle(color: textWhite, fontSize: 14)),
            SizedBox(height: 4),
            Text(jam, style: TextStyle(color: textGrey, fontSize: 10)),
          ],
        ),
      ),
    );
  }

  // Desain Kolom Ketik
  Widget _buildInputArea() {
    return Container(
      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      decoration: BoxDecoration(
        color: bgSurface,
        border: Border(top: BorderSide(color: accentCyan.withOpacity(0.2))),
      ),
      child: Row(
        children: [
          Expanded(
            child: TextField(
              controller: _msgController,
              style: TextStyle(color: textWhite),
              decoration: InputDecoration(
                hintText: 'Transmisikan pesan...',
                hintStyle: TextStyle(color: textGrey),
                filled: true,
                fillColor: bgPrimary,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(24),
                  borderSide: BorderSide.none,
                ),
                contentPadding: EdgeInsets.symmetric(
                  horizontal: 20,
                  vertical: 10,
                ),
              ),
              onSubmitted: (_) => _sendMessage(),
            ),
          ),
          SizedBox(width: 12),
          GestureDetector(
            onTap: _sendMessage,
            child: Container(
              padding: EdgeInsets.all(12),
              decoration: BoxDecoration(
                color: accentCyan,
                shape: BoxShape.circle,
              ),
              child: Icon(Icons.send, color: bgPrimary, size: 20),
            ),
          ),
        ],
      ),
    );
  }
}
