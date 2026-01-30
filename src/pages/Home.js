// src/pages/Home.js
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
      <h1>📚 StudySprint</h1>

      <p style={{ fontSize: "1.1rem", marginBottom: "2rem" }}>
        StudySprint helps students plan and join group study sessions easily.
        Create sessions with a topic, time, and venue — or join one created by
        others.
      </p>

      {!isLoggedIn ? (
        <>
          <h3>Get started</h3>
          <p>You need an account to create or join study sessions.</p>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button onClick={() => navigate("/login")}>Login</button>
            <button onClick={() => navigate("/register")}>Register</button>
          </div>
        </>
      ) : (
        <>
          <h3>What would you like to do?</h3>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/sessions")}>
              View Study Sessions
            </button>

            <button onClick={() => navigate("/sessions/new")}>
              Create a Session
            </button>

            <button onClick={() => navigate("/my-sessions")}>
              My Joined Sessions
            </button>
          </div>
        </>
      )}
    </main>
  );
}
