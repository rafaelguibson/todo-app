// src/components/TaskModal.jsx
import { useState, useEffect } from "react";
import api from "../api/axios";
import "./TaskModal.css";

export default function TaskModal({ onClose, onCreated }) {
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    api.get("/api/categories/").then(res => setCategories(res.data));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    let finalCategory = categoryId;

    if (newCategory) {
      const res = await api.post("/api/categories/", { name: newCategory });
      finalCategory = res.data.id;
    }

    await api.post("/api/tasks/", {
      title,
      category: finalCategory
    });

    onCreated();
  }

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>Nova Tarefa</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título da tarefa"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={newCategory}
          >
            <option value="">Selecione uma categoria</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Ou crie uma nova categoria"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              setCategoryId("");
            }}
          />

          <div className="modal-actions">
            <button type="submit">Criar</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
