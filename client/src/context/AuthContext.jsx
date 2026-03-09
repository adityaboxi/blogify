import { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const AuthContext = createContext();

// Set token in axios headers
function setAuthToken(token) {
  if (token) {
    localStorage.setItem("token", token);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load token from localStorage on app start
    const token = localStorage.getItem("token");
    if (token) {
      setAuthToken(token);
      axios.get("/api/user/me")
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setAuthToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post("/api/user/signin", { email, password });
    const { token } = res.data;
    setAuthToken(token);
    const meRes = await axios.get("/api/user/me");
    setUser(meRes.data.user);
  };

  const signup = async (fullName, email, password) => {
    await axios.post("/api/user/signup", { fullName, email, password });
  };

  const logout = async () => {
    setAuthToken(null);
    setUser(null);
  };

  if (loading) return (
    <div style={{
      display: "flex", justifyContent: "center",
      alignItems: "center", height: "100vh"
    }}>
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
