import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("token");

    // PENGAMAN EKSTRA: Pastikan user dan token benar-benar ada dan valid
    if (!storedUser || storedUser === "undefined" || !storedToken || storedToken === "undefined") {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setIsAuthenticated(true);
      setUser(parsedUser);
    } catch (error) {
      console.error("Data User Corrupt, Resetting...");
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  const login = (userData, token) => {
    localStorage.setItem("token", token);
    if (userData) {
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
