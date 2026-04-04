import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import "./ForgotPassword.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email || !newPassword || !confirmPassword) {
      setError("Please fill all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        setError(errMsg || "Reset failed");
        return;
      }

      const msg = await res.text();
      setMessage(msg);
      setTimeout(() => navigate("/"), 2000);
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    }
  };

  return (
    <div className="login-container" style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f1f5f9" }}>
      <div className="forgot-password-card">
        <Link to="/" className="back-link">
          <ArrowLeft size={16} /> Back to Login
        </Link>
        <h2 className="login-title" style={{ marginBottom: "10px", fontSize: "24px", color: "#1e293b" }}>Reset Password</h2>
        <p style={{ color: "#64748b", fontSize: "14px", marginBottom: "30px" }}>Enter your email and new password</p>

        {error && <div className="leave-message message-error" style={{ marginBottom: "20px" }}>{error}</div>}
        {message && <div className="leave-message message-success" style={{ marginBottom: "20px" }}>{message}</div>}

        <form onSubmit={handleReset}>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Email Address</label>
            <input
              type="email"
              placeholder="name@company.com"
              className="leave-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="leave-input"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div style={{ marginBottom: "24px" }}>
            <label style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", display: "block" }}>Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="leave-input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="reset-btn">
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
