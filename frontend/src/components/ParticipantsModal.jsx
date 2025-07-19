import { useEffect, useState } from "react";
import api from "../api/axios";
import "./ParticipantsModal.css";

export default function ParticipantsModal({ task, onClose }) {
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    async function fetchParticipants() {
      try {
        const res = await api.get(`/api/tasks/${task.id}/`);
        setParticipants(res.data.shared_with);
      } catch (err) {
        console.error("Erro ao buscar participantes:", err);
      }
    }
    fetchParticipants();
  }, [task]);

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>Participantes da tarefa</h2>
        {participants.length === 0 ? (
          <p>Nenhum participante</p>
        ) : (
          <ul>
            {participants.map((user) => (
              <li key={user.id}>{user.username}</li>
            ))}
          </ul>
        )}
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
