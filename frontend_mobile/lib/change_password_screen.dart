import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'constants.dart';

class ChangePasswordScreen extends StatefulWidget {
  @override
  _ChangePasswordScreenState createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends State<ChangePasswordScreen> {
  final Color bgPrimary = const Color(0xFF0F172A);
  final Color bgSurface = const Color(0xFF1E293B);
  final Color accentCyan = const Color(0xFF00F0FF);
  final Color textWhite = const Color(0xFFF8FAFC);
  final Color textGrey = const Color(0xFF94A3B8);

  final _oldPassController = TextEditingController();
  final _newPassController = TextEditingController();
  final _confirmPassController = TextEditingController();
  bool _isLoading = false;
  bool _obscureOld = true;
  bool _obscureNew = true;

  Future<void> _updatePassword() async {
    if (_newPassController.text != _confirmPassController.text) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Konfirmasi password tidak cocok! ⚠️'),
          backgroundColor: Colors.orangeAccent,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    final prefs = await SharedPreferences.getInstance();
    final int userId = prefs.getInt('user_id') ?? 0;

    try {
      final response = await http.put(
        Uri.parse('${AppConstants.kBaseUrl}/api/users/change-password/$userId'),
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({
          'oldPassword': _oldPassController.text,
          'newPassword': _newPassController.text,
        }),
      );

      final data = jsonDecode(response.body);

      if (response.statusCode == 200) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message']),
            backgroundColor: Colors.greenAccent,
          ),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(data['message']),
            backgroundColor: Colors.redAccent,
          ),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Koneksi Gagal 📡'),
          backgroundColor: Colors.redAccent,
        ),
      );
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
          'KEAMANAN INTI',
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
      body: SingleChildScrollView(
        padding: EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildLabel("PASSWORD LAMA"),
            _buildPasswordField(
              _oldPassController,
              _obscureOld,
              () => setState(() => _obscureOld = !_obscureOld),
            ),

            SizedBox(height: 20),
            _buildLabel("PASSWORD BARU"),
            _buildPasswordField(
              _newPassController,
              _obscureNew,
              () => setState(() => _obscureNew = !_obscureNew),
            ),

            SizedBox(height: 20),
            _buildLabel("KONFIRMASI PASSWORD BARU"),
            _buildPasswordField(_confirmPassController, _obscureNew, null),

            SizedBox(height: 40),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: accentCyan,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                onPressed: _isLoading ? null : _updatePassword,
                child: _isLoading
                    ? CircularProgressIndicator(color: bgPrimary)
                    : Text(
                        'PERBARUI PROTOKOL KEAMANAN ⚡',
                        style: TextStyle(
                          color: bgPrimary,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLabel(String label) {
    return Text(
      label,
      style: TextStyle(
        color: textGrey,
        fontSize: 10,
        fontWeight: FontWeight.bold,
        letterSpacing: 1.5,
      ),
    );
  }

  Widget _buildPasswordField(
    TextEditingController controller,
    bool obscure,
    VoidCallback? toggle,
  ) {
    return Container(
      margin: EdgeInsets.only(top: 8),
      child: TextField(
        controller: controller,
        obscureText: obscure,
        style: TextStyle(color: textWhite),
        decoration: InputDecoration(
          filled: true,
          fillColor: bgSurface,
          prefixIcon: Icon(Icons.lock_outline, color: accentCyan),
          suffixIcon: toggle != null
              ? IconButton(
                  icon: Icon(
                    obscure ? Icons.visibility_off : Icons.visibility,
                    color: textGrey,
                  ),
                  onPressed: toggle,
                )
              : null,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(12),
            borderSide: BorderSide(color: accentCyan),
          ),
        ),
      ),
    );
  }
}
