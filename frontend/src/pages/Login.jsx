import AuthForm from "../components/AuthForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  async function handleLogin({ username, password }) {
    try {
      const res = await axios.post("/api/auth/login/", { username, password });
      localStorage.setItem("token", res.data.access);
      navigate("/dashboard");
    } catch (err) {
      alert("Usuário ou senha inválidos.");
    }
  }

  return <AuthForm onSubmit={handleLogin} buttonText="Entrar" />;
}
