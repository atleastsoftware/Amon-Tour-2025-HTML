import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
// import { autoTranslate } from "@/lib/autoTranslate"; // DISABLED - autoTranslate removed to fix flag conflicts
import { Globe, Settings, TestTube, Info } from "lucide-react";
export default function TranslationManager() {
  const { t } = useTranslation();

  const [isAutoEnabled, setIsAutoEnabled] = useState(localStorage.getItem('amon-tour-auto-translate') !== 'disabled');
  const [testResult, setTestResult] = useState<string | null>(null);
  const handleToggleAuto = (enabled: boolean) => {
    setIsAutoEnabled(enabled);
    if (enabled) {
      localStorage.removeItem('amon-tour-auto-translate');
    } else {
      localStorage.setItem('amon-tour-auto-translate', 'disabled');
    }
  };
  const handleTestTranslation = () => {
    // AutoTranslate is now disabled - flags provide manual language selection
    setTestResult('La traduction automatique a été désactivée. Utilisez les drapeaux dans le header pour changer de langue.');
    setTimeout(() => setTestResult(null), 5000);
  };
  const handleResetChoices = () => {
    // Clear language cookies to reset translation state
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem('amon-tour-translation-choice');
    setTestResult('Choix de langue réinitialisé. La page va se recharger en anglais.');
    setTimeout(() => window.location.reload(), 1500);
  };
  return <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading">{t('Gestion de la Traduction Automatique', {
              defaultValue: 'Gestion de la Traduction Automatique'
            })}</CardTitle>
            <CardDescription>{t('Configuration de la traduction automatique bas\xE9e sur la g\xE9olocalisation IP', {
              defaultValue: 'Configuration de la traduction automatique bas\xE9e sur la g\xE9olocalisation IP'
            })}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">🇫🇷</div>
            <div className="text-sm font-medium text-green-800">{t('Cible Principale', {
              defaultValue: 'Cible Principale'
            })}</div>
            <div className="text-xs text-green-600">{t('Utilisateurs fran\xE7ais', {
              defaultValue: 'Utilisateurs fran\xE7ais'
            })}</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">🌐</div>
            <div className="text-sm font-medium text-blue-800">{t('Service IP', {
              defaultValue: 'Service IP'
            })}</div>
            <div className="text-xs text-blue-600">ip-api.com (gratuit)</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">⚡</div>
            <div className="text-sm font-medium text-purple-800">{t('Traducteurs', {
              defaultValue: 'Traducteurs'
            })}</div>
            <div className="text-xs text-purple-600">{t('Chrome, Edge, Firefox', {
              defaultValue: 'Chrome, Edge, Firefox'
            })}</div>
          </div>
        </div>

        {/* Auto-Translation Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">{t('Traduction automatique', {
                defaultValue: 'Traduction automatique'
              })}</div>
              <div className="text-sm text-gray-500">{t('Activer la d\xE9tection automatique pour les visiteurs fran\xE7ais', {
                defaultValue: 'Activer la d\xE9tection automatique pour les visiteurs fran\xE7ais'
              })}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch checked={isAutoEnabled} onCheckedChange={handleToggleAuto} />
            <Badge variant={isAutoEnabled ? "default" : "secondary"}>
              {isAutoEnabled ? "Activé" : "Désactivé"}
            </Badge>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>{t('Comment \xE7a fonctionne :', {
              defaultValue: 'Comment \xE7a fonctionne :'
            })}</strong>{t('Le syst\xE8me d\xE9tecte automatiquement les visiteurs \n            fran\xE7ais (France, Belgique, Suisse, Canada) et d\xE9clenche les traducteurs natifs \n            des navigateurs (Chrome Translate, Edge Translator, Firefox Translate).', {
            defaultValue: 'Le syst\xE8me d\xE9tecte automatiquement les visiteurs \n            fran\xE7ais (France, Belgique, Suisse, Canada) et d\xE9clenche les traducteurs natifs \n            des navigateurs (Chrome Translate, Edge Translator, Firefox Translate).'
          })}</AlertDescription>
        </Alert>

        {/* Test Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />{t('Tests et Contr\xF4les', {
              defaultValue: 'Tests et Contr\xF4les'
            })}</h4>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={handleTestTranslation} className="flex items-center gap-2">
              <Globe className="h-4 w-4" />{t('Tester la Traduction', {
              defaultValue: 'Tester la Traduction'
            })}</Button>
            
            <Button variant="outline" onClick={handleResetChoices} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />{t('R\xE9initialiser Choix', {
              defaultValue: 'R\xE9initialiser Choix'
            })}</Button>
          </div>

          {testResult && <Alert className="mt-3">
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>}
        </div>

        {/* Technical Details */}
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">{t('D\xE9tails techniques', {
            defaultValue: 'D\xE9tails techniques'
          })}</summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <p><strong>{t('Pays d\xE9tect\xE9s :', {
                defaultValue: 'Pays d\xE9tect\xE9s :'
              })}</strong>{t('France (FR), Belgique (BE), Suisse (CH), Canada (CA), Monaco (MC), Luxembourg (LU)', {
              defaultValue: 'France (FR), Belgique (BE), Suisse (CH), Canada (CA), Monaco (MC), Luxembourg (LU)'
            })}</p>
            <p><strong>{t('M\xE9thodes de d\xE9clenchement :', {
                defaultValue: 'M\xE9thodes de d\xE9clenchement :'
              })}</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>{t('Attribut HTML translate="yes"', {
                defaultValue: 'Attribut HTML translate="yes"'
              })}</li>
              <li>{t('Meta tags pour suggestions de traduction', {
                defaultValue: 'Meta tags pour suggestions de traduction'
              })}</li>
              <li>{t('APIs modernes (Chrome Translator API, Firefox local)', {
                defaultValue: 'APIs modernes (Chrome Translator API, Firefox local)'
              })}</li>
              <li>{t('Fallback Google Translate Widget si disponible', {
                defaultValue: 'Fallback Google Translate Widget si disponible'
              })}</li>
            </ul>
            <p><strong>{t('Stockage :', {
                defaultValue: 'Stockage :'
              })}</strong>{t('Pr\xE9f\xE9rences utilisateur en localStorage', {
              defaultValue: 'Pr\xE9f\xE9rences utilisateur en localStorage'
            })}</p>
            <p><strong>{t('Performance :', {
                defaultValue: 'Performance :'
              })}</strong>{t('~40-100ms latence pour g\xE9olocalisation IP', {
              defaultValue: '~40-100ms latence pour g\xE9olocalisation IP'
            })}</p>
          </div>
        </details>
      </CardContent>
    </Card>;
}