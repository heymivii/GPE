import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useProfile, useUpdateProfile, useDeleteAccount } from '../../../hooks/useProfile';
import { countryApi } from '../../../api/country';
import type { UpdateProfileDto } from '../../../types/auth';
import MultiPillSelect from '../../onboarding/ui/MultiPillSelect';
import countriesData from '../../../data/countries-data.json';
import { 
  User, 
  Mail, 
  Globe, 
  Trash2, 
  Save, 
  X, 
  Edit2,
  MapPin,
} from 'lucide-react';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

interface SelectFieldProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
}

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

  const availableLanguages = useMemo(() => {
    const languages = new Set<string>()
    countriesData.countries.forEach(country => {
      country.languages.forEach(lang => languages.add(lang))
    })
    return Array.from(languages).sort().map(lang => ({
      value: lang,
      label: lang
    }))
  }, [])

  const startEditing = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        age: profile.age,
        status: profile.status,
        languageLevel: profile.languageLevel,
        motherTongue: profile.motherTongue,
        spokenLanguages: profile.spokenLanguages || [],
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

  const InfoItem = ({ label, value, icon }: { label: string, value?: string | number | null, icon?: React.ReactNode }) => (
    <div className="group">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5 flex items-center gap-2 font-outfit">
        {label}
      </p>
      <p className="text-gray-900 font-medium text-base flex items-center gap-2 font-sans">
        {icon && <span className="text-gray-400">{icon}</span>}
        {value || <span className="text-gray-400 italic font-normal text-sm">Non renseigné</span>}
      </p>
    </div>
  );

  const InputField = ({ label, id, type = "text", ...props }: InputFieldProps) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 font-outfit">
        {label}
      </label>
      <input
        id={id}
        type={type}
        className="block w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 placeholder-gray-400 font-sans"
        {...props}
      />
    </div>
  );

  const SelectField = ({ label, id, children, ...props }: SelectFieldProps) => (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1.5 font-outfit">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          className="block w-full px-4 py-2.5 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all duration-200 text-gray-900 appearance-none font-sans"
          {...props}
        >
          {children}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-500">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-50 to-indigo-50 opacity-60"></div>
          
          <div className="relative flex flex-col sm:flex-row items-center sm:items-end gap-8 pt-12">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
              <div className="relative h-32 w-32 rounded-2xl bg-white p-1.5 shadow-xl shadow-blue-100/50 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                <div className="h-full w-full bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-4xl font-bold text-white shadow-inner font-outfit">
                  {getInitials(profile.fullName || profile.email)}
                </div>
              </div>
            </div>
            
            <div className="flex-1 text-center sm:text-left space-y-3 pb-2">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 tracking-tight font-outfit">{profile.fullName || 'Utilisateur'}</h1>
                <div className="flex items-center justify-center sm:justify-start text-gray-500 font-medium mt-1 font-sans">
                  <Mail className="w-4 h-4 mr-2 text-blue-400" />
                  {profile.email}
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 font-sans">
                {profile.status && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                    {profile.status === 'self-employed' ? 'Indépendant' : 
                     profile.status === 'employed' ? 'Salarié' :
                     profile.status === 'student' ? 'Étudiant' :
                     profile.status === 'retired' ? 'Retraité' :
                     profile.status}
                  </span>
                )}
                {originCountry && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                    {originCountry.countryName}
                  </span>
                )}
              </div>
            </div>

            {!isEditing && (
              <button
                onClick={startEditing}
                className="group flex items-center px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg shadow-gray-200 hover:shadow-gray-300 font-medium text-sm font-outfit"
              >
                <Edit2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                Modifier
              </button>
            )}
          </div>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sm:p-10">
          {!isEditing ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
              {/* Personal Info Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <User className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 font-outfit">Personnel</h2>
                    <p className="text-sm text-gray-500 font-sans">Vos informations d'identité</p>
                  </div>
                </div>
                
                <div className="space-y-6 pl-2">
                  <InfoItem label="Nom complet" value={`${profile.firstName} ${profile.lastName}`} />
                  <InfoItem label="Âge" value={profile.age ? `${profile.age} ans` : null} />
                  <InfoItem 
                    label="Langue maternelle" 
                    value={profile.motherTongue} 
                    icon={<Globe className="w-4 h-4 text-blue-400" />} 
                  />
                  
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 font-outfit">Langues parlées</p>
                    <div className="flex flex-wrap gap-2 font-sans">
                      {profile.spokenLanguages && profile.spokenLanguages.length > 0 ? (
                        profile.spokenLanguages.map((lang, index) => (
                          <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                            {lang}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic text-sm">Aucune langue ajoutée</span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Preferences Section */}
              <section className="space-y-8">
                <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 font-outfit">Localisation</h2>
                    <p className="text-sm text-gray-500 font-sans">Préférences et origines</p>
                  </div>
                </div>

                <div className="space-y-6 pl-2">
                  <InfoItem label="Pays d'origine" value={originCountry?.countryName} />
                  <InfoItem label="Niveau de langue (pays cible)" value={profile.languageLevel} />
                  <InfoItem label="Statut actuel" value={
                    profile.status === 'self-employed' ? 'Indépendant' : 
                    profile.status === 'employed' ? 'Salarié' :
                    profile.status === 'student' ? 'Étudiant' :
                    profile.status === 'retired' ? 'Retraité' :
                    profile.status
                  } />
                </div>
              </section>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                {/* Edit Personal Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-blue-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-900 font-outfit">Informations personnelles</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      id="firstName"
                      label="Prénom"
                      value={formData.firstName || ''}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                    <InputField
                      id="lastName"
                      label="Nom"
                      value={formData.lastName || ''}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <InputField
                      id="age"
                      label="Âge"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || undefined })}
                      min="18"
                      max="120"
                    />
                    <SelectField
                      id="status"
                      label="Statut"
                      value={formData.status || ''}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="">Sélectionner</option>
                      <option value="student">Étudiant</option>
                      <option value="employee">Salarié</option>
                      <option value="self_employed">Indépendant</option>
                      <option value="unemployed">Demandeur d'emploi</option>
                      <option value="retired">Retraité</option>
                      <option value="other">Autre</option>
                    </SelectField>
                  </div>

                  <SelectField
                    id="motherTongue"
                    label="Langue maternelle"
                    value={formData.motherTongue || ''}
                    onChange={(e) => setFormData({ ...formData, motherTongue: e.target.value })}
                  >
                    <option value="">Sélectionnez votre langue maternelle</option>
                    {availableLanguages.map(lang => (
                      <option key={lang.value} value={lang.value}>{lang.label}</option>
                    ))}
                  </SelectField>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 font-outfit">
                      Autres langues parlées
                    </label>
                    <MultiPillSelect
                      options={availableLanguages}
                      values={formData.spokenLanguages || []}
                      onChange={(values) => setFormData({ ...formData, spokenLanguages: values })}
                    />
                  </div>
                </div>

                {/* Edit Preferences */}
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-8 w-1 bg-emerald-500 rounded-full"></div>
                    <h3 className="text-lg font-bold text-gray-900 font-outfit">Préférences & Sécurité</h3>
                  </div>

                  <SelectField
                    id="languageLevel"
                    label="Niveau de langue (pays cible)"
                    value={formData.languageLevel || ''}
                    onChange={(e) => setFormData({ ...formData, languageLevel: e.target.value })}
                  >
                    <option value="">Sélectionner</option>
                    <option value="A1">A1 - Débutant</option>
                    <option value="A2">A2 - Élémentaire</option>
                    <option value="B1">B1 - Intermédiaire</option>
                    <option value="B2">B2 - Intermédiaire avancé</option>
                    <option value="C1">C1 - Avancé</option>
                    <option value="C2">C2 - Maîtrise</option>
                    <option value="native">Langue maternelle</option>
                  </SelectField>

                  <SelectField
                    id="originCountry"
                    label="Pays d'origine"
                    value={formData.idOriginCountry || ''}
                    onChange={(e) => setFormData({ ...formData, idOriginCountry: parseInt(e.target.value) || undefined })}
                  >
                    <option value="">Sélectionner un pays</option>
                    {countries.map((country) => (
                      <option key={country.idCountry} value={country.idCountry}>
                        {country.countryName}
                      </option>
                    ))}
                  </SelectField>

                  <div className="pt-4 border-t border-gray-100 mt-6">
                    <InputField
                      id="password"
                      label="Nouveau mot de passe"
                      type="password"
                      value={formData.password || ''}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="Laisser vide pour conserver"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-400 mt-2 ml-1 font-sans">Minimum 6 caractères. Laissez vide si vous ne souhaitez pas le changer.</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-8 border-t border-gray-100">
                <button
                  type="button"
                  onClick={cancelEditing}
                  disabled={updateProfile.isPending}
                  className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 font-medium text-sm font-outfit"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all disabled:opacity-50 font-medium text-sm font-outfit"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateProfile.isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
                </button>
              </div>

              {updateProfile.isError && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm flex items-center animate-pulse font-sans">
                  <X className="w-4 h-4 mr-2" />
                  Erreur lors de la mise à jour du profil. Veuillez réessayer.
                </div>
              )}
            </form>
          )}
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50/30 rounded-3xl border border-red-100/50 p-8 overflow-hidden relative">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Trash2 className="w-32 h-32 text-red-600" />
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start gap-6">
              <div className="p-4 bg-white rounded-2xl shadow-sm text-red-500 border border-red-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="flex-1 max-w-2xl">
                <h2 className="text-lg font-bold text-gray-900 font-outfit">Zone de danger</h2>
                <p className="text-gray-500 mt-2 text-sm leading-relaxed font-sans">
                  La suppression de votre compte est irréversible. Toutes vos données personnelles, préférences et historiques seront définitivement effacés de nos serveurs.
                </p>
                
                <div className="mt-6">
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="px-5 py-2.5 border border-red-200 text-red-600 bg-white rounded-xl hover:bg-red-50 hover:border-red-300 transition-all font-medium text-sm shadow-sm font-outfit"
                    >
                      Supprimer mon compte
                    </button>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-5 bg-white rounded-xl border border-red-100 shadow-sm">
                      <p className="text-sm font-medium text-red-600 flex-1 font-sans">
                        Êtes-vous vraiment sûr de vouloir supprimer votre compte ?
                      </p>
                      <div className="flex items-center gap-3 w-full sm:w-auto font-outfit">
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          className="flex-1 sm:flex-none px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 text-sm font-medium transition-colors"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteAccount.isPending}
                          className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium shadow-sm transition-colors"
                        >
                          {deleteAccount.isPending ? 'Suppression...' : 'Confirmer'}
                        </button>
                      </div>
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
