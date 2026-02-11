import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { authApi } from "../../../api/auth";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const { t } = useTranslation();

  const forgotMutation = useMutation({
    mutationFn: (emailAddr: string) => authApi.forgotPassword({ email: emailAddr }),
    onSuccess: () => {
      setIsSuccess(true);
      toast.success(t("auth.forgotPassword.emailSent"));
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t("auth.forgotPassword.emailError");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotMutation.mutate(email);
  };

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {t("auth.forgotPassword.emailSentTitle")}
          </h2>
          <p className="text-gray-600 mb-6" dangerouslySetInnerHTML={{ __html: t("auth.forgotPassword.emailSentDesc", { email }) }} />
          <p className="text-sm text-gray-500 mb-4">
            {t("auth.forgotPassword.notReceived")}{" "}
            <button 
              onClick={() => setIsSuccess(false)} 
              className="text-[#5EA3C0] hover:underline"
            >
              {t("auth.forgotPassword.retry")}
            </button>
          </p>
        </div>
        
        <Link 
          to="/auth/login" 
          className="block w-full text-center px-4 py-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
        >
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {t("auth.forgotPassword.title")}
        </h2>
        <p className="text-gray-600">
          {t("auth.forgotPassword.description")}
        </p>
      </div>

      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder={t("auth.forgotPassword.emailPlaceholder")}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={forgotMutation.isPending}
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-4 bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50 hover:bg-gray-800"
        disabled={forgotMutation.isPending}
      >
        {forgotMutation.isPending ? t("auth.forgotPassword.submitting") : t("auth.forgotPassword.submit")}
      </button>

      <div className="text-center">
        <Link to="/auth/login" className="text-sm text-[#5EA3C0] hover:underline">
          {t("auth.forgotPassword.backToLogin")}
        </Link>
      </div>
    </form>
  );
}
