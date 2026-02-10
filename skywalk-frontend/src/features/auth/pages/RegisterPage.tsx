import RegisterForm from "../components/RegisterForm"
import { useTranslation } from "react-i18next"

export default function LoginPage() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-1xl font-bold text-center mb-6 text-black">{t('authPages.registerTitle')}</h1>
      <RegisterForm />
    </>
  );
}