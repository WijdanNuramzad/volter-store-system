import React, { useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const menuItems = [
  { key: "ringkasan", icon: "📊", label: "Dashboard" },
  { key: "order", icon: "🛠", label: "Kelola Order" },
  { key: "upload", icon: "📦", label: "Kelola Aset" },
  { key: "users", icon: "👥", label: "Manajemen User" },
  { key: "pengaturan", icon: "⚙️", label: "Pengaturan Akun" },
];

const pageTitles = {
  ringkasan: "Dashboard",
  order: "Kelola Custom Order",
  upload: "Kelola Etalase Aset",
  users: "Manajemen User",
  pengaturan: "Pengaturan Akun",
};

export default function AdminLayout({ children, activeMenu, setActiveMenu }) {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div style={{
      display: "flex", height: "100vh",
      backgroundColor: "var(--bg-primary)",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden",
    }}>
      {/* ===== SIDEBAR ===== */}
      <aside style={{
        width: "260px", flexShrink: 0,
        backgroundColor: "var(--bg-surface)",
        borderRight: "1px solid var(--border-cyan)",
        display: "flex", flexDirection: "column",
        overflow: "hidden",
      }}>
        {/* Logo */}
        <div style={{
          padding: "24px 20px",
          borderBottom: "1px solid var(--border-subtle)",
        }}>
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "8px",
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "14px", fontWeight: "bold", color: "#0F172A",
            }}>⚡</div>
            <span style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700,
              fontSize: "16px", color: "#F8FAFC",
            }}>
              VOLTER <span style={{ color: "#00F0FF" }}>ADMIN</span>
            </span>
          </Link>
          {/* User info */}
          <div style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "10px 12px", borderRadius: "8px",
            background: "rgba(0,240,255,0.05)", border: "1px solid rgba(0,240,255,0.1)",
          }}>
            <div style={{
              width: "32px", height: "32px", borderRadius: "50%",
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "13px", fontWeight: "bold", color: "#0F172A", flexShrink: 0,
            }}>
              {(user?.nama || user?.name || "A")[0].toUpperCase()}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ color: "#F8FAFC", fontSize: "13px", fontWeight: 600, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user?.nama || user?.name || "Admin"}
              </p>
              <p style={{ color: "#00F0FF", fontSize: "11px", margin: 0 }}>Super Admin</p>
            </div>
          </div>
        </div>

        {/* Nav Menu */}
        <nav style={{ flex: 1, padding: "12px 12px", overflowY: "auto" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "10px", fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", padding: "0 8px", margin: "8px 0 6px" }}>
            NAVIGASI
          </p>
          {menuItems.map(item => {
            const isActive = activeMenu === item.key;
            return (
              <div
                key={item.key}
                onClick={() => setActiveMenu(item.key)}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "11px 14px", borderRadius: "8px", marginBottom: "2px",
                  cursor: "pointer", transition: "all 0.2s ease",
                  background: isActive ? "rgba(0,240,255,0.1)" : "transparent",
                  borderLeft: isActive ? "3px solid #00F0FF" : "3px solid transparent",
                  color: isActive ? "#00F0FF" : "#94A3B8",
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#F8FAFC"; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; } }}
              >
                <span style={{ fontSize: "16px", minWidth: "20px" }}>{item.icon}</span>
                <span style={{ fontSize: "14px" }}>{item.label}</span>
                {isActive && (
                  <div style={{ marginLeft: "auto", width: "6px", height: "6px", borderRadius: "50%", background: "#00F0FF" }} />
                )}
              </div>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div style={{
          padding: "12px",
          borderTop: "1px solid var(--border-subtle)",
        }}>
          <Link to="/" style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "11px 14px", borderRadius: "8px", marginBottom: "4px",
            color: "#94A3B8", textDecoration: "none", fontSize: "14px",
            transition: "all 0.2s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#F8FAFC"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94A3B8"; }}
          >
            <span style={{ fontSize: "16px" }}>🌐</span>
            <span>Lihat Website</span>
          </Link>
          <button onClick={handleLogout} style={{
            width: "100%", display: "flex", alignItems: "center", gap: "10px",
            padding: "11px 14px", borderRadius: "8px",
            background: "transparent", color: "#EF4444",
            border: "none", cursor: "pointer", fontSize: "14px",
            transition: "all 0.2s", textAlign: "left",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: "16px" }}>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Topbar */}
        <header style={{
          height: "64px", padding: "0 32px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          borderBottom: "1px solid var(--border-subtle)",
          flexShrink: 0,
        }}>
          <div>
            <h1 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "18px", fontWeight: 700, margin: 0, color: "#F8FAFC",
            }}>
              {pageTitles[activeMenu] || "Dashboard"}
            </h1>
            <p style={{ color: "#94A3B8", fontSize: "12px", margin: 0 }}>
              {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            {/* Notification bell (cosmetic) */}
            <div style={{
              width: "36px", height: "36px", borderRadius: "8px",
              background: "var(--bg-elevated, #273449)",
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer", color: "#94A3B8", fontSize: "16px",
              border: "1px solid var(--border-subtle)",
            }}>
              🔔
            </div>
            <div style={{
              padding: "6px 14px", borderRadius: "8px",
              background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)",
              color: "#00F0FF", fontSize: "12px", fontWeight: 600,
            }}>
              Admin Panel
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px 32px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
