import { useEffect, useState } from "react";
import api from "../api/axios";
import "./TaskModal.css";

export default function TaskModal({ mode = "create", task = {}, onClose, onCreated }) {
  const isEditMode = mode === "edit";

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);

  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await api.get("/api/categories/");
        setCategories(res.data.results || res.data); // segura ambos formatos
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
      }
    }

    fetchCategories();

    if (isEditMode && task) {
      setTitle(task.title || "");
      setDescription(task.description || "");
      setCategory(task.category || "");
    }
  }, [isEditMode, task]);

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { title, description, category };
    try {
      if (isEditMode) {
        await api.put(`/api/tasks/${task.id}/`, payload);
      } else {
        await api.post("/api/tasks/", payload);
      }
      onCreated();
    } catch (err) {
      console.error("Erro ao salvar tarefa:", err);
    }
  }

  async function handleAddCategory() {
    try {
      const res = await api.post("/api/categories/", { name: newCategory });
      setCategories(prev => [...prev, res.data]);
      setCategory(res.data.id);
      setNewCategory("");
      setShowNewCategory(false);
    } catch (err) {
      console.error("Erro ao adicionar categoria:", err);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <h2>{isEditMode ? "Editar Tarefa" : "Nova Tarefa"}</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Título"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            placeholder="Descrição"
            rows="5"
            style={{ resize: "vertical" }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* CATEGORIA + ADICIONAR */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{ flexGrow: 1, height: "40px" }}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setShowNewCategory(!showNewCategory)}
              style={{
                height: "40px",
                width: "40px",
                fontSize: "20px",
                fontWeight: "bold",
                backgroundColor: "#154ec1",
                color: "#fff",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              +
            </button>
          </div>

          {showNewCategory && (
            <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
              <input
                type="text"
                placeholder="Nova categoria"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                style={{ flexGrow: 1, height: "40px" }}
              />
              <button
                type="button"
                onClick={handleAddCategory}
                style={{
                  height: "40px",
                  padding: "0 16px",
                  backgroundColor: "#154ec1",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                OK
              </button>
            </div>
          )}

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn-close">Cancelar</button>
            <button type="submit" className="btn-submit">
              {isEditMode ? "Salvar Alterações" : "Criar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
