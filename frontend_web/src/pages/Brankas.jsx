import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";

export default function Brankas() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  const [assets, setAssets] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("aset");

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch custom orders (dari token)
      const ordersRes = await api.get(`/custom-orders/my-orders`).catch(() => ({ data: { data: [] } }));
      setOrders(ordersRes.data?.data || ordersRes.data || []);

      // Fetch aset digital yang sudah dibeli (library)
      const libraryRes = await api.get(`/orders/library`).catch(() => ({ data: { data: [] } }));
      setAssets(libraryRes.data?.data || libraryRes.data || []);
    } catch (e) {
      console.error("Gagal fetch data brankas:", e);
    }
    setIsLoading(false);
  };

  const handleDownload = (item) => {
    if (item.file_url) {
      window.open(`http://localhost:5000${item.file_url}`, "_blank");
    } else {
      alert("File belum tersedia. Hubungi admin Volter!");
    }
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("selesai")) return { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" };
    if (s.includes("progress") || s.includes("proses")) return { color: "#00F0FF", bg: "rgba(0,240,255,0.1)", border: "rgba(0,240,255,0.3)" };
    if (s.includes("pembayaran") || s.includes("quotation")) return { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" };
    return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  };

  // === UI untuk user yang belum login ===
  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
          {/* Header */}
          <div style={{ marginBottom: "32px" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>
              🔐 Brankas Digital
            </h1>
            <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
              Semua aset dan riwayat pesanan kamu ada di sini
            </p>
          </div>

          {/* Not Logged In Banner */}
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "linear-gradient(135deg, rgba(0,240,255,0.05), rgba(139,92,246,0.08))",
            borderRadius: "var(--radius-lg)",
            border: "1px solid rgba(0,240,255,0.2)",
          }}>
            <div style={{ fontSize: "72px", marginBottom: "20px" }}>🔒</div>
            <h2 style={{ color: "var(--text-white)", marginBottom: "12px", fontSize: "22px" }}>
              Login untuk membuka Brankas kamu
            </h2>
            <p style={{ color: "var(--text-grey)", marginBottom: "32px", fontSize: "14px", maxWidth: "420px", margin: "0 auto 32px" }}>
              Brankas menyimpan semua aset digital dan riwayat custom order kamu. Masuk dulu untuk bisa melihatnya!
            </p>
            <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
              <button
                onClick={() => navigate("/login", { state: { returnTo: "/brankas" } })}
                style={{
                  padding: "13px 36px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #00F0FF, #0891B2)",
                  color: "#0F172A", border: "none", fontWeight: 700,
                  cursor: "pointer", fontSize: "15px", transition: "opacity 0.2s",
                }}
                onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                onMouseLeave={e => e.currentTarget.style.opacity = "1"}
              >
                🔑 Masuk Sekarang
              </button>
              <button
                onClick={() => navigate("/register")}
                style={{
                  padding: "13px 36px", borderRadius: "10px",
                  background: "transparent",
                  color: "var(--text-grey)", border: "1px solid var(--border-subtle)",
                  fontWeight: 600, cursor: "pointer", fontSize: "15px", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; e.currentTarget.style.color = "var(--accent-cyan)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-grey)"; }}
              >
                Daftar Akun
              </button>
            </div>

            {/* Feature Hints */}
            <div style={{ display: "flex", gap: "24px", justifyContent: "center", marginTop: "48px", flexWrap: "wrap" }}>
              {[
                { icon: "📦", label: "Aset Digital Saya" },
                { icon: "📋", label: "Riwayat Custom Order" },
                { icon: "⬇", label: "Download File Langsung" },
              ].map((feat, i) => (
                <div key={i} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
                  padding: "16px 24px", borderRadius: "10px",
                  background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                  minWidth: "120px",
                }}>
                  <span style={{ fontSize: "28px" }}>{feat.icon}</span>
                  <span style={{ fontSize: "12px", color: "var(--text-grey)", fontWeight: 600, textAlign: "center" }}>{feat.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>
            🔐 Brankas Digital
          </h1>
          <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
            Semua aset dan riwayat pesanan kamu ada di sini
          </p>
        </div>

        {/* Tabs */}
        <div style={{
          display: "flex", gap: "6px",
          background: "var(--bg-surface)", padding: "5px",
          borderRadius: "10px", border: "1px solid var(--border-subtle)",
          marginBottom: "28px", width: "fit-content",
        }}>
          {[
            { key: "aset", label: "📦 Aset Saya" },
            { key: "order", label: "📋 Riwayat Custom Order" },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} style={{
              padding: "10px 22px", borderRadius: "7px", fontSize: "14px", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "var(--transition)",
              background: activeTab === tab.key ? "var(--accent-cyan)" : "transparent",
              color: activeTab === tab.key ? "#0F172A" : "var(--text-grey)",
            }}>
              {tab.label}
            </button>
          ))}
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
          <>
            {/* TAB: ASET DIGITAL */}
            {activeTab === "aset" && (
              <div>
                {assets.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "80px 40px",
                    background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>📦</div>
                    <h2 style={{ color: "var(--text-white)", marginBottom: "10px" }}>Brankas masih kosong</h2>
                    <p style={{ color: "var(--text-grey)", marginBottom: "28px", fontSize: "14px" }}>
                      Beli aset dari etalase untuk menyimpannya di sini
                    </p>
                    <button onClick={() => navigate("/")} style={{
                      padding: "12px 32px", borderRadius: "8px",
                      background: "var(--accent-cyan)", color: "var(--bg-primary)",
                      border: "none", fontWeight: 700, cursor: "pointer", fontSize: "14px",
                    }}>
                      Jelajahi Etalase
                    </button>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
                    {assets.map(item => {
                      const imageUrl = item.image_url ? `http://localhost:5000${item.image_url}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${item.asset_id}`;
                      return (
                        <div key={item.id} style={{
                          background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border-cyan)", overflow: "hidden",
                        }}>
                          <div style={{ paddingTop: "60%", position: "relative", background: "var(--bg-primary)" }}>
                            <img src={imageUrl} alt={item.nama} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
                              onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.asset_id}`; }} />
                            <div style={{
                              position: "absolute", top: "10px", right: "10px",
                              padding: "3px 10px", borderRadius: "20px", fontSize: "10px", fontWeight: 700,
                              background: "rgba(34,197,94,0.9)", color: "#fff",
                            }}>✓ DIMILIKI</div>
                          </div>
                          <div style={{ padding: "16px" }}>
                            <h3 style={{ fontSize: "14px", fontWeight: 600, marginBottom: "12px" }}>{item.nama || "Aset Digital"}</h3>
                            <button onClick={() => handleDownload(item)} style={{
                              width: "100%", padding: "11px", borderRadius: "8px",
                              background: "linear-gradient(135deg, #22C55E, #16a34a)",
                              color: "#fff", border: "none", fontWeight: 700, cursor: "pointer",
                              fontSize: "13px", transition: "opacity 0.2s",
                            }}
                              onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                              onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                            >
                              ⬇ Download File
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB: CUSTOM ORDER HISTORY */}
            {activeTab === "order" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {orders.length === 0 ? (
                  <div style={{
                    textAlign: "center", padding: "80px 40px",
                    background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-subtle)",
                  }}>
                    <div style={{ fontSize: "64px", marginBottom: "20px" }}>📋</div>
                    <h2 style={{ color: "var(--text-white)", marginBottom: "10px" }}>Belum ada request</h2>
                    <p style={{ color: "var(--text-grey)", marginBottom: "28px", fontSize: "14px" }}>
                      Buat request jasa custom untuk mulai!
                    </p>
                    <button onClick={() => navigate("/custom-order")} style={{
                      padding: "12px 32px", borderRadius: "8px",
                      background: "var(--accent-purple)", color: "#fff",
                      border: "none", fontWeight: 700, cursor: "pointer", fontSize: "14px",
                    }}>
                      Buat Request Sekarang
                    </button>
                  </div>
                ) : (
                  orders.map(order => {
                    const statusStyle = getStatusColor(order.status);
                    const progress = order.progress || 0;
                    const harga = parseFloat(order.harga_tawaran);
                    const isHargaDeal = harga > 0;

                    return (
                      <div key={order.id} style={{
                        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                        border: `1px solid ${statusStyle.border}`,
                        padding: "20px 24px",
                        transition: "var(--transition)",
                      }}
                        onMouseEnter={e => e.currentTarget.style.boxShadow = `0 0 15px ${statusStyle.bg}`}
                        onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                          <div>
                            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>
                              {order.judul_project}
                            </h3>
                            <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
                              {order.kategori} · {order.platform || "Roblox Studio"}
                            </p>
                          </div>
                          <div style={{
                            padding: "5px 12px", borderRadius: "20px",
                            background: statusStyle.bg, border: `1px solid ${statusStyle.border}`,
                            color: statusStyle.color, fontSize: "11px", fontWeight: 700, letterSpacing: "0.8px",
                            textTransform: "uppercase", flexShrink: 0,
                          }}>
                            {order.status || "Menunggu"}
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div style={{ marginBottom: "16px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                            <span style={{ color: "var(--text-grey)", fontSize: "12px" }}>Progress Pengerjaan</span>
                            <span style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "12px" }}>{progress}%</span>
                          </div>
                          <div style={{ height: "8px", borderRadius: "4px", background: "var(--bg-primary)", overflow: "hidden" }}>
                            <div style={{
                              height: "100%", width: `${progress}%`,
                              background: "linear-gradient(90deg, #00F0FF, #8B5CF6)",
                              borderRadius: "4px", transition: "width 0.5s ease",
                            }} />
                          </div>
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ color: "var(--text-grey)", fontSize: "12px" }}>Harga Deal: </span>
                            <span style={{
                              color: isHargaDeal ? "var(--accent-purple)" : "var(--text-grey)",
                              fontWeight: 700, fontSize: "14px",
                            }}>
                              {isHargaDeal ? `Rp ${harga.toLocaleString("id-ID")}` : "Tunggu Penawaran"}
                            </span>
                          </div>
                          {(order.status || "").toLowerCase().includes("pembayaran") && (
                            <button onClick={() => navigate("/custom-order")} style={{
                              padding: "8px 18px", borderRadius: "8px",
                              background: "var(--accent-cyan)", color: "#0F172A",
                              border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px",
                            }}>
                              💳 Bayar
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
