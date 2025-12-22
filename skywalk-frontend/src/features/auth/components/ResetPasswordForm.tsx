import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import api from "../../../lib/api";

const calculatePasswordStrength = (password: string) => {
  let strength = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
  
  if (checks.length) strength += 20;
  if (checks.uppercase) strength += 20;
  if (checks.lowercase) strength += 20;
  if (checks.number) strength += 20;
  if (checks.special) strength += 20;
  
  return { strength, checks };
};

export default function ResetPasswordForm() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    if (!newPassword) return { strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } };
    return calculatePasswordStrength(newPassword);
  }, [newPassword]);
  
  const getStrengthColor = () => {
    if (passwordStrength.strength <= 40) return "bg-red-500";
    if (passwordStrength.strength <= 60) return "bg-orange-500";
    if (passwordStrength.strength <= 80) return "bg-yellow-500";
    return "bg-green-500";
  };
  
  const getStrengthText = () => {
    if (passwordStrength.strength <= 40) return "Faible";
    if (passwordStrength.strength <= 60) return "Moyen";
    if (passwordStrength.strength <= 80) return "Bon";
    return "Fort";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!token) {
      setError("Token de réinitialisation manquant");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }
    
    if (passwordStrength.strength < 60) {
      setError("Votre mot de passe est trop faible. Utilisez au moins 8 caractères avec majuscules, minuscules et chiffres.");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await api.post("/auth/reset-password", { token, newPassword });
      toast.success("Mot de passe réinitialisé avec succès !");
      navigate("/auth/login");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de la réinitialisation";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Lien invalide
        </h2>
        <p className="text-gray-600 mb-6">
          Le lien de réinitialisation est manquant ou invalide.
        </p>
        <Link 
          to="/auth/forgot-password" 
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Nouveau mot de passe
        </h2>
        <p className="text-gray-600">
          Choisissez un mot de passe fort pour sécuriser votre compte.
        </p>
      </div>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <input
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={newPassword}
          placeholder="Nouveau mot de passe"
          onChange={(e) => setNewPassword(e.target.value)}
          required
          disabled={isLoading}
        />
        
        {newPassword && (
          <div className="mt-2">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${getStrengthColor()}`}
                style={{ width: `${passwordStrength.strength}%` }}
              />
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-600">
                Force : <span className="font-medium">{getStrengthText()}</span>
              </p>
              <div className="flex gap-1 text-xs">
                <span className={passwordStrength.checks.length ? "text-green-600" : "text-gray-400"}>8+</span>
                <span className={passwordStrength.checks.uppercase ? "text-green-600" : "text-gray-400"}>A</span>
                <span className={passwordStrength.checks.lowercase ? "text-green-600" : "text-gray-400"}>a</span>
                <span className={passwordStrength.checks.number ? "text-green-600" : "text-gray-400"}>0</span>
                <span className={passwordStrength.checks.special ? "text-green-600" : "text-gray-400"}>!</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div>
        <input
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={confirmPassword}
          placeholder="Confirmer le mot de passe"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50 hover:bg-gray-800"
        disabled={isLoading}
      >
        {isLoading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
      </button>

      <div className="text-center">
        <Link to="/auth/login" className="text-sm text-[#5EA3C0] hover:underline">
          Retour à la connexion
        </Link>
      </div>
    </form>
  );
}
