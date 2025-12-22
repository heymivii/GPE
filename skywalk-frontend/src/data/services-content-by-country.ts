
export interface CountrySpecificContent {
  emploi?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    sites?: string[];
  };
  logement?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    sites?: string[];
  };
  transport?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
  };
  sante?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
  };
  demarches?: {
    stats?: Array<{ label: string; value: string }>;
    specificGuides?: Array<{
      title: string;
      steps: string[];
    }>;
    tips?: string[];
    documents?: string[];
  };
}

export const countryContent: Record<string, CountrySpecificContent> = {
  canada: {
    emploi: {
      stats: [
        { label: 'Offres au Canada', value: '1,200+' },
        { label: 'Salaire moyen', value: '75,000 CAD' },
        { label: 'Délai d\'embauche', value: '4-6 semaines' },
      ],
      specificGuides: [
        {
          title: 'Permis de travail au Canada',
          steps: [
            'Vérifiez votre éligibilité (Programme Entrée Express, PVT, permis fermé)',
            'Obtenez une offre d\'emploi d\'un employeur canadien',
            'L\'employeur doit obtenir une EIMT (Étude d\'Impact sur le Marché du Travail)',
            'Déposez votre demande de permis de travail en ligne',
            'Attendez 2-4 mois pour le traitement',
          ],
        },
        {
          title: 'Sites d\'emploi recommandés',
          steps: [
            'Indeed.ca - Le plus populaire au Canada',
            'Workopolis.com - Spécialisé Canada',
            'LinkedIn - Réseautage professionnel',
            'Job Bank (Guichet-Emplois) - Site officiel du gouvernement',
            'Monster.ca - Offres variées',
          ],
        },
      ],
      tips: [
        'Le CV canadien ne doit PAS contenir de photo, âge, ou statut marital',
        'Préparez-vous aux "behavioural interviews" (questions comportementales)',
        'Les références professionnelles sont très importantes au Canada',
        'Mentionnez si vous avez le droit de travailler (permis ouvert/fermé)',
      ],
      sites: ['Indeed.ca', 'Workopolis.com', 'LinkedIn', 'Job Bank', 'Monster.ca'],
    },
    logement: {
      stats: [
        { label: 'Loyer moyen Toronto', value: '2,200 CAD' },
        { label: 'Loyer moyen Montréal', value: '1,600 CAD' },
        { label: 'Dépôt requis', value: '1er + dernier mois' },
      ],
      specificGuides: [
        {
          title: 'Recherche de logement au Canada',
          steps: [
            'Utilisez Kijiji.ca, Craigslist, PadMapper, Rentals.ca',
            'Préparez : preuve de revenus, références, lettre d\'emploi',
            'Dépôt = 1 mois de loyer maximum (loi provinciale)',
            'Signez un bail (lease) de 12 mois généralement',
            'Inspection pré-emménagement obligatoire',
          ],
        },
      ],
      tips: [
        'À Toronto/Vancouver, la demande est forte : soyez réactif',
        'Les animaux de compagnie sont souvent refusés',
        'Vérifiez si le chauffage/électricité est inclus',
        'Les colocations sont courantes pour économiser',
      ],
      sites: ['Kijiji.ca', 'Craigslist', 'PadMapper', 'Rentals.ca', 'Zumper'],
    },
    transport: {
      specificGuides: [
        {
          title: 'Permis de conduire au Canada',
          steps: [
            'Échangez votre permis français contre un permis canadien (selon province)',
            'Au Québec : équivalence automatique pour permis français',
            'En Ontario : test théorique + pratique requis',
            'Souscrivez une assurance auto (obligatoire et coûteuse)',
          ],
        },
      ],
      tips: [
        'Les transports en commun sont moins développés qu\'en Europe',
        'La voiture est souvent nécessaire hors grandes villes',
        'Pass mensuel TTC (Toronto) : ~150 CAD, STM (Montréal) : ~95 CAD',
      ],
    },
    sante: {
      specificGuides: [
        {
          title: 'Assurance santé au Canada',
          steps: [
            'Inscrivez-vous à l\'assurance maladie provinciale (RAMQ au Québec, OHIP en Ontario)',
            'Délai de carence : 3 mois sans couverture publique',
            'Souscrivez une assurance privée pour les 3 premiers mois',
            'Trouvez un médecin de famille (liste d\'attente possible)',
          ],
        },
      ],
      tips: [
        'Les soins dentaires et optiques ne sont PAS couverts par la RAMQ/OHIP',
        'Les médicaments nécessitent une assurance privée ou régime employeur',
        'Les urgences sont gratuites mais l\'attente peut être longue',
      ],
    },
    demarches: {
      specificGuides: [
        {
          title: 'Démarches essentielles à l\'arrivée',
          steps: [
            'Obtenez votre NAS (Numéro d\'Assurance Sociale) - gratuit à Service Canada',
            'Ouvrez un compte bancaire (RBC, TD, Scotiabank)',
            'Demandez votre carte RAMQ/OHIP après 3 mois de résidence',
            'Inscrivez-vous aux impôts (déclaration annuelle obligatoire)',
          ],
        },
      ],
      tips: [
        'Le NAS est indispensable pour travailler',
        'Conservez tous vos justificatifs de résidence (bail, factures)',
        'Déclarez vos revenus mondiaux si résident fiscal canadien',
      ],
      documents: ['Passeport', 'Permis de travail/résidence', 'Preuve de résidence', 'Relevés bancaires'],
    },
  },

  france: {
    emploi: {
      stats: [
        { label: 'Offres en France', value: '1,800+' },
        { label: 'Salaire moyen', value: '38,000 EUR' },
        { label: 'Taux de chômage', value: '7.3%' },
      ],
      specificGuides: [
        {
          title: 'Travailler en France (UE vs Hors UE)',
          steps: [
            'Citoyens UE/EEE : pas de permis de travail nécessaire',
            'Hors UE : visa de travail requis (sponsorisé par l\'employeur)',
            'Inscription à Pôle Emploi possible pour aide à la recherche',
            'Cotisations sociales élevées (sécu, retraite) mais bonne protection',
          ],
        },
      ],
      tips: [
        'Le CV français fait généralement 1 page, avec photo',
        'La lettre de motivation est très importante',
        'Les entretiens sont formels, vouvoiement de rigueur',
      ],
      sites: ['Pôle Emploi', 'APEC', 'Indeed.fr', 'LinkedIn', 'Welcome to the Jungle'],
    },
    logement: {
      stats: [
        { label: 'Loyer moyen Paris', value: '1,200 EUR' },
        { label: 'Loyer moyen Lyon', value: '800 EUR' },
        { label: 'Dépôt de garantie', value: '1 mois' },
      ],
      specificGuides: [
        {
          title: 'Location en France',
          steps: [
            'Sites : SeLoger, Leboncoin, PAP (Particulier à Particulier)',
            'Dossier complet requis : 3 dernières fiches de paie, avis d\'imposition, pièce d\'identité',
            'Garant souvent exigé (Garantme, Visale pour jeunes/précaires)',
            'État des lieux détaillé à l\'entrée et sortie',
          ],
        },
      ],
      tips: [
        'La concurrence est forte dans les grandes villes',
        'APL (Aide Personnalisée au Logement) disponible sous conditions',
        'Assurance habitation obligatoire',
      ],
      sites: ['SeLoger', 'Leboncoin', 'PAP', 'Logic-Immo', 'Bien\'ici'],
    },
    transport: {
      specificGuides: [
        {
          title: 'Permis de conduire en France',
          steps: [
            'Permis UE : valide en France sans démarche',
            'Permis hors UE : échange possible selon accords bilatéraux',
            'Sinon : passage du permis français obligatoire (code + conduite)',
          ],
        },
      ],
      tips: [
        'Pass Navigo (Paris) : 75€/mois toutes zones',
        'TGV pour trajets longue distance (réserver à l\'avance)',
        'Vélib\' et autopartage (Autolib\') disponibles',
      ],
    },
    sante: {
      specificGuides: [
        {
          title: 'Sécurité sociale française',
          steps: [
            'Inscription automatique dès premier emploi',
            'Carte Vitale envoyée sous 3-6 semaines',
            'Remboursement : 70% consultations, 80% hospitalisations',
            'Mutuelle complémentaire recommandée (souvent via employeur)',
          ],
        },
      ],
      tips: [
        'Médecin traitant obligatoire pour meilleur remboursement',
        'Urgences : 15 (SAMU), hôpitaux publics gratuits avec Carte Vitale',
        'Pharmacies ouvertes 24h/24 dans grandes villes',
      ],
    },
    demarches: {
      specificGuides: [
        {
          title: 'Installation en France',
          steps: [
            'Titre de séjour si hors UE (préfecture)',
            'Ouverture compte bancaire (RIB indispensable)',
            'Déclaration d\'impôts annuelle (prélèvement à la source)',
            'Inscription consulaire si expatrié',
          ],
        },
      ],
      documents: ['Passeport/CNI', 'Justificatif de domicile', 'Acte de naissance', 'Visa (si hors UE)'],
    },
  },

  allemagne: {
    emploi: {
      stats: [
        { label: 'Offres en Allemagne', value: '2,100+' },
        { label: 'Salaire moyen', value: '52,000 EUR' },
        { label: 'Taux de chômage', value: '5.1%' },
      ],
      specificGuides: [
        {
          title: 'Travailler en Allemagne',
          steps: [
            'Citoyens UE : libre circulation, pas de permis',
            'Hors UE : Carte Bleue Européenne (diplôme + 56k€/an)',
            'Reconnaissance des diplômes via Anabin',
            'Allemand niveau B2 souvent requis (sauf IT)',
          ],
        },
      ],
      tips: [
        'Le CV allemand (Lebenslauf) est chronologique inverse',
        'Pas de photo obligatoire (mais courante)',
        'Ponctualité absolue aux entretiens',
      ],
      sites: ['StepStone.de', 'Indeed.de', 'Xing', 'LinkedIn', 'Bundesagentur für Arbeit'],
    },
    logement: {
      stats: [
        { label: 'Loyer moyen Berlin', value: '1,200 EUR' },
        { label: 'Loyer moyen Munich', value: '1,600 EUR' },
        { label: 'Caution (Kaution)', value: '3 mois max' },
      ],
      specificGuides: [
        {
          title: 'Se loger en Allemagne',
          steps: [
            'Sites : ImmobilienScout24, WG-Gesucht (colocations)',
            'Schufa (équivalent crédit score) souvent demandé',
            'Wohnungsgeberbestätigung (attestation du propriétaire) pour Anmeldung',
            'Loyers "kalt" (sans charges) ou "warm" (avec charges)',
          ],
        },
      ],
      tips: [
        'Marché tendu à Berlin/Munich : visitez rapidement',
        'Les appartements non meublés n\'ont parfois PAS de cuisine',
        'Inscription (Anmeldung) obligatoire sous 14 jours',
      ],
      sites: ['ImmobilienScout24', 'WG-Gesucht', 'Immowelt', 'eBay Kleinanzeigen'],
    },
    transport: {
      specificGuides: [
        {
          title: 'Permis et transports en Allemagne',
          steps: [
            'Permis UE valide 6 mois, puis échange gratuit',
            'Permis hors UE : échange selon accords ou passage examen',
            'Transports en commun excellents (U-Bahn, S-Bahn, Tram)',
          ],
        },
      ],
      tips: [
        'Pass mensuel Berlin (AB) : ~49€ (Deutschlandticket)',
        'Vélo très populaire, pistes cyclables nombreuses',
        'Trains Deutsche Bahn pour trajets nationaux',
      ],
    },
    sante: {
      specificGuides: [
        {
          title: 'Assurance santé allemande',
          steps: [
            'Assurance santé OBLIGATOIRE (gesetzlich ou privat)',
            'Gesetzliche (publique) : ~15% du salaire, plafonné',
            'Private (privée) : pour hauts revenus (>66k€/an)',
            'Inscription dès arrivée, carte envoyée rapidement',
          ],
        },
      ],
      tips: [
        'Assurances recommandées : TK, AOK, Barmer',
        'Médecins parlant anglais/français dans grandes villes',
        'Urgences : 112, hôpitaux bien équipés',
      ],
    },
    demarches: {
      specificGuides: [
        {
          title: 'Démarches administratives',
          steps: [
            'Anmeldung (enregistrement) au Bürgeramt sous 14 jours - CRUCIAL',
            'Steuernummer (numéro fiscal) automatiquement attribué',
            'Ouverture compte bancaire (N26, Deutsche Bank, Commerzbank)',
            'Assurance santé obligatoire avant Anmeldung',
          ],
        },
      ],
      tips: [
        'Prenez RDV Bürgeramt à l\'avance (souvent plusieurs semaines d\'attente)',
        'Conservez votre Meldebescheinigung (certificat d\'enregistrement)',
        'Bureaucratie allemande = papiers, papiers, papiers !',
      ],
      documents: ['Passeport', 'Wohnungsgeberbestätigung', 'Contrat de travail', 'Assurance santé'],
    },
  },

  espagne: {
    emploi: {
      sites: ['InfoJobs.net', 'Indeed.es', 'LinkedIn', 'Tecnoempleo'],
      tips: [
        'Marché du travail compétitif, salaires plus bas qu\'Europe du Nord',
        'Maîtrise de l\'espagnol souvent indispensable',
        'Contrats temporaires très courants',
      ],
    },
    logement: {
      stats: [
        { label: 'Loyer moyen Madrid', value: '1,000 EUR' },
        { label: 'Loyer moyen Barcelone', value: '1,100 EUR' },
      ],
      sites: ['Idealista', 'Fotocasa', 'Pisos.com'],
    },
  },

  'royaume-uni': {
    emploi: {
      specificGuides: [
        {
          title: 'Travailler au Royaume-Uni post-Brexit',
          steps: [
            'Visa de travail requis (Skilled Worker visa)',
            'Employeur doit être sponsor licencié',
            'Salaire minimum : £26,200/an (ou £10.75/heure)',
            'Niveau d\'anglais B1 requis',
          ],
        },
      ],
      sites: ['Indeed.co.uk', 'Reed.co.uk', 'Totaljobs', 'CV-Library'],
    },
    logement: {
      stats: [
        { label: 'Loyer moyen Londres', value: '1,800 GBP' },
        { label: 'Dépôt', value: '5 semaines max' },
      ],
      sites: ['Rightmove', 'Zoopla', 'SpareRoom', 'OpenRent'],
    },
  },
};

export const getCountryContent = (
  countrySlug: string,
  category: string
): CountrySpecificContent[keyof CountrySpecificContent] | undefined => {
  const country = countryContent[countrySlug.toLowerCase()];
  if (!country) return undefined;
  return country[category as keyof CountrySpecificContent];
};
