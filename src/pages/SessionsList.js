// src/pages/SessionsList.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, joinSession, leaveSession } from "../services/api";

export default function SessionsList() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("token");

  const [sessions, setSessions] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // Filters
  const [moduleFilter, setModuleFilter] = useState("");
  const [dateFilter, setDateFilter] = useState(""); // YYYY-MM-DD

  async function loadSessions() {
    setBusy(true);
    setError("");
    try {
      const data = await getSessions({
        module: moduleFilter || undefined,
        date: dateFilter || undefined,
      });
      setSessions(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message || "Failed to load sessions");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleFilter, dateFilter]);

  // Build module dropdown options from current results
  const moduleOptions = useMemo(() => {
    const set = new Set(sessions.map((s) => s.module).filter(Boolean));
    return Array.from(set).sort();
  }, [sessions]);

  async function handleJoin(sessionId) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await joinSession(sessionId);
      await loadSessions();
    } catch (e) {
      alert(e.message || "Failed to join session");
      // If token expired, api.js removes token; send to login
      if (!localStorage.getItem("token")) navigate("/login");
    }
  }

  async function handleLeave(sessionId) {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    try {
      await leaveSession(sessionId);
      await loadSessions();
    } catch (e) {
      alert(e.message || "Failed to leave session");
      if (!localStorage.getItem("token")) navigate("/login");
    }
  }

  return (
    <main style={{ maxWidth: "950px", margin: "0 auto", padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div>
          <h2>Upcoming Study Sessions</h2>
          <p style={{ marginTop: "0.25rem" }}>
            Filter by module/date, then view details to join or manage.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          {isLoggedIn ? (
            <button onClick={() => navigate("/sessions/new")}>+ Create</button>
          ) : (
            <button onClick={() => navigate("/login")}>
              Login to Join/Create
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <section
        style={{
          marginTop: "1.25rem",
          padding: "1rem",
          border: "1px solid #ddd",
          borderRadius: "8px",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <label style={{ display: "block", fontSize: "0.9rem" }}>Module</label>
          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
          >
            <option value="">All</option>
            {moduleOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: "block", fontSize: "0.9rem" }}>Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", alignItems: "end", gap: "0.5rem" }}>
          <button type="button" onClick={loadSessions} disabled={busy}>
            {busy ? "Loading..." : "Refresh"}
          </button>
          <button
            type="button"
            onClick={() => {
              setModuleFilter("");
              setDateFilter("");
            }}
            disabled={busy}
          >
            Clear
          </button>
        </div>
      </section>

      {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}

      {/* List */}
      <section style={{ marginTop: "1.25rem" }}>
        {sessions.length === 0 && !busy ? (
          <p>No sessions found. Try changing filters or create one.</p>
        ) : (
          <div style={{ display: "grid", gap: "1rem" }}>
            {sessions.map((s) => {
              const joinedCount = Number(s.joined_count ?? 0);
              const capacity = Number(s.capacity ?? 0);
              const isFull = capacity > 0 && joinedCount >= capacity;
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
                      <b>Capacity:</b> {joinedCount}/{capacity} &nbsp;•&nbsp;{" "}
                      <b>Status:</b> {s.status}
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
                      onClick={() => handleJoin(s.id)}
                      disabled={!isLoggedIn || isCompleted || isFull}
                      title={
                        !isLoggedIn
                          ? "Login required"
                          : isCompleted
                          ? "Session completed"
                          : isFull
                          ? "Session full"
                          : "Join session"
                      }
                    >
                      Join
                    </button>

                    <button
                      onClick={() => handleLeave(s.id)}
                      disabled={!isLoggedIn}
                      title={!isLoggedIn ? "Login required" : "Leave session"}
                    >
                      Leave
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
