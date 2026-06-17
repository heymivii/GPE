import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '../../../api/user';
import { useAuth } from '../../../hooks/useAuth';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Search, RefreshCw, Shield, Users } from 'lucide-react';

export default function AdminRoles() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [usersSearch, setUsersSearch] = useState('');
  const usersPage = 1;

  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useQuery({
    queryKey: ['admin-users-list', usersPage],
    queryFn: () => userApi.getUsersAdmin(usersPage, 100),
  });

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: number; role: string }) => userApi.updateUserRole(userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-collaborators'] });
      toast.success('Rôle mis à jour avec succès.');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Erreur lors de la modification du rôle.';
      toast.error(msg);
    },
  });

  const currentUserId = user?.idUser || (user as any)?.id || (user as any)?.userId;

  const filteredUsers = (usersData?.data || []).filter((u: any) => {
    if (!usersSearch.trim()) return true;
    const q = usersSearch.toLowerCase();
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`.toLowerCase();
    return fullName.includes(q) || u.email?.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-[#5EA3C0]" />
            Gestion des rôles
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Modifier les privilèges des utilisateurs (Attribution des rôles User / Admin)
          </p>
        </div>
        <button
          onClick={() => refetchUsers()}
          disabled={usersLoading || updateRoleMutation.isPending}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 bg-white rounded-lg hover:bg-gray-50 text-gray-600 text-sm transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${usersLoading || updateRoleMutation.isPending ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {/* Main card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#5EA3C0]" /> Utilisateurs enregistrés
            </h2>
            <p className="text-[11px] text-gray-400">Total : {filteredUsers.length} comptes correspondants</p>
          </div>
          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par nom ou email..."
              value={usersSearch}
              onChange={(e) => setUsersSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-250 bg-gray-50/50 rounded-xl text-xs focus:outline-none focus:border-[#5EA3C0]"
            />
          </div>
        </div>

        {usersLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#5EA3C0]" />
            <p className="text-xs text-gray-400">Chargement de la liste des utilisateurs...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-center py-12 text-gray-400 text-sm italic">Aucun utilisateur trouvé.</p>
        ) : (
          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  <th className="py-3 px-4">Utilisateur</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Date d'inscription</th>
                  <th className="py-3 px-4">Dernière connexion</th>
                  <th className="py-3 px-4 text-right">Rôle / Privilèges</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-xs text-gray-600">
                {filteredUsers.map((u: any) => {
                  const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || 'Sans nom';
                  const initials = fullName.slice(0, 2).toUpperCase();
                  const isSelf = u.idUser === currentUserId;
                  const isSaving = updateRoleMutation.isPending && updateRoleMutation.variables?.userId === u.idUser;

                  return (
                    <tr key={u.idUser} className="hover:bg-gray-50/45 transition-colors">
                      <td className="py-3 px-4 font-semibold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
                            {initials}
                          </div>
                          <span>
                            {fullName}
                            {isSelf && (
                              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-slate-900 text-white font-extrabold">
                                Vous
                              </span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{u.email}</td>
                      <td className="py-3 px-4 text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="py-3 px-4 text-gray-400">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('fr-FR') : 'Jamais connecté'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-2">
                          {isSaving && <RefreshCw className="w-3 h-3 animate-spin text-[#5EA3C0]" />}
                          <select
                            value={u.roles}
                            onChange={(e) => updateRoleMutation.mutate({ userId: u.idUser, role: e.target.value })}
                            disabled={isSelf || isSaving}
                            className={`bg-white border border-gray-250 rounded-lg text-xs font-semibold px-2 py-1 focus:border-[#5EA3C0] focus:ring-1 focus:ring-[#5EA3C0] ${
                              u.roles === 'admin' ? 'text-amber-700 bg-amber-50/50' : 'text-gray-700'
                            }`}
                          >
                            <option value="user">Utilisateur (User)</option>
                            <option value="admin">Administrateur (Admin)</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
