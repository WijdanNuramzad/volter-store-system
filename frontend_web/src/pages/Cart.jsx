import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import Swal from "sweetalert2";

// ─── Helper ────────────────────────────────────────────────────────────────
const formatRupiah = (harga) => {
  const num = parseFloat(harga) || 0;
  if (num === 0) return "GRATIS";
  return "Rp " + num.toLocaleString("id-ID");
};

// Memancarkan event agar badge Navbar ikut refresh
const emitCartUpdate = () => window.dispatchEvent(new Event("cartUpdated"));

// ─── Komponen Checkbox kustom bergaya dark-navy/cyan ──────────────────────
function StyledCheckbox({ checked, onChange, indeterminate = false }) {
  return (
    <div
      onClick={onChange}
      style={{
        width: "20px", height: "20px", borderRadius: "5px", flexShrink: 0,
        border: checked || indeterminate ? "2px solid #00F0FF" : "2px solid #475569",
        background: checked || indeterminate ? "rgba(0,240,255,0.15)" : "transparent",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 0.15s",
      }}
    >
      {indeterminate && !checked && (
        <div style={{ width: "10px", height: "2px", background: "#00F0FF", borderRadius: "2px" }} />
      )}
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6L5 9L10 3" stroke="#00F0FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </div>
  );
}

// ─── Komponen Utama ────────────────────────────────────────────────────────
export default function Cart() {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  // ── State Checkbox ──────────────────────────────────────────────────────
  // selectedIds: Set berisi cart_id dari setiap item yang di-ceklis user.
  // Saat cartItems berubah (add/remove), selectedIds disesuaikan otomatis.
  const [selectedIds, setSelectedIds] = useState(new Set());

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    if (!isAuthenticated) { navigate("/login"); return; }
    fetchCart();
    // eslint-disable-next-line
  }, [isAuthenticated]);

  const fetchCart = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/cart`);
      const items = res.data?.data || res.data || [];
      setCartItems(items);
      // Secara default, PILIH SEMUA item setelah fetch pertama
      setSelectedIds(new Set(items.map(i => i.cart_id)));
    } catch (e) {
      console.error("Gagal fetch keranjang:", e);
    }
    setIsLoading(false);
  }, []);

  // ── Logika Checkbox ─────────────────────────────────────────────────────

  // Cek apakah semua item sedang di-ceklis
  const isAllSelected = cartItems.length > 0 && selectedIds.size === cartItems.length;
  // Cek apakah sebagian item sedang di-ceklis (untuk state "indeterminate")
  const isPartialSelected = selectedIds.size > 0 && selectedIds.size < cartItems.length;

  // Toggle satu item
  const toggleItem = (cartId) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(cartId)) { next.delete(cartId); } else { next.add(cartId); }
      return next;
    });
  };

  // Toggle Pilih Semua / Batalkan Semua
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(new Set()); // batalkan semua
    } else {
      setSelectedIds(new Set(cartItems.map(i => i.cart_id))); // pilih semua
    }
  };

  // Item-item yang saat ini terpilih (akan di-checkout)
  const selectedItems = cartItems.filter(i => selectedIds.has(i.cart_id));

  // ── Hapus Item ──────────────────────────────────────────────────────────
  const handleRemove = async (cartId) => {
    try {
      await api.delete(`/cart/${cartId}`);
      // Hapus dari selectedIds juga agar tidak ada "ghost selection"
      setSelectedIds(prev => { const n = new Set(prev); n.delete(cartId); return n; });
      showToast("Item dihapus dari keranjang");
      fetchCart().then(emitCartUpdate);
    } catch (e) {
      showToast("Gagal menghapus item", "error");
    }
  };

  // ── Checkout (hanya item yang di-ceklis) ─────────────────────────────────
  const handleCheckout = async () => {
    if (selectedItems.length === 0) {
      showToast("Pilih minimal 1 item untuk checkout!", "error");
      return;
    }
    setCheckoutLoading(true);

    Swal.fire({
      title: "Memproses Pembayaran...",
      html: "Mohon tunggu, sedang menghubungi server pembayaran...",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
      background: "#1E293B", color: "#F8FAFC",
    });

    setTimeout(async () => {
      try {
        // Kirim HANYA item yang terpilih ke backend
        await api.post(`/cart/checkout`, { items: selectedItems });

        // Keluarkan item yang sudah di-checkout dari state lokal
        setCartItems(prev => prev.filter(i => !selectedIds.has(i.cart_id)));
        setSelectedIds(new Set());
        emitCartUpdate(); // refresh badge navbar

        Swal.fire({
          icon: "success",
          title: "Pembayaran Berhasil!",
          text: `${selectedItems.length} aset berhasil dibeli dan masuk ke Brankas!`,
          background: "#1E293B", color: "#F8FAFC",
          timer: 2500, showConfirmButton: false,
        });

        setTimeout(() => navigate("/brankas"), 2500);
      } catch (error) {
        console.error("Checkout gagal:", error);
        Swal.fire({
          icon: "error", title: "Pembayaran Gagal",
          text: error.response?.data?.message || "Terjadi kesalahan saat memproses pesanan.",
          background: "#1E293B", color: "#F8FAFC",
        });
      } finally {
        setCheckoutLoading(false);
      }
    }, 2000);
  };

  // ── Hitung Total hanya dari item terpilih ─────────────────────────────
  const total = selectedItems.reduce((sum, item) => sum + (parseFloat(item.harga) || 0), 0);

  // ─── Render ─────────────────────────────────────────────────────────────
  return (
    <PublicLayout>
      {/* Toast Notifikasi */}
      {toastMsg && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px", zIndex: 9999,
          padding: "14px 20px", borderRadius: "10px",
          background: toastMsg.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(34,197,94,0.9)",
          color: "#fff", fontWeight: 600, fontSize: "14px",
          backdropFilter: "blur(8px)", boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
          animation: "fadeInUp 0.3s ease",
        }}>
          {toastMsg.msg}
        </div>
      )}

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Header */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "6px" }}>🛒 Keranjang Belanja</h1>
          <p style={{ color: "var(--text-grey)", fontSize: "14px" }}>
            {cartItems.length} item · {selectedIds.size} dipilih
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
        ) : cartItems.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 40px",
            background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
            border: "1px solid var(--border-subtle)",
          }}>
            <div style={{ fontSize: "64px", marginBottom: "20px" }}>🛒</div>
            <h2 style={{ color: "var(--text-white)", marginBottom: "10px" }}>Keranjangmu kosong</h2>
            <p style={{ color: "var(--text-grey)", marginBottom: "28px", fontSize: "14px" }}>
              Jelajahi katalog dan tambahkan karya yang kamu suka!
            </p>
            <button onClick={() => navigate("/")} style={{
              padding: "12px 32px", borderRadius: "8px",
              background: "var(--accent-cyan)", color: "var(--bg-primary)",
              border: "none", fontWeight: 700, cursor: "pointer", fontSize: "14px",
            }}>
              Jelajahi Katalog
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: "24px", alignItems: "start" }}>
            {/* ── Kolom Kiri: Daftar Item ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>

              {/* Baris "Pilih Semua" */}
              <div style={{
                display: "flex", alignItems: "center", gap: "14px",
                padding: "14px 16px", borderRadius: "var(--radius-md)",
                background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              }}>
                <StyledCheckbox
                  checked={isAllSelected}
                  indeterminate={isPartialSelected}
                  onChange={toggleSelectAll}
                />
                <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-white)", userSelect: "none" }}>
                  Pilih Semua ({cartItems.length} item)
                </span>
                {selectedIds.size > 0 && (
                  <span style={{ marginLeft: "auto", fontSize: "12px", color: "var(--accent-cyan)" }}>
                    {selectedIds.size} dipilih
                  </span>
                )}
              </div>

              {/* Daftar Item dengan Checkbox */}
              {cartItems.map((item) => {
                const isFree = parseFloat(item.harga) === 0 || item.is_free === 1;
                const isSelected = selectedIds.has(item.cart_id);
                const imageUrl = item.image_url
                  ? `http://localhost:5000${item.image_url}`
                  : `https://api.dicebear.com/7.x/shapes/svg?seed=${item.cart_id}`;

                return (
                  <div key={item.cart_id} style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    padding: "16px", borderRadius: "var(--radius-md)",
                    background: "var(--bg-surface)",
                    border: isSelected ? "1px solid rgba(0,240,255,0.35)" : "1px solid var(--border-subtle)",
                    transition: "all 0.2s",
                    boxShadow: isSelected ? "0 0 12px rgba(0,240,255,0.06)" : "none",
                  }}>
                    {/* Checkbox */}
                    <StyledCheckbox
                      checked={isSelected}
                      onChange={() => toggleItem(item.cart_id)}
                    />

                    {/* Thumbnail */}
                    <div style={{
                      width: "72px", height: "72px", borderRadius: "var(--radius-sm)",
                      overflow: "hidden", flexShrink: 0, background: "var(--bg-primary)",
                      opacity: isSelected ? 1 : 0.5, transition: "opacity 0.2s",
                    }}>
                      <img src={imageUrl} alt={item.nama} style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${item.cart_id}`; }} />
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, opacity: isSelected ? 1 : 0.5, transition: "opacity 0.2s" }}>
                      <h3 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>
                        {item.nama || "Aset Digital"}
                      </h3>
                      <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
                        Aset Digital Roblox
                      </p>
                    </div>

                    {/* Harga + Hapus */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{
                        fontFamily: "Poppins, sans-serif", fontWeight: 700,
                        fontSize: "16px", margin: "0 0 8px",
                        color: isFree ? "var(--accent-green)" : "var(--accent-purple)",
                        opacity: isSelected ? 1 : 0.5, transition: "opacity 0.2s",
                      }}>
                        {formatRupiah(item.harga)}
                      </p>
                      <button onClick={() => handleRemove(item.cart_id)} style={{
                        background: "transparent", border: "none", cursor: "pointer",
                        color: "var(--text-muted)", fontSize: "12px",
                        transition: "color 0.2s", padding: "4px 8px",
                      }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--accent-red)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-muted)"}
                      >
                        🗑 Hapus
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Kolom Kanan: Ringkasan Order ── */}
            <div style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-cyan)",
              padding: "28px",
              position: "sticky", top: "84px",
            }}>
              <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "8px" }}>
                Ringkasan Order
              </h2>
              <p style={{ color: "var(--text-grey)", fontSize: "12px", marginBottom: "20px" }}>
                {selectedItems.length === 0
                  ? "Belum ada item dipilih"
                  : `${selectedItems.length} dari ${cartItems.length} item dipilih`}
              </p>

              {/* Daftar item terpilih */}
              {selectedItems.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
                  {selectedItems.map(item => (
                    <div key={item.cart_id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", gap: "8px" }}>
                      <span style={{
                        color: "var(--text-grey)", flex: 1,
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"
                      }}>
                        {item.nama || "Aset Digital"}
                      </span>
                      <span style={{ color: "var(--text-white)", fontWeight: 600, flexShrink: 0 }}>
                        {parseFloat(item.harga) === 0 ? "Gratis" : `Rp ${parseFloat(item.harga).toLocaleString("id-ID")}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  padding: "20px", textAlign: "center", borderRadius: "8px",
                  background: "var(--bg-primary)", border: "1px dashed var(--border-subtle)",
                  marginBottom: "20px",
                }}>
                  <p style={{ color: "var(--text-grey)", fontSize: "13px", margin: 0 }}>
                    ☝️ Pilih item di sebelah kiri untuk checkout
                  </p>
                </div>
              )}

              <hr style={{ border: "none", borderTop: "1px solid var(--border-subtle)", marginBottom: "20px" }} />

              {/* Total */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                <span style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "16px" }}>Total</span>
                <span style={{
                  fontFamily: "Poppins, sans-serif", fontWeight: 800, fontSize: "22px",
                  color: selectedItems.length > 0 ? "var(--accent-cyan)" : "var(--text-muted)",
                }}>
                  {selectedItems.length === 0 ? "—" : total === 0 ? "GRATIS" : `Rp ${total.toLocaleString("id-ID")}`}
                </span>
              </div>

              {/* Tombol Checkout */}
              <button
                onClick={handleCheckout}
                disabled={checkoutLoading || selectedItems.length === 0}
                style={{
                  width: "100%", padding: "16px", borderRadius: "10px",
                  background: checkoutLoading || selectedItems.length === 0
                    ? "var(--text-muted)"
                    : "linear-gradient(135deg, #00F0FF, #0099ff)",
                  color: "#0F172A", border: "none", fontWeight: 700, fontSize: "15px",
                  cursor: checkoutLoading || selectedItems.length === 0 ? "not-allowed" : "pointer",
                  transition: "all 0.2s",
                  boxShadow: selectedItems.length > 0 ? "0 4px 15px rgba(0,240,255,0.3)" : "none",
                }}
              >
                {checkoutLoading
                  ? "⏳ Memproses..."
                  : selectedItems.length === 0
                  ? "Pilih Item Dulu"
                  : `⚡ Checkout (${selectedItems.length} item)`}
              </button>

              <p style={{ color: "var(--text-grey)", fontSize: "11px", textAlign: "center", marginTop: "14px" }}>
                🔒 Transaksi aman & terenkripsi
              </p>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spinCyan {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PublicLayout>
  );
}
