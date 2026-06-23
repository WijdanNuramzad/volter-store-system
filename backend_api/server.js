require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const dbPool = require("./config/database");
const { verifySocketToken } = require("./middleware/authMiddleware");

const userRoutes = require("./routes/userRoutes");
const assetRoutes = require("./routes/assetRoutes");
const orderRoutes = require("./routes/orderRoutes");
const sellerRoutes = require("./routes/sellerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const customOrderRoutes = require("./routes/customOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const wishlistRoutes = require("./routes/wishlistRoutes");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.use("/api/users", userRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/sellers", sellerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/custom-orders", customOrderRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/wishlist", wishlistRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Halo kawan Volter! API Backend berhasil menyala. ⚡" });
});

// ✅ REST: Ambil riwayat chat per-order
app.get("/api/chat/:order_id", async (req, res) => {
  const { order_id } = req.params;
  try {
    const [results] = await dbPool.query(
      "SELECT * FROM chat_messages WHERE order_id = ? ORDER BY timestamp ASC",
      [order_id],
    );
    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil riwayat chat" });
  }
});

// ✅ Socket.IO: Middleware Autentikasi JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  const decoded = verifySocketToken(token);

  if (!decoded) {
    return next(new Error("SOCKET_AUTH_FAILED: Token tidak valid atau tidak ada."));
  }

  socket.user = decoded; // simpan data user di socket
  next();
});

// ✅ Socket.IO: Room-based Private Chat
io.on("connection", (socket) => {
  console.log(`[SOCKET] User ${socket.user.id} (${socket.user.role}) terhubung. ID Socket: ${socket.id}`);

  // Event: Gabung ke room chat order tertentu
  socket.on("gabung_room", async ({ order_id }) => {
    if (!order_id) return;

    // Verifikasi: hanya pemilik order atau admin yang boleh masuk room
    if (socket.user.role !== "admin") {
      const [order] = await dbPool.query(
        "SELECT id FROM custom_requests WHERE id = ? AND user_id = ?",
        [order_id, socket.user.id],
      );
      if (order.length === 0) {
        socket.emit("error_akses", { message: "Kamu tidak punya akses ke room ini!" });
        return;
      }
    }

    const roomName = `order_${order_id}`;
    socket.join(roomName);
    console.log(`[SOCKET] User ${socket.user.id} bergabung ke room: ${roomName}`);
    socket.emit("bergabung_sukses", { room: roomName, order_id });
  });

  // Event: Kirim pesan ke room tertentu
  socket.on("kirim_pesan", async ({ order_id, pesan }) => {
    if (!order_id || !pesan?.trim()) return;

    const roomName = `order_${order_id}`;

    try {
      const [result] = await dbPool.query(
        "INSERT INTO chat_messages (order_id, sender_id, sender_name, pesan) VALUES (?, ?, ?, ?)",
        [order_id, socket.user.id, socket.user.nama || socket.user.role, pesan.trim()],
      );

      const pesanBaru = {
        id: result.insertId,
        order_id,
        sender_id: socket.user.id,
        sender_name: socket.user.nama || socket.user.role,
        sender_role: socket.user.role,
        pesan: pesan.trim(),
        timestamp: new Date(),
      };

      // ✅ Kirim HANYA ke room ini, bukan global!
      io.to(roomName).emit("terima_pesan", pesanBaru);
    } catch (error) {
      console.error("[SOCKET] Gagal menyimpan chat:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log(`[SOCKET] User ${socket.user.id} terputus dari Radar.`);
  });
});

const startServer = async () => {
  try {
    await dbPool.query("SELECT 1");
    console.log("[DATABASE] Berhasil terhubung ke MySQL Volter! 🗄️");

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log(
        `[SERVER] Volter API & Radar Socket berjalan di port ${PORT} 🚀🎙️`,
      );
    });
  } catch (error) {
    console.error("[DATABASE] Gagal terhubung ke MySQL:", error.message);
  }
};

startServer();
