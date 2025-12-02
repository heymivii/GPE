/**
 * DONNÉES COMPLÈTES LOGEMENT - SUISSE
 * 
 * Sources officielles utilisées:
 * - Homegate, ImmoScout24 pour les prix moyens
 * - OFS (Office Fédéral de la Statistique) pour les statistiques
 * - Comparis pour les comparaisons de prix
 * - Dernière mise à jour: 2 décembre 2025
 */

export const switzerlandLogementData = {
  country: "Switzerland",
  code: "CH",
  currency: "CHF",
  
  housing: {
    averageRent: {
      national: {
        studio: 1400,
        oneBedroom: 1800,
        twoBedroom: 2500,
        threeBedroom: 3200,
        currency: "CHF",
        note: "Prix moyens nationaux, très variable selon canton et proximité centres urbains",
        source: "OFS (Office Fédéral de la Statistique) + Homegate 2025"
      },
      byCity: {
        Zurich: {
          studio: 1700,
          t2: 2500,
          t3: 3500,
          note: "Prix moyens Zurich ville, canton le plus cher de Suisse",
          source: "https://www.homegate.ch + ImmoScout24"
        },
        Geneva: {
          studio: 1800,
          t2: 2600,
          t3: 3800,
          note: "Prix moyens Genève ville, 2ème canton le plus cher",
          source: "https://www.homegate.ch"
        },
        Lausanne: {
          studio: 1600,
          t2: 2300,
          t3: 3100,
          note: "Prix moyens Lausanne centre, canton de Vaud",
          source: "https://www.homegate.ch"
        },
        Basel: {
          studio: 1500,
          t2: 2200,
          t3: 3000,
          note: "Prix moyens Bâle ville",
          source: "https://www.homegate.ch"
        },
        Bern: {
          studio: 1400,
          t2: 2100,
          t3: 2800,
          note: "Prix moyens Berne capitale",
          source: "https://www.homegate.ch"
        },
        Lucerne: {
          studio: 1300,
          t2: 1900,
          t3: 2600,
          note: "Prix moyens Lucerne centre",
          source: "https://www.homegate.ch"
        }
      }
    },
    
    deposit: {
      amount: {
        typical: "3 mois de loyer (standard)",
        range: "1 à 3 mois selon propriétaire et canton",
        note: "Le dépôt de garantie est généralement de 3 mois en Suisse",
        source: "Droit du bail suisse (Code des obligations art. 257e)"
      },
      heldIn: {
        method: "Compte bancaire bloqué (Mietkautionskonto / compte de garantie locative)",
        description: "Le dépôt DOIT être placé sur un compte bancaire séparé bloqué au nom du locataire",
        interest: "Les intérêts reviennent au locataire",
        note: "Compte Kaution : le locataire ouvre le compte, les fonds sont bloqués pour le propriétaire",
        source: "Code des obligations art. 257e"
      },
      alternatives: [
        {
          name: "Garantie bancaire (Mietkautionsversicherung)",
          description: "Assurance qui garantit le dépôt sans bloquer les 3 mois de loyer",
          cost: "~50-100 CHF/an",
          provider: "SwissCaution, Mietergarant, etc."
        }
      ],
      prohibitedCharges: [
        "Frais d'agence pour le locataire (propriétaire paie l'agence)",
        "Frais de dossier excessifs",
        "Frais de visite"
      ]
    },
    
    requiredDocuments: [
      {
        document: "Passeport ou carte d'identité",
        obligatoire: true,
        note: "Pièce d'identité en cours de validité"
      },
      {
        document: "Permis de séjour (B, L, C, G)",
        obligatoire: true,
        note: "Permis B (résidents), L (courte durée <1 an), C (établissement), G (frontaliers)"
      },
      {
        document: "Extrait du registre des poursuites (Betreibungsregisterauszug / Poursuites)",
        obligatoire: true,
        note: "Document OBLIGATOIRE en Suisse prouvant l'absence de dettes. À demander à la commune de résidence actuelle",
        validity: "Valable 3 mois",
        source: "Disponible auprès de l'Office des poursuites de votre commune"
      },
      {
        document: "Contrat de travail ou attestation de salaire",
        obligatoire: true,
        note: "Justificatif de revenus (3 dernières fiches de paie ou contrat)"
      },
      {
        document: "Attestation d'assurance responsabilité civile (Haftpflichtversicherung)",
        obligatoire: true,
        note: "Assurance RC OBLIGATOIRE pour louer en Suisse (~150-200 CHF/an)",
        source: "Exigence standard des propriétaires suisses"
      },
      {
        document: "Références de précédents bailleurs",
        obligatoire: false,
        note: "Attestations des anciens propriétaires (fortement recommandé)"
      },
      {
        document: "Formulaire de candidature (Bewerbungsformular)",
        obligatoire: true,
        note: "Formulaire standard fourni par l'agence ou le propriétaire à remplir"
      }
    ],
    
    leaseRules: {
      leaseDuration: {
        standard: "Durée indéterminée (contrat à durée indéterminée)",
        note: "La plupart des contrats suisses sont à durée indéterminée et renouvelables tacitement",
        fixedTerm: "Contrats à durée déterminée possibles mais moins courants",
        source: "Code des obligations art. 266 à 273c"
      },
      noticePeriod: {
        tenant: {
          duration: "3 mois généralement (variable selon canton et contrat)",
          deadlines: "Résiliation uniquement aux dates légales : fin de mois ou fin de trimestre selon canton",
          note: "À Zurich : résiliation possible au 31 mars, 30 juin, 30 septembre, 31 décembre",
          registered: "Lettre recommandée OBLIGATOIRE (lettre signature ou recommandée A+)",
          source: "Code des obligations art. 266a et 266b"
        },
        landlord: {
          duration: "6 mois minimum (en principe)",
          process: "Formulaire officiel cantonal OBLIGATOIRE + motif valable",
          contestation: "Le locataire peut contester la résiliation devant la Commission de conciliation dans les 30 jours",
          source: "Code des obligations art. 271 et suivants"
        }
      },
      rentIncrease: {
        basis: "Basé sur le taux hypothécaire de référence + inflation (IPC)",
        frequency: "Augmentation possible si le taux hypothécaire augmente",
        process: "Formulaire officiel cantonal + préavis 10 jours avant début du bail",
        contestation: "Le locataire peut contester dans les 30 jours auprès de la Commission de conciliation",
        note: "Le taux hypothécaire de référence est publié par le Secrétariat d'État à l'économie (SECO)",
        source: "Code des obligations art. 269a à 269d + ordonnance sur le bail"
      },
      leaseAgreement: {
        language: "Allemand, français ou italien selon canton",
        officialForm: "Utilisation du formulaire officiel cantonal recommandée",
        registration: "Pas d'enregistrement obligatoire (sauf exceptions cantonales)",
        source: "Code des obligations art. 253 et suivants"
      },
      conciliation: {
        name: "Commission de conciliation en matière de baux (Schlichtungsbehörde)",
        role: "Médiation obligatoire AVANT tout procès locatif",
        cost: "Gratuit ou très faible coût (selon canton)",
        note: "Passage obligé pour tout litige locatif en Suisse",
        source: "Code des obligations art. 274 à 274g"
      }
    },
    
    utilities: {
      averageMonthly: {
        heating: {
          studio: 100,
          t2: 150,
          t3: 200,
          note: "Chauffage (souvent inclus dans les charges / Nebenkosten)",
          source: "Estimation moyenne Suisse"
        },
        charges: {
          studio: 150,
          t2: 200,
          t3: 250,
          note: "Charges (Nebenkosten) : eau, chauffage, entretien, ordures. Souvent incluses dans le loyer",
          source: "Estimation moyenne selon OFS"
        },
        electricity: {
          studio: 50,
          t2: 80,
          t3: 110,
          note: "Électricité (généralement NON incluse dans les charges)",
          source: "ElCom - Commission fédérale de l'électricité"
        },
        internet: {
          standard: 50,
          fiber: 70,
          note: "Abonnement internet standard ou fiber (Swisscom, Sunrise, Salt)",
          source: "Comparaison fournisseurs 2025"
        },
        radioTV: {
          amount: 335,
          frequency: "par an",
          note: "Redevance radio-TV (Serafe) OBLIGATOIRE pour tous les ménages",
          monthly: 28,
          source: "https://www.serafe.ch"
        }
      },
      totalEstimate: {
        studio: 228,
        t2: 308,
        t3: 388,
        note: "Total charges mensuelles moyennes (charges locatives 150 + électricité 50 + Serafe 28 = studio)",
        withoutCharges: "Si charges incluses dans le loyer : compter seulement électricité + internet + Serafe",
        currency: "CHF"
      }
    },
    
    tenantInsurance: {
      mandatory: true,
      type: "Responsabilité civile (Haftpflichtversicherung / RC)",
      averageCost: 150,
      currency: "CHF",
      frequency: "par an",
      coverage: "Dommages causés à autrui (dégâts des eaux, incendie, etc.)",
      note: "L'assurance RC est EXIGÉE par les propriétaires suisses. Sans elle, impossible de louer",
      householdContents: {
        name: "Assurance ménage (Hausratversicherung)",
        mandatory: false,
        recommended: true,
        cost: "~200-300 CHF/an",
        coverage: "Biens personnels (vol, incendie, dégâts d'eau)"
      },
      source: "Standard du marché locatif suisse"
    },
    
    housingBenefits: {
      limitedSupport: {
        note: "La Suisse n'a PAS de système national d'aide au logement comme en France ou au UK",
        cantonalAid: "Aides cantonales très limitées et conditionnées (AVS/AI, aide sociale)",
        eligibility: "Réservées aux personnes en difficulté extrême ou bénéficiaires de l'aide sociale"
      },
      socialHousing: {
        name: "Logements subventionnés (gemeinnützige Wohnungen)",
        availability: "Très limité, listes d'attente longues (plusieurs années)",
        eligibility: "Plafonds de revenus stricts, priorité aux résidents de longue durée",
        note: "Zurich et Genève ont plus de logements sociaux que les autres cantons"
      },
      adviceServices: {
        name: "ASLOCA / Mieterverband (Association de locataires)",
        services: "Conseils juridiques, vérification de contrats, défense des locataires",
        cost: "Cotisation annuelle (~80-150 CHF/an)",
        url: "https://www.asloca.ch (Romandie) / https://www.mieterverband.ch (Suisse alémanique)",
        note: "Fortement recommandé pour les nouveaux arrivants"
      }
    },
    
    platforms: [
      {
        name: "Homegate",
        url: "https://www.homegate.ch",
        type: "Market leader",
        note: "Plus grand site immobilier suisse, 90% des annonces"
      },
      {
        name: "ImmoScout24",
        url: "https://www.immoscout24.ch",
        type: "Comprehensive",
        note: "2ème plus grand site, interface multilingue (DE/FR/IT/EN)"
      },
      {
        name: "Flatfox",
        url: "https://flatfox.ch",
        type: "Modern platform",
        note: "Plateforme moderne avec visites virtuelles, candidature en ligne"
      },
      {
        name: "Anibis",
        url: "https://www.anibis.ch",
        type: "Classifieds",
        note: "Petites annonces, parfois plus abordable"
      },
      {
        name: "Comparis",
        url: "https://en.comparis.ch/immobilien/default",
        type: "Comparison + listings",
        note: "Comparateur + annonces, outils de calcul de budget"
      },
      {
        name: "WG-Zimmer.ch",
        url: "https://www.wgzimmer.ch",
        type: "Flatshares",
        note: "Spécialisé en colocations (WG = Wohngemeinschaft)"
      }
    ],
    
    importantNotes: {
      betreibungsregister: "Extrait du registre des poursuites (Betreibungsregisterauszug) OBLIGATOIRE : document prouvant l'absence de dettes, à demander à votre commune de résidence. Valable 3 mois. IMPOSSIBLE de louer sans ce document",
      haftpflicht: "Assurance responsabilité civile (Haftpflichtversicherung) OBLIGATOIRE pour louer. Coût : ~150-200 CHF/an. Les propriétaires la demandent systématiquement",
      deposit: "Dépôt de garantie 3 mois standard : à placer sur un compte bancaire bloqué (Mietkautionskonto) ou garantie bancaire SwissCaution (~50-100 CHF/an)",
      highCosts: "Loyers parmi les plus élevés au monde : Zurich (1700 CHF studio), Genève (1800 CHF), Lausanne (1600 CHF). Prévoir 30-40% du salaire net pour le loyer",
      competitiveMarket: "Marché TRÈS compétitif dans les grandes villes : dossier parfait indispensable, réactivité cruciale (visites le jour même), décisions rapides",
      workPermit: "Permis de séjour/travail OBLIGATOIRE (B, L, C ou G). Sans permis, impossible de louer légalement",
      language: "Contrats en allemand (Zurich, Bern, Basel), français (Genève, Lausanne, Fribourg) ou italien (Tessin) selon canton",
      formalities: "Résiliation par lettre recommandée UNIQUEMENT aux dates légales (fin de mois/trimestre selon canton). Oubli = 3 mois supplémentaires",
      conciliation: "Commission de conciliation en matière de baux (Schlichtungsbehörde) : passage OBLIGATOIRE pour tout litige avant tribunal. Gratuit ou faible coût",
      rentalMarket: "Pas de règle des 3× le loyer comme en France, mais revenus doivent couvrir confortablement le loyer + charges + assurances obligatoires"
    }
  }
};

export default switzerlandLogementData;
