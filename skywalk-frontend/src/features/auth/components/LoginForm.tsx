import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useAuth } from "../../../hooks/useAuth";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { t } = useTranslation();
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/dashboard";

  const loginMutation = useMutation({
    mutationFn: (data: { email: string; password: string }) => login(data),
    onSuccess: () => {
      toast.success(t("auth.login.success"));
      navigate(redirect);
    },
    onError: (err: unknown) => {
      const errorMessage = err instanceof Error 
        ? err.message 
        : (err as { response?: { data?: { message?: string } } })?.response?.data?.message || t("auth.login.error");
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <input
          type="email"
          className="mt-1 w-full px-4 py-4 rounded-lg  placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={email}
          placeholder={t("auth.login.email")}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={loginMutation.isPending}
        />
      </div>

      <div>
        <input
          type="password"
          className="mt-1 w-full px-4 py-4 rounded-lg placeholder-black text-black"
          style={{ backgroundColor: "rgba(217, 217, 217, 0.4)" }}
          value={password}
          placeholder={t("auth.login.password")}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loginMutation.isPending}
        />
      </div>
      
      <div className="flex justify-between items-center">
        <label htmlFor="remember-me" className="flex gap-2 items-center cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 cursor-pointer"
            id="remember-me"
          />
          <span className="text-sm text-gray-700">{t("auth.login.rememberMe")}</span>
        </label>

        <Link 
          to="/auth/pwdForgot" 
          className="text-sm text-[#5EA3C0] hover:text-[#4a8ca0] transition-colors"
        >
          {t("auth.login.forgotPassword")}
        </Link>
      </div>

      <button
        type="submit"
        className="w-full flex px-4 py-4 justify-center bg-black text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? t("auth.login.submitting") : t("auth.login.submit")}
      </button>
      
      <p>{t("auth.login.noAccount")} <Link to={`/auth/register?redirect=${encodeURIComponent(redirect)}`}>{t("auth.login.register")}</Link> </p>
    </form>
  );
}
