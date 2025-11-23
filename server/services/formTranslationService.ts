import { db } from "../db";
import { customForms, type FormField, type FormSettings } from "../../shared/schema";
import { eq } from "drizzle-orm";
import { autoTranslationService } from "./autoTranslationService";

interface FormTranslations {
  en: Record<string, string>;
  fr: Record<string, string>;
  es: Record<string, string>;
}

interface TranslationsMeta {
  fr?: Record<string, { isManuallyEdited?: boolean }>;
  es?: Record<string, { isManuallyEdited?: boolean }>;
}

class FormTranslationService {
  /**
   * Extract all translatable text from a form
   */
  private extractTranslatableFields(
    title: string,
    subtitle: string | null,
    description: string | null,
    fields: FormField[],
    settings: FormSettings
  ): Record<string, string> {
    const translations: Record<string, string> = {};

    // Form header
    translations['title'] = title;
    if (subtitle) translations['subtitle'] = subtitle;
    if (description) translations['description'] = description;

    // Form fields
    fields.forEach((field, index) => {
      const prefix = `field_${index}_`;
      translations[`${prefix}label`] = field.label;
      if (field.placeholder) {
        translations[`${prefix}placeholder`] = field.placeholder;
      }
      
      // Field options (for select, radio, checkbox)
      if (field.options && field.options.length > 0) {
        field.options.forEach((option, optionIndex) => {
          translations[`${prefix}option_${optionIndex}`] = option;
        });
      }
    });

    // Form settings
    if (settings.submitButtonText) {
      translations['submit_button_text'] = settings.submitButtonText;
    }
    if (settings.successMessage) {
      translations['success_message'] = settings.successMessage;
    }
    if (settings.errorMessage) {
      translations['error_message'] = settings.errorMessage;
    }
    if (settings.whatsappButtonText) {
      translations['whatsapp_button_text'] = settings.whatsappButtonText;
    }

    return translations;
  }

  /**
   * Initialize translations for a form
   */
  async initializeFormTranslations(formId: number): Promise<void> {
    try {
      console.log(`🔄 Initializing translations for form ${formId}...`);
      
      const form = await db.select().from(customForms).where(eq(customForms.id, formId)).limit(1);
      
      if (!form || form.length === 0) {
        console.error(`❌ Form ${formId} not found`);
        return;
      }

      const formData = form[0];
      
      // Extract English translations
      const enTranslations = this.extractTranslatableFields(
        formData.title,
        formData.subtitle,
        formData.description,
        formData.fields as FormField[],
        formData.settings as FormSettings
      );

      // Initialize translations object
      const translations: FormTranslations = {
        en: enTranslations,
        fr: {},
        es: {}
      };

      // Auto-translate to French and Spanish
      for (const [key, enValue] of Object.entries(enTranslations)) {
        try {
          // Translate to French
          const frResult = await autoTranslationService.translateText(enValue, 'fr', 'en');
          translations.fr[key] = frResult.translatedText;
          
          // Small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Translate to Spanish
          const esResult = await autoTranslationService.translateText(enValue, 'es', 'en');
          translations.es[key] = esResult.translatedText;
          
          await new Promise(resolve => setTimeout(resolve, 500));
          
          console.log(`✅ Translated "${key}": ${enValue}`);
        } catch (error) {
          console.error(`❌ Failed to translate ${key}:`, error);
          // Keep English as fallback
          translations.fr[key] = enValue;
          translations.es[key] = enValue;
        }
      }

      // Save translations to database
      await db.update(customForms)
        .set({ 
          translations,
          translationsMeta: {}
        })
        .where(eq(customForms.id, formId));

      console.log(`✅ Form ${formId} translations initialized`);
    } catch (error) {
      console.error(`❌ Error initializing form ${formId} translations:`, error);
      throw error;
    }
  }

  /**
   * Update translations for a form when its content changes
   */
  async updateFormTranslations(
    formId: number,
    title: string,
    subtitle: string | null,
    description: string | null,
    fields: FormField[],
    settings: FormSettings
  ): Promise<void> {
    try {
      const form = await db.select().from(customForms).where(eq(customForms.id, formId)).limit(1);
      
      if (!form || form.length === 0) {
        return;
      }

      const formData = form[0];
      const currentTranslations = formData.translations as FormTranslations || { en: {}, fr: {}, es: {} };
      const currentMeta = formData.translationsMeta as TranslationsMeta || {};

      // Extract new English translations
      const newEnTranslations = this.extractTranslatableFields(
        title,
        subtitle,
        description,
        fields,
        settings
      );

      // Update translations
      const updatedTranslations: FormTranslations = {
        en: newEnTranslations,
        fr: currentTranslations.fr || {},
        es: currentTranslations.es || {}
      };

      // For each English field, check if it changed
      for (const [key, newEnValue] of Object.entries(newEnTranslations)) {
        const oldEnValue = currentTranslations.en?.[key];
        
        // If English text changed, re-translate (only if not manually edited)
        if (oldEnValue !== newEnValue) {
          console.log(`📝 English text changed for "${key}": "${oldEnValue}" → "${newEnValue}"`);
          
          // Update French if not manually edited
          if (!currentMeta.fr?.[key]?.isManuallyEdited) {
            try {
              const frResult = await autoTranslationService.translateText(newEnValue, 'fr', 'en');
              updatedTranslations.fr[key] = frResult.translatedText;
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`Failed to translate to French:`, error);
              updatedTranslations.fr[key] = newEnValue;
            }
          }
          
          // Update Spanish if not manually edited
          if (!currentMeta.es?.[key]?.isManuallyEdited) {
            try {
              const esResult = await autoTranslationService.translateText(newEnValue, 'es', 'en');
              updatedTranslations.es[key] = esResult.translatedText;
              await new Promise(resolve => setTimeout(resolve, 500));
            } catch (error) {
              console.error(`Failed to translate to Spanish:`, error);
              updatedTranslations.es[key] = newEnValue;
            }
          }
        }
      }

      // Remove translations for fields that no longer exist
      const oldKeys = Object.keys(currentTranslations.en || {});
      const newKeys = Object.keys(newEnTranslations);
      const removedKeys = oldKeys.filter(k => !newKeys.includes(k));
      
      for (const key of removedKeys) {
        delete updatedTranslations.fr[key];
        delete updatedTranslations.es[key];
        if (currentMeta.fr?.[key]) delete currentMeta.fr[key];
        if (currentMeta.es?.[key]) delete currentMeta.es[key];
      }

      // Save updated translations
      await db.update(customForms)
        .set({ 
          translations: updatedTranslations,
          translationsMeta: currentMeta
        })
        .where(eq(customForms.id, formId));

      console.log(`✅ Form ${formId} translations updated`);
    } catch (error) {
      console.error(`❌ Error updating form ${formId} translations:`, error);
    }
  }

  /**
   * Get translations for a specific form
   */
  async getFormTranslations(formId: number): Promise<{ translations: FormTranslations; meta: TranslationsMeta } | null> {
    try {
      const form = await db.select().from(customForms).where(eq(customForms.id, formId)).limit(1);
      
      if (!form || form.length === 0) {
        return null;
      }

      return {
        translations: form[0].translations as FormTranslations || { en: {}, fr: {}, es: {} },
        meta: form[0].translationsMeta as TranslationsMeta || {}
      };
    } catch (error) {
      console.error(`Error getting form ${formId} translations:`, error);
      return null;
    }
  }
}

export const formTranslationService = new FormTranslationService();
