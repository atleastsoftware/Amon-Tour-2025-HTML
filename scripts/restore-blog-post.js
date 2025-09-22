#!/usr/bin/env node

/**
 * RESTAURATION COMPLÈTE DU FICHIER BLOG-POST
 * Supprime toutes les traductions problématiques et restore les strings normales
 */

import fs from 'fs';

class BlogPostRestorer {
  restoreBlogPost() {
    const filePath = 'client/src/pages/blog-post.tsx';
    let content = fs.readFileSync(filePath, 'utf8');
    
    console.log('🔧 Restoring blog-post.tsx...');
    
    // Remplacer l'objet popularToursData complet avec des strings normales
    const popularToursDataFixed = `
// Popular Tour Ninja tours mapping - real tokens from API
const popularToursData = {
  'phi-phi': {
    id: '_LkIo_9vyF',
    title: "Koh Phi Phi & Ao Nang's local islands",
    description: "Full-day excursion to the paradisiacal Phi Phi islands and Ao Nang's local islands. Discover white sand beaches, crystal-clear waters and breathtaking landscapes.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/_LkIo_9vyF"
  },
  'railay': {
    id: '8avSq2JCG8',
    title: "Railay & Ao Nang's local islands",
    description: "Explore the magnificent Railay Beach, accessible only by boat, and Ao Nang's local islands. Perfect for rock climbing, relaxation and discovery.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/8avSq2JCG8"
  },
  'phang-nga': {
    id: 't1k3AxM19a',
    title: "Phang Nga Bay: Koh Kudu and Koh Hong",
    description: "Discover the breathtaking beauty of Phang Nga Bay with its limestone karsts, crystal-clear waters and hidden lagoons.",
    duration: "1 day", 
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/t1k3AxM19a"
  },
  'krabi-waterfall': {
    id: '-Yzd7eCHa0',
    title: "Krabi: Primary Forest and Waterfall",
    description: "Explore Krabi's primary forest and discover magnificent waterfalls in an authentic natural setting.",
    duration: "1 day",
    price: 2500, 
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/-Yzd7eCHa0"
  },
  'thalane': {
    id: 'CeNxYxqbXq',
    title: "Thalane - Mangrove kayaking & natural pools",
    description: "Kayak through mangroves and discover natural pools in Thalane, one of Krabi's best-kept secrets.",
    duration: "1 day",
    price: 2500,
    currency: "THB", 
    tourNinjaUrl: "https://www.tourninja.io/book/CeNxYxqbXq"
  },
  'ao-luk': {
    id: 'Bh9zKvN-QO',
    title: "Ao Luk - Temple, Cave and Jungle",
    description: "Explore Ao Luk's temples, caves and jungle for an authentic cultural and natural experience.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/Bh9zKvN-QO"
  }
};`;

    // Trouver et remplacer l'objet popularToursData complet
    const popularToursRegex = /\/\/ Popular Tour Ninja tours mapping[\s\S]*?};/;
    content = content.replace(popularToursRegex, popularToursDataFixed);
    
    // Supprimer toutes les autres références t() problématiques
    content = content
      .replace(/t\([^,)]*,\s*\{\s*defaultValue:[^}]*\}\)/g, (match) => {
        // Extraire la valeur defaultValue
        const defaultValueMatch = match.match(/defaultValue:\s*"([^"]*)"/);
        return defaultValueMatch ? `"${defaultValueMatch[1]}"` : '""';
      })
      .replace(/t\(undefined,\s*\{\s*defaultValue:\s*undefined\s*\}\)/g, 'undefined');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('✅ blog-post.tsx has been restored to working state');
  }

  execute() {
    console.log('🔧 RESTAURATION DU FICHIER BLOG-POST');
    console.log('=' .repeat(40));
    this.restoreBlogPost();
    console.log('=' .repeat(40));
    console.log('✅ Restauration terminée !');
  }
}

const restorer = new BlogPostRestorer();
restorer.execute();