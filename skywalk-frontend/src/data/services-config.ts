import { Briefcase, Home, Car, Heart, FileText, GraduationCap, Building2, Users } from 'lucide-react';

export interface ServiceGuide {
  title: string;
  steps: string[];
}

export interface ServiceConfig {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color: string;
  bgColor: string;
  hasTools?: boolean; // Indique si le service a des outils interactifs
  stats?: {
    label: string;
    value: string;
  }[];
  guides: ServiceGuide[];
  tips: string[];
  searchCategory?: string;
  faq?: {
    question: string;
    answer: string;
  }[];
}

export const servicesConfig: Record<string, ServiceConfig> = {
  emploi: {
    id: 'emploi',
    title: 'Trouver un emploi',
    subtitle: 'Opportunités professionnelles',
    description: 'Découvrez les meilleures opportunités d\'emploi adaptées à votre profil et facilitez votre intégration professionnelle dans votre nouveau pays.',
    icon: Briefcase,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    hasTools: true, // ✅ A des outils (CV, Interview)
    stats: [
      { label: 'Offres disponibles', value: '2,500+' },
      { label: 'Secteurs actifs', value: '15' },
      { label: 'Taux de placement', value: '85%' },
    ],
    guides: [
      {
        title: 'Comment préparer votre candidature',
        steps: [
          'Adaptez votre CV au format local (CV européen, américain, etc.)',
          'Rédigez une lettre de motivation personnalisée',
          'Traduisez vos diplômes et certifications',
          'Préparez votre portfolio ou LinkedIn',
          'Identifiez les entreprises qui recrutent des expatriés',
        ],
      },
      {
        title: 'Démarches administratives',
        steps: [
          'Vérifiez votre permis de travail ou visa',
          'Renseignez-vous sur la reconnaissance de vos qualifications',
          'Inscrivez-vous aux plateformes d\'emploi locales',
          'Contactez les agences de recrutement spécialisées',
        ],
      },
    ],
    tips: [
      'Commencez vos recherches 3-6 mois avant votre départ',
      'Réseautez sur LinkedIn avec des professionnels du pays',
      'Apprenez les bases de la langue locale',
      'Renseignez-vous sur la culture d\'entreprise locale',
    ],
    searchCategory: 'emploi',
    faq: [
      {
        question: 'Comment faire reconnaître mes diplômes ?',
        answer: 'Contactez l\'organisme de reconnaissance des qualifications du pays cible (ex: ENIC-NARIC en Europe). La procédure prend généralement 2-3 mois.',
      },
      {
        question: 'Ai-je besoin d\'un permis de travail ?',
        answer: 'Cela dépend de votre nationalité et du pays de destination. Les citoyens de l\'UE/EEE n\'ont généralement pas besoin de permis pour travailler dans l\'UE.',
      },
    ],
  },

  logement: {
    id: 'logement',
    title: 'Trouver un logement',
    subtitle: 'Logements et hébergements',
    description: 'Trouvez le logement idéal pour votre expatriation : appartements, maisons, colocations. Comparez les prix et les quartiers.',
    icon: Home,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    hasTools: true, // ✅ A des outils (Budget, Dossier, Garantie)
    stats: [
      { label: 'Annonces actives', value: '1,800+' },
      { label: 'Villes couvertes', value: '45' },
      { label: 'Prix moyen/mois', value: '€850' },
    ],
    guides: [
      {
        title: 'Étapes de recherche',
        steps: [
          'Définissez votre budget (loyer + charges + dépôt)',
          'Choisissez le quartier selon vos priorités (travail, écoles, transports)',
          'Comparez les types de logement (studio, T2, colocation)',
          'Vérifiez les conditions de location (durée, caution, garanties)',
          'Visitez plusieurs logements avant de décider',
        ],
      },
      {
        title: 'Documents nécessaires',
        steps: [
          'Pièce d\'identité ou passeport',
          'Justificatif de revenus (3 dernières fiches de paie)',
          'Justificatif de domicile actuel',
          'Lettre de recommandation de l\'ancien propriétaire',
          'RIB pour les prélèvements',
        ],
      },
    ],
    tips: [
      'Prévoyez 2-3 mois de loyer pour le dépôt de garantie',
      'Utilisez les sites locaux de petites annonces',
      'Méfiez-vous des arnaques : ne payez jamais avant la visite',
      'Vérifiez l\'état du logement et faites un état des lieux détaillé',
    ],
    searchCategory: 'logement',
    faq: [
      {
        question: 'Quel budget prévoir pour le logement ?',
        answer: 'Prévoyez 30-40% de vos revenus pour le loyer. Ajoutez 2-3 mois de loyer pour le dépôt initial et les frais d\'agence.',
      },
      {
        question: 'Comment louer sans historique local ?',
        answer: 'Proposez un garant, payez plusieurs mois d\'avance, ou utilisez des services comme Garantme pour rassurer les propriétaires.',
      },
    ],
  },

  transport: {
    id: 'transport',
    title: 'Se déplacer',
    subtitle: 'Transport et mobilité',
    description: 'Découvrez les solutions de transport : transports en commun, location de voiture, vélo. Obtenez les bons abonnements.',
    icon: Car,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    hasTools: true, // ✅ A des outils (Coût, Permis, Véhicule)
    stats: [
      { label: 'Réseaux de transport', value: '120+' },
      { label: 'Pass disponibles', value: '35' },
      { label: 'Économie moyenne', value: '40%' },
    ],
    guides: [
      {
        title: 'Choisir votre mode de transport',
        steps: [
          'Évaluez vos besoins quotidiens (travail, école, loisirs)',
          'Comparez les coûts : transports en commun vs voiture',
          'Renseignez-vous sur les abonnements mensuels/annuels',
          'Vérifiez les applications mobiles de transport local',
          'Explorez les options écologiques (vélo, trottinette)',
        ],
      },
      {
        title: 'Permis de conduire',
        steps: [
          'Vérifiez si votre permis est valide dans le pays',
          'Faites échanger votre permis si nécessaire',
          'Souscrivez une assurance auto adaptée',
          'Apprenez le code de la route local',
        ],
      },
    ],
    tips: [
      'Les pass étudiants/seniors offrent souvent des réductions',
      'Certaines villes offrent le vélo en libre-service gratuitement',
      'Téléchargez l\'application de transport locale dès votre arrivée',
      'Comparez les tarifs des taxis vs VTC (Uber, Bolt)',
    ],
    searchCategory: 'transport',
  },

  sante: {
    id: 'sante',
    title: 'Santé et bien-être',
    subtitle: 'Services de santé',
    description: 'Accédez aux services de santé : médecins, hôpitaux, assurances. Trouvez des professionnels parlant votre langue.',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    hasTools: true, // ✅ A des outils (Couverture, Dossier médical, Budget)
    stats: [
      { label: 'Professionnels référencés', value: '5,000+' },
      { label: 'Langues disponibles', value: '25' },
      { label: 'Assurances partenaires', value: '18' },
    ],
    guides: [
      {
        title: 'Couverture santé',
        steps: [
          'Vérifiez votre couverture actuelle à l\'étranger',
          'Souscrivez une assurance internationale si nécessaire',
          'Inscrivez-vous au système de santé local',
          'Obtenez votre carte vitale ou équivalent',
          'Trouvez un médecin généraliste de référence',
        ],
      },
      {
        title: 'Documents médicaux',
        steps: [
          'Traduisez votre dossier médical',
          'Obtenez des copies de vos ordonnances',
          'Faites un bilan de santé avant le départ',
          'Vérifiez les vaccins obligatoires',
        ],
      },
    ],
    tips: [
      'Gardez vos ordonnances en version originale et traduite',
      'Repérez l\'hôpital le plus proche de votre domicile',
      'Enregistrez les numéros d\'urgence locaux',
      'Vérifiez la prise en charge des soins à l\'étranger',
    ],
    searchCategory: 'sante',
  },

  demarches: {
    id: 'demarches',
    title: 'Démarches administratives',
    subtitle: 'Papiers et formalités',
    description: 'Simplifiez vos démarches : visa, permis de séjour, carte vitale, impôts. Suivez vos procédures étape par étape.',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: [
      { label: 'Procédures guidées', value: '50+' },
      { label: 'Taux de succès', value: '92%' },
      { label: 'Délai moyen', value: '6 semaines' },
    ],
    guides: [
      {
        title: 'Démarches prioritaires',
        steps: [
          'Demandez votre visa/permis de séjour',
          'Enregistrez-vous auprès des autorités locales',
          'Ouvrez un compte bancaire local',
          'Obtenez un numéro de sécurité sociale',
          'Faites traduire vos documents officiels',
        ],
      },
      {
        title: 'Organisation',
        steps: [
          'Créez un dossier avec toutes vos copies',
          'Scannez tous vos documents importants',
          'Notez les dates limites de chaque procédure',
          'Gardez les justificatifs de dépôt',
        ],
      },
    ],
    tips: [
      'Commencez les démarches 3 mois avant le départ',
      'Faites certifier vos traductions par un traducteur assermenté',
      'Gardez toujours des photocopies de vos documents',
      'Inscrivez-vous au registre des Français de l\'étranger si applicable',
    ],
    searchCategory: 'demarches',
  },

  education: {
    id: 'education',
    title: 'Éducation et formation',
    subtitle: 'Écoles et formations',
    description: 'Trouvez des écoles, universités et formations pour vous et vos enfants. Cours de langue et programmes d\'intégration.',
    icon: GraduationCap,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-50',
    stats: [
      { label: 'Établissements', value: '800+' },
      { label: 'Formations', value: '3,200+' },
      { label: 'Cours de langue', value: '450+' },
    ],
    guides: [
      {
        title: 'Scolarisation des enfants',
        steps: [
          'Recherchez les écoles dans votre quartier',
          'Vérifiez le système éducatif local (âge, niveaux)',
          'Renseignez-vous sur les écoles internationales',
          'Inscrivez vos enfants le plus tôt possible',
          'Préparez les documents nécessaires (bulletins, vaccins)',
        ],
      },
      {
        title: 'Formation continue',
        steps: [
          'Identifiez vos besoins de formation',
          'Recherchez les cours de langue disponibles',
          'Vérifiez les reconnaissances de diplômes',
          'Explorez les formations professionnelles',
        ],
      },
    ],
    tips: [
      'Les écoles internationales sont chères mais facilitent la transition',
      'Les cours de langue gratuits existent souvent pour les nouveaux arrivants',
      'Certaines universités offrent des bourses pour étudiants internationaux',
    ],
    searchCategory: 'education',
  },

  culture: {
    id: 'culture',
    title: 'Culture et loisirs',
    subtitle: 'Découverte et intégration',
    description: 'Découvrez la culture locale, les événements, les communautés d\'expatriés. Facilitez votre intégration sociale.',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    stats: [
      { label: 'Événements/mois', value: '200+' },
      { label: 'Communautés', value: '85' },
      { label: 'Activités', value: '1,500+' },
    ],
    guides: [
      {
        title: 'Intégration sociale',
        steps: [
          'Rejoignez des groupes d\'expatriés sur les réseaux sociaux',
          'Participez aux événements de networking',
          'Apprenez les bases de la langue locale',
          'Découvrez les coutumes et traditions',
          'Explorez les quartiers et lieux emblématiques',
        ],
      },
    ],
    tips: [
      'Meetup et Internations sont d\'excellentes plateformes pour rencontrer des gens',
      'Participez aux fêtes locales pour mieux comprendre la culture',
      'Rejoignez des clubs ou associations selon vos centres d\'intérêt',
    ],
    searchCategory: 'culture',
  },

  business: {
    id: 'business',
    title: 'Créer son entreprise',
    subtitle: 'Entrepreneuriat à l\'étranger',
    description: 'Lancez votre activité à l\'étranger : création d\'entreprise, freelance, statuts juridiques. Accompagnement personnalisé.',
    icon: Building2,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    stats: [
      { label: 'Créations/an', value: '1,200+' },
      { label: 'Taux de réussite', value: '78%' },
      { label: 'Délai moyen', value: '3 mois' },
    ],
    guides: [
      {
        title: 'Étapes de création',
        steps: [
          'Étudiez le marché local et la concurrence',
          'Choisissez votre statut juridique',
          'Rédigez votre business plan',
          'Obtenez les autorisations nécessaires',
          'Ouvrez un compte professionnel',
          'Inscrivez-vous aux organismes sociaux et fiscaux',
        ],
      },
      {
        title: 'Freelance à l\'étranger',
        steps: [
          'Vérifiez les règles du travail indépendant',
          'Déclarez votre activité',
          'Souscrivez une assurance professionnelle',
          'Gérez votre facturation et comptabilité',
        ],
      },
    ],
    tips: [
      'Faites-vous accompagner par un expert-comptable local',
      'Renseignez-vous sur les aides à la création d\'entreprise',
      'Rejoignez des incubateurs ou espaces de coworking',
    ],
    searchCategory: 'business',
  },
};

export const getServiceBySlug = (slug: string): ServiceConfig | undefined => {
  return servicesConfig[slug];
};

export const getAllServices = (): ServiceConfig[] => {
  return Object.values(servicesConfig);
};

export const getServicesWithTools = (): ServiceConfig[] => {
  return Object.values(servicesConfig).filter(service => service.hasTools === true);
};
