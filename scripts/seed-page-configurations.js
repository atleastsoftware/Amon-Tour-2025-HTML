import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq } from "drizzle-orm";
import { 
  pageConfigurations, 
  pageBlocks, 
  blockTemplates 
} from "../shared/schema.js";

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

const pageConfigsToSeed = [
  {
    pageName: "Home Page",
    pageSlug: "home",
    pageType: "main",
    metaTitle: "Amon Tour - Authentic Thailand Tours & Experiences in Krabi",
    metaDescription: "Discover authentic Thailand with Amon Tour. Expert-guided tours in Krabi, island hopping, cultural experiences, and custom adventures. Book your perfect Thai getaway.",
    isActive: true
  },
  {
    pageName: "Experiences",
    pageSlug: "experiences", 
    pageType: "main",
    metaTitle: "Thailand Tours & Experiences - Amon Tour Krabi",
    metaDescription: "Browse our collection of authentic Thailand tours and experiences. Island hopping, cultural tours, adventure activities, and custom itineraries in Krabi and southern Thailand.",
    isActive: true
  },
  {
    pageName: "Custom Tour",
    pageSlug: "custom-tour",
    pageType: "main", 
    metaTitle: "Custom Thailand Tours - Personalized Travel Experiences",
    metaDescription: "Create your perfect Thailand adventure with our custom tour service. Personalized itineraries, expert local guides, and unique experiences tailored to your interests.",
    isActive: true
  },
  {
    pageName: "Blog",
    pageSlug: "blog",
    pageType: "main",
    metaTitle: "Thailand Travel Blog - Tips, Guides & Stories | Amon Tour",
    metaDescription: "Read our Thailand travel blog for insider tips, destination guides, and travel stories. Get expert advice for your Thailand adventure from local experts.",
    isActive: true
  },
  {
    pageName: "Contact",
    pageSlug: "contact",
    pageType: "main",
    metaTitle: "Contact Amon Tour - Thailand Travel Experts",
    metaDescription: "Get in touch with Amon Tour for your Thailand travel needs. Professional travel consultants ready to help plan your perfect Thai adventure.",
    isActive: true
  },
  {
    pageName: "Stays & Accommodations",
    pageSlug: "stays",
    pageType: "secondary",
    metaTitle: "Thailand Accommodations & Stays - Amon Tour",
    metaDescription: "Find perfect accommodations for your Thailand stay. Carefully selected hotels, resorts, and unique lodging options in Krabi and southern Thailand.",
    isActive: true
  },
  {
    pageName: "External Stays",
    pageSlug: "external-stays", 
    pageType: "secondary",
    metaTitle: "Partner Accommodations - Extended Stay Options",
    metaDescription: "Explore our partner accommodations across Thailand. Extended stay options and alternative lodging for longer Thailand adventures.",
    isActive: true
  },
  {
    pageName: "All Tours",
    pageSlug: "tours",
    pageType: "secondary",
    metaTitle: "All Thailand Tours - Complete Tour Collection",
    metaDescription: "Browse our complete collection of Thailand tours and experiences. From island hopping to cultural immersion, find your perfect Thai adventure.",
    isActive: true
  },
  {
    pageName: "Privacy Policy",
    pageSlug: "privacy-policy",
    pageType: "legal",
    metaTitle: "Privacy Policy - Amon Tour",
    metaDescription: "Amon Tour privacy policy and data protection information for our Thailand tour services.",
    isActive: true
  },
  {
    pageName: "Terms & Conditions",
    pageSlug: "terms-conditions",
    pageType: "legal", 
    metaTitle: "Terms & Conditions - Amon Tour",
    metaDescription: "Terms and conditions for Amon Tour Thailand travel services and bookings.",
    isActive: true
  }
];

const homePageBlocks = [
  {
    blockType: "hero",
    blockOrder: 1,
    identifier: "home_hero",
    title: "Découvrez la Thaïlande Authentique",
    subtitle: "Avec Amon Tour, vivez des expériences uniques dans le sud de la Thaïlande",
    ctaText: "Explorez nos tours",
    ctaUrl: "/experiences",
    imageUrl: "/attached_assets/krabi-hero.jpg",
    iconName: "map-pin",
    configuration: { hasButton: true },
    isActive: true
  },
  {
    blockType: "text_image",
    blockOrder: 2,
    identifier: "why_choose_us",
    title: "Pourquoi choisir Amon Tour ?",
    content: "Nous sommes une agence de voyage locale basée à Krabi, spécialisée dans les expériences authentiques du sud de la Thaïlande. Notre équipe de guides experts vous fait découvrir les trésors cachés de cette région magnifique.",
    iconName: "compass",
    configuration: { alignment: "center" },
    isActive: true
  },
  {
    blockType: "card_grid",
    blockOrder: 3,
    identifier: "featured_tours",
    title: "Tours Populaires",
    subtitle: "Découvrez nos expériences les plus prisées",
    configuration: { displayCount: 6, showFilters: true, gridType: "tours" },
    isActive: true
  },
  {
    blockType: "hero",
    blockOrder: 4,
    identifier: "cta_section",
    title: "Prêt pour l'Aventure ?",
    subtitle: "Créons ensemble votre voyage sur mesure en Thaïlande",
    ctaText: "Créer mon voyage",
    ctaUrl: "/custom-tour",
    backgroundColor: "#1e73be",
    configuration: { style: "cta" },
    isActive: true
  }
];

const experiencesPageBlocks = [
  {
    blockType: "hero",
    blockOrder: 1,
    identifier: "experiences_hero",
    title: "Nos Expériences",
    subtitle: "Découvrez la beauté authentique du sud de la Thaïlande",
    imageUrl: "/attached_assets/experiences-hero.jpg",
    iconName: "map",
    configuration: { hasButton: false },
    isActive: true
  },
  {
    blockType: "card_grid",
    blockOrder: 2,
    identifier: "all_tours",
    title: "Toutes nos Expériences",
    subtitle: "Du saut d'île en exploration culturelle",
    configuration: { displayCount: 12, showFilters: true, gridType: "tours" },
    isActive: true
  }
];

const customTourPageBlocks = [
  {
    blockType: "hero",
    blockOrder: 1,
    identifier: "custom_tour_hero",
    title: "Voyage Sur Mesure",
    subtitle: "Créez votre expérience unique en Thaïlande",
    imageUrl: "/attached_assets/custom-tour-hero.jpg",
    iconName: "compass",
    configuration: { hasButton: false },
    isActive: true
  },
  {
    blockType: "text_image",
    blockOrder: 2,
    identifier: "custom_tour_intro",
    title: "Votre Voyage, Vos Envies",
    content: "Chaque voyageur est unique, et votre expérience en Thaïlande devrait l'être aussi. Notre équipe d'experts locaux vous accompagne dans la création d'un itinéraire personnalisé qui correspond parfaitement à vos envies, votre budget et vos centres d'intérêt.",
    iconName: "heart",
    configuration: { alignment: "center" },
    isActive: true
  },
  {
    blockType: "form",
    blockOrder: 3,
    identifier: "custom_tour_form",
    title: "Décrivez votre voyage idéal",
    description: "Partagez vos envies avec nous et nous créerons un itinéraire sur mesure",
    configuration: { 
      formType: "custom-tour",
      fields: ["name", "email", "dates", "preferences", "budget", "groupSize"]
    },
    isActive: true
  }
];

const contactPageBlocks = [
  {
    blockType: "hero",
    blockOrder: 1,
    identifier: "contact_hero",
    title: "Contactez-nous",
    subtitle: "Notre équipe est là pour vous aider à planifier votre voyage",
    imageUrl: "/attached_assets/contact-hero.jpg",
    iconName: "mail",
    configuration: { hasButton: false },
    isActive: true
  },
  {
    blockType: "contact_info",
    blockOrder: 2,
    identifier: "contact_details",
    configuration: {
      address: "242/1 Moo1 – Na Thai – Ao Nang, 81000 Krabi – Thailand",
      phone: "+66 (0) 75 695 678",
      email: "info@amon-tour.com",
      hours: "Lun-Dim: 8h-19h (heure thaï)"
    },
    isActive: true
  },
  {
    blockType: "form",
    blockOrder: 3,
    identifier: "contact_form",
    title: "Envoyez-nous un message",
    description: "Nous répondons généralement dans les 24h",
    configuration: {
      formType: "contact",
      fields: ["name", "email", "subject", "message"]
    },
    isActive: true
  }
];

const blogPageBlocks = [
  {
    blockType: "hero",
    blockOrder: 1,
    identifier: "blog_hero",
    title: "Blog Voyage",
    subtitle: "Conseils, guides et histoires de voyage en Thaïlande",
    imageUrl: "/attached_assets/blog-hero.jpg",
    iconName: "book-open",
    configuration: { hasButton: false },
    isActive: true
  },
  {
    blockType: "text_image",
    blockOrder: 2,
    identifier: "blog_intro",
    title: "Découvrez la Thaïlande à travers nos Articles",
    content: "Notre blog regorge de conseils pratiques, de guides détaillés et d'histoires inspirantes pour vous aider à planifier votre voyage en Thaïlande. Explorez nos articles écrits par des experts locaux.",
    iconName: "compass",
    configuration: { alignment: "center" },
    isActive: true
  }
];

async function seedPageConfigurations() {
  console.log("🌱 Seeding page configurations...");
  
  try {
    // Create page configurations
    const createdPages = [];
    for (const pageConfig of pageConfigsToSeed) {
      const [created] = await db
        .insert(pageConfigurations)
        .values({
          ...pageConfig,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .onConflictDoUpdate({
          target: pageConfigurations.pageSlug,
          set: {
            ...pageConfig,
            updatedAt: new Date()
          }
        })
        .returning();
      createdPages.push(created);
      console.log(`✅ Page configuration created/updated: ${created.pageName}`);
    }

    // Create blocks for specific pages
    const pageBlocksMap = {
      'home': homePageBlocks,
      'experiences': experiencesPageBlocks,
      'custom-tour': customTourPageBlocks,
      'contact': contactPageBlocks,
      'blog': blogPageBlocks
    };

    for (const [pageSlug, blocks] of Object.entries(pageBlocksMap)) {
      const pageConfig = createdPages.find(p => p.pageSlug === pageSlug);
      if (!pageConfig) continue;

      // Delete existing blocks for this page to avoid duplicates
      await db.delete(pageBlocks).where(eq(pageBlocks.pageId, pageConfig.id));

      // Create new blocks
      for (const blockData of blocks) {
        await db.insert(pageBlocks).values({
          ...blockData,
          pageId: pageConfig.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        console.log(`✅ Block created: ${blockData.blockType} for ${pageSlug}`);
      }
    }

    console.log("🎉 Page configurations and blocks seeded successfully!");
    
  } catch (error) {
    console.error("❌ Error seeding page configurations:", error);
    throw error;
  }
}

// Run seeding
if (import.meta.url === `file://${process.argv[1]}`) {
  seedPageConfigurations()
    .then(() => {
      console.log("✨ Seeding completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Seeding failed:", error);
      process.exit(1);
    });
}

export { seedPageConfigurations };