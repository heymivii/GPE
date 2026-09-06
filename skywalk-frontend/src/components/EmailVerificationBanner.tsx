import { useState } from 'react';
import { MailWarning, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth';
import { authApi } from '../api/auth';

/**
 * Rappel de confirmation d'adresse, affiché tant que l'email n'est pas vérifié.
 * Volontairement NON masquable : c'est le seul signal qui distingue un compte
 * confirmé d'une adresse saisie au hasard. Les comptes créés avant la mise en
 * place de la vérification sont marqués vérifiés en base, ils ne le voient pas.
 */
export default function EmailVerificationBanner() {
  const { user, isAuthenticated } = useAuth();
  const [sending, setSending] = useState(false);

  if (!isAuthenticated || !user || user.emailVerified !== false) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      const res = await authApi.resendVerification();
      toast.success(res.message);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          "L'envoi a échoué, réessayez dans quelques minutes",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-amber-50 border-b border-amber-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2 sm:gap-3 min-w-0">
            <MailWarning className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5 sm:mt-0" />
            <p className="text-xs sm:text-sm text-amber-900 leading-snug">
              <span className="font-semibold">Confirmez votre adresse email.</span>{' '}
              Un lien a été envoyé à{' '}
              <span className="font-medium break-all">{user.email}</span>.
            </p>
          </div>

          <button
            onClick={handleResend}
            disabled={sending}
            className="flex-shrink-0 ml-7 sm:ml-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs sm:text-sm font-medium rounded-full transition-colors disabled:opacity-50"
          >
            {sending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            {sending ? 'Envoi…' : "Renvoyer l'email"}
          </button>
        </div>
      </div>
    </div>
  );
}
