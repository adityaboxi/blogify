import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("/api/user/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    await axios.post("/api/user/signin", { email, password });
    const res = await axios.get("/api/user/me");
    setUser(res.data.user);
  };

  const signup = async (fullName, email, password) => {
    await axios.post("/api/user/signup", { fullName, email, password });
  };

  const logout = async () => {
    await axios.get("/api/user/logout");
    setUser(null);
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <p style={{ color: "#999" }}>Loading...</p>
    </div>
  );

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}