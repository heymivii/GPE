/**
 * DONNÉES COMPLÈTES POUR LA FRANCE
 * 
 * Sources officielles utilisées:
 * - Transport: carbu.com, RATP, goodassur.com, largus.fr
 * - Santé: ameli.fr, service-public.fr, drees.solidarites-sante.gouv.fr
 * - Dernière mise à jour: 2 décembre 2025
 */

export const franceData = {
  transport: {
    fuelPricePerLiter: 1.72,
    fuelPriceSource: "https://carbu.com/france/prixmoyens",
    publicTransportMonthlyPass: 88.4,
    publicTransportPassNote: "Forfait Navigo mois toutes zones en Île-de-France (référence grande métropole).",
    publicTransportSource: "https://www.bonjour-ratp.fr/actualites/articles/tarifs-forfaits-navigo-2025/",
    averageInsuranceCostMonthly: 53.1,
    insuranceCostNote: "Prix moyen d'une assurance auto en 2025, toutes formules confondues.",
    insuranceCostSource: "https://goodassur.com/assurance-auto/tarif",
    averageMaintenanceCostMonthly: 44,
    maintenanceCostNote: "Entretien moyen mensuel selon étude sur le budget auto (entretien seul).",
    maintenanceCostSource: "https://www.largus.fr/actualite-automobile/achat-carburant-entretien-combien-une-voiture-coute-t-elle-chaque-mois-30043992.html",
    averageTollsAndParkingMonthly: 100,
    tollsParkingNote: "Base indicative: environ 16 €/mois de péages (source L'Argus) + ordre de grandeur 80 €/mois de stationnement en grande ville.",
    tollsSource: "https://www.largus.fr/actualite-automobile/achat-carburant-entretien-combien-une-voiture-coute-t-elle-chaque-mois-30043992.html",
    defaultCarConsumptionLPer100km: 6.5,
    licenseExchange: {
      euEeaLicense: {
        exchangeRequired: false,
        notes: "Un permis UE/EEE est valable sans limite en France, l'échange n'est obligatoire que dans certains cas particuliers (infractions, perte, etc.).",
        officialLink: "https://www.service-public.fr/particuliers/vosdroits/F1758"
      },
      nonEuLicense: {
        exchangeRequiredAfterMonths: 12,
        internationalPermitRecommended: true,
        requiresDrivingTestInSomeCases: true,
        notes: "Un permis non européen est valable 1 an à partir de l'installation en France. Passé ce délai, un échange est nécessaire si le pays est éligible, sinon il faut repasser le permis.",
        officialLink: "https://www.service-public.fr/particuliers/vosdroits/F1460"
      },
      generalHelpLink: "https://permisdeconduire.ants.gouv.fr/aide-et-contact/permis-de-conduire-etranger"
    },
    vehicleChecklist: {
      registrationDocuments: [
        "Justificatif d'identité (passeport, carte nationale d'identité)",
        "Justificatif de domicile de moins de 6 mois",
        "Certificat de cession ou facture d'achat",
        "Ancienne carte grise (si véhicule d'occasion)",
        "Quitus fiscal pour un véhicule acheté dans l'UE",
        "Certificat de conformité ou attestation d'identification",
        "Preuve d'assurance du véhicule"
      ],
      registrationOfficialLinks: [
        "https://immatriculation.ants.gouv.fr/demarches-en-ligne/immatriculer-pour-la-premiere-fois-un-vehicule-en-france",
        "https://www.service-public.fr/particuliers/vosdroits/N367"
      ],
      insuranceRequired: [
        "Assurance responsabilité civile (obligatoire)",
        "Assurance tous risques recommandée pour véhicule récent"
      ],
      technicalInspectionFrequency: "Contrôle technique à partir des 4 ans du véhicule, puis tous les 2 ans.",
      technicalInspectionSource: "https://www.dekra-norisko.fr/faq/date-controle-technique-/quand-faire-le-controle-technique-auto-%2Cid-3048?faqId=1045",
      notes: "Certaines démarches (carte grise, changement de titulaire) se font uniquement en ligne via l'ANTS."
    }
  },
  healthcare: {
    publicHealthcare: true,
    publicSystemDescription: "Système de Sécurité sociale avec remboursement d'environ 70% du tarif conventionné pour la plupart des soins, le reste étant couvert par la mutuelle ou à charge.",
    publicCoverageRate: 0.7,
    publicCoverageSource: "https://www.ameli.fr/assure/remboursements/rembourse/tableau-recapitulatif-taux-remboursement",
    gpConsultationTariff: 30,
    gpTariffSource: "https://www.info.gouv.fr/actualite/sante-consultation-a-30-euros-chez-le-medecin-generaliste",
    privateInsuranceRecommended: true,
    averagePrivateInsuranceMonthly: 70,
    privateInsuranceNote: "Prix moyen d'une complémentaire santé pour un adulte seul en 2025.",
    privateInsuranceSource: "https://www.magnolia.fr/mutuelle-sante/prix",
    coverageQualityRating: 9.0,
    requiresHealthInsuranceForLongStayVisa: true,
    visaHealthRequirementNote: "Pour un visa long séjour, une couverture santé (publique ou privée) est généralement exigée.",
    medicalChecklist: {
      mandatoryVaccinesForEntry: [
        "Aucune vaccination spécifique obligatoire pour entrer en France depuis la plupart des pays.",
        "Vaccin fièvre jaune obligatoire uniquement pour les voyageurs en provenance de zones à risque."
      ],
      mandatoryVaccinesSources: [
        "https://sante.gouv.fr/prevention-en-sante/sante-des-populations/article/recommandations-sanitaires-pour-les-voyageurs",
        "https://www.diplomatie.gouv.fr/fr/conseils-aux-voyageurs/informations-pratiques/risques/risques-sanitaires/article/sante-vaccinations"
      ],
      recommendedVaccinesForExpat: [
        "Vaccins de base à jour (DTP, ROR)",
        "Hépatite A (selon profil et conditions de vie)",
        "Hépatite B",
        "Vaccin grippe saisonnière recommandé chaque année"
      ],
      recommendedVaccinesSources: [
        "https://www.passporthealthglobal.com/fr-ca/conseils-destination/france/"
      ],
      documentsToTranslateOrBring: [
        "Résumé des antécédents médicaux",
        "Ordonnances en cours (avec DCI des médicaments)",
        "Compte-rendus d'examens importants (imagerie, analyses)",
        "Carnet de vaccination"
      ],
      euHealthCardInfo: {
        applies: true,
        note: "La Carte européenne d'assurance maladie (CEAM) est valable pour les ressortissants de l'UE séjournant temporairement en France.",
        officialLink: "https://www.ameli.fr/assure/remboursements/rembourse/soins-etranger/carte-europeenne-assurance-maladie"
      }
    },
    healthBudget: {
      annualPublicHealthcareCostPerCapitaOutOfPocket: 292,
      outOfPocketSource: "https://drees.solidarites-sante.gouv.fr/publications-communique-de-presse-infographie-documents-de-reference/250930-Panorama-d%C3%A9penses-de-sant%C3%A9",
      annualPrivateInsuranceCost: 840,
      healthBudgetNote: "840 € = 70 €/mois x 12 mois pour une mutuelle moyenne ; le reste à charge moyen (hors mutuelle) est d'environ 292 €/an par habitant."
    }
  }
};

export default franceData;
