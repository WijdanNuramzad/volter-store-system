import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import Swal from "sweetalert2";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);

  // Cek apakah email terdaftar (bisa lanjut ke step 2 jika di backend tidak error, 
  // tapi karena kita bikin 1 rute langsung reset, kita gabung di submit form step 2.
  // Untuk step 1, kita cuma tampung email)
  const handleNextStep = (e) => {
    e.preventDefault();
    if (!email) {
      Swal.fire({ icon: "error", title: "Oops!", text: "Email harus diisi", background: "#1E293B", color: "#F8FAFC" });
      return;
    }
    setStep(2);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({ icon: "warning", title: "Password Berbeda", text: "Konfirmasi password harus sama persis.", background: "#1E293B", color: "#F8FAFC" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/users/forgot-password-local", {
        email,
        newPassword: passwords.newPassword
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: res.data.message || "Password berhasil direset.",
        background: "#1E293B",
        color: "#F8FAFC",
        timer: 2000,
        showConfirmButton: false
      });
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        background: "#1E293B",
        color: "#F8FAFC"
      });
      setStep(1); // kembali ke step 1 jika email tidak ketemu
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "var(--bg-primary)", padding: "20px"
    }}>
      <div style={{
        background: "var(--bg-surface)", padding: "40px", borderRadius: "16px",
        width: "100%", maxWidth: "420px", border: "1px solid var(--border-subtle)",
        boxShadow: "0 10px 40px rgba(0,0,0,0.4)"
      }}>
        
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-block", marginBottom: "16px" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px", margin: "0 auto",
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "24px", fontWeight: "bold", color: "#0F172A",
              boxShadow: "0 0 16px rgba(0, 240, 255, 0.4)",
            }}>⚡</div>
          </Link>
          <h2 style={{ fontSize: "24px", fontWeight: 700, margin: "0 0 8px", color: "var(--text-white)" }}>
            Reset Password
          </h2>
          <p style={{ color: "var(--text-grey)", fontSize: "14px", margin: 0 }}>
            {step === 1 ? "Masukkan email yang terdaftar pada akun kamu" : "Buat password baru untuk akun kamu"}
          </p>
        </div>

        {/* Form Step 1: Input Email */}
        {step === 1 && (
          <form onSubmit={handleNextStep} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "8px" }}>
                Alamat Email
              </label>
              <input 
                type="email" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                placeholder="nama@email.com" 
                required 
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
                  border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }} 
              />
            </div>
            
            <button type="submit" style={{
              width: "100%", padding: "14px", borderRadius: "8px",
              background: "linear-gradient(135deg, #00F0FF, #0099ff)",
              color: "#0F172A", border: "none", fontWeight: 700, fontSize: "15px", cursor: "pointer",
              boxShadow: "0 4px 15px rgba(0,240,255,0.3)"
            }}>
              Lanjutkan
            </button>
          </form>
        )}

        {/* Form Step 2: Input Password Baru */}
        {step === 2 && (
          <form onSubmit={handleResetPassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "12px", background: "rgba(0,240,255,0.1)", border: "1px solid rgba(0,240,255,0.2)", borderRadius: "8px", marginBottom: "8px" }}>
              <p style={{ margin: 0, fontSize: "13px", color: "#00F0FF", textAlign: "center" }}>
                Email: <b>{email}</b>
              </p>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "8px" }}>
                Password Baru
              </label>
              <input 
                type="password" 
                value={passwords.newPassword} 
                onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })} 
                required 
                autoFocus
                style={{
                  width: "100%", padding: "12px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
                  border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }} 
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "8px" }}>
                Konfirmasi Password
              </label>
              <input 
                type="password" 
                value={passwords.confirmPassword} 
                onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })} 
                required 
                style={{
                  width: "100%", padding: "12px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
                  border: "1px solid var(--border-subtle)", borderRadius: "8px", fontSize: "14px", outline: "none",
                  boxSizing: "border-box"
                }} 
              />
            </div>
            
            <button type="submit" disabled={isLoading} style={{
              width: "100%", padding: "14px", borderRadius: "8px", marginTop: "8px",
              background: isLoading ? "var(--text-muted)" : "linear-gradient(135deg, #00F0FF, #0099ff)",
              color: "#0F172A", border: "none", fontWeight: 700, fontSize: "15px", 
              cursor: isLoading ? "not-allowed" : "pointer",
              boxShadow: isLoading ? "none" : "0 4px 15px rgba(0,240,255,0.3)"
            }}>
              {isLoading ? "Memproses..." : "Simpan Password Baru"}
            </button>
            
            <button type="button" onClick={() => setStep(1)} disabled={isLoading} style={{
              width: "100%", padding: "12px", borderRadius: "8px",
              background: "transparent", color: "var(--text-grey)",
              border: "1px solid var(--border-subtle)", fontWeight: 600, fontSize: "14px", 
              cursor: isLoading ? "not-allowed" : "pointer",
            }}>
              Batal
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link to="/login" style={{ color: "#94A3B8", fontSize: "13px", textDecoration: "none" }}>
            Kembali ke halaman Login
          </Link>
        </div>
      </div>
    </div>
  );
}
