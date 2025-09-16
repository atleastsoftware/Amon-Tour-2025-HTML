import { i18n } from '@lingui/core';

export const locales = {
  en: 'English',
  fr: 'Français', 
  es: 'Español'
};

export const defaultLocale = 'en';

export async function dynamicActivate(locale: keyof typeof locales) {
  const { messages } = await import(`./locales/${locale}/messages.js`);
  
  i18n.load(locale, messages);
  i18n.activate(locale);
  
  // Store locale preference
  localStorage.setItem('locale', locale);
  document.documentElement.lang = locale;
}