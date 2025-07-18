import AuthForm from "../components/AuthForm";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef();

  // Redireciona se já estiver logado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function handleLogin({ username, password }) {
    try {
      const res = await api.post("/api/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      let msg = "Erro ao fazer login.";
      if (err.response?.data) {
        const data = err.response.data;
        msg = Object.values(data).flat().join(" ");
      }
      setErrorMsg(msg);
      formRef.current?.resetForm();
    }
  }

  return (
    <AuthForm
      ref={formRef}
      onSubmit={handleLogin}
      buttonText="Entrar"
      error={errorMsg}
    />
  );
}
