# Design — Récupération IA (grounded, sans hallucination) des liens officiels par service

**Date :** 2026-06-17 · **Branche :** `feat/checklist-gov-links`

## Objectif
Remplacer les liens officiels **codés en dur** (`checklist-links.ts`, `services-content-by-country.ts`) par une **couche `gov_link` en BDD**, alimentée par un pipeline **grounded** : recherche web réelle → filtre domaine officiel → vérification live → **tri par une IA locale (Ollama)** → stockage. Sert **la checklist ET les pages services**.

## Principe anti-hallucination (non négociable)
**L'IA ne génère jamais d'URL.** Elle ne fait que **choisir** parmi des candidats **réels** (issus d'une recherche web), filtrés par **domaine officiel** et **vérifiés live (HTTP 200)**. Sortie de l'IA = un **index** de la liste de candidats. 0 candidat valide → `status: needs_review` (jamais d'invention).

## Catégories (canoniques, alignées sur les services)
`emploi · logement · transport · sante · demarches · education · culture · business · visa · banque · demarches-admin`
→ une petite table de correspondance réconcilie les catégories checklist (FR/anglais) vers ces clés canoniques.

## Modèle de données — table `gov_link`
| champ | type | rôle |
|---|---|---|
| id | PK | |
| country_code | varchar | FR · JP · US … |
| category | varchar | catégorie canonique de service |
| label | varchar | « France-Visas — visa étudiant » |
| url | text | URL réelle, vérifiée |
| source_query | text | requête utilisée (provenance) |
| confidence | float | issu du tri/vérif |
| verified_at | timestamp | dernier check live 200 |
| status | varchar | active · needs_review · dead |

Unicité logique : (country_code, category, url). **Seed initial** depuis les fichiers statiques actuels (rien n'est perdu).

## Pipeline `GovLinksService.generate(countryCode, category)`
```
① QueryBuilder      (country, category) → requête + mots-clés attendus
② SearchProvider    recherche web réelle (allowed_domains officiels) → candidats {url,title,snippet}
③ DomainAllowlist   ne garde que les domaines officiels (.gouv.fr·.go.jp·.gov·.admin.ch·canada.ca…) [filet]
④ LinkVerifier      HTTP 200 (suit redirects) + titre/contenu contient les mots-clés → vire morts/hors-sujet
⑤ LlmRanker         (Ollama) choisit le meilleur candidat RÉEL + label + confidence  [sortie = index]
⑥ upsert gov_link
```

**Unités isolées (testables seules) :** `QueryBuilder` · `OfficialDomainAllowlist` · `SearchProvider` (interface) · `LinkVerifier` · `LlmRanker` (interface) · `GovLinksService`.

## Abstractions (swap dev↔prod sans réécriture)
- **`LlmRanker`** : impl OpenAI-compatible (base URL + modèle via env). **Ollama** en dev (`http://localhost:11434/v1`, ex. llama3.1:8b), **LLM cloud bas coût** en prod. Tâche = tri seulement → petit modèle suffit, coût quasi nul (génération rare + cache BDD).
- **`SearchProvider`** : API de recherche (**Tavily** recommandé, free tier orienté grounding ; Brave possible). 1 clé. (Le `WebSearch` du spike n'est pas dispo dans NestJS.)

## Où ça tourne
Ollama est **local** → pipeline exécuté en **outil admin/local** (la machine a internet + Ollama) qui **écrit dans la BDD**. La **prod lit la BDD**. Migration future vers exécution serveur quand LLM cloud (grâce aux abstractions).

## Consommateurs
- **Checklist** : `checklist-links.ts` (liens externes) → lecture `gov_link` par (pays, catégorie).
- **Pages services** : `services-content-by-country.ts` (liens) → lecture `gov_link`.
→ Un seul moteur, deux usages.

## Cas limites / garanties
- 0 candidat vérifié → `needs_review` (honnête).
- Ollama indispo → repli heuristique (top domaine officiel vérifié).
- Lien mort au re-check → `dead` (= health-check intégré, gratuit).

## Hors scope (MVP)
- Génération massive de tous (11 catégories × N pays) d'un coup → on démarre sur **les 4 pays supportés + visa/demarches/logement/sante** ; le reste suit.
- UI d'admin riche → un déclencheur simple (commande/endpoint) suffit au MVP.

## Tests
- `QueryBuilder`, `OfficialDomainAllowlist`, `LinkVerifier` : purs → unitaires directs.
- `LlmRanker` : mock (l'IA renvoie un index ; on vérifie qu'on ne sort jamais une URL hors candidats).
- `GovLinksService` : mock des 3 providers (search/verify/llm) → cas 0-candidat, lien mort, succès.
