import AuthForm from "../components/AuthForm";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  async function handleRegister({ username, password, email }) {
    try {
      await axios.post("/api/users/register/", { username, password, email });
      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (err) {
      alert("Erro ao cadastrar. Verifique os dados.");
    }
  }

  return <AuthForm onSubmit={handleRegister} buttonText="Registrar" />;
}
