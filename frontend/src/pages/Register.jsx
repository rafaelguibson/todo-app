import AuthForm from "../components/AuthForm";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

export default function Register() {
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState("");
  const formRef = useRef();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/dashboard");
    }
  }, [navigate]);

  async function handleRegister({ username, password, email }) {
    try {
      await api.post("/api/auth/register/", { username, password, email });
      const res = await api.post("/api/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      let msg = "Erro ao cadastrar. Verifique os dados.";
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
      onSubmit={handleRegister}
      buttonText="Registrar"
      error={errorMsg}
    />
  );
}
