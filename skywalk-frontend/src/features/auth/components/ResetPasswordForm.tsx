import { useState, useMemo } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { authApi } from "../../../api/auth";
import PasswordInput from "../../../components/PasswordInput";

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
  const { t } = useTranslation();
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordStrength = useMemo(() => {
    if (!newPassword)
      return {
        strength: 0,
        checks: { length: false, uppercase: false, lowercase: false, number: false, special: false },
      };
    return calculatePasswordStrength(newPassword);
  }, [newPassword]);

  const getStrengthColor = () => {
    if (passwordStrength.strength <= 40) return "bg-red-500";
    if (passwordStrength.strength <= 60) return "bg-orange-500";
    if (passwordStrength.strength <= 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getStrengthText = () => {
    if (passwordStrength.strength <= 40) return t("auth.resetPassword.weak");
    if (passwordStrength.strength <= 60) return t("auth.resetPassword.medium");
    if (passwordStrength.strength <= 80) return t("auth.resetPassword.good");
    return t("auth.resetPassword.strong");
  };

  const resetMutation = useMutation({
    mutationFn: (data: { token: string; newPassword: string }) =>
      authApi.resetPassword(data),
    onSuccess: () => {
      toast.success(t("auth.resetPassword.success"));
      navigate("/auth/login");
    },
    onError: (err: unknown) => {
      const errorMessage =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || t("auth.resetPassword.error");
      setError(errorMessage);
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError(t("auth.resetPassword.tokenMissing"));
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t("auth.resetPassword.passwordMismatch"));
      return;
    }

    if (passwordStrength.strength < 60) {
      setError(
        t("auth.resetPassword.passwordWeak")
      );
      return;
    }

    resetMutation.mutate({ token, newPassword });
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
          {t("auth.resetPassword.invalidLink")}
        </h2>
        <p className="text-gray-600 mb-6">
          {t("auth.resetPassword.invalidLinkDesc")}
        </p>
        <Link 
          to="/auth/forgot-password" 
          className="inline-block px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {t("auth.resetPassword.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("auth.resetPassword.title")}
        </h2>
        <p className="text-gray-600">
          {t("auth.resetPassword.description")}
        </p>
      </div>

      {error && (
        <div className="p-3 text-red-700 bg-red-100 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div>
        <PasswordInput
          value={newPassword}
          placeholder={t("auth.resetPassword.newPassword")}
          onChange={setNewPassword}
          disabled={resetMutation.isPending}
          autoComplete="new-password"
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
                {t("auth.resetPassword.strength")} <span className="font-medium">{getStrengthText()}</span>
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
          placeholder={t("auth.resetPassword.confirmPassword")}
          onChange={setConfirmPassword}
          disabled={resetMutation.isPending}
          autoComplete="new-password"
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50 hover:bg-gray-800"
        disabled={resetMutation.isPending}
      >
        {resetMutation.isPending ? t("auth.resetPassword.submitting") : t("auth.resetPassword.submit")}
      </button>

      <div className="text-center">
        <Link to="/auth/login" className="text-sm text-[#5EA3C0] hover:underline">
          {t("auth.resetPassword.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
