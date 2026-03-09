import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import AddBlog from "./pages/AddBlog";
import BlogDetail from "./pages/BlogDetail";
import ForgotPassword from "./pages/ForgotPassword";

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/signin" replace />;
}

export default function App() {
  return (
    <div style={{ minHeight: "100vh", background: "#fff", color: "#111" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/blog/:id" element={<BlogDetail />} />
        <Route path="/blog/add" element={
          <ProtectedRoute><AddBlog /></ProtectedRoute>
        } />
        <Route path="*" element={
          <div style={{ textAlign: "center", padding: "4rem" }}>
            <h2>404 — Page not found</h2>
          </div>
        } />
      </Routes>
    </div>
  );
}