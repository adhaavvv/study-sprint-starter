// src/pages/Register.js
import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { register } from "../services/api";

export default function Register() {
  const navigate = useNavigate();

  // ✅ Hooks FIRST
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = !!localStorage.getItem("token");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setBusy(true);
    try {
      await register({ username, password });
      navigate("/login");
    } catch (err) {
      setError(err.message || "Register failed");
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
      <h2>Register</h2>

      <form onSubmit={handleSubmit}>
        <input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button disabled={busy}>
          {busy ? "Registering..." : "Register"}
        </button>
      </form>
    </main>
  );
}
