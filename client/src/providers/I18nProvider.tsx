import { i18n } from '@lingui/core';
import { I18nProvider as LinguiProvider } from '@lingui/react';
import { ReactNode, useEffect } from 'react';
import { dynamicActivate, defaultLocale } from '../i18n';

interface Props {
  children: ReactNode;
}

// Initialize default locale immediately
dynamicActivate(defaultLocale).catch(console.error);

export function I18nProvider({ children }: Props) {
  useEffect(() => {
    // Get saved locale or use default  
    const savedLocale = localStorage.getItem('locale') as 'en' | 'fr' | 'es';
    
    if (savedLocale && savedLocale !== defaultLocale) {
      // Initialize with the saved locale if different from default
      dynamicActivate(savedLocale).catch(console.error);
    }
  }, []);

  return (
    <LinguiProvider i18n={i18n}>
      {children}
    </LinguiProvider>
  );
}