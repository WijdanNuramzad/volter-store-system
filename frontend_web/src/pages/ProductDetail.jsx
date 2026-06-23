import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";

const formatRupiah = (harga) => {
  const num = parseFloat(harga) || 0;
  if (num === 0) return "GRATIS";
  return "Rp " + num.toLocaleString("id-ID");
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  const showToast = (msg, type = "success") => {
    setToastMsg({ msg, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const res = await api.get(`/assets/${id}`);
        const data = res.data?.data || res.data;
        setProduct(data);

        // Fetch related products
        const allRes = await api.get("/assets");
        const allProducts = allRes.data?.data || allRes.data || [];
        setRelatedProducts(allProducts.filter(p => p.id !== parseInt(id)).slice(0, 4));

        // Fetch reviews
        const reviewsRes = await api.get(`/reviews/${id}`);
        setReviews(reviewsRes.data?.data || []);

        if (isAuthenticated) {
          try {
            const wishRes = await api.get(`/wishlist/check/${id}`);
            setIsWishlisted(wishRes.data.isWishlisted);
          } catch (err) {
            console.error("Gagal cek wishlist", err);
          }
        }
      } catch (e) {
        console.error("Gagal fetch produk/reviews:", e);
        navigate("/");
      }
      setIsLoading(false);
    };
    fetchProduct();
  }, [id, navigate]);

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }
    setCartLoading(true);
    try {
      await api.post("/cart", { asset_id: product.id }); // 🔒 user_id dari token
      showToast("Berhasil ditambahkan ke keranjang! 🛒");
    } catch (e) {
      showToast(e.response?.data?.message || "Gagal menambahkan ke keranjang", "error");
    }
    setCartLoading(false);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    await handleAddToCart();
    navigate("/cart");
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      navigate("/login", { state: { returnTo: location.pathname } });
      return;
    }
    setWishlistLoading(true);
    try {
      const res = await api.post(`/wishlist/toggle/${product.id}`);
      setIsWishlisted(res.data.isWishlisted);
      showToast(res.data.message);
    } catch (error) {
      showToast("Gagal memproses wishlist", "error");
    }
    setWishlistLoading(false);
  };

  if (isLoading) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
            <div className="skeleton" style={{ paddingTop: "70%", borderRadius: "16px" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", paddingTop: "20px" }}>
              <div className="skeleton" style={{ height: "14px", width: "30%" }} />
              <div className="skeleton" style={{ height: "36px", width: "90%" }} />
              <div className="skeleton" style={{ height: "36px", width: "70%" }} />
              <div className="skeleton" style={{ height: "24px", width: "40%", marginTop: "8px" }} />
              <div className="skeleton" style={{ height: "80px", marginTop: "8px" }} />
            </div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (!product) return null;

  const isFree = product.is_free === 1 || parseFloat(product.harga) === 0;
  const imageUrl = product.image_url
    ? `http://localhost:5000${product.image_url}`
    : `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(product.nama)}&backgroundColor=0F172A`;

  return (
    <PublicLayout>
      {/* Toast Notification */}
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

      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "40px 24px 80px" }}>
        {/* Breadcrumb */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "32px", fontSize: "13px", color: "var(--text-grey)" }}>
          <span style={{ cursor: "pointer", color: "var(--accent-cyan)" }} onClick={() => navigate("/")}>Beranda</span>
          <span>›</span>
          <span>{product.nama}</span>
        </div>

        {/* Main Content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "56px", alignItems: "start" }}>
          {/* Left: Image */}
          <div>
            <div style={{
              borderRadius: "var(--radius-lg)",
              overflow: "hidden",
              border: "1px solid var(--border-cyan)",
              background: "var(--bg-primary)",
              position: "relative",
            }}>
              <img
                src={imageUrl}
                alt={product.nama}
                style={{ width: "100%", height: "auto", display: "block", minHeight: "300px", objectFit: "cover" }}
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${product.id}`; }}
              />
              {/* Overlay badge */}
              <div style={{
                position: "absolute", top: "16px", left: "16px",
                padding: "6px 14px", borderRadius: "20px",
                background: isFree ? "rgba(34,197,94,0.9)" : "rgba(139,92,246,0.9)",
                color: "#fff", fontWeight: 700, fontSize: "12px", letterSpacing: "0.5px",
                backdropFilter: "blur(4px)",
              }}>
                {isFree ? "✦ GRATIS" : "PREMIUM"}
              </div>
            </div>
          </div>

          {/* Right: Info */}
          <div>
            {/* Badge */}
            <div style={{
              display: "inline-block",
              padding: "4px 12px", borderRadius: "20px", marginBottom: "16px",
              background: "rgba(0,240,255,0.08)", border: "1px solid rgba(0,240,255,0.2)",
              color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 600,
            }}>
              🎮 Aset Digital Roblox
            </div>

            <h1 style={{
              fontFamily: "Poppins, sans-serif",
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 800, lineHeight: "1.2", marginBottom: "20px",
            }}>
              {product.nama}
            </h1>

            {/* Price */}
            <div style={{
              padding: "20px 24px", borderRadius: "var(--radius-md)",
              background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
              marginBottom: "24px",
            }}>
              <p style={{ color: "var(--text-grey)", fontSize: "12px", fontWeight: 600, letterSpacing: "1px", textTransform: "uppercase", margin: "0 0 6px" }}>
                Harga
              </p>
              <p style={{
                fontFamily: "Poppins, sans-serif", fontWeight: 800,
                fontSize: isFree ? "28px" : "32px",
                color: isFree ? "var(--accent-green)" : "var(--accent-purple)",
                margin: 0,
              }}>
                {formatRupiah(product.harga)}
              </p>
              {!isFree && (
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: "6px 0 0" }}>
                  Termasuk akses seumur hidup ke file aset
                </p>
              )}
            </div>

            {/* Deskripsi */}
            {product.deskripsi && (
              <div style={{ marginBottom: "28px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px" }}>Deskripsi</h3>
                <p style={{ color: "var(--text-grey)", fontSize: "14px", lineHeight: "1.7", margin: 0 }}>
                  {product.deskripsi}
                </p>
              </div>
            )}

            {/* File Info */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px",
              marginBottom: "28px",
            }}>
              {[
                { label: "Format", value: product.file_url ? "ZIP / RAR" : "Digital Asset" },
                { label: "Tipe", value: isFree ? "Gratis Unduh" : "Berbayar" },
              ].map(info => (
                <div key={info.label} style={{
                  padding: "12px 16px", borderRadius: "var(--radius-sm)",
                  background: "var(--bg-surface)", border: "1px solid var(--border-subtle)",
                }}>
                  <p style={{ color: "var(--text-grey)", fontSize: "11px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 4px" }}>{info.label}</p>
                  <p style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600, margin: 0 }}>{info.value}</p>
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", gap: "12px" }}>
              {isFree ? (
                <button onClick={handleBuyNow} style={{
                  flex: 1, padding: "16px", borderRadius: "10px",
                  background: "linear-gradient(135deg, #22C55E, #16a34a)",
                  color: "#fff", border: "none", fontWeight: 700, fontSize: "15px",
                  cursor: "pointer", transition: "all 0.2s",
                  boxShadow: "0 4px 15px rgba(34,197,94,0.3)",
                }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(34,197,94,0.4)"; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(34,197,94,0.3)"; }}
                >
                  ⬇ Unduh Gratis
                </button>
              ) : (
                <>
                  <button onClick={handleAddToCart} disabled={cartLoading} style={{
                    flex: 1, padding: "16px", borderRadius: "10px",
                    background: "transparent", color: "var(--accent-cyan)",
                    border: "1px solid var(--accent-cyan)", fontWeight: 700, fontSize: "14px",
                    cursor: "pointer", transition: "all 0.2s",
                    opacity: cartLoading ? 0.6 : 1,
                  }}
                    onMouseEnter={e => { if (!cartLoading) e.currentTarget.style.background = "rgba(0,240,255,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                  >
                    🛒 {cartLoading ? "Memproses..." : "Keranjang"}
                  </button>
                  <button onClick={handleBuyNow} disabled={cartLoading} style={{
                    flex: 1, padding: "16px", borderRadius: "10px",
                    background: "linear-gradient(135deg, #8B5CF6, #7c3aed)",
                    color: "#fff", border: "none", fontWeight: 700, fontSize: "14px",
                    cursor: "pointer", transition: "all 0.2s",
                    boxShadow: "0 4px 15px rgba(139,92,246,0.3)",
                    opacity: cartLoading ? 0.6 : 1,
                  }}
                    onMouseEnter={e => { if (!cartLoading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(139,92,246,0.4)"; } }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 15px rgba(139,92,246,0.3)"; }}
                  >
                    ⚡ Beli Sekarang
                  </button>
                </>
              )}
            </div>

            {/* Wishlist Button */}
            <div style={{ marginTop: "12px" }}>
              <button onClick={handleToggleWishlist} disabled={wishlistLoading} style={{
                width: "100%", padding: "14px", borderRadius: "10px",
                background: isWishlisted ? "rgba(239, 68, 68, 0.1)" : "var(--bg-primary)",
                color: isWishlisted ? "#EF4444" : "var(--text-grey)",
                border: isWishlisted ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid var(--border-subtle)",
                fontWeight: 600, fontSize: "14px", cursor: "pointer", transition: "all 0.2s",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
              }}
                onMouseEnter={e => {
                  if (!isWishlisted) {
                    e.currentTarget.style.color = "#F8FAFC";
                    e.currentTarget.style.borderColor = "var(--border-cyan)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isWishlisted) {
                    e.currentTarget.style.color = "var(--text-grey)";
                    e.currentTarget.style.borderColor = "var(--border-subtle)";
                  }
                }}
              >
                {wishlistLoading ? "Memproses..." : isWishlisted ? "❤️ Tersimpan di Wishlist" : "🤍 Simpan ke Wishlist"}
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "flex", gap: "16px", marginTop: "20px", padding: "16px",
              background: "rgba(0,240,255,0.04)", borderRadius: "var(--radius-sm)",
              border: "1px solid var(--border-subtle)",
            }}>
              {["✅ File Asli & Lengkap", "🔒 Transaksi Aman", "📦 Download Instan"].map(badge => (
                <span key={badge} style={{ color: "var(--text-grey)", fontSize: "12px" }}>{badge}</span>
              ))}
            </div>
          </div>
        </div>

        {/* REVIEWS SECTION */}
        <div style={{ marginTop: "64px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "24px", color: "#F8FAFC" }}>
            Ulasan Pembeli ({reviews.length})
          </h2>
          {reviews.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)" }}>
              <p style={{ color: "var(--text-grey)", margin: 0 }}>Belum ada ulasan untuk aset ini. Jadilah yang pertama memberikan ulasan setelah membelinya!</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {reviews.map((rev) => (
                <div key={rev.id} style={{
                  padding: "24px", background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
                  border: "1px solid var(--border-subtle)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{
                        width: "40px", height: "40px", borderRadius: "50%",
                        background: "linear-gradient(135deg, #00F0FF, #8B5CF6)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: "14px", fontWeight: "bold", color: "#0F172A",
                      }}>
                        {(rev.user_name || "U")[0].toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: 0, color: "#F8FAFC", fontSize: "15px", fontWeight: 600 }}>{rev.user_name}</h4>
                        <span style={{ color: "var(--text-grey)", fontSize: "12px" }}>
                          {new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    <div style={{ color: "#F59E0B", fontSize: "16px", letterSpacing: "2px" }}>
                      {"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}
                    </div>
                  </div>
                  {rev.review_text && (
                    <p style={{ color: "var(--text-white)", fontSize: "14px", lineHeight: "1.6", margin: "12px 0 0" }}>
                      "{rev.review_text}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RELATED PRODUCTS */}
        {relatedProducts.length > 0 && (
          <div style={{ marginTop: "80px" }}>
            <h2 style={{ fontSize: "22px", fontWeight: 700, marginBottom: "24px" }}>
              Karya Lainnya
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "16px" }}>
              {relatedProducts.map(p => {
                const pFree = p.is_free === 1 || parseFloat(p.harga) === 0;
                const pImg = p.image_url ? `http://localhost:5000${p.image_url}` : `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`;
                return (
                  <div key={p.id} onClick={() => { navigate(`/product/${p.id}`); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    style={{
                      background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
                      border: "1px solid var(--border-cyan)", overflow: "hidden", cursor: "pointer",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(0,240,255,0.5)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--border-cyan)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  >
                    <div style={{ paddingTop: "65%", position: "relative", overflow: "hidden", background: "var(--bg-primary)" }}>
                      <img src={pImg} alt={p.nama} style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} onError={e => { e.target.src = `https://api.dicebear.com/7.x/shapes/svg?seed=${p.id}`; }} />
                    </div>
                    <div style={{ padding: "14px" }}>
                      <p style={{ color: "var(--text-white)", fontSize: "13px", fontWeight: 600, margin: "0 0 6px", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.nama}</p>
                      <p style={{ color: pFree ? "var(--accent-green)" : "var(--accent-purple)", fontWeight: 700, fontSize: "13px", margin: 0 }}>{formatRupiah(p.harga)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
