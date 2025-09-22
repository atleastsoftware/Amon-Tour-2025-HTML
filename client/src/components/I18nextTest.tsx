import { useState, useEffect } from 'react';

export default function I18nextTest() {
  console.log('🔍 I18nextTest component rendered!');
  const [results, setResults] = useState<string[]>(['Loading...']);

  useEffect(() => {
    const runTests = async () => {
      try {
        const testResults = [];
        
        // Test 1: Fetch manual des traductions
        console.log('🔍 Testing manual fetch...');
        const response = await fetch('/locales/fr/common.json');
        const data = await response.json();
        testResults.push(`✅ Manual fetch: ${response.status}`);
        testResults.push(`✅ Hero title exists: ${!!data.hero?.title}`);
        testResults.push(`✅ Hero title value: "${data.hero?.title}"`);
        
        // Test 2: État d'i18next
        if (typeof window !== 'undefined' && (window as any).i18next) {
          const i18nInstance = (window as any).i18next;
          testResults.push(`✅ i18next global exists: true`);
          testResults.push(`✅ i18next initialized: ${i18nInstance.isInitialized}`);
          testResults.push(`✅ Current language: ${i18nInstance.language}`);
          testResults.push(`✅ Store data exists: ${!!i18nInstance.store?.data}`);
          
          if (i18nInstance.store?.data?.fr?.common) {
            testResults.push(`✅ French common loaded: true`);
            testResults.push(`✅ French hero.title: "${i18nInstance.store.data.fr.common.hero?.title}"`);
          } else {
            testResults.push(`❌ French common NOT loaded`);
          }
        } else {
          testResults.push(`❌ i18next global NOT found`);
        }
        
        setResults(testResults);
        console.log('🔍 Test results:', testResults);
        
      } catch (error) {
        console.error('🔍 Test error:', error);
        setResults([`❌ Error: ${error}`]);
      }
    };

    runTests();
  }, []);

  return (
    <div className="fixed top-4 right-4 bg-blue-600 text-white p-4 rounded shadow-lg z-50 max-w-sm">
      <h3 className="font-bold mb-2">🔍 i18next Debug</h3>
      <div className="text-xs space-y-1">
        {results.map((result, index) => (
          <div key={index} className="bg-blue-700 p-1 rounded">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
}