import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import PublicLayout from "../layouts/PublicLayout";
import Swal from "sweetalert2";

export default function Wishlist() {
  const [wishlists, setWishlists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (isAuthenticated) {
      fetchWishlist();
    } else {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const fetchWishlist = async () => {
    try {
      const res = await api.get("/wishlist");
      setWishlists(res.data.data);
    } catch (error) {
      console.error("Gagal mengambil wishlist:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveWishlist = async (assetId) => {
    try {
      await api.post(`/wishlist/toggle/${assetId}`);
      // Hapus item dari UI secara lokal setelah sukses
      setWishlists((prev) => prev.filter((item) => item.id !== assetId));
      
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Aset telah dihapus dari wishlist.',
        timer: 1500,
        showConfirmButton: false,
        background: '#1E293B',
        color: '#F8FAFC'
      });
    } catch (error) {
      console.error("Gagal menghapus wishlist", error);
      Swal.fire({
        icon: 'error', title: 'Oops', text: 'Gagal menghapus dari wishlist',
        background: '#1E293B', color: '#F8FAFC'
      });
    }
  };

  const handleAddToCart = async (assetId) => {
    try {
      await api.post("/cart", { assetId });
      window.dispatchEvent(new Event("cartUpdated"));
      Swal.fire({
        icon: 'success', title: 'Berhasil', text: 'Aset masuk ke keranjang!',
        timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC'
      });
    } catch (error) {
      console.error("Gagal tambah keranjang", error);
    }
  };

  return (
    <PublicLayout>
      <div style={{ padding: "40px 24px", maxWidth: "1200px", margin: "0 auto", minHeight: "80vh" }}>
        
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "32px" }}>
          <div style={{
            width: "48px", height: "48px", borderRadius: "12px",
            background: "rgba(239, 68, 68, 0.1)", color: "#EF4444",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "24px"
          }}>
            ❤️
          </div>
          <div>
            <h1 style={{ color: "#F8FAFC", fontSize: "28px", margin: "0 0 4px" }}>Wishlist Saya</h1>
            <p style={{ color: "#94A3B8", margin: 0, fontSize: "14px" }}>
              Aset-aset digital yang kamu sukai dan simpan untuk nanti.
            </p>
          </div>
        </div>

        {isLoading ? (
           <div style={{ textAlign: "center", padding: "100px", color: "#00F0FF" }}>Memuat wishlist...</div>
        ) : wishlists.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 20px", background: "var(--bg-surface)",
            borderRadius: "16px", border: "1px dashed var(--border-subtle)"
          }}>
            <h2 style={{ fontSize: "24px", marginBottom: "8px", color: "var(--text-white)" }}>Wishlist Kamu Masih Kosong 🤍</h2>
            <p style={{ color: "var(--text-grey)", marginBottom: "24px" }}>Kamu belum memiliki aset yang difavoritkan.</p>
            <Link to="/" style={{
              display: "inline-block", padding: "12px 24px", borderRadius: "8px",
              background: "linear-gradient(135deg, #00F0FF, #0099ff)", color: "#0F172A",
              fontWeight: 700, textDecoration: "none"
            }}>
              Jelajahi Katalog
            </Link>
          </div>
        ) : (
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "24px"
          }}>
            {wishlists.map(asset => (
              <div key={asset.id} style={{
                background: "var(--bg-surface)", borderRadius: "12px", overflow: "hidden",
                border: "1px solid var(--border-subtle)", position: "relative",
                display: "flex", flexDirection: "column"
              }}>
                <img 
                  src={asset.gambar_url} 
                  alt={asset.nama} 
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderBottom: "1px solid var(--border-subtle)" }}
                />
                
                {/* Tombol hapus wishlist overlay */}
                <button 
                  onClick={() => handleRemoveWishlist(asset.id)}
                  style={{
                    position: "absolute", top: "10px", right: "10px",
                    width: "36px", height: "36px", borderRadius: "50%",
                    background: "rgba(15, 23, 42, 0.7)", border: "none", color: "#EF4444",
                    fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    backdropFilter: "blur(4px)"
                  }}
                  title="Hapus dari Wishlist"
                >
                  ❤️
                </button>

                <div style={{ padding: "16px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                  <h3 style={{ margin: "0 0 8px", fontSize: "16px", color: "var(--text-white)" }}>{asset.nama}</h3>
                  <p style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: "bold", color: "#00F0FF" }}>
                    {asset.harga === 0 ? "Gratis" : `Rp ${asset.harga.toLocaleString("id-ID")}`}
                  </p>

                  <div style={{ marginTop: "auto", display: "flex", gap: "10px" }}>
                    <Link to={`/product/${asset.id}`} style={{
                      flex: 1, textAlign: "center", padding: "10px", borderRadius: "6px",
                      background: "rgba(0, 240, 255, 0.1)", color: "#00F0FF",
                      border: "1px solid rgba(0, 240, 255, 0.2)", textDecoration: "none",
                      fontWeight: 600, fontSize: "13px"
                    }}>
                      Lihat Detail
                    </Link>
                    <button 
                      onClick={() => handleAddToCart(asset.id)}
                      style={{
                        flex: 1, padding: "10px", borderRadius: "6px",
                        background: "linear-gradient(135deg, #00F0FF, #0099ff)", color: "#0F172A",
                        border: "none", fontWeight: 700, fontSize: "13px", cursor: "pointer"
                      }}
                    >
                      + Keranjang
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
