import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../hooks/useAuth";
import { countryApi } from "../../../api/country";

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

export default function RegisterForm() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";
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

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  });
  
  const passwordStrength = useMemo(() => {
    if (!password) return { strength: 0, checks: { length: false, uppercase: false, lowercase: false, number: false, special: false } };
    return calculatePasswordStrength(password);
  }, [password]);
  
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
        
        {password && (
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
          placeholder="Confirmation du mot de passe"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      
      <label htmlFor="terms" className="flex gap-2 items-start cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
          id="terms"
          required
          disabled={isLoading}
        />
        <span className="text-sm text-gray-700">
          J'accepte les{" "}
          <Link to="/legal/terms" className="text-[#5EA3C0] hover:underline" target="_blank">
            conditions d'utilisation
          </Link>{" "}
          et la{" "}
          <Link to="/legal/privacy" className="text-[#5EA3C0] hover:underline" target="_blank">
            politique de confidentialité
          </Link>
        </span>
      </label>

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
