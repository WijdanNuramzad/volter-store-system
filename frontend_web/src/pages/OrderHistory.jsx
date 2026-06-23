import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import Swal from "sweetalert2";

export default function OrderHistory() {
  const { isAuthenticated } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal Review States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/orders/riwayat`);
      setOrders(res.data?.data || res.data || []);
    } catch (e) {
      console.error("Gagal fetch riwayat:", e);
    }
    setIsLoading(false);
  };

  const handleOpenReview = (asset) => {
    setSelectedAsset(asset);
    setRating(5);
    setReviewText("");
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedAsset) return;

    setIsSubmitting(true);
    try {
      await api.post("/reviews", {
        asset_id: selectedAsset.asset_id,
        rating,
        review_text: reviewText,
      });

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Ulasan Anda telah tersimpan.",
        background: "#1E293B",
        color: "#F8FAFC",
        timer: 2000,
        showConfirmButton: false,
      });

      setShowReviewModal(false);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: error.response?.data?.message || "Terjadi kesalahan.",
        background: "#1E293B",
        color: "#F8FAFC",
      });
    }
    setIsSubmitting(false);
  };

  if (!isAuthenticated) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
          <h2 style={{ color: "#F8FAFC", marginBottom: "16px" }}>Silakan Login</h2>
          <p style={{ color: "#94A3B8", marginBottom: "24px" }}>Anda harus login untuk melihat riwayat pesanan.</p>
          <Link to="/login" style={{
            padding: "12px 32px", borderRadius: "8px", background: "#00F0FF", color: "#0F172A",
            textDecoration: "none", fontWeight: "bold"
          }}>Ke Halaman Login</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "8px", color: "#F8FAFC" }}>
          📦 Riwayat Pesanan
        </h1>
        <p style={{ color: "#94A3B8", marginBottom: "32px" }}>
          Daftar seluruh aset digital yang pernah Anda transaksikan.
        </p>

        {isLoading ? (
          <div style={{ textAlign: "center", padding: "80px" }}>
             <div style={{
              width: "40px", height: "40px", borderRadius: "50%",
              border: "3px solid rgba(0,240,255,0.2)", borderTopColor: "#00F0FF",
              animation: "spinCyan 0.8s linear infinite", margin: "0 auto",
            }} />
          </div>
        ) : orders.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 40px", background: "#1E293B",
            borderRadius: "16px", border: "1px solid #334155"
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <h2 style={{ color: "#F8FAFC", marginBottom: "10px" }}>Belum ada transaksi</h2>
            <p style={{ color: "#94A3B8", marginBottom: "28px" }}>Mulai jelajahi aset menarik di Volter Store.</p>
            <Link to="/" style={{
              padding: "12px 32px", borderRadius: "8px", background: "#8B5CF6", color: "#fff",
              textDecoration: "none", fontWeight: "bold"
            }}>Jelajahi Beranda</Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {orders.map((order) => {
              const isLunas = order.status === "lunas";
              const harga = parseFloat(order.total_harga) || 0;

              return (
                <div key={order.id} style={{
                  background: "#1E293B", borderRadius: "16px", border: "1px solid #334155",
                  padding: "24px", display: "flex", alignItems: "center", gap: "24px",
                  flexWrap: "wrap"
                }}>
                  {/* Image Placeholder */}
                  <div style={{
                    width: "80px", height: "80px", borderRadius: "8px", flexShrink: 0,
                    background: order.image_url ? `url(http://localhost:5000${order.image_url}) center/cover` : "#0F172A",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "1px solid #475569"
                  }}>
                    {!order.image_url && <span style={{ fontSize: "24px" }}>📦</span>}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: "200px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "#F8FAFC", marginBottom: "4px" }}>
                      {order.nama_aset}
                    </h3>
                    <p style={{ color: "#94A3B8", fontSize: "13px", margin: 0 }}>
                      Tgl Beli: {new Date(order.tanggal_transaksi).toLocaleDateString("id-ID", {
                        day: "numeric", month: "long", year: "numeric"
                      })}
                    </p>
                    <p style={{ 
                      color: harga === 0 ? "#22C55E" : "#F8FAFC", 
                      fontSize: "15px", fontWeight: "bold", marginTop: "8px", marginBottom: 0 
                    }}>
                      {harga === 0 ? "Gratis" : `Rp ${harga.toLocaleString("id-ID")}`}
                    </p>
                  </div>

                  {/* Status & Action */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "12px", minWidth: "120px" }}>
                    <div style={{
                      padding: "6px 14px", borderRadius: "20px", fontSize: "12px", fontWeight: "bold",
                      textTransform: "uppercase",
                      background: isLunas ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
                      color: isLunas ? "#22C55E" : "#F59E0B",
                      border: `1px solid ${isLunas ? "rgba(34,197,94,0.3)" : "rgba(245,158,11,0.3)"}`
                    }}>
                      {isLunas ? "Berhasil" : "Pending"}
                    </div>

                    {isLunas && (
                      <button 
                        onClick={() => handleOpenReview(order)}
                        style={{
                          padding: "8px 16px", borderRadius: "8px", background: "rgba(0,240,255,0.1)",
                          color: "#00F0FF", border: "1px solid rgba(0,240,255,0.3)",
                          fontWeight: "bold", cursor: "pointer", transition: "all 0.2s",
                          fontSize: "13px"
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = "#00F0FF"; e.currentTarget.style.color = "#0F172A"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(0,240,255,0.1)"; e.currentTarget.style.color = "#00F0FF"; }}
                      >
                        Beri Ulasan ⭐
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL REVIEW */}
      {showReviewModal && selectedAsset && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999,
          background: "rgba(15,23,42,0.8)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px"
        }}>
          <div style={{
            background: "#1E293B", width: "100%", maxWidth: "500px", borderRadius: "16px",
            border: "1px solid #334155", boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
            overflow: "hidden", display: "flex", flexDirection: "column"
          }}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid #334155", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ color: "#F8FAFC", margin: 0, fontSize: "18px" }}>Nilai Aset</h3>
              <button 
                onClick={() => setShowReviewModal(false)}
                style={{ background: "transparent", border: "none", color: "#94A3B8", cursor: "pointer", fontSize: "20px" }}
              >
                &times;
              </button>
            </div>
            
            <form onSubmit={handleSubmitReview} style={{ padding: "24px" }}>
              <p style={{ color: "#94A3B8", marginBottom: "16px", fontSize: "14px" }}>
                Bagaimana pendapat Anda tentang <strong>{selectedAsset.nama_aset}</strong>?
              </p>

              {/* Bintang Rating */}
              <div style={{ display: "flex", gap: "8px", marginBottom: "24px", justifyContent: "center" }}>
                {[1, 2, 3, 4, 5].map(star => (
                  <span 
                    key={star} 
                    onClick={() => setRating(star)}
                    style={{
                      cursor: "pointer", fontSize: "36px",
                      color: star <= rating ? "#F59E0B" : "#475569",
                      transition: "color 0.2s"
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Teks Ulasan */}
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Tulis ulasan Anda di sini (opsional)..."
                rows="4"
                style={{
                  width: "100%", padding: "14px", borderRadius: "8px",
                  background: "#0F172A", border: "1px solid #475569", color: "#F8FAFC",
                  outline: "none", resize: "vertical", fontSize: "14px", boxSizing: "border-box",
                  marginBottom: "24px"
                }}
              />

              <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  style={{
                    padding: "10px 20px", borderRadius: "8px", background: "transparent",
                    color: "#94A3B8", border: "1px solid #475569", cursor: "pointer", fontWeight: "bold"
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "10px 20px", borderRadius: "8px", background: "#00F0FF",
                    color: "#0F172A", border: "none", cursor: isSubmitting ? "not-allowed" : "pointer",
                    fontWeight: "bold", opacity: isSubmitting ? 0.7 : 1
                  }}
                >
                  {isSubmitting ? "Menyimpan..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes spinCyan {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </PublicLayout>
  );
}
