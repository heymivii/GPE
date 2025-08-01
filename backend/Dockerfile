# Étape 1 : Image Node officielle
FROM node:18

# Étape 2 : Dossier de travail dans le container
WORKDIR /app

# Étape 3 : Copier les fichiers de dépendances
COPY package*.json ./

# Étape 4 : Installer les dépendances
RUN npm install

# Étape 5 : Copier tout le reste du code
COPY . .

# Étape 6 : Build du projet NestJS (TypeScript → JavaScript)
RUN npm run build

# Étape 7 : Exposer le port
EXPOSE 3000

# Étape 8 : Lancer l'application compilée
CMD ["node", "dist/main"]
