import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      await login({ email, password });
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 text-red-700 bg-red-100 rounded-lg">
          {error}
        </div>
      )}
      
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg  placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Nom d'utilisateur"
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <input
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={password}
          placeholder="Mot de passe"
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="flex justify-between">
        <div className=" flex gap-2 items-center">
          <input
            type="checkbox"
            className=""
            id="scales"
          />
          <label htmlFor="scales">Se souvenir de moi</label>
        </div>

        <div className=" flex gap-2 items-center">
          <Link to="/auth/pwdForgot">Mot de passe oublié ?</Link>
        </div>
      </div>

      <button
        type="submit"
        className="w-full flex px-4 py-4 justify-center bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
      
      <p>Vous n'avez pas encore de compte ? <Link to="/auth/register">Inscrivez-vous</Link> </p>
    </form>
  );
}
