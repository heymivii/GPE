import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { countryApi } from "../../../api/country";

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard/";
  const initialAge = searchParams.get("age") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState(initialAge);
  const [idOriginCountry, setIdOriginCountry] = useState<number | undefined>();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Récupérer la liste des pays
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas");
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError("Veuillez renseigner votre prénom et nom");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register({
        email,
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        age: age ? parseInt(age) : undefined,
        idOriginCountry,
      });
      navigate(redirect);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || "Erreur lors de l'inscription";
      setError(errorMessage);
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
      
      {firstName && lastName && (
        <div className="p-3 text-blue-700 bg-blue-50 rounded-lg text-sm">
          Votre nom d'affichage sera : <strong>{firstName} {lastName}</strong>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={firstName}
            placeholder="Prénom"
            onChange={(e) => setFirstName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
        
        <div>
          <input
            type="text"
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={lastName}
            placeholder="Nom"
            onChange={(e) => setLastName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      </div>
      
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="number"
            min="18"
            max="100"
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={age}
            placeholder="Âge"
            onChange={(e) => setAge(e.target.value)}
            disabled={isLoading}
          />
        </div>
        
        <div>
          <select
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={idOriginCountry || ""}
            onChange={(e) => setIdOriginCountry(e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={isLoading}
          >
            <option value="">Pays d'origine</option>
            {countries.map((country) => (
              <option key={country.idCountry} value={country.idCountry}>
                {country.countryName}
              </option>
            ))}
          </select>
        </div>
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

      <div>
        <input
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={confirmPassword}
          placeholder="Confirmation du mot de passe"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <div className="flex gap-2 items-center">
        <input
          type="checkbox"
          className=""
          id="terms"
          required
          disabled={isLoading}
        />
        <label htmlFor="terms">Accepter les conditions d'utilisation</label>
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? "Inscription..." : "Rejoindre l'aventure SkyWalk"}
      </button>
      
      <p>Vous avez déjà un compte ? <Link to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>Connectez-vous</Link> </p>
    </form>
  );
}
