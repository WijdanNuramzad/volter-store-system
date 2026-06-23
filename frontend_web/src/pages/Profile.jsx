import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import PublicLayout from "../layouts/PublicLayout";
import Swal from "sweetalert2";

export default function Profile() {
  const { user, isAuthenticated } = useContext(AuthContext);
  const [profile, setProfile] = useState({
    nama: "",
    email: "",
    roblox_username: "",
    kontak_wa_discord: "",
    jenis_kelamin: "Lainnya"
  });

  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated]);

  const fetchProfile = async () => {
    try {
      const res = await api.get("/users/profile");
      if (res.data && res.data.profile) {
        setProfile({
          nama: res.data.profile.nama || "",
          email: res.data.profile.email || "",
          roblox_username: res.data.profile.roblox_username || "",
          kontak_wa_discord: res.data.profile.kontak_wa_discord || "",
          jenis_kelamin: res.data.profile.jenis_kelamin || "Lainnya"
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data profil", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await api.put(`/users/update/${user.id}`, profile);
      Swal.fire({
        icon: "success",
        title: "Profil Diperbarui!",
        text: "Data profil kamu berhasil disimpan.",
        background: "#1E293B",
        color: "#F8FAFC",
        timer: 2000,
        showConfirmButton: false
      });
      // Update local storage user data to reflect new name if needed
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        storedUser.nama = profile.nama;
        localStorage.setItem("user", JSON.stringify(storedUser));
        window.dispatchEvent(new Event("storage")); // Optional: trigger nav update if Context listens to it
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: error.response?.data?.message || "Terjadi kesalahan sistem.",
        background: "#1E293B",
        color: "#F8FAFC"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Tidak Cocok",
        text: "Konfirmasi password baru tidak sama.",
        background: "#1E293B",
        color: "#F8FAFC"
      });
      return;
    }

    setIsChangingPass(true);
    try {
      await api.put(`/users/change-password/${user.id}`, {
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword
      });

      Swal.fire({
        icon: "success",
        title: "Password Diperbarui!",
        text: "Gunakan password baru ini untuk login selanjutnya.",
        background: "#1E293B",
        color: "#F8FAFC",
        timer: 2500,
        showConfirmButton: false
      });

      setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal Mengubah Password",
        text: error.response?.data?.message || "Terjadi kesalahan sistem.",
        background: "#1E293B",
        color: "#F8FAFC"
      });
    } finally {
      setIsChangingPass(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "12px 16px",
    background: "var(--bg-primary)", color: "var(--text-white)",
    border: "1px solid var(--border-subtle)", borderRadius: "8px",
    fontSize: "14px", outline: "none", transition: "border-color 0.2s",
    boxSizing: "border-box"
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px", display: "flex", alignItems: "center", gap: "20px" }}>
          <div style={{
            width: "80px", height: "80px", borderRadius: "50%",
            background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "32px", fontWeight: "bold", color: "#0F172A",
            boxShadow: "0 4px 15px rgba(0,240,255,0.2)"
          }}>
            {(profile.nama || "U")[0].toUpperCase()}
          </div>
          <div>
            <h1 style={{ fontSize: "28px", fontWeight: 700, margin: "0 0 6px" }}>Profil Saya</h1>
            <p style={{ color: "var(--text-grey)", fontSize: "14px", margin: 0 }}>
              Kelola informasi pribadi dan keamanan akun kamu
            </p>
          </div>
        </div>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid rgba(0,240,255,0.2)", borderTopColor: "var(--accent-cyan)",
              animation: "spinCyan 0.8s linear infinite", margin: "0 auto",
            }} />
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            
            {/* Form Edit Profil */}
            <div style={{
              background: "var(--bg-surface)", padding: "28px",
              borderRadius: "12px", border: "1px solid var(--border-cyan)"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>Informasi Dasar</h2>
              <form onSubmit={handleUpdateProfile} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Nama Lengkap</label>
                  <input type="text" name="nama" value={profile.nama} onChange={handleProfileChange} style={inputStyle} required />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Email (Tidak bisa diubah)</label>
                  <input type="email" value={profile.email} disabled style={{ ...inputStyle, opacity: 0.6, cursor: "not-allowed" }} />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Roblox Username</label>
                  <input type="text" name="roblox_username" value={profile.roblox_username} onChange={handleProfileChange} style={inputStyle} placeholder="Cth: builderman" />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Kontak (WA/Discord)</label>
                  <input type="text" name="kontak_wa_discord" value={profile.kontak_wa_discord} onChange={handleProfileChange} style={inputStyle} placeholder="Cth: DiscordUser#1234 atau 0812345..." />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Jenis Kelamin</label>
                  <select name="jenis_kelamin" value={profile.jenis_kelamin} onChange={handleProfileChange} style={inputStyle}>
                    <option value="Laki-laki" style={{ background: "#1E293B" }}>Laki-laki</option>
                    <option value="Perempuan" style={{ background: "#1E293B" }}>Perempuan</option>
                    <option value="Lainnya" style={{ background: "#1E293B" }}>Lainnya</option>
                  </select>
                </div>

                <button type="submit" disabled={isUpdating} style={{
                  marginTop: "8px", padding: "14px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #00F0FF, #0099ff)",
                  color: "#0F172A", border: "none", fontWeight: 700, fontSize: "14px",
                  cursor: isUpdating ? "not-allowed" : "pointer", opacity: isUpdating ? 0.7 : 1,
                  boxShadow: "0 4px 15px rgba(0,240,255,0.3)", transition: "all 0.2s"
                }}>
                  {isUpdating ? "Menyimpan..." : "Simpan Perubahan Profil"}
                </button>
              </form>
            </div>

            {/* Form Ganti Password */}
            <div style={{
              background: "var(--bg-surface)", padding: "28px",
              borderRadius: "12px", border: "1px solid var(--border-subtle)",
              height: "fit-content"
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px", color: "var(--text-white)" }}>Keamanan Akun</h2>
              <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Password Lama</label>
                  <input type="password" name="oldPassword" value={passwords.oldPassword} onChange={handlePasswordChange} style={inputStyle} required />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Password Baru</label>
                  <input type="password" name="newPassword" value={passwords.newPassword} onChange={handlePasswordChange} style={inputStyle} required />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "13px", color: "var(--text-grey)", marginBottom: "6px" }}>Konfirmasi Password Baru</label>
                  <input type="password" name="confirmPassword" value={passwords.confirmPassword} onChange={handlePasswordChange} style={inputStyle} required />
                </div>

                <button type="submit" disabled={isChangingPass} style={{
                  marginTop: "8px", padding: "14px", borderRadius: "8px",
                  background: "rgba(139,92,246,0.15)", color: "#8B5CF6",
                  border: "1px solid rgba(139,92,246,0.3)", fontWeight: 700, fontSize: "14px",
                  cursor: isChangingPass ? "not-allowed" : "pointer", transition: "all 0.2s"
                }}
                  onMouseEnter={e => { if(!isChangingPass) e.currentTarget.style.background = "rgba(139,92,246,0.25)"; }}
                  onMouseLeave={e => { if(!isChangingPass) e.currentTarget.style.background = "rgba(139,92,246,0.15)"; }}
                >
                  {isChangingPass ? "Memproses..." : "Ganti Password"}
                </button>
              </form>
            </div>

          </div>
        )}
      </div>
      <style>{`
        @keyframes spinCyan {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PublicLayout>
  );
}
