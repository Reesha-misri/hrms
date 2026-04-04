import { useState } from "react";
import { Link } from "react-router-dom";
import "./Login.css";
import { Eye, EyeOff } from "lucide-react";

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

    const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:3001/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errMsg = await res.text();
        setError(errMsg || "Login failed");
        return;
      }

      const data = await res.json();

      // Save login data
localStorage.setItem("role", data.role);
localStorage.setItem("employee_id", data.employee_id);
localStorage.setItem("permissions", JSON.stringify(data.permissions));

      // data should include: { role, employee_id, permissions: [{permission_name: "..."}, ...] }
      window.location.reload();
    } catch (err) {
      console.error(err);
      setError("Error connecting to server");
    }
  };

  return (
  <div className="login-container">
    <div className="login-card">
      <h2 className="login-title">Welcome Back 👋</h2>
      <p className="login-subtitle">Login to your account</p>

      {error && <p className="login-error">{error}</p>}

      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="login-input"
        />

        <div className="password-wrapper">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="login-input"
  />

  <span
    className="toggle-password"
    onClick={() => setShowPassword(!showPassword)}
  >
{showPassword ? <Eye size={18} /> : <EyeOff size={18} />}  </span>
</div>

        <button type="submit" className="login-button">
          Login
        </button>
      </form>
      <div className="login-footer">
        <Link to="/forgot-password" style={{ color: "#007bff", textDecoration: "none", fontSize: "14px" }}>Forgot Password?</Link>
      </div>
    </div>
  </div>
);
}

export default Login;