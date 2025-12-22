import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login({ email, password });
      toast.success("Connexion réussie !");
      navigate(redirect);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur de connexion";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg  placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Email"
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
      
      <div className="flex justify-between items-center">
        <label htmlFor="remember-me" className="flex gap-2 items-center cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer"
            id="remember-me"
          />
          <span className="text-sm text-gray-700">Se souvenir de moi</span>
        </label>

        <Link 
          to="/auth/pwdForgot" 
          className="text-sm text-[#5EA3C0] hover:text-[#4a8ca0] transition-colors"
        >
          Mot de passe oublié ?
        </Link>
      </div>

      <button
        type="submit"
        className="w-full flex px-4 py-4 justify-center bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Connexion..." : "Se connecter"}
      </button>
      
      <p>Vous n'avez pas encore de compte ? <Link to={`/auth/register?redirect=${encodeURIComponent(redirect)}`}>Inscrivez-vous</Link> </p>
    </form>
  );
}
