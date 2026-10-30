import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import Loading from "../components/Loading";
import ErrorMessage from "../components/ErrorMessage";

const API_URL = "http://localhost:5000/tasks";
const AI_API_URL = "http://localhost:5000/api/ai/generate-description";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

function Projects() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [currentUser, setCurrentUser] = useState(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");

  // Practical 13 AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  // HANDLE UNAUTHORIZED RESPONSE
  const handleUnauthorized = (response) => {
    if (response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      navigate("/login");

      return true;
    }

    return false;
  };

  // GET TASKS
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(API_URL, {
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch tasks");
      }

      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (_) {}
    }

    fetchTasks();
  }, []);

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // GENERATE AI DESCRIPTION (Practical 13)
  const generateAiDescription = async () => {
    if (!title.trim()) {
      setAiError("Please enter a Task Title first to generate an AI description.");
      return;
    }

    try {
      setAiLoading(true);
      setAiError(null);

      const response = await fetch(AI_API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({ title: title.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate AI description");
      }

      if (data.description) {
        setDescription(data.description);
      }
    } catch (err) {
      setAiError(err.message || "Failed to contact AI service");
    } finally {
      setAiLoading(false);
    }
  };

  // CREATE TASK
  const createTask = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    try {
      setActionLoading(true);
      setError(null);
      setMessage("");

      const response = await fetch(API_URL, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          title,
          description,
          priority,
        }),
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create task");
      }

      setTitle("");
      setDescription("");
      setPriority("medium");

      setMessage("Task created successfully!");

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // UPDATE TASK
  const toggleTask = async (task) => {
    try {
      setActionLoading(true);
      setError(null);
      setMessage("");

      const response = await fetch(`${API_URL}/${task._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update task");
      }

      setMessage("Task updated successfully!");

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // DELETE TASK
  const deleteTask = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    try {
      setActionLoading(true);
      setError(null);
      setMessage("");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (handleUnauthorized(response)) {
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete task");
      }

      setMessage("Task deleted successfully!");

      await fetchTasks();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const q = search.toLowerCase();
    return (
      task.title.toLowerCase().includes(q) ||
      (task.description && task.description.toLowerCase().includes(q))
    );
  });

  if (loading) {
    return (
      <main className="page-shell">
        <Loading />
      </main>
    );
  }

  return (
    <main className="page-shell">
      <section className="tasks-header">
        <div>
          <span className="eyebrow">FULL STACK PRACTICAL 07</span>

          <h1>Task Management</h1>

          <p>
            Manage your tasks with React, Express, MongoDB and JWT
            authentication.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          {currentUser && (
            <span style={{ fontSize: "14px", color: "#64748b" }}>
              👤 {currentUser.name || currentUser.email}
            </span>
          )}
          <button
            onClick={handleLogout}
            style={{
              padding: "6px 14px",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "13px"
            }}
          >
            Logout
          </button>
          <div className="task-count">
            <strong>{tasks.length}</strong>
            <span>Total Tasks</span>
          </div>
        </div>
      </section>

      {message && (
        <div className="success-message">
          <span>✓</span>
          {message}
        </div>
      )}

      {error && (
        <ErrorMessage
          message={error}
          retry={fetchTasks}
        />
      )}

      {/* CREATE TASK */}
      <section className="create-task-card">
        <div className="section-title">
          <div className="section-icon">＋</div>

          <div>
            <h2>Create New Task</h2>
            <p>Add a new task to your MongoDB database.</p>
          </div>
        </div>

        <form onSubmit={createTask} className="task-form">
          <div className="form-group full-width">
            <label>Task Title</label>

            <input
              type="text"
              placeholder="e.g. Complete React Practical"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group full-width">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <label style={{ margin: 0 }}>Description</label>
              <button
                type="button"
                onClick={generateAiDescription}
                disabled={aiLoading}
                className="ai-generate-btn"
                style={{
                  background: aiLoading ? "#94a3b8" : "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "5px 12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  cursor: aiLoading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  boxShadow: "0 2px 4px rgba(79, 70, 229, 0.25)",
                  transition: "all 0.2s ease"
                }}
              >
                {aiLoading ? (
                  <>
                    <span style={{ display: "inline-block", width: "11px", height: "11px", border: "2px solid #ffffff", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                    Generating with AI...
                  </>
                ) : (
                  <>✨ Generate Description</>
                )}
              </button>
            </div>

            <textarea
              placeholder="Describe what needs to be completed..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />

            {/* AI Error Notification */}
            {aiError && (
              <div style={{ marginTop: "6px", padding: "8px 12px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", color: "#dc2626", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                <span>⚠️</span>
                <span>{aiError}</span>
              </div>
            )}

            {/* AI Disclaimer */}
            <div style={{ marginTop: "6px", fontSize: "11px", color: "#64748b", fontStyle: "italic", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>ℹ️</span>
              <span><strong>AI Disclaimer:</strong> Descriptions generated by AI can be reviewed and edited freely before submitting the task.</span>
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>

          <button
            type="submit"
            className="primary-button"
            disabled={actionLoading}
          >
            {actionLoading ? "Creating..." : "Create Task"}
          </button>
        </form>
      </section>

      {/* TASK LIST */}
      <section className="task-list-section">
        <div className="list-heading">
          <div>
            <span className="eyebrow">YOUR WORK</span>
            <h2>Your Tasks</h2>
          </div>

          <span className="task-badge">
            {filteredTasks.length} of {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
          </span>
        </div>

        <div style={{ margin: "16px 0" }}>
          <input
            type="text"
            placeholder="🔍 Search tasks by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 14px",
              border: "1px solid #cbd5e1",
              borderRadius: "8px",
              fontSize: "14px",
              boxSizing: "border-box"
            }}
          />
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✓</div>

            <h3>{tasks.length === 0 ? "No tasks yet" : `No tasks matching "${search}"`}</h3>

            <p>
              {tasks.length === 0
                ? "Create your first task above and it will appear here."
                : "Try a different search keyword."}
            </p>
          </div>
        ) : (
          <div className="task-grid">
            {filteredTasks.map((task) => (
              <article
                className={`task-card ${
                  task.completed ? "completed-task" : ""
                }`}
                key={task._id}
              >
                <div className="task-card-top">
                  <span
                    className={`priority priority-${task.priority}`}
                  >
                    {task.priority}
                  </span>

                  <span
                    className={`status ${
                      task.completed
                        ? "status-completed"
                        : "status-pending"
                    }`}
                  >
                    {task.completed ? "Completed" : "Pending"}
                  </span>
                </div>

                <h3>{task.title}</h3>

                <p className="task-description">
                  {task.description || "No description provided."}
                </p>

                <div className="task-date">
                  Created{" "}
                  {new Date(task.createdAt).toLocaleDateString()}
                </div>

                <div className="task-actions">
                  <button
                    className="complete-button"
                    onClick={() => toggleTask(task)}
                    disabled={actionLoading}
                  >
                    {task.completed
                      ? "Mark Pending"
                      : "Mark Complete"}
                  </button>

                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task._id)}
                    disabled={actionLoading}
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Projects;