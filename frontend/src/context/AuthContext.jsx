import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, fetchCurrentUser } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchCurrentUser()
      .then((data) => setUser(data))
      .catch(() => {
        localStorage.removeItem("access_token");
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const { access_token } = await loginUser(email, password);
    localStorage.setItem("access_token", access_token);
    const currentUser = await fetchCurrentUser();
    setUser(currentUser);
    return currentUser;
  }

  function logout() {
    localStorage.removeItem("access_token");
    setUser(null);
  }

  const value = { user, loading, login, logout, updateUser: setUser, isAuthenticated: !!user };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
