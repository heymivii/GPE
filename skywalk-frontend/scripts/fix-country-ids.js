import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mapping des IDs selon la BDD
const idMapping = {
  // Les IDs qui restent pareils (1-7)
  1: 1,  // France
  2: 2,  // Canada
  3: 3,  // Suisse
  4: 4,  // Allemagne
  5: 5,  // Espagne
  6: 6,  // Italie
  7: 7,  // Portugal
  
  // Les IDs à échanger
  8: 13,  // États-Unis: ancien ID 8 → nouveau ID 13
  13: 8,  // Belgique: ancien ID 13 → nouveau ID 8
  
  // Les autres (9-12, 14+) restent pareils
  9: 9,   // Pays-Bas
  10: 10, // Luxembourg
  11: 11, // Royaume-Uni
  12: 12, // Irlande
  14: 14, // Australie
  // ... etc pour les autres pays
};

// Charger le fichier JSON
const jsonPath = path.join(__dirname, '../src/data/countries-data.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

console.log(`📖 Lecture de ${data.countries.length} pays...`);

// Créer un nouveau tableau avec les IDs mis à jour
const updatedCountries = data.countries.map(country => {
  const oldId = country.id;
  const newId = idMapping[oldId] !== undefined ? idMapping[oldId] : oldId;
  
  if (oldId !== newId) {
    console.log(`🔄 ${country.name}: ID ${oldId} → ${newId}`);
  }
  
  return {
    ...country,
    id: newId
  };
});

// Trier par ID
updatedCountries.sort((a, b) => a.id - b.id);

// Sauvegarder
const output = {
  countries: updatedCountries
};

fs.writeFileSync(jsonPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`✅ Fichier mis à jour avec ${updatedCountries.length} pays !`);
console.log(`📝 Vérification:`);
console.log(`  - ID 8: ${updatedCountries.find(c => c.id === 8)?.name}`);
console.log(`  - ID 13: ${updatedCountries.find(c => c.id === 13)?.name}`);
