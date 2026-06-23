import React, { useContext } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Brankas from "./pages/Brankas";
import CustomOrder from "./pages/CustomOrder";
import MyOrders from "./pages/MyOrders";
import OrderHistory from "./pages/OrderHistory";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import { AuthProvider, AuthContext } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute"; // Import satpam kita

// Komponen GuestRoute: Jika sudah login, cegah akses ke halaman /login
const GuestRoute = ({ children }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  if (isAuthenticated) {
    return user?.role === "admin" ? <Navigate to="/admin" /> : <Navigate to="/" />;
  }
  return children;
};

// Komponen App Routes yang dibungkus agar bisa menggunakan AuthContext
const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        
        {/* Rute Login dijaga oleh GuestRoute */}
        <Route path="/login" element={
          <GuestRoute>
            <Login />
          </GuestRoute>
        } />
        
        {/* Rute Register dijaga oleh GuestRoute */}
        <Route path="/register" element={
          <GuestRoute>
            <Register />
          </GuestRoute>
        } />

        <Route path="/forgot-password" element={
          <GuestRoute>
            <ForgotPassword />
          </GuestRoute>
        } />
        
        <Route path="/product/:id" element={<ProductDetail />} />
        
        <Route path="/cart" element={
          <PrivateRoute>
            <Cart />
          </PrivateRoute>
        } />
        
        <Route path="/brankas" element={
          <PrivateRoute>
            <Brankas />
          </PrivateRoute>
        } />
        
        <Route path="/my-orders" element={
          <PrivateRoute>
            <MyOrders />
          </PrivateRoute>
        } />

        <Route path="/history" element={
          <PrivateRoute>
            <OrderHistory />
          </PrivateRoute>
        } />

        <Route path="/custom-order" element={
          <PrivateRoute>
            <CustomOrder />
          </PrivateRoute>
        } />

        <Route path="/profile" element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        } />

        <Route path="/wishlist" element={
          <PrivateRoute>
            <Wishlist />
          </PrivateRoute>
        } />

        {/* Rute Admin sekarang dijaga oleh PrivateRoute khusus Admin */}
        <Route
          path="/admin"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminDashboard />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
