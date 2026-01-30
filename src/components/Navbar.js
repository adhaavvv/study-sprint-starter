// src/components/Navbar.js
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));

  // Update navbar when token changes (login/logout)
  useEffect(() => {
    const onStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", onStorage);

    // also update once on mount (covers same-tab updates if you call setItem/removeItem)
    onStorage();

    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/login");
  }

  const linkStyle = ({ isActive }) => ({
    textDecoration: "none",
    fontWeight: isActive ? "700" : "500",
  });

  return (
    <header
      style={{
        borderBottom: "1px solid #ddd",
        padding: "1rem",
      }}
    >
      <nav
        style={{
          maxWidth: "950px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <span style={{ fontWeight: 800, fontSize: "1.1rem" }}>📚 StudySprint</span>

          <NavLink to="/" style={linkStyle}>
            Home
          </NavLink>

          <NavLink to="/sessions" style={linkStyle}>
            Sessions
          </NavLink>

          {isLoggedIn && (
            <NavLink to="/my-sessions" style={linkStyle}>
              My Sessions
            </NavLink>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isLoggedIn ? (
            <>
              <button onClick={() => navigate("/sessions/new")}>
                + Create
              </button>
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" style={linkStyle}>
                Login
              </NavLink>
              <NavLink to="/register" style={linkStyle}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
