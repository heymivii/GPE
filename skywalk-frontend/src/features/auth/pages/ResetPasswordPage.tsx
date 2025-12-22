import ResetPasswordForm from "../components/ResetPasswordForm";

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <ResetPasswordForm />
      </div>
    </div>
  );
}
