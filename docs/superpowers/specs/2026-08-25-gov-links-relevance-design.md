# Garde-fous de pertinence pour la génération gov-links

**Date :** 2026-08-25
**Statut :** design validé, prêt pour plan d'implémentation
**Périmètre :** phase 1 — fiabiliser la source unique. La fusion multi-sources fera l'objet d'une spec séparée.

---

## 1. Contexte

`GovLinksService.generate()` cherche, vérifie et résume une page gouvernementale officielle par
couple (pays, catégorie). Le résultat alimente `admin_procedure.actionItems`, qui devient la
checklist affichée à l'utilisateur.

La chaîne complète :

```
recherche (SearXNG)  →  filtre domaine officiel  →  vérification HTTP live  →  ranker LLM
       →  summarize LLM (facts + actions)  →  gov_link (pending_review)
       →  approbation admin  →  status 'active'
       →  AdminProcedureGeneratorService.generateFromGovLinks()  →  checklist utilisateur
```

L'extraction elle-même est saine : le prompt de `summarize()` interdit toute connaissance externe,
et l'audit ci-dessous n'a relevé **aucune hallucination**. Le défaut est en amont, dans la
**sélection de la page**.

## 2. Le problème, mesuré

Audit des 34 `gov_link` en statut `active` (FR, CH, JP, US — 11 catégories canoniques).

### 2.1 Sources erronées — 9 sur 34

| # | Pays / catégorie | URL retenue | Nature du défaut |
|---|---|---|---|
| 1 | FR / demarches | `demarche.numerique.gouv.fr/commencer/pref14-premieredemande-visad` | préfecture du Calvados — échelon départemental |
| 2 | CH / education | `eda.admin.ch/countries/peru/fr/home/visa-&-entree-en-suisse` | page destinée aux ressortissants péruviens |
| 3 | CH / sante | `bag.admin.ch/fr/assurance-maladie-travailleurs-frontaliers` | audience « travailleurs frontaliers » |
| 4 | CH / transport | `schweiz-frankreich.eda.admin.ch/fr/permis-de-conduire-…` | accord bilatéral FR↔CH uniquement |
| 5 | CH / logement | `bfs.admin.ch/bfs/en/home/statistics/cross-sectional-topics` | page de statistiques, pas une démarche |
| 6 | JP / visa | `japan.go.jp/` | page d'accueil générique |
| 7 | JP / transport | `mlit.go.jp/en/` | page d'accueil de ministère |
| 8 | US / transport | `usa.gov/agencies/u-s-department-of-transportation` | fiche annuaire d'agence |
| 9 | US / demarches | `uscis.gov/green-card/how-to-apply-for-a-green-card` | statut inadapté à une arrivée sous visa |

Les cas 1 à 8 portent un **marqueur détectable dans l'URL ou le texte**. Le cas 9 n'en porte
aucun : page nationale, officielle, bien formée, sémantiquement hors-cible. Cette asymétrie
justifie l'architecture hybride retenue en §4.

### 2.2 Complétude insuffisante

- 10 catégories sur 44 possibles n'ont aucun lien actif (CH : 4, JP : 3, US : 3).
- Plusieurs catégories tombent à 2 ou 3 actions (FR/business : 2, FR/transport : 2, CH/logement : 3).
- Cause structurelle identifiée : `link-verifier.ts:54` tronque le texte de page à
  `hay.slice(0, 4000)`, et `llm-ranker.ts:64` re-tronque à 4000. Les actions sont donc extraites
  des 4000 premiers caractères seulement. Traité en §7.

### 2.3 Ce qui n'est PAS le problème

Le garde-fou humain existe et fonctionne. `persist()` écrit `pending_review` pour tout lien machine
neuf ; seul `PATCH /gov-links/:id/approve` le passe en `active`
(`gov-links.service.ts:405-414`, `gov-links.controller.ts:55-64`). Les 9 liens erronés sont
`active` parce qu'**un administrateur les a approuvés** — rien à l'écran ne signalait `pref14`.

Conséquence de conception : les garde-fous ne servent pas seulement à bloquer, ils servent à
**motiver le rejet devant l'humain qui approuve**. Le tuyau existe déjà : `verify()` accumule des
`reasons: string[]` concaténées dans `message` (`generation-orchestrator.service.ts:186-204`).
Ce sont les hooks qui sont vides, pas la plomberie.

## 3. Décisions actées

| Décision | Choix | Conséquence |
|---|---|---|
| Modèle de complétude | garde-fous d'abord, multi-sources ensuite | pas de migration en phase 1 |
| Nature du garde-fou | hybride : règles déterministes puis juge LLM | coût borné, comportement testable |
| Verdict sur page signalée | essayer le candidat suivant, sinon `needs_review` motivé | maximise les bonnes réponses sans travail humain |
| Emplacement du code | module `relevance/` dédié, appelé par `generate()` et `verify()` | jugement unique, deux usages |

## 4. Architecture

### 4.1 Arborescence

```
backend/src/features/gov-links/relevance/
  page-scope.ts          règles déterministes — pures, synchrones, sans DB ni réseau
  page-scope.spec.ts
  relevance-judge.ts     juge LLM — interface + implémentation Groq
  relevance-judge.spec.ts
  index.ts               evaluateRelevance() : composition règles → juge
  index.spec.ts
```

### 4.2 Interfaces publiques

```ts
export type RelevanceCode =
  | 'departmental' | 'homepage' | 'third-country' | 'bilateral'
  | 'statistics' | 'directory' | 'wrong-audience' | 'judge-unavailable';

export interface RelevanceFlag {
  code: RelevanceCode;
  /** Message en français, affiché tel quel dans l'admin. */
  reason: string;
}

export interface RelevanceVerdict {
  ok: boolean;
  flags: RelevanceFlag[];
}

export interface RelevanceInput {
  url: string;
  countryCode: string;
  category: string;
  pageText?: string;
}

/** Règles seules : pures, synchrones, gratuites. */
export function scopeFlags(input: RelevanceInput): RelevanceFlag[];

/** Juge sémantique. Une seule implémentation (Groq) + un stub de test. */
export interface RelevanceJudge {
  judge(input: RelevanceInput): Promise<RelevanceFlag[]>;
}

/** Composition : règles d'abord ; le juge n'est appelé que si les règles passent. */
export async function evaluateRelevance(
  input: RelevanceInput,
  judge?: RelevanceJudge,
): Promise<RelevanceVerdict>;
```

Deux consommateurs, un seul jugement :

- `GovLinksService.generate()` appelle `evaluateRelevance` pour **filtrer** ses candidats.
- `GenerationOrchestratorService.verify()` appelle `scopeFlags` pour **expliquer** le verdict à
  l'admin, en remplacement du stub `relevanceGate` actuel
  (`generation-orchestrator.service.ts:208-220`).

## 5. Les règles déterministes

Chaque règle est une fonction pure. Chaque règle a un test amorcé sur l'URL réelle qui a échoué
dans l'audit §2.1, **et** un contre-exemple tiré des 25 liens sains qui ne doit produire aucun flag.

| Code | Détection | URL d'amorce (audit) |
|---|---|---|
| `departmental` | `pref\d{1,3}` dans le chemin ; `prefecture` ; hostname dont le premier label figure dans la liste des départements français | cas 1 |
| `third-country` | nom de pays ou ISO2 dans le chemin (`/countries/<pays>/`) différent du pays de destination | cas 2 |
| `wrong-audience` | marqueurs d'audience incompatible dans l'URL ou le texte : `travailleurs frontaliers`, `français à l'étranger`, `sans-papiers` | cas 3 |
| `bilateral` | deux noms de pays dans le hostname (`schweiz-frankreich`) | cas 4 |
| `statistics` | `statistic`, `statistique`, `/bfs/`, `chiffres-cles`, `donnees` dans le chemin | cas 5 |
| `homepage` | `pathname` vide, `/`, ou réduit à un segment de locale (`/en/`, `/fr/`) | cas 6, 7 |
| `directory` | `/agencies/`, `/annuaire/`, `/organismes/`, `/ministeres/` dans le chemin | cas 8 |

**Couverture attendue : 8 des 9 sources erronées, à coût nul.** Le cas 9 (`uscis.gov/green-card`)
relève du juge.

Les listes (départements français, noms de pays, marqueurs d'audience) sont des **données
exportées**, pas des littéraux enfouis dans les fonctions — elles doivent pouvoir être étendues
sans toucher à la logique ni aux tests existants.

### 5.1 Risque de faux positifs

C'est le risque principal de cette section : remplacer un problème de faux négatifs par un problème
de faux positifs. Deux protections obligatoires.

1. **Corpus de contre-exemples.** Les 25 URLs saines de l'audit constituent un jeu de tests : aucune
   ne doit lever le moindre flag. Ce test échoue au premier durcissement excessif d'une règle.
2. **Ancrage strict.** `departmental` ne se déclenche pas sur la simple présence de `gouv.fr` —
   `service-public.gouv.fr/particuliers/vosdroits/F2413` est national et doit passer. La règle
   exige un marqueur explicite (`pref\d+`) ou un nom de département reconnu.

## 6. Le juge LLM

N'est appelé **que si `scopeFlags` ne renvoie aucun flag**.

- Même discipline anti-hallucination que `summarize()` : `temperature: 0`,
  `response_format: { type: 'json_object' }`, jugement contraint au texte de la page fourni.
- Question unique : *« est-ce LA page de procédure canonique pour une personne qui ARRIVE en
  \<pays\> et souhaite accomplir \<catégorie\> ? »*
- Réponse : `{ "ok": boolean, "reason": string }`. Un `ok: false` produit un flag dont le `reason`
  est repris tel quel pour l'admin.
- Timeout aligné sur l'existant (30 s).

### 6.1 Fail-open — décision explicite

Si le juge est injoignable ou renvoie une réponse illisible, **la page n'est pas bloquée** : on pose
un flag `judge-unavailable` visible dans l'admin, et le candidat poursuit son chemin.

Justification : un LLM en panne ne doit pas vider les 11 catégories d'un pays. C'est le même
arbitrage que celui déjà pris pour le ranker (`gov-links.service.ts:227-231`, repli sur le premier
lien vérifié). Ce choix est documenté ici parce qu'un relecteur futur le prendrait sinon pour un
oubli de gestion d'erreur.

## 7. La boucle de sélection

### 7.1 Comportement actuel

`pickBest()` → 1 candidat → `summarize()` → `persist()`.

### 7.2 Comportement cible

```
candidats = [choix du ranker, puis le reste de `verified` dans l'ordre, sans doublon]

pour chaque candidat, au plus MAX_RELEVANCE_ATTEMPTS (4) :
    flags = scopeFlags(candidat)              // gratuit
    si flags non vide       → mémoriser, candidat suivant
    flags = judge(candidat)                   // 1 appel LLM
    si flags non vide       → mémoriser, candidat suivant
    → summarize(candidat) + persist(pending_review), on s'arrête

si aucun candidat n'a été retenu :
    persist(mieux classé, 'needs_review', message = tous les motifs accumulés)
```

**Propriété clé : `summarize()` ne tourne que sur le candidat retenu.** Les tentatives coûtent un
appel de jugement, jamais un appel de résumé.

### 7.3 Coût

Par catégorie — aujourd'hui : 1 `pickBest` + 1 `summarize`. Demain, au pire : 1 `pickBest` +
4 `judge` + 1 `summarize`, soit **+4 appels Groq par catégorie**, +44 par run complet de 11
catégories. Le délai inter-catégories existant (`GENERATION_DELAY_MS`, 8 s) absorbe cette charge.

## 8. Élargissement de la fenêtre de lecture

**Section détachable** — la seule qui sorte du strict périmètre « garde-fous ». Elle traite la
cause de complétude identifiée en §2.2, indépendante de la sélection.

- `link-verifier` conserve sa troncature à 4000 caractères pour la mise en correspondance des
  mots-clés : élargir ce chemin coûterait de la mémoire sur les 12 candidats vérifiés en parallèle.
- Le candidat **retenu** obtient une lecture complète via `page-reader`, puis `summarize()` tourne
  sur plusieurs tronçons dont on fusionne les actions après déduplication.
- Plafond d'actions relevé de 7 à 10 (`llm-ranker.ts:110`).

Si le périmètre de la phase 1 doit être réduit, cette section part en phase 2 sans impacter les
autres.

## 9. Erreurs et invariants

| Situation | Comportement |
|---|---|
| Page injoignable sur le candidat N | passer au candidat N+1 |
| Juge injoignable ou réponse illisible | fail-open + flag `judge-unavailable` |
| Tous les candidats signalés | `needs_review` avec l'ensemble des motifs |
| Aucun candidat vérifié | comportement actuel inchangé (`needs_review`) |
| Lien déjà approuvé par un admin, URL inchangée | **jamais dépublié automatiquement** — invariant existant à préserver (`gov-links.service.ts:405-414`) |

## 10. Modèle de données

**Aucun changement de schéma en phase 1.** Les motifs transitent par le champ `message` de
`GenerationRunResultItem`, déjà persisté dans `generation_run.results`. La contrainte
`UQ_gov_link_country_cat` reste en place ; elle ne sera levée qu'en phase 2.

## 11. Plan de tests

1. **`page-scope.spec.ts`** — une assertion par règle sur l'URL réelle correspondante de l'audit,
   plus le corpus des 25 URLs saines qui ne doivent lever aucun flag.
2. **`relevance-judge.spec.ts`** — HTTP bouchonné : réponse `ok: false` → flag ; réponse illisible
   → `judge-unavailable` ; erreur réseau → `judge-unavailable` (fail-open vérifié, pas supposé).
3. **`index.spec.ts`** — le juge n'est PAS appelé quand une règle a déjà signalé la page
   (vérifie l'économie d'appels, pas seulement le verdict).
4. **Boucle de sélection** — ranker et verifier bouchonnés : un candidat signalé est ignoré,
   `summarize` n'est appelé qu'une fois, sur le candidat retenu.
5. **Régression sur données réelles** — les 9 URLs de l'audit sont refusées (8 par les règles,
   1 par le juge bouchonné), les 25 saines passent.

Développement en TDD : test rouge observé avant chaque implémentation.

## 12. Fichiers touchés

| Fichier | Nature |
|---|---|
| `relevance/*` | création |
| `gov-links.service.ts` | boucle de sélection dans `generate()` |
| `generation-orchestrator.service.ts` | `relevanceGate` stub → appel à `scopeFlags` |
| `llm-ranker.ts` | plafond d'actions 7 → 10 (§8 uniquement) |
| `link-verifier.ts` / `page-reader.ts` | lecture élargie du candidat retenu (§8 uniquement) |

## 13. Critères de succès

1. Les 9 URLs erronées de l'audit sont refusées par la chaîne complète.
2. Les 25 URLs saines de l'audit ne lèvent aucun flag.
3. Un run complet sur FR produit un message motivé et lisible pour chaque catégorie en
   `needs_review` — aucun rejet muet.
4. Le fail-open est prouvé par test : juge indisponible → la génération aboutit quand même.
5. Aucun lien approuvé par un admin n'est dépublié par un run.

## 14. Hors périmètre — phase 2

Fusion multi-sources : levée de `UQ_gov_link_country_cat`, colonne `rank`, fusion et déduplication
des actions dans `generateFromGovLinks`. Spec dédiée, après livraison de la phase 1.
