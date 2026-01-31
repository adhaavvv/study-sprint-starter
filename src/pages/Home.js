// src/pages/Home.js
import { useNavigate } from "react-router-dom";
import './styles.css'


export default function Home() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  return (
    <div className="home-container">
      <h1>📚 StudySprint</h1>

      <p className="home-text">
        StudySprint helps students plan and join group study sessions easily.
        Create sessions with a topic, time, and venue — or join one created by
        others.
      </p>

      {!isLoggedIn ? (
        <>
          <h3>Get started</h3>
          <p className="home-text">
            You need an account to create or join study sessions.
          </p>

          <div className="home-buttons">
            <button 
              className="guest-button"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
            <button 
              className="guest-button"
              onClick={() => navigate("/register")}
            >
              Register
            </button>
          </div>
        </>
      ) : (
        <>
          <h3>What would you like to do?</h3>

          <div className="home-buttons">
            <button 
              className="action-button"
              onClick={() => navigate("/sessions")}
            >
              View Study Sessions
            </button>

            <button 
              className="action-button"
              onClick={() => navigate("/sessions/new")}
            >
              Create a Session
            </button>

            <button 
              className="action-button"
              onClick={() => navigate("/my-sessions")}
            >
              My Joined Sessions
            </button>
          </div>
        </>
      )}
    </div>
  );
}