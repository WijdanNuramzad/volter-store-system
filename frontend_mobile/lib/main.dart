import 'package:flutter/material.dart';
import 'login_screen.dart';
import 'home_screen.dart'; // 👇 WAJIB DITAMBAHKAN AGAR BISA BUKA HOME

void main() {
  runApp(VolterApp());
}

class VolterApp extends StatelessWidget {
  // === PALET WARNA CYBERPUNK VOLTER ===
  final Color bgPrimary = const Color(0xFF0F172A); // Deep Slate
  final Color accentCyan = const Color(0xFF00F0FF); // Cyber Cyan
  final Color accentPurple = const Color(0xFF8B5CF6); // Electric Purple
  final Color bgSurface = const Color(0xFF1E293B); // Slate Surface

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Volter Store', // Sekalian diupdate jadi Store
      debugShowCheckedModeBanner:
          false, // Menghilangkan pita "DEBUG" merah di pojok
      // MENGUBAH TEMA AKAR MENJADI DARK MODE CYBERPUNK
      theme: ThemeData(
        brightness: Brightness.dark,
        primaryColor: accentCyan,
        scaffoldBackgroundColor: bgPrimary,
        fontFamily: 'Inter', // Default font aplikasi
        colorScheme: ColorScheme.dark(
          primary: accentCyan,
          secondary: accentPurple,
          surface: bgSurface,
          background: bgPrimary, // Menggunakan background karena fallback
        ),
        appBarTheme: AppBarTheme(backgroundColor: bgPrimary, elevation: 0),
      ),

      // 👇 INI DIA KUNCINYA! Pintu masuk langsung ke Etalase (Guest Mode)
      home: HomeScreen(),
    );
  }
}
