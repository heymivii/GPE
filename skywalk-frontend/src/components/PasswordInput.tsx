import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  id?: string;
}

/**
 * Champ mot de passe avec bouton oeil.
 * Sans ce bouton les utilisateurs retapent leur mot de passe dans le champ email
 * quand ils se trompent de saisie (retour de recette).
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder,
  disabled = false,
  required = true,
  autoComplete,
  id,
}: PasswordInputProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className="mt-1 w-full px-4 py-4 pr-12 rounded-lg placeholder-black text-black"
        style={{ backgroundColor: 'rgba(217, 217, 217, 0.4)' }}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        disabled={disabled}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        disabled={disabled}
        className="absolute right-3 top-1/2 mt-0.5 -translate-y-1/2 p-1 text-gray-600 hover:text-black disabled:opacity-40 transition-colors"
        aria-label={
          visible
            ? t('auth.password.hide', { defaultValue: 'Masquer le mot de passe' })
            : t('auth.password.show', { defaultValue: 'Afficher le mot de passe' })
        }
        aria-pressed={visible}
        tabIndex={-1}
      >
        {visible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
  );
}
