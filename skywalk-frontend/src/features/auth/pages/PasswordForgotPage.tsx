import PasswordForgotForm from "../components/PasswordForgotForm";

export default function PasswordForgotPage() {
  return (
    <>
      <h1 className="text-1xl font-bold text-center mb-6 text-black">Mot de passe oublié ?</h1>
      <small className="text-gray-600">Renseignez votre e-mail pour recevoir un lien de réinitialisation</small>
      <PasswordForgotForm />
    </>
  );
}