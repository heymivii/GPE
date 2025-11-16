# Workflow du projet

## Branches principales
- **main** : version stable (production, protégée).  
- **develop** : branche d’intégration (protégée). Toutes les fonctionnalités passent par elle avant d’aller sur `main`.  

Le code est déjà structuré en deux dossiers dans la branch develop :  
- `/skywalk-frontend/` : pour le code du front-end  
- `/backend/` : pour le code du back-end  

⚠️ Ne pas créer de branches `frontend` ou `backend`. On travaille directement dans les dossiers.

---

## Comment contribuer

### 1. Créer une nouvelle branche à partir de `dev`
```bash
git checkout develop
git pull origin develop
git checkout -b feature/ma-fonctionnalite

Utilise un nom explicite : feature/login, feature/dashboard, fix/api-bug, etc.
Une branche = une seule fonctionnalité.


2. Développer
	•	Si c’est du front : va dans /skywalk-frontend/.
	•	Si c’est du back : va dans /backend/.
	•	N’ajoute pas de nouveaux dossiers pour le front ou le back.


3. Commits clairs et réguliers

git add .
git commit -m "feat(auth): ajout du formulaire de connexion"
git push -u origin feature/ma-fonctionnalite

Conventions de commits :
	•	feat: ... → nouvelle fonctionnalité
	•	fix: ... → correction de bug
	•	chore: ... → tâches techniques (config, dépendances, etc.)
	•	docs: ... → documentation


4. Ouvrir une Pull Request
	•	Base branch = dev
	•	Compare branch = ta branche (feature/...)
	•	Utilise le template de PR fourni pour décrire clairement ce que tu as fait.

5. Merge
	•	Attendre review si besoin.
	•	Vérifier que tout fonctionne.
	•	Faire un squash and merge (pour un historique plus propre).