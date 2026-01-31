// src/pages/SessionsList.js
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSessions, joinSession, leaveSession } from "../services/api";
import './styles.css'

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
    <main className="sessions-container">
      <div className="sessions-header">
        <div className="sessions-header-info">
          <h2>Upcoming Study Sessions</h2>
          <p>Filter by module/date, then view details to join or manage.</p>
        </div>

        <div className="sessions-header-actions">
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
      <section className="filters-section">
        <div className="filter-group">
          <label>Module</label>
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

        <div className="filter-group">
          <label>Date</label>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
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

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      {/* List */}
      <section className="sessions-list">
        {sessions.length === 0 && !busy ? (
          <p className="no-sessions">No sessions found. Try changing filters or create one.</p>
        ) : (
          <div className="sessions-grid">
            {sessions.map((s) => {
              const joinedCount = Number(s.joined_count ?? 0);
              const capacity = Number(s.capacity ?? 0);
              const isFull = capacity > 0 && joinedCount >= capacity;
              const isCompleted = s.status === "COMPLETED";

              return (
                <div key={s.id} className="session-card">
                  <div className="session-info">
                    <h3>{s.title}</h3>
                    <p className="session-detail">
                      <b>Module:</b> {s.module} &nbsp;•&nbsp; <b>Venue:</b> {s.venue}
                    </p>
                    <p className="session-detail">
                      <b>Date/Time:</b>{" "}
                      {s.datetime ? new Date(s.datetime).toLocaleString() : "-"}
                    </p>
                    <p className="session-detail">
                      <b>Capacity:</b> {joinedCount}/{capacity} &nbsp;•&nbsp;{" "}
                      <b>Status:</b> {s.status}
                    </p>
                    {s.creator_username && (
                      <p className="session-detail">
                        <b>Creator:</b> {s.creator_username}
                      </p>
                    )}
                  </div>

                  <div className="session-actions">
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
