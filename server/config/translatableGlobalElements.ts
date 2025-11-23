/**
 * Configuration for translatable fields in global site elements
 * (Footer, Navigation Menu, Announcement Bar, Pop-up)
 * 
 * These elements are managed in /admin-appearance and their translations
 * are automatically synchronized when modified in the dashboard.
 */

export interface TranslatableGlobalConfig {
  arrayFields?: {
    textFields: string[];
  };
  simpleFields?: string[];
}

/**
 * Footer has 5 sections:
 * - Contact Information (contact_info)
 * - Useful Links (useful_links)
 * - Social Networks (social_media)
 * - Newsletter (newsletter_config)
 * - Copyright (copyright_config)
 */
export const TRANSLATABLE_FOOTER_FIELDS: Record<string, TranslatableGlobalConfig> = {
  // Section "Informations de contact"
  contact_info: {
    arrayFields: {
      textFields: ['label', 'value']
    }
  },
  
  // Section "Liens utiles"
  useful_links: {
    arrayFields: {
      textFields: ['text', 'url'] // text is translatable, url is not
    }
  },
  
  // Section "Réseaux sociaux"
  social_media: {
    arrayFields: {
      textFields: ['platform', 'label'] // label is translatable
    }
  },
  
  // Section "Newsletter"
  newsletter_config: {
    simpleFields: ['title', 'description', 'buttonText', 'privacyText']
  },
  
  // Section "Copyright"
  copyright_config: {
    simpleFields: ['text']
  }
};

/**
 * Navigation Menu - hierarchical menu items
 */
export const TRANSLATABLE_NAVIGATION_MENU_FIELDS = {
  textFields: ['name', 'description'] // Menu item name and description are translatable
};

/**
 * Announcement Bar (Barre d'annonces)
 * Stored in site_settings with section='theme' and key='notification_bar'
 */
export const TRANSLATABLE_ANNOUNCEMENT_BAR_FIELDS = {
  simpleFields: ['text'] // Only the notification text is translatable
};

/**
 * Pop-up Settings
 * Stored in site_settings with section='theme' and key='popup_settings'
 */
export const TRANSLATABLE_POPUP_FIELDS = {
  simpleFields: ['title', 'description', 'buttonText']
};

/**
 * Helper function to get translatable config for a footer section
 */
export function getTranslatableFooterConfig(footerSection: string): TranslatableGlobalConfig | null {
  return TRANSLATABLE_FOOTER_FIELDS[footerSection] || null;
}
