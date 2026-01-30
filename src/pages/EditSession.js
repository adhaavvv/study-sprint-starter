// src/pages/EditSession.js
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSessionDetails, updateSession } from "../services/api";

function toDateTimeLocal(value) {
  // Converts "2026-01-30T10:00:00.000Z" or "2026-01-30 10:00:00" -> "YYYY-MM-DDTHH:MM"
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function EditSession() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [venue, setVenue] = useState("");
  const [datetime, setDatetime] = useState("");
  const [capacity, setCapacity] = useState(1);

  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getSessionDetails(id);
      const s = data.session;

      setTitle(s.title || "");
      setModule(s.module || "");
      setVenue(s.venue || "");
      setDatetime(toDateTimeLocal(s.datetime));
      setCapacity(Number(s.capacity ?? 1));
    } catch (e) {
      setError(e.message || "Failed to load session");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title || !module || !venue || !datetime || !capacity) {
      setError("All fields are required");
      return;
    }

    if (Number(capacity) < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    setBusy(true);
    try {
      await updateSession(id, {
        title,
        module,
        venue,
        datetime,
        capacity: Number(capacity),
      });

      navigate(`/sessions/${id}`);
    } catch (e) {
      setError(e.message || "Failed to update session");
      // If token expired, api.js removes token
      if (!localStorage.getItem("token")) navigate("/login");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (error && !title && !module && !venue && !datetime) {
    return (
      <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
        <p style={{ color: "red" }}>{error}</p>
        <button onClick={() => navigate("/sessions")}>Back</button>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "500px", margin: "0 auto", padding: "2rem" }}>
      <h2>Edit Study Session</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Module</label>
          <input
            type="text"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Date & Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label>Max Participants</label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red", marginBottom: "1rem" }}>{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem" }}>
          <button type="submit" disabled={busy}>
            {busy ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => navigate(`/sessions/${id}`)}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <button type="button" onClick={load} disabled={busy}>
          Reload from Server
        </button>
      </div>
    </main>
  );
}
