import { useState } from "react";
import { Link } from "react-router-dom";
import "./AuthForm.css";

export default function AuthForm({ onSubmit, buttonText }) {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    remember: false
  });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="auth-container">
      <h2>{buttonText === "Registrar" ? "Crie sua conta" : "Acesse o sistema"}</h2>

      {buttonText === "Registrar" && (
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
        />
      )}

      <input
        type="text"
        name="username"
        placeholder="Usuário"
        value={formData.username}
        onChange={handleChange}
        required
      />

      <input
        type="password"
        name="password"
        placeholder="Senha"
        value={formData.password}
        onChange={handleChange}
        required
      />

      {buttonText === "Entrar" && (
        <div className="auth-extra">
          <label className="remember">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
            />
            Lembre de mim
          </label>
          <Link to="#" className="forgot">Esqueceu sua senha?</Link>
        </div>
      )}

      <button type="submit">{buttonText}</button>

      {buttonText === "Entrar" && (
        <p className="auth-footer">
          Não tem uma conta? <Link to="/register">Registrar</Link>
        </p>
      )}
    </form>
  );
}
