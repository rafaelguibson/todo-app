import AuthForm from "../components/AuthForm";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useState, useRef } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef();

  async function handleRegister({ username, password, email }) {
    try {
      // Etapa 1: Registro
      await api.post("/api/auth/register/", { username, password, email });

      // Etapa 2: Login automático
      const res = await api.post("/api/auth/login/", { username, password });

      // Etapa 3: Armazenar token e redirecionar
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      let msg = "Erro ao cadastrar. Verifique os dados.";
      if (err.response?.data) {
        const data = err.response.data;
        msg = Object.values(data).flat().join(" ");
      }
      setErrorMsg(msg);
      formRef.current?.resetForm();  // Resetar formulário após erro
    }
  }

  return (
    <AuthForm
      ref={formRef}
      onSubmit={handleRegister}
      buttonText="Registrar"
      error={errorMsg}
    />
  );
}
