import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Liste des images manquantes depuis la base de données
const missingImages = [
  'tour-1754816358221-290703384.jpeg', // Koh Phi Phi & Ao Nang's local islands
  'tour-1754816317280-71545064.jpeg',  // The Secrets of Railay - Adventure Course  
  'tour-1754816405500-877622656.jpeg', // Bivouac in Phang Nga Bay
  'tour-1754816439179-322855290.jpeg', // Koh Kradan  & Koh Ngaï
  'tour-1754816480916-390212634.jpeg', // Koh Mook & Sunset
  'tour-1754816503155-375167765.jpeg', // Semi Private - Koh Hong Archipelago
  'tour-1754816524864-740424960.jpeg', // Semi Private - Railay & Ao Nang's local islands Sunset and plankton
  'tour-1754816544072-723063397.jpeg', // Laem Sak: Local Life  in Phang Nga Bay
  'tour-1754816565215-182945748.jpeg', // Krabi Primary Forest  and Waterfall
  'tour-1754816596449-634553577.jpeg', // Thalane - Kayaking  & natural pools
  'tour-1754816647078-836973709.jpeg', // Koh Hong & Ao Nang's local islands Sunset and Plankton
  'tour-1754816668408-45135677.jpeg',  // Koh Hong Archipelago
  'tour-1754816689377-36309818.jpeg',  // Railay & Ao Nang's local islands
  'tour-1754816720535-856337768.jpeg', // Ao Nang's local islands sunset and plankton
  'tour-1754816780349-585902009.jpeg', // Phang Nga Bay : Koh Kudu and Koh Hong
  'tour-1754816814833-815991714.jpeg', // Catamaran day trip - Ao Nang's local islands
  'tour-1754816828409-517810912.jpeg', // Semi Private - Koh Phi Phi on morning
  'tour-1754816381014-771284773.jpg'   // Ao Luk - Temple, Cave and Jungle
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`Downloaded: ${dest}`);
          resolve();
        });
      } else {
        console.log(`Failed to download ${url}: ${response.statusCode}`);
        reject(new Error(`HTTP ${response.statusCode}`));
      }
    }).on('error', (err) => {
      fs.unlink(dest, () => {}); // Delete the file if error
      reject(err);
    });
  });
}

async function recoverImages() {
  // Essayer de télécharger depuis la version live
  const liveUrl = 'https://amontour.replit.app'; // URL de la version live
  
  console.log('Attempting to recover images from live version...');
  
  for (const image of missingImages) {
    const imageUrl = `${liveUrl}/uploads/tours/${image}`;
    const localPath = path.join(__dirname, '..', 'uploads', 'tours', image);
    
    try {
      await downloadFile(imageUrl, localPath);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s between downloads
    } catch (error) {
      console.log(`Failed to download ${image}: ${error.message}`);
      
      // Créer un fichier placeholder temporaire
      const placeholderPath = path.join(__dirname, '..', 'uploads', 'tours-missing', image);
      fs.writeFileSync(placeholderPath, 'PLACEHOLDER_IMAGE_FILE');
      console.log(`Created placeholder for ${image}`);
    }
  }
  
  console.log('Image recovery completed!');
}

recoverImages().catch(console.error);