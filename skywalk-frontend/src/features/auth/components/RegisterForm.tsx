import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";
import { countryApi } from "../../../api/country";
import PasswordInput from "../../../components/PasswordInput";
import { isValidPersonName, normalizePersonName } from "../../../lib/personName";

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
  const { t } = useTranslation();
  const redirect = searchParams.get("redirect") || "/dashboard";
  const initialAge = searchParams.get("age") || "";

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [age, setAge] = useState(initialAge);
  const [countryOriginId, setCountryOriginId] = useState<number | undefined>();
  const [error, setError] = useState("");

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  });

  const registerMutation = useMutation({
    mutationFn: (data: Parameters<typeof register>[0]) => register(data),
    onSuccess: () => {
      navigate(redirect);
    },
    onError: (err: unknown) => {
      const axiosMsg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(axiosMsg || t("auth.register.error"));
    },
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
    if (passwordStrength.strength <= 40) return t("auth.register.weak");
    if (passwordStrength.strength <= 60) return t("auth.register.medium");
    if (passwordStrength.strength <= 80) return t("auth.register.good");
    return t("auth.register.strong");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (password !== confirmPassword) {
      setError(t("auth.register.passwordMismatch"));
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError(t("auth.register.nameRequired"));
      return;
    }

    // Même règle que le backend : lettres/accents, espace, apostrophe, tiret.
    if (!isValidPersonName(firstName) || !isValidPersonName(lastName)) {
      setError(t("auth.register.nameInvalid"));
      return;
    }

    registerMutation.mutate({
      email,
      password,
      firstName: normalizePersonName(firstName),
      lastName: normalizePersonName(lastName),
      age: age ? parseInt(age) : undefined,
      countryOriginId,
    });
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
          {t("auth.register.displayName")} <strong>{firstName} {lastName}</strong>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={firstName}
            placeholder={t("auth.register.firstName")}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={50}
            required
            disabled={registerMutation.isPending}
          />
        </div>
        
        <div>
          <input
            type="text"
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={lastName}
            placeholder={t("auth.register.lastName")}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={50}
            required
            disabled={registerMutation.isPending}
          />
        </div>
      </div>
      
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder={t("auth.register.email")}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={registerMutation.isPending}
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
            placeholder={t("auth.register.age")}
            onChange={(e) => setAge(e.target.value)}
            disabled={registerMutation.isPending}
          />
        </div>
        
        <div>
          <select
            className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
            style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
            value={countryOriginId || ""}
            onChange={(e) => setCountryOriginId(e.target.value ? parseInt(e.target.value) : undefined)}
            disabled={registerMutation.isPending}
          >
            <option value="">{t("auth.register.originCountry")}</option>
            {countries.map((country) => (
              <option key={country.idCountry} value={country.idCountry}>
                {country.countryName}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <PasswordInput
          value={password}
          placeholder={t("auth.register.password")}
          onChange={setPassword}
          disabled={registerMutation.isPending}
          autoComplete="new-password"
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
                {t("auth.register.strength")} <span className="font-medium">{getStrengthText()}</span>
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
        <PasswordInput
          value={confirmPassword}
          placeholder={t("auth.register.confirmPassword")}
          onChange={setConfirmPassword}
          disabled={registerMutation.isPending}
          autoComplete="new-password"
        />
      </div>
      
      <label htmlFor="terms" className="flex gap-2 items-start cursor-pointer">
        <input
          type="checkbox"
          className="mt-1 w-4 h-4 cursor-pointer flex-shrink-0"
          id="terms"
          required
          disabled={registerMutation.isPending}
        />
        <span className="text-sm text-gray-700">
          {t("auth.register.terms")}{" "}
          <Link to="/terms" className="text-[#5EA3C0] hover:underline" target="_blank">
            {t("auth.register.termsOfUse")}
          </Link>{" "}
          {t("auth.register.and")}{" "}
          <Link to="/privacy" className="text-[#5EA3C0] hover:underline" target="_blank">
            {t("auth.register.privacyPolicy")}
          </Link>
        </span>
      </label>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={registerMutation.isPending}
      >
        {registerMutation.isPending ? t("auth.register.submitting") : t("auth.register.submit")}
      </button>
      
      <p>{t("auth.register.hasAccount")} <Link to={`/auth/login?redirect=${encodeURIComponent(redirect)}`}>{t("auth.register.login")}</Link> </p>
    </form>
  );
}
