import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Switch } from "@/components/ui/switch";
import { autoTranslate } from "@/lib/autoTranslate";
import { Globe, Settings, TestTube, Info } from "lucide-react";

export default function TranslationManager() {
  const [isAutoEnabled, setIsAutoEnabled] = useState(
    localStorage.getItem('amon-tour-auto-translate') !== 'disabled'
  );
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
    try {
      // Clear previous state
      localStorage.removeItem('amon-tour-translation-choice');
      
      // Trigger manual test
      autoTranslate.manualTrigger();
      setTestResult('Test déclenché ! Vérifiez si une notification de traduction apparaît.');
      
      // Clear test result after 5 seconds
      setTimeout(() => setTestResult(null), 5000);
    } catch (error) {
      setTestResult('Erreur lors du test de traduction');
    }
  };

  const handleResetChoices = () => {
    localStorage.removeItem('amon-tour-translation-choice');
    setTestResult('Choix utilisateur réinitialisés. La détection automatique se redéclenchera.');
    setTimeout(() => setTestResult(null), 3000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Globe className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-lg font-heading">Gestion de la Traduction Automatique</CardTitle>
            <CardDescription>
              Configuration de la traduction automatique basée sur la géolocalisation IP
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">🇫🇷</div>
            <div className="text-sm font-medium text-green-800">Cible Principale</div>
            <div className="text-xs text-green-600">Utilisateurs français</div>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">🌐</div>
            <div className="text-sm font-medium text-blue-800">Service IP</div>
            <div className="text-xs text-blue-600">ip-api.com (gratuit)</div>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">⚡</div>
            <div className="text-sm font-medium text-purple-800">Traducteurs</div>
            <div className="text-xs text-purple-600">Chrome, Edge, Firefox</div>
          </div>
        </div>

        {/* Auto-Translation Toggle */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center space-x-3">
            <Settings className="h-5 w-5 text-gray-500" />
            <div>
              <div className="font-medium">Traduction automatique</div>
              <div className="text-sm text-gray-500">
                Activer la détection automatique pour les visiteurs français
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAutoEnabled}
              onCheckedChange={handleToggleAuto}
            />
            <Badge variant={isAutoEnabled ? "success" : "secondary"}>
              {isAutoEnabled ? "Activé" : "Désactivé"}
            </Badge>
          </div>
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Comment ça fonctionne :</strong> Le système détecte automatiquement les visiteurs 
            français (France, Belgique, Suisse, Canada) et déclenche les traducteurs natifs 
            des navigateurs (Chrome Translate, Edge Translator, Firefox Translate).
          </AlertDescription>
        </Alert>

        {/* Test Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              Tests et Contrôles
            </h4>
          </div>
          
          <div className="flex gap-3 flex-wrap">
            <Button 
              variant="outline" 
              onClick={handleTestTranslation}
              className="flex items-center gap-2"
            >
              <Globe className="h-4 w-4" />
              Tester la Traduction
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleResetChoices}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Réinitialiser Choix
            </Button>
          </div>

          {testResult && (
            <Alert className="mt-3">
              <AlertDescription>{testResult}</AlertDescription>
            </Alert>
          )}
        </div>

        {/* Technical Details */}
        <details className="border rounded-lg p-4">
          <summary className="cursor-pointer font-medium text-sm">
            Détails techniques
          </summary>
          <div className="mt-3 text-xs text-gray-600 space-y-2">
            <p><strong>Pays détectés :</strong> France (FR), Belgique (BE), Suisse (CH), Canada (CA), Monaco (MC), Luxembourg (LU)</p>
            <p><strong>Méthodes de déclenchement :</strong></p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Attribut HTML translate="yes"</li>
              <li>Meta tags pour suggestions de traduction</li>
              <li>APIs modernes (Chrome Translator API, Firefox local)</li>
              <li>Fallback Google Translate Widget si disponible</li>
            </ul>
            <p><strong>Stockage :</strong> Préférences utilisateur en localStorage</p>
            <p><strong>Performance :</strong> ~40-100ms latence pour géolocalisation IP</p>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}