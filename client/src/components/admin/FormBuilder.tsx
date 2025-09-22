// FormBuilder temporairement désactivé à cause de corruptions du script automatique
// Le fichier original est sauvé comme FormBuilder.tsx.BROKEN.bak

import { useTranslation } from 'react-i18next';

export interface FormBuilderProps {
  initialForm?: any;
  onSave?: (form: any) => void;
  onSaveDraft?: (form: any) => void;
  onCancel?: () => void;
}

export default function FormBuilder({ initialForm, onSave, onSaveDraft, onCancel }: FormBuilderProps) {
  const { t } = useTranslation();
  
  return (
    <div className="p-8 text-center">
      <h2 className="text-xl font-semibold mb-4">FormBuilder temporairement indisponible</h2>
      <p className="text-gray-600 mb-4">
        Le FormBuilder est temporairement désactivé pendant la migration i18n.
      </p>
      <p className="text-sm text-gray-500">
        Fichier original sauvé dans FormBuilder.tsx.BROKEN.bak
      </p>
    </div>
  );
}