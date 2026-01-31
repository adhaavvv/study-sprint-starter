// src/pages/SessionDetails.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  getSessionDetails,
  joinSession,
  leaveSession,
  deleteSession,
  completeSession,
} from "../services/api";

// Small helper: read username/userId from JWT (client-side only)
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export default function SessionDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const isLoggedIn = !!token;
  const me = token ? parseJwt(token) : null; // { userId, username, exp, ... }

  const [data, setData] = useState(null); // { session, participants }
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const d = await getSessionDetails(id);
      setData(d);
    } catch (e) {
      setError(e.message || "Failed to load session details");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const session = data?.session;
  const participants = data?.participants || [];

  const joinedCount = participants.length;
  const capacity = Number(session?.capacity ?? 0);
  const isFull = capacity > 0 && joinedCount >= capacity;
  const isCompleted = session?.status === "COMPLETED";

  const myUserId = me?.userId;
  const myUsername = me?.username;

  const iJoined = useMemo(() => {
    if (!myUserId) return false;
    return participants.some((p) => Number(p.user_id) === Number(myUserId));
  }, [participants, myUserId]);

  const iAmCreator = useMemo(() => {
    // backend returns creator_username in your server.js
    return !!(myUsername && session?.creator_username === myUsername);
  }, [myUsername, session]);

  async function handleJoin() {
    if (!isLoggedIn) return navigate("/login");
    setActionBusy(true);
    try {
      await joinSession(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to join session");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleLeave() {
    if (!isLoggedIn) return navigate("/login");
    setActionBusy(true);
    try {
      await leaveSession(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to leave session");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleComplete() {
    if (!isLoggedIn) return navigate("/login");
    if (!window.confirm("Mark this session as COMPLETED?")) return;

    setActionBusy(true);
    try {
      await completeSession(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to mark completed");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setActionBusy(false);
    }
  }

  async function handleDelete() {
    if (!isLoggedIn) return navigate("/login");
    if (!window.confirm("Delete this session? This cannot be undone.")) return;

    setActionBusy(true);
    try {
      await deleteSession(id);
      navigate("/sessions");
    } catch (e) {
      alert(e.message || "Failed to delete session");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setActionBusy(false);
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/sessions")}>Back</button>
      </main>
    );
  }

  if (!session) {
    return (
      <main style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem" }}>
        <p>Session not found.</p>
        <button onClick={() => navigate("/sessions")}>Back</button>
      </main>
    );
  }

  return (
    <main className="session-details-container">
      <section className="session-card">
        <h2>{session.title}</h2>

        <div className="session-info">
          <p>
            <b>Module:</b> {session.module}
          </p>
          <p>
            <b>Venue:</b> {session.venue}
          </p>
          <p>
            <b>Date/Time:</b>{" "}
            {session.datetime ? new Date(session.datetime).toLocaleString() : "-"}
          </p>
          <p>
            <b>Status:</b> {session.status}
          </p>
          <p>
            <b>Capacity:</b> {joinedCount}/{capacity} {isFull ? "(Full)" : ""}
          </p>
          <p>
            <b>Creator:</b> {session.creator_username}
          </p>
        </div>
      </section>

      <section className="participants-section">
        <h3>Participants ({participants.length})</h3>

        {participants.length === 0 ? (
          <p>No one has joined yet.</p>
        ) : (
          <ul className="participants-list">
            {participants.map((p) => (
              <li key={p.user_id}>
                {p.username}
                {myUserId && Number(p.user_id) === Number(myUserId) ? " (You)" : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* ACTIONS at bottom */}
      <div className="session-actions">
        <button 
          className="back-button"
          onClick={() => navigate("/sessions")}
        >
          ← Back to Sessions
        </button>

        <div className="session-buttons">
          {!isLoggedIn ? (
            <button onClick={() => navigate("/login")}>Login to Join</button>
          ) : (
            <>
              {!iJoined ? (
                <button
                  onClick={handleJoin}
                  disabled={actionBusy || isCompleted || isFull}
                >
                  {actionBusy ? "Please wait..." : "Join"}
                </button>
              ) : (
                <button onClick={handleLeave} disabled={actionBusy}>
                  {actionBusy ? "Please wait..." : "Leave"}
                </button>
              )}

              {iAmCreator && (
                <>
                  <button
                    onClick={() => navigate(`/sessions/${id}/edit`)}
                    disabled={actionBusy}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={actionBusy || isCompleted}
                  >
                    Mark Completed
                  </button>
                  <button onClick={handleDelete} disabled={actionBusy}>
                    Delete
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {!iAmCreator && isLoggedIn && (
        <p style={{ 
          textAlign: "right",
          marginTop: "0.75rem", 
          fontSize: "0.9rem", 
          color: "#666" 
        }}>
          Only the creator can edit, delete, or mark completed.
        </p>
      )}
    </main>
  );
}
