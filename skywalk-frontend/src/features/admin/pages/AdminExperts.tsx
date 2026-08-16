import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import {
  BadgeCheck,
  Search,
  Loader2,
  ShieldCheck,
  X,
  Check,
} from 'lucide-react';
import { userApi } from '../../../api/user';
import { countryApi } from '../../../api/country';
import { useVerifyExpert, useRevokeExpert } from '../../../hooks/useExperts';

interface AdminUser {
  idUser: number;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  isExpert?: boolean;
  expertVerifiedAt?: string | null;
  expertTitle?: string | null;
  expertCountry?: { idCountry: number; countryName: string } | null;
  expertCountryId?: number | null;
}

export default function AdminExperts() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<number | null>(null);
  const [form, setForm] = useState<{ expertTitle: string; expertBio: string; expertCountryId: string }>({
    expertTitle: '',
    expertBio: '',
    expertCountryId: '',
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['admin-users', 1],
    queryFn: () => userApi.getUsersAdmin(1, 100),
  });
  const { data: countries = [] } = useQuery({
    queryKey: ['countries', 'active'],
    queryFn: () => countryApi.getActive(),
  });

  const verifyMutation = useVerifyExpert();
  const revokeMutation = useRevokeExpert();

  const users: AdminUser[] = usersData?.data ?? [];
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        (u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q),
    );
  }, [users, search]);

  const isVerified = (u: AdminUser) => !!(u.isExpert && u.expertVerifiedAt);

  const openVerify = (u: AdminUser) => {
    setEditing(u.idUser);
    setForm({
      expertTitle: u.expertTitle ?? '',
      expertBio: '',
      expertCountryId: u.expertCountryId ? String(u.expertCountryId) : '',
    });
  };

  const submitVerify = (userId: number) => {
    verifyMutation.mutate(
      {
        userId,
        dto: {
          expertTitle: form.expertTitle || undefined,
          expertBio: form.expertBio || undefined,
          expertCountryId: form.expertCountryId ? Number(form.expertCountryId) : undefined,
        },
      },
      {
        onSuccess: () => {
          toast.success(t('experts.admin.verified', { defaultValue: 'Expert vérifié' }));
          setEditing(null);
        },
        onError: () => toast.error(t('common.error', { defaultValue: 'Une erreur est survenue' })),
      },
    );
  };

  const revoke = (userId: number) => {
    revokeMutation.mutate(userId, {
      onSuccess: () => toast.success(t('experts.admin.revoked', { defaultValue: 'Vérification révoquée' })),
      onError: () => toast.error(t('common.error', { defaultValue: 'Une erreur est survenue' })),
    });
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('experts.admin.title', { defaultValue: 'Vérification des experts' })}
          </h1>
          <p className="text-sm text-gray-500">
            {t('experts.admin.subtitle', {
              defaultValue: 'Attribuez ou révoquez le statut d’expert vérifié.',
            })}
          </p>
        </div>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('experts.admin.search', { defaultValue: 'Rechercher un membre…' })}
          className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
          {filtered.map((u) => (
            <div key={u.idUser} className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center font-semibold flex-shrink-0">
                  {(u.fullName || u.firstName || u.email).charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {u.fullName || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email}
                  </p>
                  <p className="text-xs text-gray-400 truncate">{u.email}</p>
                </div>
                {isVerified(u) ? (
                  <>
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      {u.expertTitle || t('experts.verified', { defaultValue: 'Expert vérifié' })}
                    </span>
                    <button
                      onClick={() => revoke(u.idUser)}
                      disabled={revokeMutation.isPending}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
                    >
                      {t('experts.admin.revoke', { defaultValue: 'Révoquer' })}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => openVerify(u)}
                    className="px-3 py-1.5 text-xs font-medium text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                  >
                    {t('experts.admin.verify', { defaultValue: 'Vérifier' })}
                  </button>
                )}
              </div>

              {editing === u.idUser && (
                <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 p-3 space-y-2">
                  <input
                    value={form.expertTitle}
                    onChange={(e) => setForm((f) => ({ ...f, expertTitle: e.target.value }))}
                    placeholder={t('experts.admin.titlePlaceholder', {
                      defaultValue: 'Titre (ex. Avocat en immigration)',
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
                  />
                  <textarea
                    value={form.expertBio}
                    onChange={(e) => setForm((f) => ({ ...f, expertBio: e.target.value }))}
                    placeholder={t('experts.admin.bioPlaceholder', { defaultValue: 'Bio courte' })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none resize-none"
                  />
                  <select
                    value={form.expertCountryId}
                    onChange={(e) => setForm((f) => ({ ...f, expertCountryId: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:border-[#5EA3C0] outline-none"
                  >
                    <option value="">
                      {t('experts.admin.countryPlaceholder', { defaultValue: 'Pays d’expertise (optionnel)' })}
                    </option>
                    {countries.map((c: any) => (
                      <option key={c.idCountry} value={c.idCountry}>
                        {c.countryName}
                      </option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => submitVerify(u.idUser)}
                      disabled={verifyMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check className="w-3.5 h-3.5" />
                      {t('experts.admin.confirm', { defaultValue: 'Confirmer la vérification' })}
                    </button>
                    <button
                      onClick={() => setEditing(null)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <X className="w-3.5 h-3.5" />
                      {t('common.cancel', { defaultValue: 'Annuler' })}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
