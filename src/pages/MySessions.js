// src/pages/MySessions.js
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMySessions, leaveSession } from "../services/api";

export default function MySessions() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function load() {
    setBusy(true);
    setError("");
    try {
      const data = await getMySessions();
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load your sessions");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleLeave(id) {
    if (!window.confirm("Leave this session?")) return;

    setBusy(true);
    try {
      await leaveSession(id);
      await load();
    } catch (e) {
      alert(e.message || "Failed to leave session");
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="my-sessions-container">
      <div className="my-sessions-header">
        <h2>My Joined Sessions</h2>
        <p>These are the study sessions you’ve joined.</p>
      </div>

      {error && <p className="error">{error}</p>}

      {sessions.length === 0 && !busy ? (
        <p>You haven’t joined any sessions yet.</p>
      ) : (
        <div className="my-sessions-grid">
          {sessions.map((s) => {
            const joinedCount = Number(s.joined_count ?? 0);
            const capacity = Number(s.capacity ?? 0);
            const isCompleted = s.status === "COMPLETED";

            return (
              <div key={s.id} className="my-session-card">
                <div className="my-session-info">
                  <h3>{s.title}</h3>
                  <div className="my-session-details">
                    <p>
                      <b>Module:</b> {s.module} &nbsp;•&nbsp; <b>Venue:</b> {s.venue}
                    </p>
                    <p>
                      <b>Date/Time:</b> {s.datetime ? new Date(s.datetime).toLocaleString() : "-"}
                    </p>
                    <p>
                      <b>Status:</b> {s.status}
                    </p>
                    <p>
                      <b>Capacity:</b> {joinedCount}/{capacity}
                    </p>
                    {s.creator_username && (
                      <p>
                        <b>Creator:</b> {s.creator_username}
                      </p>
                    )}
                  </div>
                </div>

                <div className="my-session-actions">
                  <button onClick={() => navigate(`/sessions/${s.id}`)}>
                    View
                  </button>
                  <button
                    onClick={() => handleLeave(s.id)}
                    disabled={busy || isCompleted}
                  >
                    Leave
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
