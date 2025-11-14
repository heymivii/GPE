import { useState } from "react";
import { authApi } from "../../../api/auth";

export default function PasswordForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);
    
    try {
      await authApi.forgotPassword({ email });
      setSuccess("Un email de réinitialisation a été envoyé à votre adresse");
    } catch (err: any) {
      setError(err.response?.data?.message || "Erreur lors de l'envoi de l'email");
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
      
      {success && (
        <div className="p-3 text-green-700 bg-green-100 rounded-lg">
          {success}
        </div>
      )}
      
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Votre email"
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Envoi..." : "Recevoir mon lien"}
      </button>
    </form>
  );
}
