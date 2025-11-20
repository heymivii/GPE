// Page de profil utilisateur avec édition et suppression de compte

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useProfile, useUpdateProfile, useDeleteAccount } from '../../../hooks/useProfile';
import { countryApi } from '../../../api/country';
import type { UpdateProfileDto } from '../../../types/auth';

export default function ProfilePage() {
  const { data: profile, isLoading, error } = useProfile();
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: countryApi.getAll,
  });
  const updateProfile = useUpdateProfile();
  const deleteAccount = useDeleteAccount();

  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileDto>({});

  // Trouver le nom du pays d'origine
  const originCountry = countries.find(c => c.idCountry === profile?.idOriginCountry);

  // Initialiser le formulaire avec les données du profil
  const startEditing = () => {
    if (profile) {
      setFormData({
        fullName: profile.fullName,
        age: profile.age,
        status: profile.status,
        languageLevel: profile.languageLevel,
        idOriginCountry: profile.idOriginCountry,
      });
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Erreur lors du chargement du profil</div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* En-tête */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600 mt-1">{profile.email}</p>
            </div>
            {!isEditing && (
              <button
                onClick={startEditing}
                className="px-4 py-2 bg-[#5EA3C0] text-white rounded-lg hover:bg-[#4891b0] transition-colors"
              >
                Modifier
              </button>
            )}
          </div>

          {/* Mode affichage */}
          {!isEditing && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700">Nom complet</label>
                <p className="text-gray-900 mt-1">{profile.fullName}</p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Âge</label>
                  <p className="text-gray-900 mt-1">{profile.age || 'Non renseigné'}</p>
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700">Statut</label>
                  <p className="text-gray-900 mt-1">{profile.status || 'Non renseigné'}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Niveau de langue</label>
                <p className="text-gray-900 mt-1">{profile.languageLevel || 'Non renseigné'}</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700">Pays d'origine</label>
                <p className="text-gray-900 mt-1">{originCountry?.countryName || 'Non renseigné'}</p>
              </div>

              <div className="border-t pt-6 mt-8">
                <h2 className="text-xl font-semibold text-red-600 mb-4">Zone dangereuse</h2>
                <p className="text-gray-600 mb-4">
                  La suppression de votre compte est irréversible. Toutes vos données seront définitivement perdues.
                </p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Supprimer mon compte
                  </button>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleDeleteAccount}
                      disabled={deleteAccount.isPending}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      {deleteAccount.isPending ? 'Suppression...' : 'Confirmer la suppression'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Annuler
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mode édition */}
          {isEditing && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom complet *
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="age" className="block text-sm font-semibold text-gray-700 mb-2">
                    Âge
                  </label>
                  <input
                    id="age"
                    type="number"
                    value={formData.age || ''}
                    onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                    min="18"
                    max="120"
                  />
                </div>

                <div>
                  <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    id="status"
                    value={formData.status || ''}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                  >
                    <option value="">Sélectionner</option>
                    <option value="student">Étudiant</option>
                    <option value="employed">Salarié</option>
                    <option value="self-employed">Indépendant</option>
                    <option value="retired">Retraité</option>
                    <option value="other">Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="languageLevel" className="block text-sm font-semibold text-gray-700 mb-2">
                  Niveau de langue
                </label>
                <select
                  id="languageLevel"
                  value={formData.languageLevel || ''}
                  onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  <option value="A1">A1 - Débutant</option>
                  <option value="A2">A2 - Élémentaire</option>
                  <option value="B1">B1 - Intermédiaire</option>
                  <option value="B2">B2 - Intermédiaire avancé</option>
                  <option value="C1">C1 - Avancé</option>
                  <option value="C2">C2 - Maîtrise</option>
                  <option value="native">Langue maternelle</option>
                </select>
              </div>

              <div>
                <label htmlFor="originCountry" className="block text-sm font-semibold text-gray-700 mb-2">
                  Pays d'origine
                </label>
                <select
                  id="originCountry"
                  value={formData.idOriginCountry || ''}
                  onChange={(e) => setFormData({ ...formData, idOriginCountry: parseInt(e.target.value) || undefined })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                >
                  <option value="">Sélectionner un pays</option>
                  {countries.map((country) => (
                    <option key={country.idCountry} value={country.idCountry}>
                      {country.countryName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nouveau mot de passe (optionnel)
                </label>
                <input
                  id="password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5EA3C0] focus:border-transparent"
                  placeholder="Laisser vide pour ne pas changer"
                  minLength={6}
                />
                <p className="text-sm text-gray-500 mt-1">Minimum 6 caractères</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="px-6 py-2 bg-[#5EA3C0] text-white rounded-lg hover:bg-[#4891b0] transition-colors disabled:opacity-50"
                >
                  {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={updateProfile.isPending}
                  className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
                >
                  Annuler
                </button>
              </div>

              {updateProfile.isError && (
                <div className="text-red-600 text-sm">
                  Erreur lors de la mise à jour du profil. Veuillez réessayer.
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
