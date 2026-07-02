import React, { useState, useEffect, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";

export default function MyOrders() {
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Chat States
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const messagesEndRef = useRef(null);

  // Invoice States
  const [showInvoice, setShowInvoice] = useState(false);
  const [invoiceOrder, setInvoiceOrder] = useState(null);
  const [buktiFile, setBuktiFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/custom-orders/my-orders`);
      setOrders(res.data?.data || res.data || []);
    } catch (e) {
      console.error("Gagal fetch pesanan:", e);
    }
    setIsLoading(false);
  };

  const handleUploadBukti = async (e) => {
    e.preventDefault();
    if (!buktiFile || !invoiceOrder) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("bukti_pembayaran", buktiFile);
      await api.put(`/custom-orders/pay/${invoiceOrder.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      alert("Bukti pembayaran berhasil diupload! Menunggu verifikasi admin 🚀");
      setShowInvoice(false);
      setBuktiFile(null);
      fetchOrders();
    } catch (err) {
      alert("Gagal mengupload bukti pembayaran.");
    }
    setIsUploading(false);
  };

  // Setup Socket.IO for the selected order
  useEffect(() => {
    if (!selectedOrder) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token },
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      socket.emit("gabung_room", { order_id: selectedOrder.id });
    });

    socket.on("terima_pesan", (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socket.on("error_akses", (err) => {
      alert(err.message);
      socket.disconnect();
    });

    // Fetch initial chat history
    api.get(`/chat/${selectedOrder.id}`)
      .then(res => {
        setMessages(res.data?.data || res.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      })
      .catch(e => console.error("Gagal load riwayat chat", e));

    return () => socket.disconnect();
  }, [selectedOrder]);

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketInstance || !selectedOrder) return;
    
    socketInstance.emit("kirim_pesan", { 
      order_id: selectedOrder.id, 
      pesan: chatInput.trim() 
    });
    setChatInput("");
  };

  const getStatusColor = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("selesai")) return { color: "#22C55E", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)" };
    if (s.includes("verifikasi")) return { color: "#3B82F6", bg: "rgba(59,130,246,0.1)", border: "rgba(59,130,246,0.3)" };
    if (s.includes("progress") || s.includes("proses")) return { color: "#00F0FF", bg: "rgba(0,240,255,0.1)", border: "rgba(0,240,255,0.3)" };
    if (s.includes("pembayaran") || s.includes("quotation")) return { color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", border: "rgba(139,92,246,0.3)" };
    return { color: "#F59E0B", bg: "rgba(245,158,11,0.1)", border: "rgba(245,158,11,0.3)" };
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>
            📋 Pesanan Custom Saya
          </h1>
          <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
            Pantau progress dan diskusikan pesananmu langsung dengan tim kami
          </p>
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
          <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1fr 400px" : "1fr", gap: "24px", alignItems: "start" }}>
            
            {/* DAFTAR ORDER */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {orders.length === 0 ? (
                <div style={{
                  textAlign: "center", padding: "80px 40px",
                  background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)",
                }}>
                  <div style={{ fontSize: "64px", marginBottom: "20px" }}>🎨</div>
                  <h2 style={{ color: "var(--text-white)", marginBottom: "10px" }}>Belum ada pesanan</h2>
                  <p style={{ color: "var(--text-grey)", marginBottom: "28px", fontSize: "14px" }}>
                    Buat request jasa custom untuk mewujudkan idemu!
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
                  const isSelected = selectedOrder?.id === order.id;

                  return (
                    <div key={order.id} style={{
                      background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                      border: isSelected ? "1px solid var(--accent-cyan)" : `1px solid ${statusStyle.border}`,
                      padding: "20px 24px",
                      transition: "var(--transition)",
                      boxShadow: isSelected ? "0 0 15px rgba(0,240,255,0.15)" : "none",
                    }}
                      onMouseEnter={e => !isSelected && (e.currentTarget.style.boxShadow = `0 0 15px ${statusStyle.bg}`)}
                      onMouseLeave={e => !isSelected && (e.currentTarget.style.boxShadow = "none")}
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
                      <div style={{ marginBottom: "20px" }}>
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
                        <div style={{ display: "flex", gap: "10px" }}>
                          {(order.status || "").toLowerCase().includes("pembayaran") && (
                            <button onClick={() => { setInvoiceOrder(order); setShowInvoice(true); }} style={{
                              padding: "8px 16px", borderRadius: "8px",
                              background: "var(--accent-cyan)", color: "#0F172A",
                              border: "none", fontWeight: 700, cursor: "pointer", fontSize: "13px",
                            }}>
                              🧾 Lihat Invoice & Bayar
                            </button>
                          )}
                          <button onClick={() => setSelectedOrder(isSelected ? null : order)} style={{
                            padding: "8px 16px", borderRadius: "8px",
                            background: isSelected ? "var(--bg-primary)" : "rgba(59,130,246,0.1)", 
                            color: isSelected ? "var(--text-grey)" : "#3B82F6",
                            border: isSelected ? "1px solid var(--text-muted)" : "1px solid rgba(59,130,246,0.3)", 
                            fontWeight: 600, cursor: "pointer", fontSize: "13px",
                          }}>
                            {isSelected ? "Tutup Chat" : "💬 Chat Admin"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* PANEL CHAT PRIVATE */}
            {selectedOrder && (
              <div style={{
                position: "sticky", top: "84px",
                height: "calc(100vh - 120px)",
                background: "var(--bg-surface)",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-cyan)",
                display: "flex", flexDirection: "column",
                overflow: "hidden",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
              }}>
                {/* Chat Header */}
                <div style={{ padding: "16px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(0,240,255,0.05)" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, margin: "0 0 4px", color: "var(--text-white)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E", animation: "glowPulse 1.5s ease infinite" }} />
                    Diskusi: {selectedOrder.judul_project}
                  </h3>
                  <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
                    Admin Volter akan membalas pesan Anda di sini
                  </p>
                </div>

                {/* Chat Messages */}
                <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  {messages.length === 0 && (
                    <div style={{ textAlign: "center", color: "var(--text-grey)", padding: "40px", fontSize: "13px" }}>
                      Mulai percakapan dengan tim Volter 👋
                    </div>
                  )}
                  {messages.map((msg, i) => {
                    const isMe = msg.sender_id === user?.id;
                    const isSystem = msg.sender_role === "admin";
                    
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: isMe ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                        {!isMe && (
                          <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: isSystem ? "var(--accent-cyan)" : "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: isSystem ? "#0F172A" : "#F8FAFC", flexShrink: 0 }}>
                            {isSystem ? "A" : (msg.sender_name?.[0] || "U").toUpperCase()}
                          </div>
                        )}
                        
                        <div style={{
                          maxWidth: "75%", padding: "10px 14px", 
                          borderRadius: isMe ? "14px 14px 0 14px" : "14px 14px 14px 0",
                          background: isMe ? "rgba(139,92,246,0.15)" : "var(--bg-elevated, #273449)",
                          border: `1px solid ${isMe ? "rgba(139,92,246,0.3)" : "var(--border-subtle)"}`,
                        }}>
                          {!isMe && <span style={{ fontSize: "11px", color: isSystem ? "var(--accent-cyan)" : "var(--text-grey)", display: "block", marginBottom: "4px", fontWeight: 600 }}>
                            {isSystem ? "Admin Volter" : msg.sender_name}
                          </span>}
                          
                          <p style={{ margin: 0, color: "var(--text-white)", fontSize: "13px", lineHeight: "1.5" }}>{msg.pesan}</p>
                          
                          <span style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginTop: "6px", textAlign: isMe ? "right" : "left" }}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Baru saja"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Chat Input */}
                <form onSubmit={handleSendChat} style={{ display: "flex", padding: "14px", gap: "10px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
                  <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                    placeholder="Tulis pesan..."
                    style={{ flex: 1, padding: "12px", background: "var(--bg-surface)", color: "var(--text-white)", border: "1px solid var(--border-subtle)", borderRadius: "8px", outline: "none", fontSize: "13px" }} />
                  <button type="submit" style={{
                    padding: "0 16px", borderRadius: "8px",
                    background: "var(--accent-cyan)", color: "#0F172A",
                    border: "none", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
                  }}>
                    <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                    </svg>
                  </button>
                </form>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL INVOICE */}
      {showInvoice && invoiceOrder && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(15,23,42,0.8)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "var(--bg-surface)", width: "100%", maxWidth: "600px", 
            borderRadius: "16px", border: "1px solid var(--border-cyan)", 
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)", overflow: "hidden", 
            display: "flex", flexDirection: "column", maxHeight: "90vh"
          }}>
            {/* Header Modal */}
            <div style={{ padding: "24px", borderBottom: "1px dashed var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h3 style={{ color: "var(--text-white)", margin: "0 0 6px", fontSize: "20px", fontWeight: 800 }}>INVOICE TAGIHAN</h3>
                <p style={{ color: "var(--text-grey)", fontSize: "13px", margin: 0, fontFamily: "monospace" }}>
                  INV-VOLTER-{invoiceOrder.id.toString().padStart(4, '0')}-{new Date().getFullYear()}
                </p>
              </div>
              <button 
                onClick={() => { setShowInvoice(false); setBuktiFile(null); }}
                style={{ background: "transparent", border: "none", color: "var(--text-grey)", cursor: "pointer", fontSize: "24px" }}
              >
                &times;
              </button>
            </div>
            
            <div style={{ padding: "24px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "24px" }}>
              
              {/* Rincian Pesanan */}
              <div style={{ background: "var(--bg-primary)", padding: "16px", borderRadius: "10px", border: "1px solid var(--border-subtle)" }}>
                <h4 style={{ color: "var(--text-white)", fontSize: "14px", marginBottom: "12px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "8px" }}>Rincian Pesanan</h4>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-grey)", fontSize: "13px" }}>Klien</span>
                  <span style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600 }}>{user?.nama || user?.name || "Klien Volter"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ color: "var(--text-grey)", fontSize: "13px" }}>Nama Project</span>
                  <span style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600, textAlign: "right" }}>{invoiceOrder.judul_project}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "16px" }}>
                  <span style={{ color: "var(--text-grey)", fontSize: "13px" }}>Platform</span>
                  <span style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600 }}>{invoiceOrder.platform || "Roblox Studio"}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px dashed var(--border-cyan)", paddingTop: "12px" }}>
                  <span style={{ color: "var(--text-white)", fontSize: "14px", fontWeight: 700 }}>Total Pembayaran</span>
                  <span style={{ color: "var(--accent-cyan)", fontSize: "18px", fontWeight: 800 }}>
                    Rp {parseFloat(invoiceOrder.harga_tawaran || 0).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* Instruksi Pembayaran */}
              <div>
                <h4 style={{ color: "var(--text-white)", fontSize: "14px", marginBottom: "12px" }}>💳 Transfer Ke Rekening Berikut:</h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.3)", padding: "12px", borderRadius: "8px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-grey)", fontWeight: 700 }}>Bank BCA</p>
                    <p style={{ margin: "0 0 4px", fontSize: "16px", color: "var(--text-white)", fontWeight: 800, letterSpacing: "1px" }}>0123 4567 89</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-grey)" }}>a.n. Volter Studio</p>
                  </div>
                  <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", padding: "12px", borderRadius: "8px" }}>
                    <p style={{ margin: "0 0 4px", fontSize: "12px", color: "var(--text-grey)", fontWeight: 700 }}>GoPay / Dana</p>
                    <p style={{ margin: "0 0 4px", fontSize: "16px", color: "var(--text-white)", fontWeight: 800, letterSpacing: "1px" }}>0812 3456 7890</p>
                    <p style={{ margin: 0, fontSize: "11px", color: "var(--text-grey)" }}>a.n. Volter Studio</p>
                  </div>
                </div>
              </div>

              {/* Form Upload Bukti */}
              <form onSubmit={handleUploadBukti} style={{ marginTop: "8px" }}>
                <h4 style={{ color: "var(--text-white)", fontSize: "14px", marginBottom: "8px" }}>🧾 Konfirmasi Pembayaran</h4>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: "0 0 12px" }}>Upload foto struk atau screenshot transfer di sini.</p>
                
                <div style={{ 
                  border: "2px dashed var(--border-subtle)", borderRadius: "10px", 
                  padding: "20px", textAlign: "center", background: "var(--bg-primary)",
                  cursor: "pointer", transition: "all 0.2s"
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = "var(--accent-cyan)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "var(--border-subtle)"}
                  onClick={() => document.getElementById("bukti-upload").click()}
                >
                  <input 
                    type="file" 
                    id="bukti-upload" 
                    style={{ display: "none" }} 
                    accept="image/*"
                    onChange={(e) => setBuktiFile(e.target.files[0])}
                  />
                  {buktiFile ? (
                    <div>
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>✅</div>
                      <p style={{ color: "var(--text-white)", margin: 0, fontSize: "13px", fontWeight: 600 }}>{buktiFile.name}</p>
                      <p style={{ color: "var(--accent-cyan)", margin: "4px 0 0", fontSize: "11px" }}>Klik untuk ganti file</p>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontSize: "24px", marginBottom: "8px" }}>📸</div>
                      <p style={{ color: "var(--text-grey)", margin: 0, fontSize: "13px" }}>Pilih atau tarik file gambar ke sini</p>
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
                  <button
                    type="button"
                    onClick={() => { setShowInvoice(false); setBuktiFile(null); }}
                    style={{
                      flex: 1, padding: "14px", borderRadius: "8px", background: "var(--bg-primary)",
                      color: "var(--text-grey)", border: "1px solid var(--border-subtle)", cursor: "pointer", fontWeight: 600
                    }}
                  >
                    Nanti Saja
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading || !buktiFile}
                    style={{
                      flex: 2, padding: "14px", borderRadius: "8px", background: "var(--accent-cyan)",
                      color: "#0F172A", border: "none", cursor: (isUploading || !buktiFile) ? "not-allowed" : "pointer",
                      fontWeight: 700, opacity: (isUploading || !buktiFile) ? 0.7 : 1
                    }}
                  >
                    {isUploading ? "Mengunggah..." : "Kirim Bukti Pembayaran"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </PublicLayout>
  );
}
