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
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "2rem" }}>
      <h2>My Joined Sessions</h2>
      <p style={{ marginBottom: "1rem" }}>
        These are the study sessions you’ve joined.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {sessions.length === 0 && !busy ? (
        <p>You haven’t joined any sessions yet.</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {sessions.map((s) => {
            const joinedCount = Number(s.joined_count ?? 0);
            const capacity = Number(s.capacity ?? 0);
            const isCompleted = s.status === "COMPLETED";

            return (
              <div
                key={s.id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "1rem",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: "1 1 420px" }}>
                  <h3 style={{ margin: 0 }}>{s.title}</h3>
                  <p style={{ margin: "0.4rem 0" }}>
                    <b>Module:</b> {s.module} &nbsp;•&nbsp; <b>Venue:</b>{" "}
                    {s.venue}
                  </p>
                  <p style={{ margin: "0.4rem 0" }}>
                    <b>Date/Time:</b>{" "}
                    {s.datetime ? new Date(s.datetime).toLocaleString() : "-"}
                  </p>
                  <p style={{ margin: "0.4rem 0" }}>
                    <b>Status:</b> {s.status}
                  </p>
                  <p style={{ margin: "0.4rem 0" }}>
                    <b>Capacity:</b> {joinedCount}/{capacity}
                  </p>
                  {s.creator_username && (
                    <p style={{ margin: "0.4rem 0" }}>
                      <b>Creator:</b> {s.creator_username}
                    </p>
                  )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "0.5rem",
                    alignItems: "center",
                  }}
                >
                  <button onClick={() => navigate(`/sessions/${s.id}`)}>
                    View
                  </button>

                  <button
                    onClick={() => handleLeave(s.id)}
                    disabled={busy || isCompleted}
                    title={
                      isCompleted
                        ? "Completed sessions cannot be left"
                        : "Leave session"
                    }
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
