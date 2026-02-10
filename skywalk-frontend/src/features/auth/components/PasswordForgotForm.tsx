import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "../../../api/auth";

export default function PasswordForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { t } = useTranslation();

  const forgotMutation = useMutation({
    mutationFn: (emailAddr: string) => authApi.forgotPassword({ email: emailAddr }),
    onSuccess: () => {
      setSuccess(t("auth.passwordForgot.success"));
    },
    onError: (err: unknown) => {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || t("auth.passwordForgot.error"));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    forgotMutation.mutate(email);
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
          placeholder={t("auth.passwordForgot.emailPlaceholder")}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={forgotMutation.isPending}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={forgotMutation.isPending}
      >
        {forgotMutation.isPending ? t("auth.passwordForgot.submitting") : t("auth.passwordForgot.submit")}
      </button>
    </form>
  );
}
