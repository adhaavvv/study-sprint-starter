// src/pages/CreateSession.js
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createSession } from "../services/api";

export default function CreateSession() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [module, setModule] = useState("");
  const [venue, setVenue] = useState("");
  const [datetime, setDatetime] = useState("");
  const [capacity, setCapacity] = useState(1);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!title || !module || !venue || !datetime || !capacity) {
      setError("All fields are required");
      return;
    }

    if (capacity < 1) {
      setError("Capacity must be at least 1");
      return;
    }

    setBusy(true);
    try {
      const data = await createSession({
        title,
        module,
        venue,
        datetime,
        capacity: Number(capacity),
      });

      // backend returns { message, id }
      navigate(`/sessions/${data.id}`);
    } catch (err) {
      setError(err.message || "Failed to create session");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="session-form-container">
      <h2>Create Study Session</h2>

      <form className="session-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. C219 CA2 Revision"
            required
          />
        </div>

        <div className="form-group">
          <label>Module</label>
          <input
            type="text"
            value={module}
            onChange={(e) => setModule(e.target.value)}
            placeholder="e.g. C219"
            required
          />
        </div>

        <div className="form-group">
          <label>Venue</label>
          <input
            type="text"
            value={venue}
            onChange={(e) => setVenue(e.target.value)}
            placeholder="e.g. RP Library"
            required
          />
        </div>

        <div className="form-group">
          <label>Date & Time</label>
          <input
            type="datetime-local"
            value={datetime}
            onChange={(e) => setDatetime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Max Participants</label>
          <input
            type="number"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            required
          />
        </div>

        {error && (
          <p className="error">{error}</p>
        )}

        <div className="form-buttons">
          <button type="submit" disabled={busy}>
            {busy ? "Creating..." : "Create Session"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/sessions")}
            disabled={busy}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
