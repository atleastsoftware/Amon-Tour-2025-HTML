import { useTranslation } from 'react-i18next';

/**
 * TEST COMPONENT: Compare ancien TranslationService vs nouveau i18next
 * Ce composant sera temporaire - pour vérifier que i18next fonctionne
 */
export function I18nextTest() {
  const {
    t,
    i18n
  } = useTranslation();
  return <div className="fixed bottom-4 right-4 bg-white border-2 border-red-500 p-4 rounded-lg shadow-lg z-50">
      <h3 className="text-sm font-bold text-red-600 mb-2">{t("Ud83euddeatesti18nex", {
        defaultValue: "Ud83euddeatesti18nex"
      })}</h3>
      
      <div className="text-xs space-y-1">
        <div><strong>{t("Langue", {
            defaultValue: "Langue"
          })}</strong> {i18n.language}</div>
        
        <div className="bg-gray-100 p-2 rounded mt-2">
          <div><strong>✅ i18next:</strong></div>
          <div>• {t('buttons.bookNow')}</div>
          <div>• {t('buttons.learnMore')}</div>
          <div>• {t('navigation.home')}</div>
        </div>
        
        <div className="bg-green-100 p-2 rounded">
          <div><strong>{t("Ud83cudfafnouvellesc", {
              defaultValue: "Ud83cudfafnouvellesc"
            })}</strong></div>
          <div>• {t('hero.seeOffers')}</div>
          <div>• {t('hero.customTrip')}</div>
        </div>
      </div>
    </div>;
}