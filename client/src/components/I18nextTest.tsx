export default function I18nextTest() {
  console.log('🔍 I18nextTest starting...');
  
  // Test simple sans imports
  setTimeout(() => {
    console.log('🔍 Testing manual fetch...');
    fetch('/locales/fr/common.json')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Fetch success:', !!data.hero?.title);
        console.log('✅ Hero title:', data.hero?.title);
        
        // Test global i18next
        if ((window as any).i18next) {
          const i18n = (window as any).i18next;
          console.log('✅ i18next global found');
          console.log('✅ i18next initialized:', i18n.isInitialized);
          console.log('✅ Current language:', i18n.language);
          console.log('✅ Store exists:', !!i18n.store?.data);
          
          if (i18n.store?.data?.fr?.common) {
            console.log('✅ French loaded:', !!i18n.store.data.fr.common.hero);
          } else {
            console.log('❌ French NOT loaded');
          }
        } else {
          console.log('❌ i18next global NOT found');
        }
      })
      .catch(err => console.error('❌ Test error:', err));
  }, 1000);

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-3 rounded shadow-lg z-50">
      <h3 className="font-bold">🔍 i18next Debug</h3>
      <p className="text-sm">Check console for results</p>
    </div>
  );
}