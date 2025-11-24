import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useProfile, useUpdateProfile, useDeleteAccount } from '../../../hooks/useProfile';
import { countryApi } from '../../../api/country';
import type { UpdateProfileDto } from '../../../types/auth';
import { 
  User, 
  Mail, 
  Globe, 
  Shield, 
  Trash2, 
  Save, 
  X, 
  Edit2,
  MapPin,
  Briefcase,
  Languages,
  Calendar
} from 'lucide-react';

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

  const originCountry = countries.find(c => c.idCountry === profile?.idOriginCountry);

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
      toast.success('Profil mis à jour avec succès');
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount.mutateAsync();
      toast.success('Compte supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      toast.error('Erreur lors de la suppression du compte');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 bg-white px-6 py-4 rounded-lg shadow-sm border border-red-100">
          Erreur lors du chargement du profil
        </div>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="h-24 bg-gradient-to-r from-blue-600 to-blue-400"></div>
          <div className="px-8 pb-8">
            <div className="relative flex items-end -mt-10 mb-6">
              <div className="h-24 w-24 rounded-xl bg-white p-1 shadow-lg">
                <div className="h-full w-full bg-blue-50 rounded-lg flex items-center justify-center text-2xl font-bold text-blue-600">
                  {getInitials(profile.fullName || profile.email)}
                </div>
              </div>
              <div className="ml-6 mb-2 flex-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.fullName || 'Utilisateur'}</h1>
                <div className="flex items-center text-gray-500 text-sm mt-1">
                  <Mail className="w-4 h-4 mr-1.5" />
                  {profile.email}
                </div>
              </div>
              {!isEditing && (
                <button
                  onClick={startEditing}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm font-medium text-sm"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier le profil
                </button>
              )}
            </div>

            {!isEditing ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                    Informations personnelles
                  </h2>
                  <div className="grid gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Nom complet</p>
                        <p className="text-gray-900 font-medium">{profile.fullName}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Âge</p>
                        <p className="text-gray-900 font-medium">{profile.age ? `${profile.age} ans` : 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Briefcase className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Statut</p>
                        <p className="text-gray-900 font-medium capitalize">
                          {profile.status === 'self-employed' ? 'Indépendant' : 
                           profile.status === 'employed' ? 'Salarié' :
                           profile.status === 'student' ? 'Étudiant' :
                           profile.status === 'retired' ? 'Retraité' :
                           profile.status || 'Non renseigné'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h2 className="text-lg font-semibold text-gray-900 border-b border-gray-100 pb-2">
                    Préférences & Localisation
                  </h2>
                  <div className="grid gap-4">
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <Languages className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Niveau de langue</p>
                        <p className="text-gray-900 font-medium">{profile.languageLevel || 'Non renseigné'}</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-xs text-gray-500 font-medium uppercase">Pays d'origine</p>
                        <p className="text-gray-900 font-medium">{originCountry?.countryName || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Informations personnelles</h3>
                    
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                        Nom complet
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="fullName"
                          type="text"
                          value={formData.fullName || ''}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                          Âge
                        </label>
                        <input
                          id="age"
                          type="number"
                          value={formData.age || ''}
                          onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          min="18"
                          max="120"
                        />
                      </div>

                      <div>
                        <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                          Statut
                        </label>
                        <select
                          id="status"
                          value={formData.status || ''}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Préférences</h3>
                    
                    <div>
                      <label htmlFor="languageLevel" className="block text-sm font-medium text-gray-700 mb-1">
                        Niveau de langue
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Languages className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="languageLevel"
                          value={formData.languageLevel || ''}
                          onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
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
                    </div>

                    <div>
                      <label htmlFor="originCountry" className="block text-sm font-medium text-gray-700 mb-1">
                        Pays d'origine
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Globe className="h-5 w-5 text-gray-400" />
                        </div>
                        <select
                          id="originCountry"
                          value={formData.idOriginCountry || ''}
                          onChange={(e) => setFormData({ ...formData, idOriginCountry: parseInt(e.target.value) || undefined })}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                        >
                          <option value="">Sélectionner un pays</option>
                          {countries.map((country) => (
                            <option key={country.idCountry} value={country.idCountry}>
                              {country.countryName}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                        Nouveau mot de passe
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Shield className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                          id="password"
                          type="password"
                          value={formData.password || ''}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors"
                          placeholder="Laisser vide pour conserver"
                          minLength={6}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    disabled={updateProfile.isPending}
                    className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 font-medium text-sm"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={updateProfile.isPending}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium text-sm shadow-sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>

                {updateProfile.isError && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center">
                    <X className="w-4 h-4 mr-2" />
                    Erreur lors de la mise à jour du profil. Veuillez réessayer.
                  </div>
                )}
              </form>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-red-100 overflow-hidden">
          <div className="px-8 py-6">
            <div className="flex items-start">
              <div className="p-3 bg-red-50 rounded-lg mr-4">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900">Zone de danger</h2>
                <p className="text-gray-600 mt-1 text-sm">
                  La suppression de votre compte est irréversible. Toutes vos données personnelles, préférences et historiques seront définitivement effacés de nos serveurs.
                </p>
                
                <div className="mt-6">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-4 py-2 border border-red-200 text-red-600 bg-white rounded-lg hover:bg-red-50 transition-colors font-medium text-sm"
                    >
                      Supprimer mon compte
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg border border-red-100">
                      <p className="text-sm font-medium text-red-800 flex-1">
                        Êtes-vous vraiment sûr de vouloir supprimer votre compte ?
                      </p>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-3 py-1.5 bg-white text-gray-700 border border-gray-200 rounded-md hover:bg-gray-50 text-sm font-medium"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleteAccount.isPending}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium shadow-sm"
                      >
                        {deleteAccount.isPending ? 'Suppression...' : 'Confirmer la suppression'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
