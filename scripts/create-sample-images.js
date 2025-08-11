import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Créer quelques images d'exemple pour tester l'interface
const toursDirectory = path.join(__dirname, '..', 'uploads', 'tours');

// Assurons-nous que le répertoire existe
if (!fs.existsSync(toursDirectory)) {
  fs.mkdirSync(toursDirectory, { recursive: true });
}

// Créer une image SVG d'exemple simple
const createSampleSVG = (tourName, color) => `
<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${color}"/>
  <text x="50%" y="40%" text-anchor="middle" fill="white" font-size="16" font-family="Arial">
    EXEMPLE PERSONNALISÉ
  </text>
  <text x="50%" y="60%" text-anchor="middle" fill="white" font-size="12" font-family="Arial">
    ${tourName}
  </text>
  <text x="50%" y="80%" text-anchor="middle" fill="white" font-size="10" font-family="Arial">
    (Remplacez par vos vraies images)
  </text>
</svg>`;

// Créer quelques exemples pour démonstration
const sampleTours = [
  { name: 'Koh Phi Phi Adventure', color: '#4A90E2', filename: 'sample-phi-phi.svg' },
  { name: 'Railay Beach Secret', color: '#7B68EE', filename: 'sample-railay.svg' },
  { name: 'Krabi Forest Tour', color: '#32CD32', filename: 'sample-forest.svg' }
];

sampleTours.forEach(tour => {
  const filePath = path.join(toursDirectory, tour.filename);
  fs.writeFileSync(filePath, createSampleSVG(tour.name, tour.color));
  console.log(`Created sample image: ${tour.filename}`);
});

console.log('Sample images created successfully!');
console.log('You can now use these files to test the upload interface.');