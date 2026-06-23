import React, { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import Swal from "sweetalert2";

// === HELPER: Format Rupiah ===
const formatRupiah = (harga) => {
  const num = parseFloat(harga) || 0;
  if (num === 0) return "GRATIS";
  return "Rp " + num.toLocaleString("id-ID");
};

// === KOMPONEN KARTU PRODUK ===
function ProductCard({ item }) {
  const [hovered, setHovered] = useState(false);

  const isFree = item.is_free === 1 || parseFloat(item.harga) === 0;
  const imageUrl = item.image_url
    ? `http://localhost:5000${item.image_url}`
    : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(item.nama)}&backgroundColor=0F172A`;

  return (
    <Link
      to={`/product/${item.id}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        textDecoration: "none",
        background: "var(--bg-surface)",
        borderRadius: "var(--radius-lg)",
        border: hovered ? "1px solid rgba(0,240,255,0.5)" : "1px solid var(--border-cyan)",
        overflow: "hidden",
        cursor: "pointer",
        transition: "var(--transition)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        boxShadow: hovered ? "var(--glow-cyan)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Thumbnail */}
      <div style={{ position: "relative", paddingTop: "65%", overflow: "hidden", background: "var(--bg-primary)" }}>
        <img
          src={imageUrl}
          alt={item.nama}
          style={{
            position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
            objectFit: "cover",
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.06)" : "scale(1)",
          }}
          onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.id}`; }}
        />
        {/* Badge GRATIS / BERBAYAR */}
        <div style={{
          position: "absolute", top: "10px", left: "10px",
          padding: "4px 10px", borderRadius: "20px",
          fontSize: "10px", fontWeight: 700, letterSpacing: "0.8px",
          background: isFree ? "rgba(34,197,94,0.9)" : "rgba(139,92,246,0.9)",
          color: "#fff",
          backdropFilter: "blur(4px)",
        }}>
          {isFree ? "✦ GRATIS" : "PREMIUM"}
        </div>
        
        {/* Tombol Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            item.onToggleWishlist(item.id);
          }}
          style={{
            position: "absolute", top: "10px", right: "10px",
            width: "32px", height: "32px", borderRadius: "50%",
            background: "rgba(15, 23, 42, 0.6)", border: "none",
            color: item.isWishlisted ? "#EF4444" : "#F8FAFC",
            fontSize: "16px", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)", transition: "all 0.2s"
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.1)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          title="Toggle Wishlist"
        >
          {item.isWishlisted ? "❤️" : "🤍"}
        </button>
      </div>

      {/* Info */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
        <h3 style={{
          fontSize: "14px", fontWeight: 600, color: "var(--text-white)",
          lineHeight: "1.4", margin: 0,
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
        }}>
          {item.nama}
        </h3>

        {item.deskripsi && (
          <p style={{
            fontSize: "12px", color: "var(--text-grey)", lineHeight: "1.5",
            overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
            margin: 0,
          }}>
            {item.deskripsi}
          </p>
        )}

        <div style={{ marginTop: "auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{
            fontFamily: "Poppins, sans-serif",
            fontWeight: 700,
            fontSize: isFree ? "14px" : "15px",
            color: isFree ? "var(--accent-green)" : "var(--accent-purple)",
          }}>
            {formatRupiah(item.harga)}
          </span>
          <div style={{
            width: "30px", height: "30px", borderRadius: "8px",
            background: hovered ? "var(--accent-cyan)" : "rgba(0,240,255,0.1)",
            display: "flex", alignItems: "center", justifyContent: "center",
            transition: "var(--transition)",
          }}>
            <svg width="14" height="14" fill="none" stroke={hovered ? "#0F172A" : "#00F0FF"} strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

// === KOMPONEN SKELETON CARD ===
function SkeletonCard() {
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-subtle)", overflow: "hidden",
    }}>
      <div className="skeleton" style={{ paddingTop: "65%" }} />
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div className="skeleton" style={{ height: "14px", width: "80%" }} />
        <div className="skeleton" style={{ height: "12px", width: "60%" }} />
        <div className="skeleton" style={{ height: "16px", width: "40%", marginTop: "8px" }} />
      </div>
    </div>
  );
}

// === KOMPONEN STATS BAR ===
function StatsBar({ stats }) {
  const items = [
    { label: "Total Karya", value: stats.total_karya || 0, icon: "🎨", color: "#00F0FF" },
    { label: "Order Selesai", value: stats.order_selesai || 0, icon: "✅", color: "#22C55E" },
    { label: "Karya Gratis", value: stats.karya_gratis || 0, icon: "🎁", color: "#8B5CF6" },
  ];

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
      gap: "16px", marginBottom: "48px",
    }}>
      {items.map(item => (
        <div key={item.label} style={{
          background: "var(--bg-surface)",
          borderRadius: "var(--radius-md)",
          border: `1px solid ${item.color}33`,
          padding: "20px 24px",
          display: "flex", alignItems: "center", gap: "16px",
        }}>
          <span style={{ fontSize: "28px" }}>{item.icon}</span>
          <div>
            <p style={{ fontSize: "22px", fontWeight: 800, color: item.color, fontFamily: "Poppins, sans-serif", margin: 0 }}>
              {item.value.toLocaleString()}
            </p>
            <p style={{ fontSize: "12px", color: "var(--text-grey)", margin: 0 }}>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// === KOMPONEN TESTIMONIAL ===
function TestimonialCard({ t }) {
  return (
    <div style={{
      background: "var(--bg-surface)",
      borderRadius: "var(--radius-lg)",
      border: "1px solid var(--border-subtle)",
      padding: "24px",
    }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "12px" }}>
        {[1,2,3,4,5].map(star => (
          <span key={star} style={{ color: star <= (t.rating || 5) ? "#F59E0B" : "#475569", fontSize: "16px" }}>★</span>
        ))}
      </div>
      <p style={{ color: "var(--text-grey)", fontSize: "13px", lineHeight: "1.6", marginBottom: "16px", fontStyle: "italic" }}>
        "{t.komentar || t.ulasan || "Karya yang sangat memuaskan! Tim Volter benar-benar profesional."}"
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "36px", height: "36px", borderRadius: "50%",
          background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 700, fontSize: "14px", color: "#0F172A",
        }}>
          {(t.nama || t.user_nama || "U")[0].toUpperCase()}
        </div>
        <div>
          <p style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600, margin: 0 }}>
            {t.nama || t.user_nama || "Klien Volter"}
          </p>
          <p style={{ color: "var(--text-grey)", fontSize: "11px", margin: 0 }}>
            {t.roblox_username ? `@${t.roblox_username}` : "Customer"}
          </p>
        </div>
      </div>
    </div>
  );
}

// === HALAMAN UTAMA HOME ===
export default function Home() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [activeKategori, setActiveKategori] = useState("Semua");
  const [sortBy, setSortBy] = useState("terbaru");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [stats, setStats] = useState({ total_karya: 0, order_selesai: 0, karya_gratis: 0 });
  const [wishlistIds, setWishlistIds] = useState([]);
  
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const filterTabs = ["Semua", "Gratis", "Berbayar"];
  const sortOptions = [
    { value: "terbaru", label: "Terbaru" },
    { value: "termurah", label: "Termurah" },
    { value: "termahal", label: "Termahal" },
    { value: "az", label: "A → Z" },
  ];

  // Kategori unik diambil dinamis dari data produk
  const kategoriList = ["Semua", ...Array.from(new Set(products.map(p => p.kategori).filter(Boolean)))];

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [assetsRes, statsRes] = await Promise.allSettled([
          api.get("/assets"),
          api.get("/custom-orders/admin/dashboard/stats"),
        ]);

        if (assetsRes.status === "fulfilled") {
          const data = assetsRes.value.data?.data || assetsRes.value.data || [];
          setProducts(data);
          setFiltered(data);
          setStats(prev => ({ ...prev, total_karya: data.length, karya_gratis: data.filter(d => parseFloat(d.harga) === 0 || d.is_free === 1).length }));
        }

        if (statsRes.status === "fulfilled") {
          const s = statsRes.value.data?.data || statsRes.value.data || {};
          setStats(prev => ({ ...prev, order_selesai: s.order_aktif || 0 }));
        }
      } catch (e) {
        console.error("Gagal fetch data:", e);
      }
      setIsLoading(false);
    };

    // Fetch testimonials secara terpisah (opsional, tidak crash kalau endpoint belum ada)
    api.get("/custom-orders/reviews").then(res => {
      setTestimonials((res.data?.data || res.data || []).slice(0, 4));
    }).catch(() => {
      // Fallback testimonials statis
      setTestimonials([
        { id: 1, rating: 5, komentar: "Map yang dibuat sangat detail dan sesuai permintaan! Prosesnya cepat banget.", nama: "Arya Pratama", roblox_username: "aryacraft" },
        { id: 2, rating: 5, komentar: "Scriptnya clean dan well-commented. Gampang dipahami dan tidak ada bug sama sekali!", nama: "Rizky Aditya", roblox_username: "rizkydev" },
        { id: 3, rating: 5, komentar: "Pelayanannya ramah dan responsif. Hasil akhirnya melebihi ekspektasi saya.", nama: "Dinda Putri", roblox_username: "dindagames" },
        { id: 4, rating: 5, komentar: "Recommended banget! Harga terjangkau tapi kualitas premium.", nama: "Bagas Eko", roblox_username: "bagasrbx" },
      ]);
    });

    fetchData();
  }, []);

  // Fetch Wishlist IDs if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api.get("/wishlist").then(res => {
        setWishlistIds(res.data.data.map(item => item.id));
      }).catch(err => console.error("Gagal fetch wishlist:", err));
    } else {
      setWishlistIds([]);
    }
  }, [isAuthenticated]);

  const handleToggleWishlist = async (assetId) => {
    if (!isAuthenticated) {
      Swal.fire({
        icon: 'warning', title: 'Login Diperlukan',
        text: 'Silakan login terlebih dahulu untuk menyimpan ke wishlist.',
        background: '#1E293B', color: '#F8FAFC',
        showCancelButton: true, confirmButtonText: 'Login Sekarang', confirmButtonColor: '#00F0FF'
      }).then((result) => {
        if (result.isConfirmed) navigate("/login");
      });
      return;
    }
    
    // Optimistic UI update
    const isCurrentlyWishlisted = wishlistIds.includes(assetId);
    if (isCurrentlyWishlisted) {
      setWishlistIds(prev => prev.filter(id => id !== assetId));
    } else {
      setWishlistIds(prev => [...prev, assetId]);
    }

    try {
      await api.post(`/wishlist/toggle/${assetId}`);
    } catch (error) {
      console.error("Toggle wishlist gagal", error);
      // Revert if failed
      if (isCurrentlyWishlisted) {
        setWishlistIds(prev => [...prev, assetId]);
      } else {
        setWishlistIds(prev => prev.filter(id => id !== assetId));
      }
    }
  };

  // Filter, Sort & Search
  useEffect(() => {
    let result = [...products];

    // 1. Filter Harga (Gratis/Berbayar)
    if (activeFilter === "Gratis") result = result.filter(p => parseFloat(p.harga) === 0 || p.is_free === 1);
    if (activeFilter === "Berbayar") result = result.filter(p => parseFloat(p.harga) > 0 && p.is_free !== 1);

    // 2. Filter Kategori
    if (activeKategori !== "Semua") result = result.filter(p => p.kategori === activeKategori);

    // 3. Search teks (nama + deskripsi + kategori)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.nama?.toLowerCase().includes(q) ||
        p.deskripsi?.toLowerCase().includes(q) ||
        p.kategori?.toLowerCase().includes(q)
      );
    }

    // 4. Sort
    if (sortBy === "termurah") result.sort((a, b) => parseFloat(a.harga) - parseFloat(b.harga));
    else if (sortBy === "termahal") result.sort((a, b) => parseFloat(b.harga) - parseFloat(a.harga));
    else if (sortBy === "az") result.sort((a, b) => a.nama?.localeCompare(b.nama));
    // "terbaru" → default order dari backend (DESC created_at)

    setFiltered(result);
  }, [products, activeFilter, activeKategori, searchQuery, sortBy]);

  // Helper: reset semua filter
  const handleResetFilter = () => {
    setSearchQuery("");
    setActiveFilter("Semua");
    setActiveKategori("Semua");
    setSortBy("terbaru");
  };

  const isFiltered = searchQuery || activeFilter !== "Semua" || activeKategori !== "Semua" || sortBy !== "terbaru";

  const chipStyle = {
    display: "inline-flex", alignItems: "center", gap: "4px",
    padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: 600,
    background: "rgba(0,240,255,0.08)", color: "#00F0FF",
    border: "1px solid rgba(0,240,255,0.2)", cursor: "pointer",
    transition: "background 0.2s",
  };

  return (
    <PublicLayout>
      {/* === HERO SECTION === */}
      <section style={{
        position: "relative",
        padding: "96px 24px 80px",
        overflow: "hidden",
        background: "linear-gradient(180deg, rgba(0,240,255,0.03) 0%, transparent 60%)",
      }}>
        {/* Background Decorations */}
        <div style={{
          position: "absolute", top: "20%", left: "5%",
          width: "400px", height: "400px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,240,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: "30%", right: "5%",
          width: "350px", height: "350px", borderRadius: "50%",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
          filter: "blur(40px)", pointerEvents: "none",
        }} />

        <div style={{ maxWidth: "1280px", margin: "0 auto", textAlign: "center", position: "relative" }}>
          {/* Eyebrow label */}
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "20px", marginBottom: "24px",
            background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)",
            fontSize: "13px", color: "#00F0FF", fontWeight: 600,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F0FF", animation: "glowPulse 1.5s ease infinite" }} />
            Komunitas Kreator Roblox Terpercaya
          </div>

          {/* Heading */}
          <h1 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(36px, 6vw, 72px)",
            fontWeight: 800,
            lineHeight: "1.1",
            marginBottom: "20px",
            letterSpacing: "-1px",
          }}>
            Dapatkan{" "}
            <span style={{
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Map & Script
            </span>
            <br />Roblox Premium
          </h1>

          <p style={{
            color: "var(--text-grey)", fontSize: "clamp(15px, 2vw, 18px)",
            maxWidth: "560px", margin: "0 auto 40px", lineHeight: "1.7",
          }}>
            Koleksi aset digital berkualitas tinggi dari kreator berpengalaman.
            Gratis hingga premium — semua untuk membangun dunia Roblox-mu.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="#catalog" style={{
              padding: "14px 32px", borderRadius: "10px",
              background: "linear-gradient(135deg, #00F0FF, #0099ff)",
              color: "#0F172A", textDecoration: "none",
              fontWeight: 700, fontSize: "15px",
              boxShadow: "0 4px 20px rgba(0,240,255,0.3)",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,240,255,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,240,255,0.3)"; }}
            >
              Jelajahi Katalog ↓
            </a>
            <Link to="/custom-order" style={{
              padding: "14px 32px", borderRadius: "10px",
              background: "rgba(139,92,246,0.15)", color: "#8B5CF6",
              border: "1px solid rgba(139,92,246,0.35)", textDecoration: "none",
              fontWeight: 700, fontSize: "15px",
              transition: "all 0.25s",
            }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(139,92,246,0.25)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(139,92,246,0.15)"; }}
            >
              ✦ Pesan Jasa Custom
            </Link>
          </div>
        </div>
      </section>

      {/* === STATS BAR === */}
      <section style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 16px" }}>
        <StatsBar stats={stats} />
      </section>

      {/* === CATALOG SECTION === */}
      <section id="catalog" style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 24px 80px" }}>
        {/* Section Header */}
        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
            ETALASE DIGITAL
          </p>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Karya Terbaru Volter</h2>
        </div>

        {/* Filter & Search Bar */}
        {/* ── Baris Utama ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px", flexWrap: "wrap" }}>
          {/* Search */}
          <div style={{ flex: 1, minWidth: "220px", position: "relative" }}>
            <svg style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8", pointerEvents: "none" }}
              width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Cari nama, deskripsi, atau kategori..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: "100%", padding: "11px 40px 11px 42px",
                background: "var(--bg-surface)", color: "var(--text-white)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "10px", fontSize: "14px", outline: "none",
                transition: "border-color 0.2s", boxSizing: "border-box",
              }}
              onFocus={e => e.target.style.borderColor = "rgba(0,240,255,0.5)"}
              onBlur={e => e.target.style.borderColor = "var(--border-subtle)"}
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")} style={{
                position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)",
                background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "16px",
              }}>×</button>
            )}
          </div>

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding: "11px 14px", background: "var(--bg-surface)",
              color: "var(--text-white)", border: "1px solid var(--border-subtle)",
              borderRadius: "10px", fontSize: "13px", cursor: "pointer", outline: "none",
            }}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value} style={{ background: "#1E293B" }}>{opt.label}</option>
            ))}
          </select>

          {/* Tombol Filter Lanjutan */}
          <button
            onClick={() => setShowAdvanced(p => !p)}
            style={{
              display: "flex", alignItems: "center", gap: "6px",
              padding: "11px 16px", borderRadius: "10px", fontSize: "13px", fontWeight: 600,
              background: showAdvanced ? "rgba(0,240,255,0.15)" : "var(--bg-surface)",
              color: showAdvanced ? "#00F0FF" : "var(--text-grey)",
              border: showAdvanced ? "1px solid rgba(0,240,255,0.4)" : "1px solid var(--border-subtle)",
              cursor: "pointer", transition: "all 0.2s", whiteSpace: "nowrap",
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" d="M3 4h18M7 10h10M11 16h2" />
            </svg>
            Filter
            {isFiltered && (
              <span style={{
                width: "8px", height: "8px", borderRadius: "50%",
                background: "#EF4444", display: "inline-block",
              }} />
            )}
          </button>

          {/* Result Count */}
          <span style={{ color: "var(--text-grey)", fontSize: "13px", whiteSpace: "nowrap" }}>
            {filtered.length} karya
          </span>
        </div>

        {/* ── Panel Filter Lanjutan (Collapsible) ── */}
        {showAdvanced && (
          <div style={{
            background: "var(--bg-surface)", borderRadius: "12px",
            border: "1px solid var(--border-subtle)", padding: "20px",
            marginBottom: "20px", display: "flex", flexDirection: "column", gap: "16px",
          }}>
            {/* Filter Harga */}
            <div>
              <p style={{ color: "var(--text-grey)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Harga</p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {filterTabs.map(tab => (
                  <button key={tab} onClick={() => setActiveFilter(tab)} style={{
                    padding: "7px 18px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                    border: "none", cursor: "pointer", transition: "all 0.2s",
                    background: activeFilter === tab ? "var(--accent-cyan)" : "rgba(255,255,255,0.05)",
                    color: activeFilter === tab ? "#0F172A" : "var(--text-grey)",
                  }}>{tab}</button>
                ))}
              </div>
            </div>

            {/* Filter Kategori */}
            {kategoriList.length > 1 && (
              <div>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "1px", marginBottom: "10px" }}>Kategori</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {kategoriList.map(kat => {
                    const count = kat === "Semua" ? products.length : products.filter(p => p.kategori === kat).length;
                    return (
                      <button key={kat} onClick={() => setActiveKategori(kat)} style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: 600,
                        border: "none", cursor: "pointer", transition: "all 0.2s",
                        background: activeKategori === kat ? "rgba(139,92,246,0.2)" : "rgba(255,255,255,0.05)",
                        color: activeKategori === kat ? "#8B5CF6" : "var(--text-grey)",
                        boxShadow: activeKategori === kat ? "0 0 0 1px rgba(139,92,246,0.5)" : "none",
                      }}>
                        {kat}
                        <span style={{
                          fontSize: "11px", fontWeight: 700, padding: "1px 6px", borderRadius: "10px",
                          background: activeKategori === kat ? "rgba(139,92,246,0.3)" : "rgba(255,255,255,0.08)",
                          color: activeKategori === kat ? "#8B5CF6" : "#64748B",
                        }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reset */}
            {isFiltered && (
              <button onClick={handleResetFilter} style={{
                alignSelf: "flex-start", padding: "7px 16px", borderRadius: "8px", fontSize: "13px",
                background: "transparent", color: "#EF4444",
                border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer",
              }}>
                ✕ Reset Semua Filter
              </button>
            )}
          </div>
        )}

        {/* ── Chips Filter Aktif ── */}
        {isFiltered && !showAdvanced && (
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "16px", alignItems: "center" }}>
            <span style={{ color: "var(--text-grey)", fontSize: "12px" }}>Aktif:</span>
            {activeFilter !== "Semua" && (
              <span style={chipStyle} onClick={() => setActiveFilter("Semua")}>Harga: {activeFilter} ×</span>
            )}
            {activeKategori !== "Semua" && (
              <span style={chipStyle} onClick={() => setActiveKategori("Semua")}>Kategori: {activeKategori} ×</span>
            )}
            {sortBy !== "terbaru" && (
              <span style={chipStyle} onClick={() => setSortBy("terbaru")}>Urut: {sortOptions.find(o=>o.value===sortBy)?.label} ×</span>
            )}
            {searchQuery && (
              <span style={chipStyle} onClick={() => setSearchQuery("")}>Cari: "{searchQuery}" ×</span>
            )}
            <button onClick={handleResetFilter} style={{
              background: "transparent", border: "none", color: "#EF4444",
              fontSize: "12px", cursor: "pointer", fontWeight: 600,
            }}>Reset semua</button>
          </div>
        )}

        {/* Product Grid */}
        {isLoading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "20px" }}>
            {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px",
            background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
            <h3 style={{ color: "var(--text-white)", marginBottom: "8px" }}>Karya tidak ditemukan</h3>
            <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
              Coba ubah kata kunci atau filter pencarian
            </p>
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "20px",
          }}>
            {filtered.map(item => (
              <ProductCard 
                key={item.id} 
                item={{
                  ...item, 
                  isWishlisted: wishlistIds.includes(item.id),
                  onToggleWishlist: handleToggleWishlist
                }} 
              />
            ))}
          </div>
        )}
      </section>

      {/* === TESTIMONIALS SECTION === */}
      {testimonials.length > 0 && (
        <section style={{
          background: "var(--bg-surface)",
          borderTop: "1px solid var(--border-subtle)",
          padding: "80px 24px",
        }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
            <div style={{ textAlign: "center", marginBottom: "48px" }}>
              <p style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>
                ULASAN KLIEN
              </p>
              <h2 style={{ fontSize: "28px", fontWeight: 700 }}>Apa Kata Mereka?</h2>
              <p style={{ color: "var(--text-grey)", fontSize: "14px", marginTop: "10px" }}>
                Ratusan klien puas dengan hasil karya komunitas Volter
              </p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "20px" }}>
              {testimonials.map((t, i) => <TestimonialCard key={t.id || i} t={t} />)}
            </div>
          </div>
        </section>
      )}

      {/* === CTA BANNER === */}
      <section style={{ padding: "80px 24px" }}>
        <div style={{
          maxWidth: "900px", margin: "0 auto",
          background: "linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(0,240,255,0.2)",
          borderRadius: "var(--radius-xl)",
          padding: "56px 48px",
          textAlign: "center",
          position: "relative", overflow: "hidden",
        }}>
          <div style={{
            position: "absolute", top: "-60px", right: "-60px",
            width: "200px", height: "200px", borderRadius: "50%",
            background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
          }} />
          <h2 style={{ fontSize: "32px", fontWeight: 800, marginBottom: "16px" }}>
            Punya ide project sendiri?
          </h2>
          <p style={{ color: "var(--text-grey)", fontSize: "16px", marginBottom: "32px", maxWidth: "500px", margin: "0 auto 32px" }}>
            Tim Volter siap membantu mewujudkan map dan script impianmu dari nol. Konsultasi gratis!
          </p>
          <Link to="/custom-order" style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "16px 40px", borderRadius: "10px",
            background: "linear-gradient(135deg, #8B5CF6, #00F0FF)",
            color: "#0F172A", textDecoration: "none",
            fontWeight: 700, fontSize: "15px",
            boxShadow: "0 4px 20px rgba(139,92,246,0.3)",
            transition: "all 0.25s",
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(139,92,246,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(139,92,246,0.3)"; }}
          >
            🚀 Buat Request Sekarang
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}
