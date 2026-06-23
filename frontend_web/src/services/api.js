import axios from "axios";

// 1. Bikin instance axios untuk koneksi ke backend
const api = axios.create({
  baseURL: "http://localhost:5000/api", // Pastikan ini sesuai dengan URL backend lo
});

// 2. INTERCEPTOR REQUEST: Otomatis selipin Kunci (Token) di setiap request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 3. INTERCEPTOR RESPONSE (SISTEM AUTO-KICK 🥾)
api.interceptors.response.use(
  (response) => {
    // Kalau server bilang OK, biarkan lewat
    return response;
  },
  (error) => {
    // Kalau server bilang 401 (Unauthorized / Token Expired)
    if (error.response && error.response.status === 401) {
      const token = localStorage.getItem("token");
      
      // Hanya lakukan auto-kick jika dia sebelumnya login (punya token)
      if (token) {
        console.error("🚨 KARTU PASS KEDALUWARSA! Mengaktifkan Auto-Kick...");
        // Bersihkan memori yang "beracun"
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // Lempar paksa ke halaman Login
        window.location.href = "/login";
      }
      // Jika memang guest (tidak ada token), biarkan API me-reject tanpa redirect paksa
    }
    return Promise.reject(error);
  },
);

export default api;
