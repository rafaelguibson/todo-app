import { useState } from "react";
import api from "../api/axios";
import "./ShareTaskModal.css";

export default function ShareTaskModal({ taskId, onClose }) {
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  async function handleShare() {
    try {
      await api.post(`/api/tasks/${taskId}/share/`, { username });
      setMessage("Usuário adicionado com sucesso!");
      setUsername(""); // limpa input
    } catch (err) {
      setMessage("Usuário não encontrado.");
      console.error("Erro ao compartilhar tarefa:", err);
    }
  }

  function handleClose() {
    onClose(); // fecha modal
    window.location.reload(); // força refresh em Tasks.jsx
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Compartilhar tarefa</h2>
        <input
          type="text"
          placeholder="Nome de usuário"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        {message && <p className="message">{message}</p>}

        <div className="modal-actions">
          <button onClick={handleClose} className="btn-close">Fechar</button>
          <button onClick={handleShare} className="btn-share">Compartilhar</button>
        </div>
      </div>
    </div>
  );
}
