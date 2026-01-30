// src/pages/Login.js
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { login } from "../services/api";

export default function Login() {
  const navigate = useNavigate();

  // ✅ Hooks FIRST
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      const data = await login({ username, password });
      localStorage.setItem("token", data.token);
      navigate("/sessions");
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setBusy(false);
    }
  }

  // ✅ Conditional render AFTER hooks
  if (isLoggedIn) {
    return <Navigate to="/sessions" replace />;
  }

  return (
    <main style={{ maxWidth: "400px", margin: "0 auto", padding: "2rem" }}>
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button disabled={busy}>
          {busy ? "Logging in..." : "Login"}
        </button>
      </form>
    </main>
  );
}
