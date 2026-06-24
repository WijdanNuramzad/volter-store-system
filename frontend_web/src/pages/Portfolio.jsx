import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import PublicLayout from "../layouts/PublicLayout";

const KATEGORI_ICONS = {
  "Map": "🗺️",
  "Script": "💻",
  "3D Model": "🎲",
  "Audio": "🎵",
  "UI/UX": "🎨",
  "Plugin": "🔧",
};

const KATEGORI_COLORS = {
  "Map": { color: "#00F0FF", bg: "rgba(0,240,255,0.08)", border: "rgba(0,240,255,0.25)" },
  "Script": { color: "#8B5CF6", bg: "rgba(139,92,246,0.08)", border: "rgba(139,92,246,0.25)" },
  "3D Model": { color: "#F59E0B", bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.25)" },
  "Audio": { color: "#22C55E", bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.25)" },
  "UI/UX": { color: "#EC4899", bg: "rgba(236,72,153,0.08)", border: "rgba(236,72,153,0.25)" },
  "Plugin": { color: "#F97316", bg: "rgba(249,115,22,0.08)", border: "rgba(249,115,22,0.25)" },
};

function PortfolioCard({ item }) {
  const [hovered, setHovered] = useState(false);
  const katColor = KATEGORI_COLORS[item.kategori] || KATEGORI_COLORS["Map"];
  const katIcon = KATEGORI_ICONS[item.kategori] || "✨";
  const imageUrl = item.image_url
    ? `http://localhost:5000${item.image_url}`
    : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.nama)}&backgroundColor=0F172A`;
  const isFree = item.is_free === 1 || parseFloat(item.harga) === 0;

  return (
    <Link
      to={`/product/${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: "none",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: hovered ? `1px solid ${katColor.color}80` : "1px solid var(--border-subtle)",
        overflow: "hidden",
        display: "flex", flexDirection: "column",
        transition: "var(--transition)",
        transform: hovered ? "translateY(-5px)" : "translateY(0)",
        boxShadow: hovered ? `0 12px 40px ${katColor.color}20` : "none",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingTop: "60%", overflow: "hidden", background: "#0a1628" }}>
        <img
          src={imageUrl}
          alt={item.nama}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.5s ease",
            transform: hovered ? "scale(1.08)" : "scale(1)",
          }}
          onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}`; }}
        />
        {/* Overlay on hover */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, ${katColor.color}30, transparent)`,
          opacity: hovered ? 1 : 0, transition: "opacity 0.3s",
        }} />
        {/* Kategori Badge */}
        <div style={{
          position: "absolute", top: "12px", left: "12px",
          padding: "4px 12px", borderRadius: "20px",
          fontSize: "11px", fontWeight: 700, letterSpacing: "0.5px",
          background: katColor.bg, border: `1px solid ${katColor.border}`,
          color: katColor.color, backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", gap: "5px",
        }}>
          {katIcon} {item.kategori || "Karya"}
        </div>
        {/* Price Badge */}
        <div style={{
          position: "absolute", top: "12px", right: "12px",
          padding: "4px 10px", borderRadius: "20px",
          fontSize: "10px", fontWeight: 700,
          background: isFree ? "rgba(34,197,94,0.85)" : "rgba(139,92,246,0.85)",
          color: "#fff", backdropFilter: "blur(4px)",
        }}>
          {isFree ? "GRATIS" : "PREMIUM"}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "18px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
        <h3 style={{
          fontSize: "15px", fontWeight: 700, color: "var(--text-white)",
          lineHeight: "1.4", margin: 0,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.nama}
        </h3>
        {item.deskripsi && (
          <p style={{
            fontSize: "12px", color: "var(--text-grey)", lineHeight: "1.6",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            margin: 0,
          }}>
            {item.deskripsi}
          </p>
        )}
        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "8px" }}>
          <span style={{
            fontFamily: "Poppins, sans-serif", fontWeight: 700,
            color: isFree ? "#22C55E" : katColor.color,
            fontSize: "15px",
          }}>
            {isFree ? "GRATIS" : `Rp ${parseFloat(item.harga).toLocaleString("id-ID")}`}
          </span>
          <span style={{
            fontSize: "12px", color: hovered ? katColor.color : "var(--text-grey)",
            fontWeight: 600, transition: "color 0.2s",
          }}>
            Lihat Detail →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Portfolio() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeKat, setActiveKat] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await api.get("/assets");
        const data = res.data?.data || res.data || [];
        setItems(data);
        setFiltered(data);
      } catch (e) {
        console.error("Gagal fetch portfolio:", e);
      }
      setIsLoading(false);
    };
    fetchData();
  }, []);

  const kategoriList = ["Semua", ...Array.from(new Set(items.map(p => p.kategori).filter(Boolean)))];

  useEffect(() => {
    let result = [...items];
    if (activeKat !== "Semua") result = result.filter(p => p.kategori === activeKat);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nama?.toLowerCase().includes(q) ||
        p.deskripsi?.toLowerCase().includes(q) ||
        p.kategori?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [items, activeKat, searchQuery]);

  // Statistik
  const stats = {
    total: items.length,
    gratis: items.filter(i => parseFloat(i.harga) === 0 || i.is_free === 1).length,
    kategori: new Set(items.map(i => i.kategori).filter(Boolean)).size,
  };

  return (
    <PublicLayout>
      {/* === HERO === */}
      <section style={{
        padding: "96px 24px 64px",
        background: "linear-gradient(180deg, rgba(139,92,246,0.05) 0%, transparent 60%)",
        position: "relative", overflow: "hidden",
        textAlign: "center",
      }}>
        {/* Decorations */}
        <div style={{
          position: "absolute", top: "10%", left: "0%",
          width: "500px", height: "500px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.07) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "0%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)",
          filter: "blur(50px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "20px", marginBottom: "24px",
            background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.3)",
            fontSize: "13px", color: "#8B5CF6", fontWeight: 600,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#8B5CF6", animation: "glowPulse 1.5s ease infinite" }} />
            Galeri Karya Volter
          </div>

          <h1 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(32px, 5vw, 60px)",
            fontWeight: 800, lineHeight: "1.1",
            marginBottom: "20px", letterSpacing: "-1px",
          }}>
            Portofolio{" "}
            <span style={{
              background: "linear-gradient(135deg, #8B5CF6, #00F0FF)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Karya Kami
            </span>
          </h1>

          <p style={{
            color: "var(--text-grey)", fontSize: "clamp(14px, 2vw, 17px)",
            maxWidth: "520px", margin: "0 auto 40px", lineHeight: "1.7",
          }}>
            Koleksi lengkap aset digital dan karya custom yang telah dibuat oleh tim Volter — tersedia untuk kamu miliki.
          </p>

          {/* Stats Row */}
          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap" }}>
            {[
              { value: stats.total, label: "Total Karya", color: "#00F0FF" },
              { value: stats.gratis, label: "Karya Gratis", color: "#22C55E" },
              { value: stats.kategori, label: "Kategori", color: "#8B5CF6" },
            ].map((s, i) => (
              <div key={i} style={{
                padding: "14px 28px", borderRadius: "12px",
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                textAlign: "center",
              }}>
                <p style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "28px", color: s.color, margin: 0 }}>
                  {s.value}
                </p>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0, marginTop: "2px" }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FILTER & GALLERY === */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Search + Filter Bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          marginBottom: "24px", flexWrap: "wrap",
        }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }}
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Cari nama atau deskripsi karya..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "11px 40px 11px 42px",
                background: "var(--bg-surface)", color: "var(--text-white)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px", fontSize: "14px", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(139,92,246,0.5)"}
              onBlur={e => e.target.style.borderColor = "var(--border-subtle)"}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px",
              }}>×</button>
            )}
          </div>
          <span style={{ color: "var(--text-grey)", fontSize: "13px", whiteSpace: "nowrap" }}>
            {filtered.length} karya
          </span>
        </div>

        {/* Kategori Tabs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "28px" }}>
          {kategoriList.map(kat => {
            const katColor = kat !== "Semua" ? KATEGORI_COLORS[kat] : null;
            const isActive = activeKat === kat;
            return (
              <button
                key={kat}
                onClick={() => setActiveKat(kat)}
                style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 18px", borderRadius: "20px",
                  fontSize: "13px", fontWeight: 600, border: "none", cursor: "pointer",
                  transition: "all 0.2s",
                  background: isActive
                    ? (kat === "Semua" ? "var(--accent-cyan)" : katColor?.color || "var(--accent-cyan)")
                    : "rgba(255,255,255,0.05)",
                  color: isActive ? "#0F172A" : "var(--text-grey)",
                  boxShadow: isActive ? `0 0 12px ${katColor?.color || "#00F0FF"}50` : "none",
                }}
              >
                {kat !== "Semua" && (KATEGORI_ICONS[kat] || "✦")} {kat}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{
                background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)", overflow: "hidden",
              }}>
                <div className="skeleton" style={{ paddingTop: "60%" }} />
                <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div className="skeleton" style={{ height: "14px", width: "75%" }} />
                  <div className="skeleton" style={{ height: "12px", width: "55%" }} />
                  <div className="skeleton" style={{ height: "16px", width: "35%", marginTop: "8px" }} />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "100px 40px",
            background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ fontSize: "56px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ color: "var(--text-white)", marginBottom: "8px" }}>Karya tidak ditemukan</h3>
            <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>Coba ubah filter atau kata kunci pencarian</p>
            <button onClick={() => { setActiveKat("Semua"); setSearchQuery(""); }} style={{
              marginTop: "20px", padding: "10px 24px", borderRadius: "8px",
              background: "var(--accent-cyan)", color: "#0F172A",
              border: "none", fontWeight: 700, cursor: "pointer",
            }}>
              Reset Filter
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
            {filtered.map(item => <PortfolioCard key={item.id} item={item} />)}
          </div>
        )}
      </section>

      {/* === CTA CUSTOM ORDER === */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          background: "linear-gradient(135deg, rgba(139,92,246,0.1) 0%, rgba(0,240,255,0.07) 100%)",
          border: "1px solid rgba(139,92,246,0.25)",
          borderRadius: "var(--radius-xl)",
          padding: "56px 48px",
          textAlign: "center", position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-60px", left: "-60px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)",
          }} />
          <h2 style={{ fontSize: "30px", fontWeight: 800, marginBottom: "14px" }}>
            Punya ide karya sendiri?
          </h2>
          <p style={{ color: "var(--text-grey)", fontSize: "16px", marginBottom: "32px", maxWidth: "480px", margin: "0 auto 32px" }}>
            Buat request custom order dan tim Volter akan mewujudkan idemu. Konsultasi awal <strong style={{ color: "#22C55E" }}>GRATIS!</strong>
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/custom-order" style={{
              padding: "14px 36px", borderRadius: "10px",
              background: "linear-gradient(135deg, #8B5CF6, #00F0FF)",
              color: "#0F172A", textDecoration: "none",
              fontWeight: 700, fontSize: "15px",
              boxShadow: "0 4px 20px rgba(139,92,246,0.35)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,92,246,0.5)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.35)"; }}
            >
              🚀 Pesan Custom Sekarang
            </Link>
            <Link to="/pricing" style={{
              padding: "14px 36px", borderRadius: "10px",
              background: "transparent",
              color: "var(--text-grey)", border: "1px solid var(--border-subtle)",
              textDecoration: "none", fontWeight: 600, fontSize: "15px", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-cyan)"; e.currentTarget.style.color = "var(--accent-cyan)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-grey)"; }}
            >
              Lihat Harga
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
