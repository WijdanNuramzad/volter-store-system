// ============================================================
// KONFIGURASI TERPUSAT VOLTER MOBILE APP
// Ubah kBaseUrl di sini untuk mengganti alamat server.
// ============================================================

import 'package:flutter/foundation.dart'; // Tambahkan ini untuk kIsWeb
import 'package:shared_preferences/shared_preferences.dart';

class AppConstants {
  // ================================================================
  // 🌐 BASE URL DINAMIS — OTOMATIS DETEKSI WEB / EMULATOR
  // ================================================================

  static String get kBaseUrl {
    if (kIsWeb) {
      // 🌐 Jika dijalankan di Chrome / Web
      return 'http://localhost:5000'; 
    } else {
      // 🤖 Jika dijalankan di Emulator Android
      return 'http://10.0.2.2:5000';
    }
  }

  // 📱 HP Fisik / Perangkat di jaringan WiFi yang sama (Manual)
  // static const String kBaseUrlPhysical = 'http://10.11.147.204:5000';

  // 🚀 Production (isi saat sudah deploy ke server publik)
  // static const String kBaseUrlProd = 'https://api.volter.com';

  // ─── Kunci SharedPreferences (harus konsisten di semua screen) ───
  // Key untuk menyimpan token JWT
  static const String kTokenKey = 'token';

  // Key untuk menyimpan data user
  static const String kUserNamaKey = 'user_nama';
  static const String kUserIdKey = 'user_id';
  static const String kUserRoleKey = 'user_role';
  static const String kUserEmailKey = 'user_email';

  // ─── Nilai Role yang valid (harus cocok dengan backend) ─────────
  static const String kRoleAdmin = 'admin';
  static const String kRoleSeller = 'seller';
  static const String kRoleBuyer = 'buyer';

  // ─── Helper: Ambil header Authorization untuk request yang butuh login ───
  // Gunakan ini di semua HTTP request ke endpoint yang dilindungi (protected).
  // Contoh: headers: await AppConstants.getAuthHeaders()
  static Future<Map<String, String>> getAuthHeaders() async {
    final prefs = await SharedPreferences.getInstance();
    final String token = prefs.getString(kTokenKey) ?? '';
    return {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }
}
