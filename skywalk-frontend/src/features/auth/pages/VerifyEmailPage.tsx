import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../../api/auth';
import { useAuth } from '../../../hooks/useAuth';

type Status = 'pending' | 'success' | 'error';

/**
 * Cible du lien de confirmation envoyé à l'inscription
 * (mail.service : /auth/verify-email?token=…).
 */
export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<Status>('pending');
  const [message, setMessage] = useState('');
  // React 18 monte deux fois les effets en dev : sans ce garde, le token part
  // deux fois et la seconde réponse (déjà consommée) écraserait le succès.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    if (!token) {
      setStatus('error');
      setMessage('Lien de confirmation incomplet — le token est absent.');
      return;
    }

    authApi
      .verifyEmail(token)
      .then(async (res) => {
        setStatus('success');
        setMessage(res.message);
        // Rafraîchit l'utilisateur en session pour faire disparaître le bandeau.
        await refreshUser().catch(() => undefined);
      })
      .catch((err) => {
        setStatus('error');
        setMessage(
          err?.response?.data?.message ||
            'Ce lien est invalide ou a expiré. Demandez un nouvel envoi depuis votre profil.',
        );
      });
  }, [token, refreshUser]);

  return (
    <div className="text-center">
      {status === 'pending' && (
        <>
          <Loader2 className="w-10 h-10 text-brand-ink animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Confirmation de votre adresse en cours…</p>
        </>
      )}

      {status === 'success' && (
        <>
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Adresse confirmée</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <Link
            to="/dashboard"
            className="inline-block px-5 py-2.5 bg-brand-ink hover:bg-brand-ink-hover text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Aller au tableau de bord
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">Confirmation impossible</h1>
          <p className="text-sm text-gray-500 mb-6">{message}</p>
          <Link
            to="/profile"
            className="inline-block px-5 py-2.5 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-semibold transition-colors"
          >
            Renvoyer depuis mon profil
          </Link>
        </>
      )}
    </div>
  );
}
