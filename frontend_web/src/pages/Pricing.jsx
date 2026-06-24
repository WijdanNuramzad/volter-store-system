import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import PublicLayout from "../layouts/PublicLayout";

// === DATA PAKET HARGA ===
const PRICING_PACKAGES = [
  {
    id: "basic",
    name: "Basic",
    icon: "🌱",
    tagline: "Cocok untuk kebutuhan sederhana",
    color: "#22C55E",
    colorBg: "rgba(34,197,94,0.08)",
    colorBorder: "rgba(34,197,94,0.25)",
    colorGlow: "rgba(34,197,94,0.2)",
    harga: "Rp 20.000",
    hargaRange: "Rp 20.000 – Rp 75.000",
    popular: false,
    features: [
      { label: "1 Map / Script sederhana", included: true },
      { label: "Ukuran project kecil (< 100 part)", included: true },
      { label: "Revisi 2x", included: true },
      { label: "Estimasi 1-3 hari", included: true },
      { label: "File source disertakan", included: true },
      { label: "Prioritas pengerjaan", included: false },
      { label: "Konsultasi desain", included: false },
      { label: "Revisi unlimited", included: false },
    ],
    category: "Aset Digital & Jasa",
    note: "Cocok untuk: Trap system, GUI sederhana, map lobby kecil",
  },
  {
    id: "standard",
    name: "Standard",
    icon: "⚡",
    tagline: "Pilihan paling populer",
    color: "#00F0FF",
    colorBg: "rgba(0,240,255,0.08)",
    colorBorder: "rgba(0,240,255,0.35)",
    colorGlow: "rgba(0,240,255,0.25)",
    harga: "Rp 100.000",
    hargaRange: "Rp 100.000 – Rp 350.000",
    popular: true,
    features: [
      { label: "1 Map / Script menengah", included: true },
      { label: "Ukuran project medium (100-500 part)", included: true },
      { label: "Revisi 5x", included: true },
      { label: "Estimasi 3-7 hari", included: true },
      { label: "File source disertakan", included: true },
      { label: "Prioritas pengerjaan", included: true },
      { label: "Konsultasi desain (1 sesi)", included: true },
      { label: "Revisi unlimited", included: false },
    ],
    category: "Aset Digital & Jasa",
    note: "Cocok untuk: Game system, RPG map, Admin panel, Obby kompleks",
  },
  {
    id: "premium",
    name: "Premium",
    icon: "👑",
    tagline: "Kualitas terbaik tanpa kompromi",
    color: "#8B5CF6",
    colorBg: "rgba(139,92,246,0.08)",
    colorBorder: "rgba(139,92,246,0.35)",
    colorGlow: "rgba(139,92,246,0.25)",
    harga: "Rp 400.000",
    hargaRange: "Rp 400.000 – Rp 1.500.000+",
    popular: false,
    features: [
      { label: "Project kompleks / full game system", included: true },
      { label: "Ukuran project besar (500+ part)", included: true },
      { label: "Revisi Unlimited", included: true },
      { label: "Estimasi sesuai scope project", included: true },
      { label: "File source + dokumentasi disertakan", included: true },
      { label: "Prioritas pengerjaan TERTINGGI", included: true },
      { label: "Konsultasi desain (unlimited)", included: true },
      { label: "After-sales support 30 hari", included: true },
    ],
    category: "Jasa Custom Order",
    note: "Cocok untuk: Full game, sistem ekonomi, 3D build kompleks",
  },
];

// === DATA KATEGORI LAYANAN ===
const LAYANAN = [
  {
    icon: "🗺️",
    nama: "Map Building",
    deskripsi: "Pembuatan map Roblox dari konsep sederhana hingga open world kompleks. Berbasis Roblox Studio.",
    mulaiDari: "Rp 20.000",
    estimasi: "1 – 14 hari",
    color: "#00F0FF",
  },
  {
    icon: "💻",
    nama: "Scripting Luau",
    deskripsi: "Pembuatan script game Roblox menggunakan Luau. Game system, AI, ekonomi, hingga UI.",
    mulaiDari: "Rp 30.000",
    estimasi: "2 – 10 hari",
    color: "#8B5CF6",
  },
  {
    icon: "🎲",
    nama: "3D Modeling",
    deskripsi: "Pembuatan model 3D custom untuk Roblox, character, props, hingga environment asset.",
    mulaiDari: "Rp 50.000",
    estimasi: "3 – 14 hari",
    color: "#F59E0B",
  },
  {
    icon: "🎨",
    nama: "UI/UX Design",
    deskripsi: "Desain antarmuka game Roblox yang modern dan responsif. GUI custom sesuai tema game.",
    mulaiDari: "Rp 25.000",
    estimasi: "2 – 7 hari",
    color: "#EC4899",
  },
  {
    icon: "🎵",
    nama: "Audio & SFX",
    deskripsi: "Aset audio, sound effect, dan musik latar untuk game Roblox. Format sesuai standar platform.",
    mulaiDari: "Rp 15.000",
    estimasi: "1 – 5 hari",
    color: "#22C55E",
  },
  {
    icon: "🔧",
    nama: "Plugin & Tools",
    deskripsi: "Pembuatan plugin Roblox Studio custom untuk mempercepat workflow development game kamu.",
    mulaiDari: "Rp 75.000",
    estimasi: "3 – 7 hari",
    color: "#F97316",
  },
];

// === FAQ DATA ===
const FAQ_LIST = [
  {
    q: "Bagaimana cara melakukan pemesanan custom order?",
    a: "Daftar / login ke akun Volter Store, lalu klik menu 'Pesanan Custom' dan isi form request dengan detail project kamu. Tim kami akan memberikan penawaran harga dalam 1×24 jam.",
  },
  {
    q: "Apakah harga bisa dinegosiasi?",
    a: "Ya! Harga yang tertera adalah estimasi. Harga final ditentukan setelah diskusi dengan tim berdasarkan kompleksitas dan scope project kamu.",
  },
  {
    q: "Berapa lama estimasi pengerjaan?",
    a: "Tergantung kompleksitas project. Basic 1-3 hari, Standard 3-7 hari, Premium sesuai scope. Estimasi lebih detail akan diberikan saat konfirmasi order.",
  },
  {
    q: "Apakah file source code disertakan?",
    a: "Ya, semua paket menyertakan file source. Paket Premium juga dilengkapi dengan dokumentasi teknis.",
  },
  {
    q: "Metode pembayaran apa yang diterima?",
    a: "Saat ini kami menerima pembayaran melalui transfer bank dan e-wallet (GoPay, OVO, Dana). Detail akan dikirimkan setelah quotation disetujui.",
  },
];

function FAQItem({ faq }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      style={{
        background: "var(--bg-surface)", borderRadius: "12px",
        border: open ? "1px solid rgba(0,240,255,0.3)" : "1px solid var(--border-subtle)",
        overflow: "hidden", transition: "border-color 0.2s",
        cursor: "pointer",
      }}
      onClick={() => setOpen(p => !p)}
    >
      <div style={{
        padding: "18px 24px", display: "flex", justifyContent: "space-between",
        alignItems: "center", gap: "16px",
      }}>
        <p style={{ color: "var(--text-white)", fontWeight: 600, fontSize: "14px", margin: 0 }}>
          {faq.q}
        </p>
        <span style={{
          color: open ? "#00F0FF" : "var(--text-grey)",
          fontSize: "20px", lineHeight: 1, flexShrink: 0,
          transform: open ? "rotate(45deg)" : "rotate(0)",
          transition: "transform 0.3s, color 0.2s",
        }}>+</span>
      </div>
      {open && (
        <div style={{
          padding: "0 24px 18px",
          borderTop: "1px solid var(--border-subtle)",
          paddingTop: "14px",
        }}>
          <p style={{ color: "var(--text-grey)", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>{faq.a}</p>
        </div>
      )}
    </div>
  );
}

export default function Pricing() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  return (
    <PublicLayout>
      {/* === HERO === */}
      <section style={{
        padding: "96px 24px 64px",
        background: "linear-gradient(180deg, rgba(0,240,255,0.04) 0%, transparent 60%)",
        textAlign: "center", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: "10%", left: "5%", width: "400px", height: "400px",
          borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(0,240,255,0.07) 0%, transparent 70%)",
        }} />
        <div style={{
          position: "absolute", top: "20%", right: "5%", width: "350px", height: "350px",
          borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)",
        }} />

        <div style={{ maxWidth: "720px", margin: "0 auto", position: "relative" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "6px 16px", borderRadius: "20px", marginBottom: "24px",
            background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.25)",
            fontSize: "13px", color: "#00F0FF", fontWeight: 600,
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#00F0FF", animation: "glowPulse 1.5s ease infinite" }} />
            Transparan & Terjangkau
          </div>

          <h1 style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "clamp(32px, 5vw, 60px)",
            fontWeight: 800, lineHeight: "1.1",
            marginBottom: "20px", letterSpacing: "-1px",
          }}>
            Harga{" "}
            <span style={{
              background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
            }}>
              Layanan
            </span>
          </h1>

          <p style={{
            color: "var(--text-grey)", fontSize: "clamp(14px, 2vw, 17px)",
            maxWidth: "520px", margin: "0 auto 0", lineHeight: "1.7",
          }}>
            Harga transparan, kualitas premium. Pilih paket yang sesuai kebutuhanmu atau diskusikan langsung dengan tim.
          </p>
        </div>
      </section>

      {/* === PAKET HARGA === */}
      <section style={{ maxWidth: "1200px", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>PAKET LAYANAN</p>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Pilih Paket yang Tepat</h2>
          <p style={{ color: "var(--text-grey)", fontSize: "14px", marginTop: "10px" }}>
            Semua paket sudah termasuk file source dan garansi kepuasan
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px", alignItems: "start" }}>
          {PRICING_PACKAGES.map(pkg => (
            <div
              key={pkg.id}
              onMouseEnter={() => setHoveredCard(pkg.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                position: "relative",
                background: pkg.popular
                  ? `linear-gradient(135deg, ${pkg.colorBg}, rgba(15,23,42,0.95))`
                  : "var(--bg-surface)",
                borderRadius: "20px",
                border: `1px solid ${hoveredCard === pkg.id || pkg.popular ? pkg.colorBorder : "var(--border-subtle)"}`,
                padding: "32px",
                transition: "all 0.3s",
                transform: (hoveredCard === pkg.id || pkg.popular) ? "translateY(-6px)" : "translateY(0)",
                boxShadow: (hoveredCard === pkg.id || pkg.popular) ? `0 20px 50px ${pkg.colorGlow}` : "none",
              }}
            >
              {/* Popular Badge */}
              {pkg.popular && (
                <div style={{
                  position: "absolute", top: "-14px", left: "50%", transform: "translateX(-50%)",
                  padding: "5px 20px", borderRadius: "20px",
                  background: `linear-gradient(135deg, ${pkg.color}, #8B5CF6)`,
                  color: "#0F172A", fontSize: "12px", fontWeight: 800,
                  letterSpacing: "1px", whiteSpace: "nowrap",
                  boxShadow: `0 4px 15px ${pkg.colorGlow}`,
                }}>
                  ⭐ PALING POPULER
                </div>
              )}

              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "20px" }}>
                <div style={{
                  width: "52px", height: "52px", borderRadius: "14px",
                  background: pkg.colorBg, border: `1px solid ${pkg.colorBorder}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "24px",
                }}>
                  {pkg.icon}
                </div>
                <div>
                  <h3 style={{ fontFamily: "Poppins", fontWeight: 800, fontSize: "20px", color: pkg.color, margin: 0 }}>
                    {pkg.name}
                  </h3>
                  <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>{pkg.tagline}</p>
                </div>
              </div>

              {/* Harga */}
              <div style={{ marginBottom: "24px", paddingBottom: "24px", borderBottom: "1px solid var(--border-subtle)" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", color: "var(--text-grey)" }}>Mulai dari</span>
                </div>
                <p style={{
                  fontFamily: "Poppins", fontWeight: 800, fontSize: "30px",
                  color: pkg.color, margin: 0, lineHeight: 1,
                }}>
                  {pkg.harga}
                </p>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: "6px 0 0" }}>
                  Range: <span style={{ color: "var(--text-white)", fontWeight: 600 }}>{pkg.hargaRange}</span>
                </p>
                <p style={{ color: "var(--text-grey)", fontSize: "11px", margin: "4px 0 0", fontStyle: "italic" }}>
                  * Harga final sesuai diskusi
                </p>
              </div>

              {/* Features */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px" }}>
                {pkg.features.map((feat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{
                      width: "18px", height: "18px", borderRadius: "50%",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "11px", fontWeight: 700, flexShrink: 0,
                      background: feat.included ? `${pkg.color}20` : "rgba(255,255,255,0.05)",
                      color: feat.included ? pkg.color : "#475569",
                      border: `1px solid ${feat.included ? pkg.colorBorder : "transparent"}`,
                    }}>
                      {feat.included ? "✓" : "×"}
                    </span>
                    <span style={{
                      fontSize: "13px",
                      color: feat.included ? "var(--text-white)" : "#475569",
                      fontWeight: feat.included ? 500 : 400,
                    }}>
                      {feat.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* Note */}
              <div style={{
                padding: "10px 14px", borderRadius: "8px",
                background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-subtle)",
                marginBottom: "24px",
              }}>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0, lineHeight: "1.5" }}>
                  💡 {pkg.note}
                </p>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate("/custom-order")}
                style={{
                  width: "100%", padding: "14px",
                  borderRadius: "10px", fontWeight: 700, fontSize: "14px",
                  border: "none", cursor: "pointer", transition: "all 0.2s",
                  background: pkg.popular
                    ? `linear-gradient(135deg, ${pkg.color}, #8B5CF6)`
                    : `${pkg.color}18`,
                  color: pkg.popular ? "#0F172A" : pkg.color,
                  boxShadow: pkg.popular ? `0 4px 20px ${pkg.colorGlow}` : "none",
                }}
                onMouseEnter={e => {
                  if (!pkg.popular) {
                    e.currentTarget.style.background = `${pkg.color}30`;
                    e.currentTarget.style.boxShadow = `0 4px 15px ${pkg.colorGlow}`;
                  } else {
                    e.currentTarget.style.opacity = "0.9";
                  }
                }}
                onMouseLeave={e => {
                  if (!pkg.popular) {
                    e.currentTarget.style.background = `${pkg.color}18`;
                    e.currentTarget.style.boxShadow = "none";
                  } else {
                    e.currentTarget.style.opacity = "1";
                  }
                }}
              >
                {pkg.popular ? "🚀 Pesan Sekarang" : "Mulai Request"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* === KATEGORI LAYANAN === */}
      <section style={{
        background: "var(--bg-surface)",
        borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)",
        padding: "80px 24px",
      }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "48px" }}>
            <p style={{ color: "var(--accent-purple)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>KATEGORI JASA</p>
            <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Layanan Kami</h2>
            <p style={{ color: "var(--text-grey)", fontSize: "14px", marginTop: "10px" }}>
              Berbagai jasa kreatif Roblox dengan harga kompetitif
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
            {LAYANAN.map((l, i) => (
              <div key={i} style={{
                padding: "24px",
                background: "var(--bg-primary)", borderRadius: "16px",
                border: "1px solid var(--border-subtle)",
                display: "flex", flexDirection: "column", gap: "12px",
                transition: "all 0.2s", cursor: "default",
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = `${l.color}40`;
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = `0 8px 25px ${l.color}15`;
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "var(--border-subtle)";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "44px", height: "44px", borderRadius: "12px",
                    background: `${l.color}15`, border: `1px solid ${l.color}35`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "22px", flexShrink: 0,
                  }}>
                    {l.icon}
                  </div>
                  <div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-white)", margin: 0 }}>{l.nama}</h3>
                    <p style={{ color: l.color, fontSize: "11px", fontWeight: 700, margin: 0, marginTop: "2px" }}>
                      Mulai {l.mulaiDari}
                    </p>
                  </div>
                </div>

                <p style={{ color: "var(--text-grey)", fontSize: "13px", lineHeight: "1.6", margin: 0 }}>
                  {l.deskripsi}
                </p>

                <div style={{
                  display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 12px", borderRadius: "8px",
                  background: `${l.color}08`, border: `1px solid ${l.color}20`,
                  marginTop: "auto",
                }}>
                  <svg width="12" height="12" fill="none" stroke={l.color} strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path strokeLinecap="round" d="M12 6v6l4 2" />
                  </svg>
                  <span style={{ color: l.color, fontSize: "12px", fontWeight: 600 }}>Estimasi: {l.estimasi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ === */}
      <section style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 24px" }}>
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <p style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700, letterSpacing: "2px", textTransform: "uppercase", marginBottom: "8px" }}>FAQ</p>
          <h2 style={{ fontSize: "28px", fontWeight: 700, margin: 0 }}>Pertanyaan Umum</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {FAQ_LIST.map((faq, i) => <FAQItem key={i} faq={faq} />)}
        </div>
      </section>

      {/* === CTA === */}
      <section style={{ padding: "0 24px 80px" }}>
        <div style={{
          maxWidth: "800px", margin: "0 auto",
          background: "linear-gradient(135deg, rgba(0,240,255,0.08) 0%, rgba(139,92,246,0.08) 100%)",
          border: "1px solid rgba(0,240,255,0.2)",
          borderRadius: "var(--radius-xl)",
          padding: "56px 48px",
          textAlign: "center",
        }}>
          <h2 style={{ fontSize: "28px", fontWeight: 800, marginBottom: "14px" }}>
            Masih bingung pilih paket?
          </h2>
          <p style={{ color: "var(--text-grey)", fontSize: "15px", marginBottom: "32px", maxWidth: "460px", margin: "0 auto 32px" }}>
            Konsultasikan kebutuhanmu dengan tim Volter. Kami akan bantu menentukan paket yang paling tepat dan efisien!
          </p>
          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={() => navigate("/custom-order")}
              style={{
                padding: "14px 36px", borderRadius: "10px",
                background: "linear-gradient(135deg, #00F0FF, #0099ff)",
                color: "#0F172A", border: "none", fontWeight: 700,
                cursor: "pointer", fontSize: "15px",
                boxShadow: "0 4px 20px rgba(0,240,255,0.3)",
                transition: "all 0.25s",
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,240,255,0.45)"; }}
              onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,240,255,0.3)"; }}
            >
              💬 Mulai Konsultasi
            </button>
            <Link to="/portfolio" style={{
              padding: "14px 36px", borderRadius: "10px",
              background: "transparent",
              color: "var(--text-grey)", border: "1px solid var(--border-subtle)",
              textDecoration: "none", fontWeight: 600, fontSize: "15px", transition: "all 0.2s",
              display: "inline-flex", alignItems: "center",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--accent-purple)"; e.currentTarget.style.color = "#8B5CF6"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-subtle)"; e.currentTarget.style.color = "var(--text-grey)"; }}
            >
              Lihat Portofolio
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
