import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";

// === Step Indicator ===
function StepIndicator({ currentStep, steps }) {
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: "48px" }}>
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <React.Fragment key={index}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "44px", height: "44px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: "15px", transition: "all 0.3s ease",
                background: isDone ? "var(--accent-cyan)" : isActive ? "rgba(0,240,255,0.15)" : "var(--bg-surface)",
                border: isDone
                  ? "2px solid var(--accent-cyan)"
                  : isActive
                  ? "2px solid var(--accent-cyan)"
                  : "2px solid var(--text-muted)",
                color: isDone ? "#0F172A" : isActive ? "var(--accent-cyan)" : "var(--text-grey)",
                boxShadow: isActive ? "0 0 15px rgba(0,240,255,0.3)" : "none",
              }}>
                {isDone ? "✓" : index + 1}
              </div>
              <span style={{
                fontSize: "11px", fontWeight: 600, textAlign: "center",
                color: isActive ? "var(--accent-cyan)" : isDone ? "var(--text-white)" : "var(--text-grey)",
                maxWidth: "80px",
              }}>
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div style={{
                flex: 1, height: "2px", margin: "0 8px", marginBottom: "28px",
                background: isDone ? "var(--accent-cyan)" : "var(--text-muted)",
                transition: "background 0.3s ease",
              }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// === Input Components ===
function FormInput({ label, value, onChange, placeholder, type = "text", required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-grey)" }}>
        {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
      </label>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          padding: "13px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
          border: `1px solid ${focused ? "var(--accent-cyan)" : "var(--text-muted)"}`,
          borderRadius: "10px", fontSize: "14px", outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(0,240,255,0.1)" : "none",
          transition: "all 0.2s",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function FormTextarea({ label, value, onChange, placeholder, rows = 4, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-grey)" }}>
        {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
      </label>
      <textarea
        rows={rows} value={value} onChange={onChange} placeholder={placeholder}
        style={{
          padding: "13px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
          border: `1px solid ${focused ? "var(--accent-cyan)" : "var(--text-muted)"}`,
          borderRadius: "10px", fontSize: "14px", outline: "none", resize: "vertical",
          boxShadow: focused ? "0 0 0 3px rgba(0,240,255,0.1)" : "none",
          transition: "all 0.2s",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function FormSelect({ label, value, onChange, options, required }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      <label style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-grey)" }}>
        {label} {required && <span style={{ color: "var(--accent-red)" }}>*</span>}
      </label>
      <select
        value={value} onChange={onChange}
        style={{
          padding: "13px 16px", background: "var(--bg-primary)", color: "var(--text-white)",
          border: `1px solid ${focused ? "var(--accent-cyan)" : "var(--text-muted)"}`,
          borderRadius: "10px", fontSize: "14px", outline: "none",
          boxShadow: focused ? "0 0 0 3px rgba(0,240,255,0.1)" : "none",
          transition: "all 0.2s", cursor: "pointer",
        }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      >
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

// === MAIN COMPONENT ===
export default function CustomOrder() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [myOrders, setMyOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [activeView, setActiveView] = useState("form"); // "form" | "history"

  // Form State (sama persis dengan mobile)
  const [form, setForm] = useState({
    judul_project: "",
    kategori: "Map",
    platform: "Roblox Studio",
    skala: "Menengah (Standar)",
    tema: "Cyberpunk",
    link_referensi: "",
    urgensi: "Santai (Standar)",
    estimasi_budget: "Rp 50.000 - Rp 150.000",
    deskripsi: "",
  });

  const set = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  const steps = [
    { title: "Info Dasar" },
    { title: "Spesifikasi & Visual" },
    { title: "Referensi & Logistik" },
    { title: "Deskripsi Detail" },
  ];

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      api.get(`/custom-orders/${user.id}`)
        .then(res => setMyOrders(res.data?.data || res.data || []))
        .catch(() => {})
        .finally(() => setOrdersLoading(false));
    } else {
      setOrdersLoading(false);
    }
  }, [isAuthenticated, user, submitSuccess]);

  const validateStep = () => {
    if (currentStep === 0 && !form.judul_project.trim()) {
      alert("Judul Project wajib diisi!");
      return false;
    }
    if (currentStep === 3 && !form.deskripsi.trim()) {
      alert("Deskripsi detail wajib diisi!");
      return false;
    }
    return true;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      // Submit
      if (!isAuthenticated) { navigate("/login", { state: { returnTo: location.pathname } }); return; }
      setIsSubmitting(true);
      try {
        await api.post("/custom-orders", {
          buyer_id: user.id,
          ...form,
        });
        setSubmitSuccess(true);
        setCurrentStep(0);
        setForm({
          judul_project: "", kategori: "Map", platform: "Roblox Studio",
          skala: "Menengah (Standar)", tema: "Cyberpunk", link_referensi: "",
          urgensi: "Santai (Standar)", estimasi_budget: "Rp 50.000 - Rp 150.000", deskripsi: "",
        });
        setActiveView("history");
      } catch (e) {
        alert(e.response?.data?.message || "Gagal mengirim request. Cek koneksi!");
      }
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const getStatusStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("selesai")) return { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" };
    if (s.includes("progress") || s.includes("proses")) return { color: "#00F0FF", bg: "rgba(0,240,255,0.1)", border: "rgba(0,240,255,0.3)" };
    if (s.includes("pembayaran") || s.includes("quotation")) return { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" };
    return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  };

  return (
    <PublicLayout>
      {/* Success Toast */}
      {submitSuccess && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          padding: "14px 20px", borderRadius: "10px",
          background: "rgba(34,197,94,0.9)", color: "#fff",
          fontWeight: 600, fontSize: "14px", backdropFilter: "blur(8px)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)", animation: "fadeInUp 0.3s ease",
        }}>
          🚀 Request berhasil dikirim ke Markas!
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>
            🛠 Jasa Custom Roblox
          </h1>
          <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
            Ceritakan ide map atau script impianmu, tim Volter siap mewujudkannya!
          </p>
        </div>

        {/* View Toggle */}
        <div style={{
          display: "flex", gap: "6px", background: "var(--bg-surface)",
          padding: "5px", borderRadius: "10px", border: "1px solid var(--border-subtle)",
          marginBottom: "36px", width: "fit-content",
        }}>
          {[
            { key: "form", label: "✦ Buat Request Baru" },
            { key: "history", label: `📋 Riwayat Pesanan (${myOrders.length})` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveView(tab.key)} style={{
              padding: "10px 22px", borderRadius: "7px", fontSize: "14px", fontWeight: 600,
              border: "none", cursor: "pointer", transition: "var(--transition)",
              background: activeView === tab.key ? "var(--accent-cyan)" : "transparent",
              color: activeView === tab.key ? "#0F172A" : "var(--text-grey)",
            }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* === FORM VIEW === */}
        {activeView === "form" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "32px", alignItems: "start" }}>
            {/* Form Card */}
            <div style={{
              background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-cyan)", padding: "36px",
            }}>
              <StepIndicator currentStep={currentStep} steps={steps} />

              {/* Step 1: Info Dasar */}
              {currentStep === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Informasi Dasar</h2>
                  <p style={{ color: "var(--text-grey)", fontSize: "13px", marginTop: 0, marginBottom: "4px" }}>Identitas utama project-mu</p>

                  <FormInput label="Judul Project" value={form.judul_project} onChange={set("judul_project")} placeholder="Contoh: Battle Royale Map Cyberpunk City" required />
                  <FormSelect label="Kategori Jasa" value={form.kategori} onChange={set("kategori")} required
                    options={["Map", "Script", "3D Model", "Audio", "UI/UX"]} />
                  <FormSelect label="Platform / Engine Tujuan" value={form.platform} onChange={set("platform")} required
                    options={["Roblox Studio", "Unity", "Unreal Engine", "Web/Figma"]} />
                </div>
              )}

              {/* Step 2: Spesifikasi & Visual */}
              {currentStep === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Spesifikasi & Visual</h2>
                  <p style={{ color: "var(--text-grey)", fontSize: "13px", marginTop: 0, marginBottom: "4px" }}>Tingkat kerumitan dan tema</p>

                  <FormSelect label="Skala Project" value={form.skala} onChange={set("skala")} required
                    options={["Kecil (Cepat)", "Menengah (Standar)", "Besar (Kompleks)"]} />
                  <FormSelect label="Tema / Gaya Visual" value={form.tema} onChange={set("tema")} required
                    options={["Cyberpunk", "Low-Poly", "Realistic", "Sci-Fi", "Pixel Art / Anime", "Medieval", "Lainnya (Tulis di deskripsi)"]} />
                </div>
              )}

              {/* Step 3: Referensi & Logistik */}
              {currentStep === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Referensi & Logistik</h2>
                  <p style={{ color: "var(--text-grey)", fontSize: "13px", marginTop: 0, marginBottom: "4px" }}>Waktu dan ekspektasi biaya</p>

                  <FormInput label="Link Referensi (Opsional)" value={form.link_referensi} onChange={set("link_referensi")} placeholder="Google Drive, Pinterest, YouTube, dll." />
                  <p style={{ color: "var(--text-grey)", fontSize: "12px", marginTop: "-10px" }}>
                    Contoh: Link Google Drive, Pinterest, atau YouTube
                  </p>
                  <FormSelect label="Tingkat Urgensi" value={form.urgensi} onChange={set("urgensi")} required
                    options={["Santai (Standar)", "Express (Prioritas + Biaya)"]} />
                  <FormSelect label="Estimasi Budget Klien" value={form.estimasi_budget} onChange={set("estimasi_budget")} required
                    options={["< Rp 50.000", "Rp 50.000 - Rp 150.000", "> Rp 150.000", "Belum Yakin (Tunggu Penawaran)"]} />
                </div>
              )}

              {/* Step 4: Deskripsi Detail */}
              {currentStep === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "4px" }}>Deskripsi Detail</h2>
                  <p style={{ color: "var(--text-grey)", fontSize: "13px", marginTop: 0, marginBottom: "4px" }}>Ceritakan spesifikasi lengkapnya</p>

                  <FormTextarea label="Deskripsi Lengkap" value={form.deskripsi} onChange={set("deskripsi")}
                    placeholder="Deskripsikan fitur atau bentuk yang kamu mau sedetail mungkin. Contoh: Map dengan tema cyberpunk, ada sistem door, interaksi NPC, ukuran 500x500 studs..." rows={6} required />
                </div>
              )}

              {/* Navigation Buttons */}
              <div style={{ display: "flex", gap: "12px", marginTop: "36px" }}>
                {currentStep > 0 && (
                  <button onClick={handleBack} style={{
                    flex: 0.4, padding: "14px", borderRadius: "10px",
                    background: "transparent", color: "var(--text-grey)",
                    border: "1px solid var(--text-muted)", fontWeight: 600, fontSize: "14px",
                    cursor: "pointer", transition: "all 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = "var(--text-white)"}
                    onMouseLeave={e => e.currentTarget.style.borderColor = "var(--text-muted)"}
                  >
                    ← Kembali
                  </button>
                )}
                <button
                  onClick={() => { if (!isAuthenticated && currentStep === 3) { navigate("/login", { state: { returnTo: location.pathname } }); return; } handleNext(); }}
                  disabled={isSubmitting}
                  style={{
                    flex: 1, padding: "14px", borderRadius: "10px",
                    background: currentStep === 3
                      ? "linear-gradient(135deg, #8B5CF6, #7c3aed)"
                      : "linear-gradient(135deg, #00F0FF, #0099ff)",
                    color: "#0F172A", border: "none", fontWeight: 700, fontSize: "14px",
                    cursor: isSubmitting ? "not-allowed" : "pointer", transition: "all 0.2s",
                    boxShadow: currentStep === 3 ? "0 4px 15px rgba(139,92,246,0.3)" : "0 4px 15px rgba(0,240,255,0.3)",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "⏳ Mengirim ke Markas..." : currentStep === 3 ? "🚀 KIRIM REQUEST" : "SELANJUTNYA →"}
                </button>
              </div>
            </div>

            {/* Sidebar Info */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Progress Preview */}
              <div style={{
                background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)", padding: "24px",
              }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>📋 Ringkasan Request</h3>
                {[
                  { label: "Judul", value: form.judul_project || "—" },
                  { label: "Kategori", value: form.kategori },
                  { label: "Platform", value: form.platform },
                  { label: "Skala", value: form.skala },
                  { label: "Budget", value: form.estimasi_budget },
                ].map(row => (
                  <div key={row.label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginBottom: "10px" }}>
                    <span style={{ color: "var(--text-grey)", fontSize: "12px", flexShrink: 0 }}>{row.label}</span>
                    <span style={{ color: "var(--text-white)", fontSize: "12px", fontWeight: 600, textAlign: "right",
                      overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "160px",
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>

              {/* How it Works */}
              <div style={{
                background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)", padding: "24px",
              }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>⚡ Cara Kerja</h3>
                {[
                  { step: "1", text: "Isi form request dengan detail", color: "#00F0FF" },
                  { step: "2", text: "Tim Volter review & kirim penawaran", color: "#8B5CF6" },
                  { step: "3", text: "Deal harga & konfirmasi pembayaran", color: "#22C55E" },
                  { step: "4", text: "Pengerjaan & update progress real-time", color: "#F59E0B" },
                ].map(item => (
                  <div key={item.step} style={{ display: "flex", gap: "12px", marginBottom: "12px" }}>
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "50%", flexShrink: 0,
                      background: `${item.color}20`, border: `1px solid ${item.color}50`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: item.color, fontSize: "11px", fontWeight: 700,
                    }}>{item.step}</div>
                    <p style={{ color: "var(--text-grey)", fontSize: "13px", margin: "auto 0" }}>{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* === HISTORY VIEW === */}
        {activeView === "history" && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "20px", fontWeight: 700 }}>Riwayat Custom Order</h2>
              <button onClick={() => { setActiveView("form"); setSubmitSuccess(false); }} style={{
                padding: "10px 20px", borderRadius: "8px",
                background: "var(--accent-purple)", color: "#fff",
                border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px",
              }}>
                + Buat Request Baru
              </button>
            </div>

            {ordersLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}>
                <div style={{
                  width: "36px", height: "36px", borderRadius: "50%",
                  border: "3px solid rgba(0,240,255,0.2)", borderTopColor: "var(--accent-cyan)",
                  animation: "spinCyan 0.8s linear infinite", margin: "0 auto",
                }} />
              </div>
            ) : myOrders.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "80px 40px",
                background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-subtle)",
              }}>
                <div style={{ fontSize: "56px", marginBottom: "16px" }}>📭</div>
                <h3 style={{ marginBottom: "8px" }}>Belum ada request</h3>
                <p style={{ color: "var(--text-grey)", fontSize: "14px", marginBottom: "24px" }}>Buat request pertamamu!</p>
                <button onClick={() => setActiveView("form")} style={{
                  padding: "12px 28px", borderRadius: "8px",
                  background: "var(--accent-purple)", color: "#fff",
                  border: "none", fontWeight: 700, cursor: "pointer", fontSize: "14px",
                }}>Buat Request</button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {myOrders.map(order => {
                  const ss = getStatusStyle(order.status);
                  const progress = order.progress || 0;
                  const harga = parseFloat(order.harga_tawaran);
                  const isHargaDeal = harga > 0;

                  return (
                    <div key={order.id} style={{
                      background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                      border: `1px solid ${ss.border}`, padding: "24px",
                    }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", gap: "12px" }}>
                        <div>
                          <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "4px" }}>{order.judul_project}</h3>
                          <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
                            {order.kategori} · {order.platform || "Roblox Studio"} · {order.skala || "Menengah"}
                          </p>
                        </div>
                        <div style={{
                          padding: "5px 12px", borderRadius: "20px",
                          background: ss.bg, border: `1px solid ${ss.border}`,
                          color: ss.color, fontSize: "11px", fontWeight: 700,
                          letterSpacing: "0.8px", textTransform: "uppercase", flexShrink: 0,
                        }}>
                          {order.status || "Menunggu Konfirmasi"}
                        </div>
                      </div>

                      {/* Progress */}
                      <div style={{ marginBottom: "16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                          <span style={{ color: "var(--text-grey)", fontSize: "12px" }}>Progress Pengerjaan</span>
                          <span style={{ color: "var(--accent-cyan)", fontWeight: 700, fontSize: "13px" }}>{progress}%</span>
                        </div>
                        <div style={{ height: "10px", borderRadius: "5px", background: "var(--bg-primary)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", width: `${progress}%`,
                            background: progress === 100 ? "#22C55E" : "linear-gradient(90deg, #00F0FF, #8B5CF6)",
                            borderRadius: "5px", transition: "width 0.5s ease",
                          }} />
                        </div>
                      </div>

                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
                        <span style={{ color: "var(--text-grey)", fontSize: "13px" }}>
                          Harga Deal:{" "}
                          <strong style={{ color: isHargaDeal ? "var(--accent-purple)" : "var(--text-grey)", fontSize: "15px" }}>
                            {isHargaDeal ? `Rp ${harga.toLocaleString("id-ID")}` : "Tunggu Penawaran"}
                          </strong>
                        </span>
                        {(order.status || "").toLowerCase().includes("pembayaran") && (
                          <button style={{
                            padding: "8px 20px", borderRadius: "8px",
                            background: "var(--accent-cyan)", color: "#0F172A",
                            border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px",
                          }}>
                            💳 Bayar Sekarang
                          </button>
                        )}
                        {(order.status || "").toLowerCase() === "selesai" && (order.rating === 0 || !order.rating) && (
                          <button style={{
                            padding: "8px 20px", borderRadius: "8px",
                            background: "transparent", color: "#F59E0B",
                            border: "1px solid rgba(245,158,11,0.4)", fontWeight: 700, cursor: "pointer", fontSize: "13px",
                          }}>
                            ⭐ Beri Ulasan
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}

