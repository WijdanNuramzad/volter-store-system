import React, { useState, useContext } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";
import Swal from "sweetalert2";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await api.post("/users/login", formData);
      const userData = res.data.userData;
      const userToken = res.data.token;

      if (userData) {
        login(userData, userToken);
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil',
          text: `Selamat datang kembali, ${userData.nama || userData.name || 'User'}!`,
          timer: 1500,
          showConfirmButton: false,
          background: '#1E293B',
          color: '#F8FAFC'
        });

        if (userData.role === "admin") {
          navigate("/admin");
        } else {
          const returnTo = location.state?.returnTo || "/";
          navigate(returnTo);
        }
      } else {
        setErrorMsg('Gagal mengambil data user dari server!');
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login gagal:", error);
      setErrorMsg(error.response?.data?.message || "Email atau password salah.");
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginCard}>
        {/* Title Clickable (Back to Home) */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <h1 style={styles.title}>
            VOLTER <span style={{ color: "#00F0FF" }}>STORE</span>
          </h1>
        </Link>
        <p style={styles.subtitle}>Selamat Datang!</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="email"
            placeholder="Alamat Email"
            style={styles.input}
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
          
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              style={{ ...styles.input, width: "100%", paddingRight: "40px" }}
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
            {/* Toggle Show Password */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                background: "transparent",
                border: "none",
                color: "#94A3B8",
                cursor: "pointer",
                padding: "5px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s"
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = "#00F0FF"}
              onMouseLeave={(e) => e.currentTarget.style.color = "#94A3B8"}
            >
              {showPassword ? (
                // Eye-off icon
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              ) : (
                // Eye icon
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>

          {/* Visual Error Message */}
          {errorMsg && (
            <p style={{ color: "#EF4444", fontSize: "13px", margin: "0", textAlign: "left" }}>
              {errorMsg}
            </p>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-5px", marginBottom: "5px" }}>
            <Link to="/forgot-password" style={{ color: "#00F0FF", fontSize: "13px", textDecoration: "none" }}>
              Lupa Password?
            </Link>
          </div>

          <button 
            type="submit" 
            style={{ 
              ...styles.button, 
              opacity: isLoading ? 0.7 : 1, 
              cursor: isLoading ? "not-allowed" : "pointer" 
            }} 
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </button>
        </form>

        {/* Link Register */}
        <p style={{ color: "#94A3B8", fontSize: "14px", marginTop: "24px", marginBottom: 0 }}>
          Belum punya akun? <Link to="/register" style={{ color: "#00F0FF", textDecoration: "none", fontWeight: "bold" }}>Daftar</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0F172A",
  },
  loginCard: {
    width: "400px",
    padding: "40px",
    backgroundColor: "#1E293B",
    borderRadius: "16px",
    border: "1px solid rgba(0, 240, 255, 0.2)",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  title: { color: "#F8FAFC", fontSize: "28px", margin: 0, transition: "color 0.2s" },
  subtitle: { color: "#94A3B8", marginBottom: "30px", marginTop: "8px" },
  form: { display: "flex", flexDirection: "column", gap: "15px" },
  input: {
    padding: "14px",
    backgroundColor: "#0F172A",
    color: "#F8FAFC",
    border: "1px solid #475569",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
    boxSizing: "border-box" // memastikan padding tidak merusak lebar 100%
  },
  button: {
    padding: "14px",
    backgroundColor: "#00F0FF",
    color: "#0F172A",
    border: "none",
    borderRadius: "8px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "5px",
    fontSize: "15px",
    transition: "background-color 0.2s",
  },
};
