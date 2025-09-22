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
  const {
    t
  } = useTranslation();
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
            <CardTitle className="text-lg font-heading">{t("Gestiondelatraductio", {
              defaultValue: "Gestiondelatraductio"
            })}</CardTitle>
            <CardDescription>{t("Configurationdelatra", {
              defaultValue: "Configurationdelatra"
            })}</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">🇫🇷</div>
            <div className="text-sm font-medium text-green-800">{t("Cibleprincipale", {
              defaultValue: "Cibleprincipale"
            })}</div>
            <div className="text-xs text-green-600">{t("Utilisateursfranxe7a", {
              defaultValue: "Utilisateursfranxe7a"
            })}</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">🌐</div>
            <div className="text-sm font-medium text-blue-800">{t("Serviceip", {
              defaultValue: "Serviceip"
            })}</div>
            <div className="text-xs text-blue-600">ip-api.com (gratuit)</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">⚡</div>
            <div className="text-sm font-medium text-purple-800">{t("Traducteurs", {
              defaultValue: "Traducteurs"
            })}</div>
            <div className="text-xs text-purple-600">{t("Chromeedgefirefox", {
              defaultValue: "Chromeedgefirefox"
            })}</div>
          </div>
        </div>

        {/* Auto-Translation Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">{t("Traductionautomatiqu", {
                defaultValue: "Traductionautomatiqu"
              })}</div>
              <div className="text-sm text-gray-500">{t("Activerladxe9tection", {
                defaultValue: "Activerladxe9tection"
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
            <strong>{t("Commentxe7afonctionn", {
              defaultValue: "Commentxe7afonctionn"
            })}</strong>{t("Lesystxe8medxe9tecte", {
            defaultValue: "Lesystxe8medxe9tecte"
          })}</AlertDescription>
        </Alert>

        {/* Test Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />{t("Testsetcontrxf4les", {
              defaultValue: "Testsetcontrxf4les"
            })}</h4>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button variant="outline" onClick={handleTestTranslation} className="flex items-center gap-2">
              <Globe className="h-4 w-4" />{t("Testerlatraduction", {
              defaultValue: "Testerlatraduction"
            })}</Button>
            
            <Button variant="outline" onClick={handleResetChoices} className="flex items-center gap-2">
              <Settings className="h-4 w-4" />{t("Rxe9initialiserchoix", {
              defaultValue: "Rxe9initialiserchoix"
            })}</Button>
          </div>

          {testResult && <Alert className="mt-3">
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>}
        </div>

        {/* Technical Details */}
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">{t("Dxe9tailstechniques", {
            defaultValue: "Dxe9tailstechniques"
          })}</summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <p><strong>{t("Paysdxe9tectxe9s", {
                defaultValue: "Paysdxe9tectxe9s"
              })}</strong>{t("Francefrbelgiquebesu", {
              defaultValue: "Francefrbelgiquebesu"
            })}</p>
            <p><strong>{t("Mxe9thodesdedxe9clen", {
                defaultValue: "Mxe9thodesdedxe9clen"
              })}</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>{t('Attribut HTML translate="yes"', {
                defaultValue: 'Attribut HTML translate="yes"'
              })}</li>
              <li>{t("Metatagspoursuggesti", {
                defaultValue: "Metatagspoursuggesti"
              })}</li>
              <li>{t("Apismoderneschrometr", {
                defaultValue: "Apismoderneschrometr"
              })}</li>
              <li>{t("Fallbackgoogletransl", {
                defaultValue: "Fallbackgoogletransl"
              })}</li>
            </ul>
            <p><strong>{t("Stockage", {
                defaultValue: "Stockage"
              })}</strong>{t("Prxe9fxe9rencesutili", {
              defaultValue: "Prxe9fxe9rencesutili"
            })}</p>
            <p><strong>{t("Performance", {
                defaultValue: "Performance"
              })}</strong>{t("40100mslatencepourgx", {
              defaultValue: "40100mslatencepourgx"
            })}</p>
          </div>
        </details>
      </CardContent>
    </Card>;
}