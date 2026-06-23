import React, { useState, useEffect, useRef, useContext } from "react";
import io from "socket.io-client";
import api from "../services/api";
import AdminLayout from "../layouts/AdminLayout";
import { AuthContext } from "../context/AuthContext";
import Swal from "sweetalert2";

// ============================================================
// HELPER: Stat Card
// ============================================================
function StatCard({ icon, label, value, sub, color, trend }) {
  return (
    <div style={{
      background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
      border: `1px solid ${color}33`, padding: "20px 24px",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: `${color}18`, display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "20px",
        }}>{icon}</div>
        {trend !== undefined && (
          <span style={{ fontSize: "12px", fontWeight: 600, color: trend >= 0 ? "#22C55E" : "#EF4444" }}>
            {trend >= 0 ? "▲" : "▼"} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p style={{ color: "var(--text-grey)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", margin: "0 0 6px" }}>
        {label}
      </p>
      <p style={{ fontFamily: "Poppins, sans-serif", fontSize: "26px", fontWeight: 800, color, margin: "0 0 4px" }}>
        {value}
      </p>
      {sub && <p style={{ color: "var(--text-muted)", fontSize: "11px", margin: 0 }}>{sub}</p>}
    </div>
  );
}

// ============================================================
// HELPER: Status Badge
// ============================================================
function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  let color = "#F59E0B", bg = "rgba(245,158,11,0.1)", border = "rgba(245,158,11,0.3)";
  if (s.includes("selesai")) { color = "#22C55E"; bg = "rgba(34,197,94,0.1)"; border = "rgba(34,197,94,0.3)"; }
  else if (s.includes("progress") || s.includes("proses")) { color = "#00F0FF"; bg = "rgba(0,240,255,0.1)"; border = "rgba(0,240,255,0.3)"; }
  else if (s.includes("pembayaran") || s.includes("quotation")) { color = "#8B5CF6"; bg = "rgba(139,92,246,0.1)"; border = "rgba(139,92,246,0.3)"; }

  return (
    <span style={{
      padding: "4px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 700,
      background: bg, border: `1px solid ${border}`, color,
      textTransform: "uppercase", letterSpacing: "0.5px",
    }}>
      {status || "Menunggu"}
    </span>
  );
}

// ============================================================
// ORDER ROW (editable inline)
// ============================================================
function OrderRow({ order, onSave, onChat }) {
  const [progress, setProgress] = useState(order.progress ?? 0);
  const [status, setStatus] = useState(order.status || "Menunggu Konfirmasi");
  const [harga, setHarga] = useState(order.harga_tawaran || "");
  const [resultLink, setResultLink] = useState(order.result_link || "");

  const inputStyle = {
    padding: "7px 10px", background: "var(--bg-primary)",
    color: "var(--text-white)", border: "1px solid var(--text-muted)",
    borderRadius: "6px", fontSize: "13px", outline: "none",
  };

  return (
    <tr style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.2s" }}
      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
    >
      <td style={{ padding: "14px 16px" }}>
        <p style={{ color: "var(--text-white)", fontWeight: 600, fontSize: "14px", margin: "0 0 3px" }}>
          {order.judul_project}
        </p>
        <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
          {order.kategori} · Klien #{order.buyer_id}
        </p>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <input type="number" min="0" max="100" value={progress}
            onChange={e => setProgress(e.target.value)}
            style={{ ...inputStyle, width: "64px", textAlign: "center" }} />
          <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>%</span>
        </div>
      </td>
      <td style={{ padding: "14px 16px" }}>
        <input type="text" value={harga} onChange={e => setHarga(e.target.value)}
          placeholder="Contoh: 150000"
          style={{ ...inputStyle, width: "130px" }} />
      </td>
      <td style={{ padding: "14px 16px" }}>
        <select value={status} onChange={e => setStatus(e.target.value)}
          style={{ ...inputStyle, cursor: "pointer", width: "100%", marginBottom: (progress == 100 || status === "Selesai") ? "8px" : "0" }}>
          {["Menunggu Konfirmasi", "Quotation", "Menunggu Pembayaran", "In Progress", "Revisi", "Selesai"].map(s =>
            <option key={s} value={s}>{s}</option>
          )}
        </select>
        {(progress == 100 || status === "Selesai") && (
          <input type="text" value={resultLink} onChange={e => setResultLink(e.target.value)}
            placeholder="Link Hasil (GDrive dsb)"
            style={{ ...inputStyle, width: "100%" }} />
        )}
      </td>
      <td style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: "6px" }}>
          <button onClick={() => onSave(order.id, progress, status, harga, resultLink)} style={{
            padding: "8px 12px", borderRadius: "6px",
            background: "linear-gradient(135deg, #00F0FF, #0099ff)",
            color: "#0F172A", border: "none", fontWeight: 700, fontSize: "12px",
            cursor: "pointer", whiteSpace: "nowrap",
          }}>
            ⚡ Update
          </button>
          <button onClick={() => onChat(order)} style={{
            padding: "8px 12px", borderRadius: "6px",
            background: "rgba(59,130,246,0.1)",
            color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)",
            fontWeight: 600, fontSize: "12px", cursor: "pointer", whiteSpace: "nowrap",
          }}>
            💬 Chat
          </button>
        </div>
      </td>
    </tr>
  );
}

// ============================================================
// MAIN ADMIN DASHBOARD
// ============================================================
export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState("ringkasan");
  const { user } = useContext(AuthContext);

  const [stats, setStats] = useState({ pendapatan: 0, order_aktif: 0, aset_terjual: 0 });
  const [orders, setOrders] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [socketInstance, setSocketInstance] = useState(null);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editAssetId, setEditAssetId] = useState(null);
  const [formAsset, setFormAsset] = useState({ nama: "", harga: "", deskripsi: "", gambar: null, file_aset: null });
  const [passwordForm, setPasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [orderSearch, setOrderSearch] = useState("");
  const [orderPage, setOrderPage] = useState(1);
  const ordersPerPage = 8;

  const messagesEndRef = useRef(null);

  // ======================== FETCH FUNCTIONS ========================
  const fetchStats = async () => {
    try {
      const res = await api.get("/custom-orders/admin/dashboard/stats");
      setStats(res.data?.data || res.data || {});
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/custom-orders/admin/all");
      setOrders(res.data?.data || res.data || []);
    } catch (e) { console.error(e); }
    setIsLoading(false);
  };

  const fetchAssets = async () => {
    try {
      const res = await api.get("/assets");
      setAssets(res.data?.data || res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data?.data || res.data || []);
    } catch (e) { console.error("Endpoint users belum ada / error:", e); }
  };

  useEffect(() => {
    if (activeMenu === "ringkasan") { fetchStats(); fetchOrders(); fetchAssets(); }
    if (activeMenu === "order") fetchOrders();
    if (activeMenu === "upload") fetchAssets();
    if (activeMenu === "users") fetchUsers();
    // eslint-disable-next-line
  }, [activeMenu]);

  // Socket.IO
  useEffect(() => {
    if (!selectedOrderForChat) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    const socket = io("http://localhost:5000", {
      transports: ["websocket"],
      auth: { token }
    });
    setSocketInstance(socket);

    socket.on("connect", () => {
      socket.emit("gabung_room", { order_id: selectedOrderForChat.id });
    });

    socket.on("terima_pesan", (msg) => {
      setMessages(prev => [...prev, msg]);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });

    socket.on("error_akses", (err) => {
      alert(err.message);
      socket.disconnect();
    });

    api.get(`/chat/${selectedOrderForChat.id}`)
      .then(res => {
        setMessages(res.data?.data || res.data || []);
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      });

    return () => socket.disconnect();
  }, [selectedOrderForChat]);

  // ======================== ACTIONS ========================
  const handleUpdateOrder = async (id, progress, status, harga, result_link) => {
    try {
      await api.put(`/custom-orders/admin/update/${id}`, {
        progress: parseInt(progress),
        status,
        harga_tawaran: harga ? parseFloat(String(harga).replace(/[^0-9.]/g, "")) : 0,
        result_link: result_link || null,
      });
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Order berhasil diupdate! ⚡', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
      fetchOrders();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal update order!', background: '#1E293B', color: '#F8FAFC' }); }
  };

  const handleUploadAsset = async (e) => {
    e.preventDefault();
    if (!formAsset.nama) return Swal.fire({ icon: 'warning', title: 'Oops', text: 'Nama wajib diisi!', background: '#1E293B', color: '#F8FAFC' });
    if (!editAssetId && (!formAsset.gambar || !formAsset.file_aset)) return Swal.fire({ icon: 'warning', title: 'Oops', text: 'Thumbnail dan file aset wajib diupload!', background: '#1E293B', color: '#F8FAFC' });
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("nama", formAsset.nama);
      formData.append("deskripsi", formAsset.deskripsi);
      formData.append("harga", formAsset.harga || 0);
      if (formAsset.gambar) formData.append("gambar", formAsset.gambar);
      if (formAsset.file_aset) formData.append("file_aset", formAsset.file_aset);

      if (editAssetId) {
        await api.put(`/assets/${editAssetId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karya diperbarui! ⚡', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
      } else {
        await api.post("/assets", formData, { headers: { "Content-Type": "multipart/form-data" } });
        Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Karya berhasil diunggah! 🚀', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
      }
      resetAssetForm();
      fetchAssets();
    } catch (e) { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal proses karya.', background: '#1E293B', color: '#F8FAFC' }); }
    setIsLoading(false);
  };

  const handleDeleteAsset = async (id) => {
    const confirm = await Swal.fire({
      title: 'Yakin hapus karya ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Ya, hapus!',
      background: '#1E293B',
      color: '#F8FAFC'
    });
    
    if (!confirm.isConfirmed) return;
    
    try {
      await api.delete(`/assets/${id}`);
      fetchAssets();
      Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'Karya telah dihapus.', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
    } catch (e) { Swal.fire({ icon: 'error', title: 'Gagal', text: 'Gagal menghapus karya.', background: '#1E293B', color: '#F8FAFC' }); }
  };

  const handleChangeUserRole = async (id, newRole) => {
    try {
      await api.put(`/users/${id}/role`, { role: newRole });
      Swal.fire({ icon: 'success', title: 'Berhasil', text: `Role diubah menjadi ${newRole}!`, timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
      fetchUsers();
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal mengubah role.', background: '#1E293B', color: '#F8FAFC' });
    }
  };

  const handleDeleteUser = async (id) => {
    const confirm = await Swal.fire({
      title: 'Yakin hapus akun user ini?',
      text: 'Data yang terhapus tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#475569',
      confirmButtonText: 'Ya, hapus!',
      background: '#1E293B',
      color: '#F8FAFC'
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
      Swal.fire({ icon: 'success', title: 'Terhapus!', text: 'User telah dihapus.', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
    } catch (e) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || 'Gagal menghapus user.', background: '#1E293B', color: '#F8FAFC' });
    }
  };

  const resetAssetForm = () => {
    setFormAsset({ nama: "", harga: "", deskripsi: "", gambar: null, file_aset: null });
    setEditAssetId(null);
    ["inputGambar", "inputFile"].forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = ""; });
  };

  const handleSendChat = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !socketInstance || !selectedOrderForChat) return;
    socketInstance.emit("kirim_pesan", { order_id: selectedOrderForChat.id, pesan: chatInput.trim() });
    setChatInput("");
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) return Swal.fire({ icon: 'error', title: 'Oops', text: 'Password baru tidak cocok!', background: '#1E293B', color: '#F8FAFC' });
    setIsLoading(true);
    try {
      await api.put(`/users/change-password/${user.id}`, {
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Password berhasil diubah! 🔒', timer: 1500, showConfirmButton: false, background: '#1E293B', color: '#F8FAFC' });
      setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (e) { Swal.fire({ icon: 'error', title: 'Gagal', text: e.response?.data?.message || "Gagal ubah password.", background: '#1E293B', color: '#F8FAFC' }); }
    setIsLoading(false);
  };

  // ======================== FILTERED ORDERS ========================
  const filteredOrders = orders.filter(o =>
    (o.judul_project || "").toLowerCase().includes(orderSearch.toLowerCase()) ||
    (o.kategori || "").toLowerCase().includes(orderSearch.toLowerCase())
  );
  const paginatedOrders = filteredOrders.slice((orderPage - 1) * ordersPerPage, orderPage * ordersPerPage);
  const totalOrderPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // ======================== SHARED STYLES ========================

  const card = { background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-subtle)", padding: "24px" };
  const inp = {
    width: "100%", padding: "12px 14px", background: "var(--bg-primary)",
    color: "var(--text-white)", border: "1px solid var(--text-muted)",
    borderRadius: "8px", fontSize: "14px", outline: "none",
  };
  const lbl = { display: "block", color: "var(--text-grey)", fontSize: "12px", fontWeight: 600, marginBottom: "6px" };
  const thStyle = {
    padding: "12px 16px", textAlign: "left",
    color: "var(--text-grey)", fontSize: "12px", fontWeight: 700,
    letterSpacing: "0.5px", textTransform: "uppercase",
    background: "rgba(0,0,0,0.2)", borderBottom: "1px solid var(--border-subtle)",
  };

  // ======================== RENDER ========================
  return (
    <AdminLayout activeMenu={activeMenu} setActiveMenu={setActiveMenu}>

      {/* =========== RINGKASAN =========== */}
      {activeMenu === "ringkasan" && (
        <div className="fade-in">
          {/* Stats Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "28px" }}>
            <StatCard icon="💰" label="Total Pendapatan" value={`Rp ${(stats.pendapatan || 0).toLocaleString("id-ID")}`} color="#22C55E" trend={12} sub="Dari semua transaksi" />
            <StatCard icon="🛠" label="Order Aktif" value={stats.order_aktif || 0} color="#00F0FF" trend={5} sub="Sedang dikerjakan" />
            <StatCard icon="📦" label="Total Aset" value={assets.length} color="#8B5CF6" sub="Di etalase publik" />
            <StatCard icon="🛒" label="Aset Terjual" value={stats.aset_terjual || 0} color="#F59E0B" trend={8} sub="Total pembelian" />
          </div>

          {/* Recent Orders */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontFamily: "Poppins, sans-serif", fontSize: "15px", fontWeight: 700, margin: 0 }}>Order Terbaru</h3>
              <button onClick={() => setActiveMenu("order")} style={{
                padding: "6px 14px", borderRadius: "6px", fontSize: "12px", fontWeight: 600,
                background: "rgba(0,240,255,0.1)", color: "var(--accent-cyan)",
                border: "1px solid rgba(0,240,255,0.2)", cursor: "pointer",
              }}>Lihat Semua →</button>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {["Project", "Kategori", "Status", "Progress"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 5).map(o => (
                    <tr key={o.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px", color: "var(--text-white)", fontSize: "14px", fontWeight: 600 }}>{o.judul_project}</td>
                      <td style={{ padding: "12px 16px", color: "var(--text-grey)", fontSize: "13px" }}>{o.kategori}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={o.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "var(--bg-primary)", overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${o.progress || 0}%`, background: "linear-gradient(90deg, #00F0FF, #8B5CF6)", borderRadius: "3px" }} />
                          </div>
                          <span style={{ color: "var(--accent-cyan)", fontSize: "12px", fontWeight: 700, minWidth: "35px" }}>{o.progress || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {orders.length === 0 && (
                    <tr><td colSpan="4" style={{ padding: "32px", textAlign: "center", color: "var(--text-grey)", fontSize: "14px" }}>Belum ada order masuk</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========== KELOLA ORDER =========== */}
      {activeMenu === "order" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: selectedOrderForChat ? "1fr 400px" : "1fr", gap: "24px", alignItems: "start" }}>
          
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Search + Filter */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
              <div style={{ position: "relative", flex: 1 }}>
                <svg style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }}
                  width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35" strokeLinecap="round"/>
                </svg>
                <input value={orderSearch} onChange={e => { setOrderSearch(e.target.value); setOrderPage(1); }}
                  placeholder="Cari order berdasarkan judul atau kategori..."
                  style={{ ...inp, paddingLeft: "36px", marginBottom: 0 }} />
              </div>
              <span style={{ display: "flex", alignItems: "center", color: "var(--text-grey)", fontSize: "13px", whiteSpace: "nowrap" }}>
                {filteredOrders.length} order
              </span>
            </div>

            {isLoading ? (
              <div style={{ textAlign: "center", padding: "60px" }}><div style={{ width: "36px", height: "36px", borderRadius: "50%", border: "3px solid rgba(0,240,255,0.2)", borderTopColor: "#00F0FF", animation: "spinCyan 0.8s linear infinite", margin: "0 auto" }} /></div>
            ) : (
              <div style={{ ...card, padding: 0, overflow: "hidden" }}>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["Project", "Progress", "Harga Tawaran", "Status", "Aksi"].map(h => <th key={h} style={thStyle}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedOrders.length > 0 ? (
                        paginatedOrders.map(o => (
                          <OrderRow 
                            key={o.id} 
                            order={o} 
                            onSave={handleUpdateOrder} 
                            onChat={() => setSelectedOrderForChat(selectedOrderForChat?.id === o.id ? null : o)} 
                          />
                        ))
                      ) : (
                        <tr><td colSpan="5" style={{ padding: "48px", textAlign: "center", color: "var(--text-grey)" }}>Tidak ada order ditemukan</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalOrderPages > 1 && (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderTop: "1px solid var(--border-subtle)" }}>
                    <span style={{ color: "var(--text-grey)", fontSize: "13px" }}>
                      Halaman {orderPage} dari {totalOrderPages}
                    </span>
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => setOrderPage(p => Math.max(1, p - 1))} disabled={orderPage === 1}
                        style={{ padding: "6px 12px", borderRadius: "6px", background: "var(--bg-primary)", color: "var(--text-grey)", border: "1px solid var(--text-muted)", cursor: orderPage === 1 ? "not-allowed" : "pointer", fontSize: "13px", opacity: orderPage === 1 ? 0.4 : 1 }}>
                        ← Prev
                      </button>
                      {Array.from({ length: totalOrderPages }, (_, i) => i + 1).map(p => (
                        <button key={p} onClick={() => setOrderPage(p)}
                          style={{ padding: "6px 12px", borderRadius: "6px", background: p === orderPage ? "var(--accent-cyan)" : "var(--bg-primary)", color: p === orderPage ? "#0F172A" : "var(--text-grey)", border: "1px solid var(--text-muted)", cursor: "pointer", fontSize: "13px", fontWeight: p === orderPage ? 700 : 400 }}>
                          {p}
                        </button>
                      ))}
                      <button onClick={() => setOrderPage(p => Math.min(totalOrderPages, p + 1))} disabled={orderPage === totalOrderPages}
                        style={{ padding: "6px 12px", borderRadius: "6px", background: "var(--bg-primary)", color: "var(--text-grey)", border: "1px solid var(--text-muted)", cursor: orderPage === totalOrderPages ? "not-allowed" : "pointer", fontSize: "13px", opacity: orderPage === totalOrderPages ? 0.4 : 1 }}>
                        Next →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* CHAT PANEL FOR SELECTED ORDER */}
          {selectedOrderForChat && (
            <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 160px)", ...card, padding: 0, overflow: "hidden", position: "sticky", top: "28px" }}>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)", background: "rgba(0,240,255,0.05)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                  <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22C55E", animation: "glowPulse 1.5s ease infinite" }} />
                  <span style={{ color: "var(--text-white)", fontWeight: 700, fontSize: "14px" }}>Diskusi Project</span>
                </div>
                <p style={{ color: "var(--text-grey)", fontSize: "12px", margin: 0 }}>
                  Klien: #{selectedOrderForChat.buyer_id} · {selectedOrderForChat.judul_project}
                </p>
              </div>

              <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: "center", color: "var(--text-grey)", padding: "40px", fontSize: "13px" }}>Belum ada pesan di order ini</div>
                )}
                {messages.map((msg, i) => {
                  const isAdmin = msg.sender_role === "admin";
                  return (
                    <div key={i} style={{ display: "flex", justifyContent: isAdmin ? "flex-end" : "flex-start", gap: "8px", alignItems: "flex-end" }}>
                      {!isAdmin && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#475569", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#F8FAFC", flexShrink: 0 }}>
                        {(msg.sender_name?.[0] || "U").toUpperCase()}
                      </div>}
                      <div style={{
                        maxWidth: "75%", padding: "10px 14px", borderRadius: isAdmin ? "14px 14px 0 14px" : "14px 14px 14px 0",
                        background: isAdmin ? "rgba(0,240,255,0.15)" : "var(--bg-elevated, #273449)",
                        border: `1px solid ${isAdmin ? "rgba(0,240,255,0.3)" : "var(--border-subtle)"}`,
                      }}>
                        {!isAdmin && <span style={{ fontSize: "11px", color: "var(--text-grey)", display: "block", marginBottom: "4px", fontWeight: 600 }}>{msg.sender_name}</span>}
                        <p style={{ margin: 0, color: "var(--text-white)", fontSize: "13px", lineHeight: "1.5" }}>{msg.pesan}</p>
                        <span style={{ fontSize: "10px", color: "var(--text-grey)", display: "block", marginTop: "6px", textAlign: isAdmin ? "right" : "left" }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Baru saja"}
                        </span>
                      </div>
                      {isAdmin && <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--accent-cyan)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#0F172A", flexShrink: 0 }}>A</div>}
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendChat} style={{ display: "flex", padding: "14px 16px", gap: "10px", borderTop: "1px solid var(--border-subtle)", background: "var(--bg-primary)" }}>
                <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                  placeholder="Kirim pesan ke klien..."
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

      {/* =========== KELOLA ASET =========== */}
      {activeMenu === "upload" && (
        <div className="fade-in" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", alignItems: "start" }}>
          {/* Form Upload */}
          <div style={card}>
            <h3 style={{ fontFamily: "Poppins", fontSize: "16px", fontWeight: 700, marginBottom: "24px", color: "var(--text-white)" }}>
              {editAssetId ? "✏️ Edit Karya" : "📥 Upload Karya Baru"}
            </h3>
            <form onSubmit={handleUploadAsset} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={lbl}>Nama Karya *</label>
                <input style={inp} value={formAsset.nama} onChange={e => setFormAsset({ ...formAsset, nama: e.target.value })} required />
              </div>
              <div>
                <label style={lbl}>Deskripsi</label>
                <textarea rows={3} style={{ ...inp, resize: "vertical" }} value={formAsset.deskripsi} onChange={e => setFormAsset({ ...formAsset, deskripsi: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>Harga (kosongkan jika GRATIS)</label>
                <input type="number" style={inp} value={formAsset.harga} onChange={e => setFormAsset({ ...formAsset, harga: e.target.value })} />
              </div>
              <div>
                <label style={lbl}>Thumbnail (JPG/PNG) {!editAssetId && "*"}</label>
                <input id="inputGambar" type="file" accept="image/*" style={{ ...inp, padding: "10px", border: "1px dashed var(--accent-cyan)", cursor: "pointer" }}
                  onChange={e => setFormAsset({ ...formAsset, gambar: e.target.files[0] })} />
              </div>
              <div>
                <label style={lbl}>File Aset (ZIP/RAR) {!editAssetId && "*"}</label>
                <input id="inputFile" type="file" accept=".zip,.rar" style={{ ...inp, padding: "10px", border: "1px dashed var(--accent-purple)", cursor: "pointer" }}
                  onChange={e => setFormAsset({ ...formAsset, file_aset: e.target.files[0] })} />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button type="submit" disabled={isLoading} style={{
                  flex: 1, padding: "13px", borderRadius: "8px",
                  background: "linear-gradient(135deg, #00F0FF, #0099ff)",
                  color: "#0F172A", border: "none", fontWeight: 700, cursor: "pointer",
                  fontSize: "14px", opacity: isLoading ? 0.6 : 1,
                }}>
                  {isLoading ? "⏳ Memproses..." : editAssetId ? "UPDATE KARYA ⚡" : "🚀 UNGGAH KE TOKO"}
                </button>
                {editAssetId && (
                  <button type="button" onClick={resetAssetForm} style={{
                    padding: "13px 20px", borderRadius: "8px",
                    background: "var(--bg-primary)", color: "var(--text-grey)",
                    border: "1px solid var(--text-muted)", cursor: "pointer", fontWeight: 600, fontSize: "14px",
                  }}>
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Asset Table */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, margin: 0 }}>
                Daftar Etalase ({assets.length} karya)
              </h3>
            </div>
            <div style={{ maxHeight: "500px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr>{["Nama Karya", "Harga", "Aksi"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {assets.length > 0 ? assets.map(a => (
                    <tr key={a.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ color: "var(--text-white)", fontWeight: 600, fontSize: "14px", margin: 0 }}>{a.nama}</p>
                        <p style={{ color: "var(--text-grey)", fontSize: "11px", margin: 0 }}>{a.is_free === 1 ? "Gratis" : "Berbayar"}</p>
                      </td>
                      <td style={{ padding: "12px 16px", color: parseFloat(a.harga) === 0 ? "var(--accent-green)" : "var(--accent-purple)", fontWeight: 700, fontSize: "13px" }}>
                        {parseFloat(a.harga) === 0 ? "GRATIS" : `Rp ${parseFloat(a.harga).toLocaleString("id-ID")}`}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button onClick={() => { setFormAsset({ nama: a.nama, harga: a.harga, deskripsi: a.deskripsi || "", gambar: null, file_aset: null }); setEditAssetId(a.id); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                            style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(59,130,246,0.15)", color: "#3B82F6", border: "1px solid rgba(59,130,246,0.3)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDeleteAsset(a.id)}
                            style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: "pointer", fontSize: "12px", fontWeight: 600 }}>
                            🗑
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="3" style={{ padding: "40px", textAlign: "center", color: "var(--text-grey)" }}>Belum ada karya</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========== MANAJEMEN USER =========== */}
      {activeMenu === "users" && (
        <div className="fade-in">
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "20px", borderBottom: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontFamily: "Poppins", fontSize: "15px", fontWeight: 700, margin: 0 }}>
                Daftar User ({users.length} akun)
              </h3>
            </div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>{["#", "Nama", "Email", "Roblox Username", "Role", "Bergabung", "Aksi"].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {users.length > 0 ? users.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-subtle)" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <td style={{ padding: "14px 16px", color: "var(--text-muted)", fontSize: "13px" }}>{i + 1}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "linear-gradient(135deg, #00F0FF, #8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 700, color: "#0F172A", flexShrink: 0 }}>
                            {(u.nama || u.name || "U")[0].toUpperCase()}
                          </div>
                          <span style={{ color: "var(--text-white)", fontSize: "14px", fontWeight: 600 }}>{u.nama || u.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-grey)", fontSize: "13px" }}>{u.email}</td>
                      <td style={{ padding: "14px 16px", color: "var(--accent-cyan)", fontSize: "13px" }}>{u.roblox_username ? `@${u.roblox_username}` : "—"}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <select
                          value={u.role || "user"}
                          onChange={(e) => handleChangeUserRole(u.id, e.target.value)}
                          style={{
                            padding: "4px 8px", borderRadius: "6px", fontSize: "11px", fontWeight: 700,
                            background: u.role === "admin" ? "rgba(139,92,246,0.15)" : "rgba(0,240,255,0.1)",
                            color: u.role === "admin" ? "#8B5CF6" : "#00F0FF",
                            border: u.role === "admin" ? "1px solid rgba(139,92,246,0.3)" : "1px solid rgba(0,240,255,0.3)",
                            textTransform: "uppercase", cursor: "pointer", outline: "none"
                          }}
                        >
                          <option value="user" style={{ color: "black" }}>USER</option>
                          <option value="admin" style={{ color: "black" }}>ADMIN</option>
                        </select>
                      </td>
                      <td style={{ padding: "14px 16px", color: "var(--text-grey)", fontSize: "12px" }}>
                        {u.created_at ? new Date(u.created_at).toLocaleDateString("id-ID") : "—"}
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => handleDeleteUser(u.id)} disabled={user.id === u.id}
                          style={{ padding: "6px 12px", borderRadius: "6px", background: "rgba(239,68,68,0.15)", color: "#EF4444", border: "1px solid rgba(239,68,68,0.3)", cursor: user.id === u.id ? "not-allowed" : "pointer", fontSize: "12px", fontWeight: 600, opacity: user.id === u.id ? 0.5 : 1 }}>
                          🗑 Hapus
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" style={{ padding: "48px", textAlign: "center", color: "var(--text-grey)" }}>
                      Belum ada data user atau endpoint `/api/users` belum tersedia
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}



      {/* =========== PENGATURAN =========== */}
      {activeMenu === "pengaturan" && (
        <div className="fade-in" style={{ maxWidth: "520px" }}>
          <div style={card}>
            <h3 style={{ fontFamily: "Poppins", fontSize: "16px", fontWeight: 700, marginBottom: "24px" }}>🔒 Ubah Kata Sandi</h3>
            <form onSubmit={handleChangePassword} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              {[
                { label: "Password Lama", key: "oldPassword" },
                { label: "Password Baru", key: "newPassword" },
                { label: "Konfirmasi Password Baru", key: "confirmPassword" },
              ].map(f => (
                <div key={f.key}>
                  <label style={lbl}>{f.label}</label>
                  <input type="password" style={inp} value={passwordForm[f.key]}
                    onChange={e => setPasswordForm({ ...passwordForm, [f.key]: e.target.value })} required />
                </div>
              ))}
              <button type="submit" disabled={isLoading} style={{
                padding: "14px", borderRadius: "8px",
                background: "linear-gradient(135deg, #00F0FF, #0099ff)",
                color: "#0F172A", border: "none", fontWeight: 700, cursor: "pointer",
                fontSize: "14px", marginTop: "8px", opacity: isLoading ? 0.6 : 1,
              }}>
                {isLoading ? "⏳ Memproses..." : "🔒 GANTI PASSWORD"}
              </button>
            </form>
          </div>
        </div>
      )}

    </AdminLayout>
  );
}
