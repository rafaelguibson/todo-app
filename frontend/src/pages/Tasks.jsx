import { useEffect, useState } from "react";
import api from "../api/axios";
import TaskModal from "../components/TaskModal";
import ParticipantsModal from "../components/ParticipantsModal";
import ShareTaskModal from "../components/ShareTaskModal";
import { FaEdit, FaTrash, FaShareAlt, FaUsers, FaEye } from "react-icons/fa";
import "./Tasks.css";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(1);
  const [filter, setFilter] = useState("all");

  const [refresh, setRefresh] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(null); // { mode: 'edit' | 'create', task }
  const [showShareModal, setShowShareModal] = useState(null); // task.id
  const [showParticipants, setShowParticipants] = useState(null); // task
  const pageSize = 5;

  function handleLogout() {
  localStorage.removeItem("token");
  window.location.href = "/login"; // ou use navigate se estiver usando react-router
  }
  
  useEffect(() => {
    fetchTasks();
  }, [page, filter, refresh]);

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

  return (
    <div className="tasks-page">
    <header className="tasks-header">
      <h1>
        Projeto Desafio: <strong>GESTAO OPME LTDA</strong>
      </h1>
      <button className="logout-button" onClick={handleLogout}>Logout</button>
    </header>

      <div className="filters">
        <button className={filter === "today" ? "active" : ""} onClick={() => (setFilter("today"), setPage(1))}>Hoje</button>
        <button className={filter === "pending" ? "active" : ""} onClick={() => (setFilter("pending"), setPage(1))}>Pendentes</button>
        <button className={filter === "done" ? "active" : ""} onClick={() => (setFilter("done"), setPage(1))}>Concluídas</button>
        <button className={filter === "all" ? "active" : ""} onClick={() => (setFilter("all"), setPage(1))}>Todas</button>
      </div>

      <div className="tasks-container">
        <div className="tasks-header-actions">
          <h2>Tarefas</h2>
          <button onClick={() => setShowTaskModal({ mode: 'create' })}>➕ Nova Tarefa</button>
        </div>

        {tasks.length === 0 ? (
          <p className="no-tasks">Nenhuma tarefa encontrada.</p>
        ) : (
          <ul className="task-list">
            {tasks.map((task) => (
              <li key={task.id} className={`task-card ${task.completed ? "done" : ""}`}>
                <div className="task-main">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleComplete(task)}
                  />
                  <span className="task-title">{task.title}</span>
                </div>
                <div className="task-info">
                  <span className="participants">
                    <FaUsers /> {task.shared_with?.length || 0}
                  </span>
                  <span className="task-date">
                    📅 {new Date(task.created_at).toLocaleDateString("pt-BR")}
                  </span>
                  <div className="task-actions">
                    <FaEye
                      className="icon"
                      title="Ver participantes"
                      onClick={() => setShowParticipants(task)}
                    />
                    <FaShareAlt
                      className="icon"
                      title="Compartilhar"
                      onClick={() => setShowShareModal(task.id)}
                    />
                    <FaEdit
                      className="icon"
                      title="Editar"
                      onClick={() => setShowTaskModal({ mode: 'edit', task })}
                    />
                    <FaTrash
                      className="icon"
                      title="Excluir"
                      onClick={() => deleteTask(task.id)}
                    />
                  </div>
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

      {/* MODAL DE CRIAÇÃO/EDIÇÃO DE TAREFA */}
      {showTaskModal && (
        <TaskModal
          mode={showTaskModal.mode}
          task={showTaskModal.task || null}
          onClose={() => setShowTaskModal(null)}
          onCreated={() => {
            setShowTaskModal(null);
            setRefresh(!refresh);
          }}
        />
      )}

      {/* MODAL DE PARTICIPANTES */}
      {showParticipants && (
        <ParticipantsModal
          task={showParticipants}
          onClose={() => setShowParticipants(null)}
        />
      )}

      {/* MODAL DE COMPARTILHAR */}
      {showShareModal && (
        <ShareTaskModal
          taskId={showShareModal}
          onClose={() => setShowShareModal(null)}
        />
      )}
    </div>
  );
}
