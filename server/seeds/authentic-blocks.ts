// Seed data with authentic content from existing pages
import { db } from '../db';
import { pageConfigurations, pageBlocks } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Authentic content extracted from actual components
export const authenticBlocksData = {
  // HOME PAGE BLOCKS
  home: {
    pageSlug: 'home',
    pageName: 'Accueil',
    pageType: 'main',
    blocks: [
      {
        blockType: 'video_hero',
        blockOrder: 1,
        identifier: 'hero_main',
        title: 'Discover the Magic of Krabi',
        subtitle: 'Your Gateway to Unforgettable Adventures',
        description: 'Experience the breathtaking beauty of Thailand\'s coastline with our personalized tours and authentic local experiences.',
        ctaText: 'Explore Our Tours',
        ctaUrl: '/experiences',
        configuration: {
          videoUrl: '/attached_assets/hero-video-optimized.mp4',
          fallbackImage: '/src/assets/DJI_20241115104455_0160_D-min.jpeg',
          overlay: 0.4,
          autoPlay: true,
          loop: true
        }
      },
      {
        blockType: 'advantages',
        blockOrder: 2,
        identifier: 'why_choose_us',
        title: 'Why Choose Us',
        subtitle: 'Experience an exclusive private day trip with our English or French-speaking and certified guides.',
        configuration: {
          features: [
            {
              title: 'Private Tours',
              description: 'Experience an exclusive day trip with our professional guides and private vehicles.',
              icon: 'Users',
              subFeatures: [
                { icon: 'fas fa-car', label: 'Private Car' },
                { icon: 'fas fa-language', label: 'Guide' },
                { icon: 'fas fa-shield-alt', label: 'Safety' }
              ]
            },
            {
              title: 'Customized Itineraries',
              description: 'Create your own journey based on your desires, your pace, and your interests.',
              icon: 'Compass',
              subFeatures: [
                { icon: 'fas fa-map-marked-alt', label: 'Custom Route' },
                { icon: 'fas fa-clock', label: 'Your Pace' },
                { icon: 'fas fa-heart', label: 'Your Interests' }
              ]
            },
            {
              title: 'Authentic Experiences',
              description: 'Discover hidden gems and local secrets away from mass tourism.',
              icon: 'Sparkles',
              subFeatures: [
                { icon: 'fas fa-compass', label: 'Hidden Gems' },
                { icon: 'fas fa-users-cog', label: 'Local Guides' },
                { icon: 'fas fa-gem', label: 'Authentic' }
              ]
            }
          ]
        }
      },
      {
        blockType: 'text_image',
        blockOrder: 3,
        identifier: 'about_amon_tour',
        title: 'Welcome to Amon Tour',
        subtitle: 'Your trusted partner for authentic Thailand experiences',
        description: 'Based in beautiful Krabi, we are passionate locals who know every hidden corner of this paradise. Our mission is to share the authentic beauty of Thailand while respecting our environment and supporting local communities.',
        configuration: {
          imageUrl: '/src/assets/about-krabi.jpeg',
          imageAlt: 'Beautiful Krabi landscape with limestone cliffs',
          features: [
            'English & French speaking guides',
            'Certified and licensed operators',
            'Eco-friendly tourism practices',
            'Support for local communities',
            'Personalized experiences',
            'Small group adventures'
          ]
        }
      },
      {
        blockType: 'card_grid',
        blockOrder: 4,
        identifier: 'featured_tours',
        title: 'Featured Tours & Experiences',
        subtitle: 'Discover our most popular adventures',
        configuration: {
          displayMode: 'tour_ninja',
          limit: 6,
          showPrices: true,
          showDuration: true,
          columns: 3
        }
      },
      {
        blockType: 'gallery',
        blockOrder: 5,
        identifier: 'customer_reviews',
        title: 'What Our Guests Say',
        subtitle: 'Real experiences from real travelers',
        configuration: {
          testimonials: [
            {
              name: 'Sophie Laurent',
              location: 'France',
              rating: 5,
              text: 'Une expérience absolument magique ! Notre guide parlait parfaitement français et nous a fait découvrir des endroits secrets que nous n\'aurions jamais trouvés seuls.',
              image: '/attached_assets/testimonial-sophie.jpg'
            },
            {
              name: 'James Mitchell',
              location: 'United Kingdom',
              rating: 5,
              text: 'The best tour we\'ve ever taken! Professional, knowledgeable, and incredibly friendly. They made our Krabi experience unforgettable.',
              image: '/attached_assets/testimonial-james.jpg'
            },
            {
              name: 'Marie Dubois',
              location: 'Belgium',
              rating: 5,
              text: 'Service impeccable et guides passionnés. Ils connaissent vraiment la région et savent partager leur amour pour la Thaïlande.',
              image: '/attached_assets/testimonial-marie.jpg'
            }
          ],
          autoPlay: true,
          interval: 5000
        }
      },
      {
        blockType: 'hero',
        blockOrder: 6,
        identifier: 'custom_tour_cta',
        title: 'Ready for Your Dream Adventure?',
        subtitle: 'Let us create a personalized tour just for you',
        description: 'Every traveler is unique, and so should be every journey. Tell us your dreams, and we\'ll make them reality.',
        ctaText: 'Plan My Custom Tour',
        ctaUrl: '/custom-tour',
        backgroundColor: 'bg-gradient-to-r from-blue-600 to-blue-800',
        configuration: {
          style: 'gradient',
          centered: true,
          fullWidth: true
        }
      }
    ]
  },

  // EXPERIENCES PAGE BLOCKS
  experiences: {
    pageSlug: 'experiences',
    pageName: 'Experiences',
    pageType: 'main',
    blocks: [
      {
        blockType: 'hero',
        blockOrder: 1,
        identifier: 'experiences_hero',
        title: 'Discover Thailand Experiences',
        subtitle: 'Immerse yourself in authentic Thai culture with our unique experiences',
        configuration: {
          imageUrl: 'https://images.unsplash.com/photo-1604159129533-9d35777a0b07?q=80&w=1000&auto=format&fit=crop',
          overlay: 0.5,
          height: '50vh',
          centered: true
        }
      },
      {
        blockType: 'search_module',
        blockOrder: 2,
        identifier: 'experience_search',
        title: 'Find Your Perfect Experience',
        configuration: {
          placeholder: 'Search experiences...',
          filterOptions: ['Culture', 'Adventure', 'Food', 'Nature'],
          showFilters: true
        }
      },
      {
        blockType: 'card_grid',
        blockOrder: 3,
        identifier: 'experience_grid',
        title: 'All Experiences',
        configuration: {
          dataSource: 'tour_cards',
          filter: { type: 'experience' },
          columns: 3,
          showPagination: true,
          itemsPerPage: 9
        }
      }
    ]
  },

  // CONTACT PAGE BLOCKS
  contact: {
    pageSlug: 'contact',
    pageName: 'Contact Us',
    pageType: 'main',
    blocks: [
      {
        blockType: 'hero',
        blockOrder: 1,
        identifier: 'contact_hero',
        title: 'Get in Touch',
        subtitle: 'Ready to start your Thai adventure? We\'re here to help!',
        configuration: {
          imageUrl: '/src/assets/contact-hero.jpeg',
          overlay: 0.3,
          height: '40vh'
        }
      },
      {
        blockType: 'contact_info',
        blockOrder: 2,
        identifier: 'contact_methods',
        title: 'How to Reach Us',
        configuration: {
          cards: [
            {
              icon: 'Mail',
              title: 'Email Us',
              description: 'info@amon-tour.com',
              action: 'mailto:info@amon-tour.com'
            },
            {
              icon: 'Phone',
              title: 'Call Us',
              description: '+66 (0)6 2574 8788',
              action: 'tel:+66625748788'
            },
            {
              icon: 'MessageCircle',
              title: 'WhatsApp',
              description: '+66 65 349 6445',
              action: 'https://wa.me/66653496445'
            },
            {
              icon: 'MapPin',
              title: 'Visit Us',
              description: '242 Moo1 Tombol Ao Nang, 81180 Krabi, Thailand',
              action: 'https://maps.google.com/?q=242+Moo1+Tombol+Ao+Nang+81180+Krabi+Thailand'
            }
          ]
        }
      },
      {
        blockType: 'form',
        blockOrder: 3,
        identifier: 'contact_form',
        title: 'Send Us a Message',
        configuration: {
          formType: 'contact',
          fields: [
            { name: 'name', label: 'Your Name', type: 'text', required: true },
            { name: 'email', label: 'Email Address', type: 'email', required: true },
            { name: 'subject', label: 'Subject', type: 'text', required: true },
            { name: 'message', label: 'Message', type: 'textarea', required: true, rows: 5 }
          ],
          submitText: 'Send Message',
          successMessage: 'Thank you! We\'ll get back to you soon.'
        }
      },
      {
        blockType: 'gallery',
        blockOrder: 4,
        identifier: 'office_location',
        title: 'Our Location',
        subtitle: 'Find us in the heart of Ao Nang',
        configuration: {
          address: '242 Moo1 Tombol Ao Nang, 81180 Krabi, Thailand',
          coordinates: { lat: 8.0342, lng: 98.8417 },
          zoom: 15,
          markerTitle: 'Amon Tour Office'
        }
      }
    ]
  }
};

// Function to seed authentic blocks
export async function seedAuthenticBlocks() {
  console.log('🌱 Seeding authentic blocks...');

  try {
    // Create pages and their blocks
    for (const [pageKey, pageData] of Object.entries(authenticBlocksData)) {
      console.log(`Creating page: ${pageData.pageName}`);
      
      // Check if page already exists
      let page = await db.select().from(pageConfigurations)
        .where(eq(pageConfigurations.pageSlug, pageData.pageSlug))
        .limit(1);
      
      if (page.length === 0) {
        // Insert page configuration if it doesn't exist
        const [newPage] = await db.insert(pageConfigurations)
          .values({
            pageSlug: pageData.pageSlug,
            pageName: pageData.pageName,
            pageType: pageData.pageType,
            isActive: true
          })
          .returning({ id: pageConfigurations.id });
        page = [newPage];
      } else {
        console.log(`  Page ${pageData.pageSlug} already exists, skipping creation`);
      }

      // Insert blocks for this page
      for (const blockData of pageData.blocks) {
        console.log(`  Adding block: ${blockData.identifier}`);
        
        // Check if block already exists
        const existingBlock = await db.select().from(pageBlocks)
          .where(eq(pageBlocks.pageId, page[0].id))
          .where(eq(pageBlocks.identifier, blockData.identifier))
          .limit(1);
        
        if (existingBlock.length === 0) {
          await db.insert(pageBlocks)
            .values({
              pageId: page[0].id,
              blockType: blockData.blockType as any,
              blockOrder: blockData.blockOrder,
              identifier: blockData.identifier,
              title: blockData.title,
              subtitle: blockData.subtitle,
              description: blockData.description,
              ctaText: blockData.ctaText,
              ctaUrl: blockData.ctaUrl,
              backgroundColor: blockData.backgroundColor,
              configuration: blockData.configuration,
              isActive: true
            });
        } else {
          console.log(`    Block ${blockData.identifier} already exists, skipping`);
        }
      }
    }

    console.log('✅ Authentic blocks seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding authentic blocks:', error);
    throw error;
  }
}