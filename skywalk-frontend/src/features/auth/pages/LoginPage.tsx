import LoginForm from "../components/LoginForm";
import { useTranslation } from "react-i18next";

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-1xl font-bold text-center mb-6 text-black">{t('authPages.loginTitle')}</h1>
      <LoginForm />
    </>
  );
}