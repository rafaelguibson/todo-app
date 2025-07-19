// src/pages/Tasks.jsx
import { useEffect, useState } from "react";
import api from "../api/axios";
import "./Tasks.css";
import TaskModal from "../components/TaskModal";
import { FaEdit, FaTrash, FaShareAlt } from "react-icons/fa";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [refresh, setRefresh] = useState(false);

  const pageSize = 5;

  async function fetchTasks() {
    try {
      const params = { page, page_size: pageSize };
      if (filter === "today") params.today = true;
      if (filter === "pending") params.completed = false;
      if (filter === "done") params.completed = true;

      const res = await api.get("/api/tasks/", { params });
      setTasks(res.data.results);
      setCount(Math.ceil(res.data.count / pageSize));
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
    }
  }

  async function toggleComplete(task) {
    try {
      await api.patch(`/api/tasks/${task.id}/`, { completed: !task.completed });
      setRefresh(!refresh);
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
    }
  }

  async function deleteTask(id) {
    try {
      await api.delete(`/api/tasks/${id}/`);
      setRefresh(!refresh);
    } catch (err) {
      console.error("Erro ao excluir tarefa:", err);
    }
  }

  useEffect(() => {
    fetchTasks();
  }, [page, filter, refresh]);

  return (
    <div className="tasks-page">
      <div className="tasks-wrapper">
        <div className="filters">
          <button className={filter === "today" ? "active" : ""} onClick={() => (setFilter("today"), setPage(1))}>
            Hoje
          </button>
          <button className={filter === "pending" ? "active" : ""} onClick={() => (setFilter("pending"), setPage(1))}>
            Pendentes
          </button>
          <button className={filter === "done" ? "active" : ""} onClick={() => (setFilter("done"), setPage(1))}>
            Concluídas
          </button>
          <button className={filter === "all" ? "active" : ""} onClick={() => (setFilter("all"), setPage(1))}>
            Todas
          </button>
        </div>

        <div className="tasks-container">
          <div className="header">
            <h2>Minhas Tarefas</h2>
            <button onClick={() => setShowModal(true)}>➕ Nova Tarefa</button>
          </div>

          {tasks.length === 0 ? (
            <p className="no-tasks">Nenhuma tarefa encontrada.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className={`task-item ${task.completed ? "done" : ""}`}>
                  <input type="checkbox" checked={task.completed} onChange={() => toggleComplete(task)} />
                  <span className="task-title">{task.title}</span>
                  <span className="task-date">
                    {new Date(task.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="actions">
                    <FaEdit title="Editar" className="icon" />
                    <FaTrash title="Excluir" className="icon" onClick={() => deleteTask(task.id)} />
                    <FaShareAlt title="Compartilhar" className="icon" />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="pagination">
          <button onClick={() => setPage(1)} disabled={page === 1}>«</button>
          <button onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>‹</button>
          <span>Página {page} de {count}</span>
          <button onClick={() => setPage(p => Math.min(p + 1, count))} disabled={page === count}>›</button>
          <button onClick={() => setPage(count)} disabled={page === count}>»</button>
        </div>
      </div>

      {showModal && (
        <TaskModal
          onClose={() => setShowModal(false)}
          onCreated={() => {
            setShowModal(false);
            setRefresh(!refresh);
          }}
        />
      )}
    </div>
  );
}
