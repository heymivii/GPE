# 📊 Structure des Données Pays

Ce dossier contient toutes les données nécessaires pour alimenter les outils interactifs de Skywalk.

## 📁 Organisation

```
data/
├── countries/          # Données complètes par pays
│   ├── france-data.ts  # ✅ Données France (complètes avec sources)
│   ├── canada-data.ts  # TODO
│   ├── germany-data.ts # TODO
│   └── ...
├── transport-data.ts   # Données transport simplifiées (utilisées par les outils)
├── health-data.ts      # Données santé simplifiées (utilisées par les outils)
└── services-config.ts  # Configuration des services
```

## 🎯 Utilisation

### Données détaillées (countries/)
Les fichiers `countries/*.ts` contiennent **toutes les informations officielles** avec sources :
- Prix détaillés (essence, assurance, entretien, péages)
- Règles d'échange de permis (UE vs non-UE)
- Checklists complètes avec liens officiels
- Système de santé avec tarifs réels
- Vaccinations obligatoires/recommandées
- Budgets santé détaillés

**Exemple** : `france-data.ts` contient 130+ lignes de données vérifiées avec 15+ sources officielles.

### Données simplifiées (racine)
Les fichiers `transport-data.ts` et `health-data.ts` sont **utilisés directement par les outils React** :
- Format simple et léger
- Accès rapide par pays
- Interfaces TypeScript strictes
- Valeurs moyennes pour calculs

## ✅ Statut par pays

| Pays | Transport | Santé | Fichier détaillé |
|------|-----------|-------|------------------|
| 🇫🇷 France | ✅ | ✅ | `france-data.ts` |
| �🇧 Royaume-Uni | ✅ | ✅ | `uk-data.ts` |
| �🇨🇦 Canada | ⏳ | ⏳ | TODO |
| 🇩🇪 Allemagne | ⏳ | ⏳ | TODO |
| 🇪🇸 Espagne | ⏳ | ⏳ | TODO |

## 🔍 Sources officielles utilisées

### France - Transport
- Prix essence : https://carbu.com/france/prixmoyens
- Pass Navigo : https://www.bonjour-ratp.fr/
- Assurance auto : https://goodassur.com/assurance-auto/tarif
- Budget entretien : https://www.largus.fr/
- Permis étranger : https://www.service-public.fr/
- Immatriculation : https://immatriculation.ants.gouv.fr/

### France - Santé
- Remboursements : https://www.ameli.fr/
- Tarifs consultations : https://www.info.gouv.fr/
- Prix mutuelles : https://www.magnolia.fr/mutuelle-sante/prix
- Dépenses santé : https://drees.solidarites-sante.gouv.fr/
- Vaccinations : https://sante.gouv.fr/
- CEAM : https://www.ameli.fr/ (Carte européenne)

### Royaume-Uni - Transport
- Prix essence : https://www.globalpetrolprices.com/United-Kingdom/ (1.35 GBP/L)
- Transport Londres : https://tfl.gov.uk/fares
- Permis étranger : https://www.gov.uk/exchange-foreign-driving-licence
- MOT (contrôle technique) : https://www.gov.uk/get-an-m-o-t
- Immatriculation : https://www.gov.uk/vehicle-registration

### Royaume-Uni - Santé
- NHS : https://www.nhs.uk/
- Commonwealth Fund : https://www.commonwealthfund.org/
- Immigration Health Surcharge : https://www.gov.uk/healthcare-immigration-application
- Enregistrement GP : https://www.nhs.uk/nhs-services/gps/
- Vaccinations : https://www.nhs.uk/conditions/vaccinations/
- GHIC : https://www.nhs.uk/using-the-nhs/healthcare-abroad/

## 📝 Comment ajouter un nouveau pays

1. **Créer le fichier détaillé** : `countries/[pays]-data.ts`
   ```typescript
   export const canadaData = {
     transport: { /* ... */ },
     healthcare: { /* ... */ }
   };
   ```

2. **Mettre à jour les fichiers simplifiés** :
   - Ajouter entrée dans `transport-data.ts` → `transportPricesByCountry`
   - Ajouter entrée dans `health-data.ts` → `healthSystemByCountry`

3. **Documenter les sources** dans les commentaires

4. **Tester les outils** avec les nouvelles données

## 🛠️ Outils utilisant ces données

### Transport
- **Calculateur de coût** : `TransportCostTool` (compare voiture vs transports publics)
- **Vérificateur de permis** : `DriverLicenseTool` (règles d'échange selon pays origine/destination)
- **Checklist véhicule** : `VehicleChecklistTool` (documents pour achat/immatriculation)

### Santé
- **Estimateur couverture** : `HealthCoverageTool` (coûts sécurité sociale + mutuelle selon profil)
- **Checklist médicale** : `MedicalChecklistTool` (documents et vaccins nécessaires)
- **Budget santé** : `HealthBudgetTool` (dépenses annuelles selon âge/profil)

## 💡 Bonnes pratiques

- ✅ **Toujours citer les sources** (liens officiels)
- ✅ **Dater les informations** (les prix changent)
- ✅ **Préciser les contextes** (ex: "grande ville", "formule moyenne")
- ✅ **Convertir en euros** pour uniformiser
- ✅ **Valider avec plusieurs sources** officielles
- ❌ **Ne pas inventer** de données

## 🔄 Mise à jour

Les données doivent être revues tous les **6 mois minimum** :
- Prix du carburant (volatile)
- Pass de transport (changements annuels)
- Tarifs consultations (revalorisations)
- Primes d'assurance (ajustements annuels)
