import PasswordForgotForm from "../components/PasswordForgotForm";
import { useTranslation } from "react-i18next";

export default function PasswordForgotPage() {
  const { t } = useTranslation();
  return (
    <>
      <h1 className="text-1xl font-bold text-center mb-6 text-black">{t('authPages.forgotPasswordTitle')}</h1>
      <small className="text-gray-600">{t('authPages.forgotPasswordSubtitle')}</small>
      <PasswordForgotForm />
    </>
  );
}