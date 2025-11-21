export interface TranslatableFieldConfig {
  simpleFields?: string[];
  arrayFields?: {
    arrayKey: string;
    textFields: string[];
  }[];
  nestedFields?: {
    parentKey: string;
    fields: string[];
  }[];
}

export const TRANSLATABLE_BLOCK_FIELDS: Record<string, TranslatableFieldConfig> = {
  hero: {
    simpleFields: ['title', 'subtitle', 'description', 'titleAccentText', 'ctaText'],
    arrayFields: [
      {
        arrayKey: 'buttons',
        textFields: ['text']
      }
    ]
  },
  
  header_page: {
    simpleFields: ['title', 'subtitle']
  },
  
  text: {
    simpleFields: ['title', 'content', 'ctaText']
  },
  
  text_section: {
    simpleFields: ['title', 'subtitle', 'content']
  },
  
  text_image: {
    simpleFields: ['title', 'subtitle', 'description', 'ctaText']
  },
  
  about_2col: {
    simpleFields: ['title', 'subtitle', 'description', 'ctaText']
  },
  
  search_bar_tours: {
    simpleFields: ['title', 'subtitle', 'placeholder']
  },
  
  features_3col: {
    simpleFields: ['title', 'description'],
    arrayFields: [
      {
        arrayKey: 'iconBlocks',
        textFields: ['title', 'description']
      }
    ]
  },
  
  testimonials: {
    simpleFields: ['title', 'subtitle']
  },
  
  contact: {
    simpleFields: [
      'title', 'subtitle', 
      'emailLabel', 'email', 
      'phoneLabel', 'phone',
      'whatsappLabel', 'whatsapp',
      'lineIdLabel', 'lineId',
      'aboutTitle', 'companyBrand', 'companyName', 'companyLicense', 'companyDescription'
    ]
  },
  
  contact_cards: {
    simpleFields: ['title', 'subtitle']
  },
  
  contact_info: {
    simpleFields: [
      'title', 'subtitle',
      'emailLabel', 'email',
      'phoneLabel', 'phone',
      'whatsappLabel', 'whatsapp',
      'lineIdLabel', 'lineId',
      'aboutTitle', 'companyBrand', 'companyName', 'companyLicense', 'companyDescription'
    ]
  },
  
  custom_form: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  form: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  cta_banner: {
    simpleFields: ['title', 'subtitle', 'description', 'ctaText']
  },
  
  cta_section: {
    simpleFields: ['title', 'subtitle', 'description', 'ctaText']
  },
  
  gallery: {
    simpleFields: ['title', 'subtitle']
  },
  
  video_section: {
    simpleFields: ['title', 'subtitle']
  },
  
  newsletter: {
    simpleFields: ['title', 'subtitle', 'description', 'buttonText', 'privacyText']
  },
  
  pdf_download: {
    simpleFields: ['title', 'description', 'buttonText']
  },
  
  interests: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  popular_experiences: {
    simpleFields: ['title', 'subtitle']
  },
  
  custom_tour_form: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  tour_ninja_section: {
    simpleFields: ['title', 'subtitle']
  },
  
  why_choose_us: {
    simpleFields: ['title', 'subtitle', 'description'],
    arrayFields: [
      {
        arrayKey: 'iconBlocks',
        textFields: ['title', 'description']
      }
    ]
  },
  
  who_we_are: {
    simpleFields: ['title', 'subtitle', 'introduction'],
    arrayFields: [
      {
        arrayKey: 'sections',
        textFields: ['subtitle', 'text']
      },
      {
        arrayKey: 'buttons',
        textFields: ['text']
      }
    ]
  },
  
  blog_search: {
    simpleFields: [
      'title', 'subtitle', 'searchPlaceholder',
      'tagsTitle', 'categoriesTitle', 'allTagsText', 'allCategoriesText'
    ]
  },
  
  text_listing: {
    simpleFields: ['title', 'subtitle'],
    arrayFields: [
      {
        arrayKey: 'items',
        textFields: ['label', 'description']
      }
    ]
  },
  
  text_pricing: {
    simpleFields: [
      'title', 'subtitle',
      'pickupTitle', 'includedTitle', 'includedDescription',
      'notIncludedTitle', 'notIncludedDescription'
    ],
    arrayFields: [
      {
        arrayKey: 'pricingCards',
        textFields: ['title', 'subtitle', 'price', 'currency', 'cycle', 'label', 'moreText']
      },
      {
        arrayKey: 'pickupTimes',
        textFields: ['time', 'location', 'price']
      }
    ]
  },
  
  text_video: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  text_gallery: {
    simpleFields: ['title', 'subtitle', 'description']
  },
  
  cards_grid: {
    simpleFields: ['title', 'subtitle']
  },
  
  card_grid: {
    simpleFields: ['title', 'subtitle']
  },
  
  search_bar: {
    simpleFields: ['placeholder']
  },
  
  search_module: {
    simpleFields: ['placeholder']
  }
};

export function getTranslatableFields(blockType: string): TranslatableFieldConfig {
  return TRANSLATABLE_BLOCK_FIELDS[blockType] || { simpleFields: [] };
}
