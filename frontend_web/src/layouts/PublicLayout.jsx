import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import api from "../services/api";

export default function PublicLayout({ children }) {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCartCount = () => {
      if (isAuthenticated) {
        api.get(`/cart`)
          .then(res => setCartCount((res.data?.data || []).length))
          .catch(() => {});
      } else {
        setCartCount(0);
      }
    };

    fetchCartCount();

    // Listen for custom event emitted by Cart.jsx after add/remove
    window.addEventListener("cartUpdated", fetchCartCount);
    return () => window.removeEventListener("cartUpdated", fetchCartCount);
  }, [isAuthenticated, user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLinks = [
    { path: "/", label: "Beranda" },
    { path: "/brankas", label: "Brankas" },
    { path: "/my-orders", label: "Pesanan Custom" },
  ];

  const isActive = (path) => {
    if (path === "/" ) return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* === NAVBAR === */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        height: "64px",
        background: scrolled
          ? "rgba(15, 23, 42, 0.95)"
          : "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(12px)",
        borderBottom: scrolled
          ? "1px solid rgba(0, 240, 255, 0.2)"
          : "1px solid transparent",
        transition: "all 0.3s ease",
        display: "flex", alignItems: "center",
      }}>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", padding: "0 24px",
          width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{
              width: "34px", height: "34px", borderRadius: "8px",
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", fontWeight: "bold", color: "#0F172A",
              boxShadow: "0 0 12px rgba(0, 240, 255, 0.4)",
            }}>⚡</div>
            <span style={{
              fontFamily: "Poppins, sans-serif", fontWeight: 700,
              fontSize: "18px", color: "#F8FAFC", letterSpacing: "0.5px",
            }}>
              VOLTER<span style={{ color: "#00F0FF" }}> STORE</span>
            </span>
          </Link>

          {/* Nav Links – Desktop */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }} className="nav-links-desktop">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} style={{
                padding: "8px 16px",
                borderRadius: "8px",
                fontSize: "14px", fontWeight: 500,
                color: isActive(link.path) ? "#00F0FF" : "#94A3B8",
                background: isActive(link.path) ? "rgba(0, 240, 255, 0.1)" : "transparent",
                border: isActive(link.path) ? "1px solid rgba(0, 240, 255, 0.25)" : "1px solid transparent",
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
                onMouseEnter={e => { if (!isActive(link.path)) { e.currentTarget.style.color = "#F8FAFC"; e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}}
                onMouseLeave={e => { if (!isActive(link.path)) { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            
            {/* Wishlist Icon */}
            {isAuthenticated && (
              <Link to="/wishlist" style={{ color: "#94A3B8", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                title="Wishlist"
              >
                <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </Link>
            )}

            {/* Cart Icon */}
            <Link to="/cart" style={{ position: "relative", color: "#94A3B8", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.color = "#00F0FF"}
              onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/>
              </svg>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute", top: "-6px", right: "-8px",
                  background: "#EF4444", color: "#fff",
                  borderRadius: "50%", fontSize: "10px", fontWeight: "bold",
                  width: "18px", height: "18px", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>

            {/* Auth Area */}
            {isAuthenticated ? (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {user?.role === "admin" && (
                  <Link to="/admin" style={{
                    padding: "7px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                    background: "rgba(139,92,246,0.15)", color: "#8B5CF6",
                    border: "1px solid rgba(139,92,246,0.3)", textDecoration: "none",
                  }}>Panel Admin</Link>
                )}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link to="/profile" style={{ textDecoration: "none" }}>
                    <div style={{
                      width: "32px", height: "32px", borderRadius: "50%",
                      background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "13px", fontWeight: "bold", color: "#0F172A",
                      boxShadow: "0 0 8px rgba(0,240,255,0)", transition: "all 0.2s"
                    }}
                      onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 10px rgba(0,240,255,0.5)"}
                      onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 8px rgba(0,240,255,0)"}
                    >
                      {(user?.nama || user?.name || "U")[0].toUpperCase()}
                    </div>
                  </Link>
                  <button onClick={handleLogout} style={{
                    padding: "7px 14px", borderRadius: "6px", fontSize: "13px", fontWeight: 600,
                    background: "transparent", color: "#EF4444",
                    border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" style={{
                padding: "9px 20px", borderRadius: "8px", fontSize: "14px", fontWeight: 600,
                background: "linear-gradient(135deg, #00F0FF, #0099ff)",
                color: "#0F172A", textDecoration: "none",
                boxShadow: "0 0 12px rgba(0, 240, 255, 0.3)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 20px rgba(0, 240, 255, 0.5)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 12px rgba(0, 240, 255, 0.3)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* === PAGE CONTENT === */}
      <main style={{ flex: 1, paddingTop: "64px" }}>
        {children}
      </main>

      {/* === FOOTER === */}
      <footer style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-cyan)",
        padding: "48px 24px 24px",
        marginTop: "auto",
      }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          {/* Footer Top */}
          <div style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1fr",
            gap: "40px",
            marginBottom: "40px",
          }}>
            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "15px", fontWeight: "bold", color: "#0F172A",
                }}>⚡</div>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px" }}>
                  VOLTER<span style={{ color: "#00F0FF" }}> STORE</span>
                </span>
              </div>
              <p style={{ color: "#94A3B8", fontSize: "13px", lineHeight: "1.7", maxWidth: "260px" }}>
                Platform komunitas kreatif Roblox terpercaya. Map, Script, dan aset digital berkualitas premium dari para kreator terbaik.
              </p>
            </div>

            {/* Navigasi */}
            <div>
              <h4 style={{ color: "#F8FAFC", fontSize: "14px", fontWeight: 600, marginBottom: "16px", letterSpacing: "0.3px" }}>Navigasi</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {navLinks.map(link => (
                  <Link key={link.path} to={link.path} style={{ color: "#94A3B8", fontSize: "13px", textDecoration: "none" }}
                    onMouseEnter={e => e.currentTarget.style.color = "#00F0FF"}
                    onMouseLeave={e => e.currentTarget.style.color = "#94A3B8"}
                  >{link.label}</Link>
                ))}
              </div>
            </div>

            {/* Layanan */}
            <div>
              <h4 style={{ color: "#F8FAFC", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Layanan</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {["Map Roblox", "Script Luau", "3D Model", "Audio FX", "UI/UX"].map(s => (
                  <span key={s} style={{ color: "#94A3B8", fontSize: "13px" }}>{s}</span>
                ))}
              </div>
            </div>

            {/* Komunitas */}
            <div>
              <h4 style={{ color: "#F8FAFC", fontSize: "14px", fontWeight: 600, marginBottom: "16px" }}>Komunitas</h4>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ color: "#94A3B8", fontSize: "13px" }}>Tentang Kami</span>
                <span style={{ color: "#94A3B8", fontSize: "13px" }}>Tim Kreator</span>
                <span style={{ color: "#94A3B8", fontSize: "13px" }}>Kebijakan</span>
              </div>
            </div>
          </div>

          {/* Footer Bottom */}
          <div style={{
            borderTop: "1px solid rgba(148, 163, 184, 0.1)",
            paddingTop: "24px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <p style={{ color: "#475569", fontSize: "12px" }}>
              © 2026 Volter Community System. Dibuat oleh Tim Volter · Universitas Cipasung
            </p>
            <p style={{ color: "#475569", fontSize: "12px" }}>
              Powered by <span style={{ color: "#00F0FF" }}>Node.js</span> & <span style={{ color: "#8B5CF6" }}>React</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
