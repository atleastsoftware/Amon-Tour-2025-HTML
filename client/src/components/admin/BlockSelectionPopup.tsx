import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, FileText, Grid3x3, FormInput, CheckCircle } from 'lucide-react';

interface BlockType {
  type: string;
  label: string;
  description: string;
  icon: any;
  preview: JSX.Element;
}

const blockTypes: BlockType[] = [
  {
    type: 'hero',
    label: 'Hero',
    description: 'Grande section d\'en-tête avec titre et vidéo/image',
    icon: Home,
    preview: (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 rounded-lg text-white">
        <h1 className="text-4xl font-bold mb-2">Titre Hero</h1>
        <p className="text-xl opacity-90">Description de votre section principale</p>
      </div>
    )
  },
  {
    type: 'text_image',
    label: 'Texte & Image',
    description: 'Section avec texte et image côte à côte',
    icon: FileText,
    preview: (
      <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-2">Titre de section</h3>
          <p className="text-gray-600">Texte descriptif avec une image associée...</p>
        </div>
        <div className="w-32 h-24 bg-gray-300 rounded flex items-center justify-center text-gray-500 text-sm">
          Image
        </div>
      </div>
    )
  },
  {
    type: 'card_grid',
    label: 'Grille de Cartes',
    description: 'Grille de cartes pour afficher du contenu',
    icon: Grid3x3,
    preview: (
      <div className="grid grid-cols-3 gap-2 p-4 bg-gray-50 rounded-lg">
        {[1, 2, 3].map(i => (
          <div key={i} className="bg-white p-3 rounded shadow-sm">
            <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
            <div className="h-2 bg-gray-300 rounded mb-1"></div>
            <div className="h-2 bg-gray-200 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    )
  },
  {
    type: 'form',
    label: 'Formulaire',
    description: 'Formulaire personnalisable avec champs dynamiques',
    icon: FormInput,
    preview: (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Formulaire de contact</h3>
        <div className="space-y-2">
          <div className="h-8 bg-white border rounded"></div>
          <div className="h-8 bg-white border rounded"></div>
          <div className="h-20 bg-white border rounded"></div>
          <div className="h-8 bg-blue-500 rounded w-32"></div>
        </div>
      </div>
    )
  },
  {
    type: 'advantages',
    label: 'Avantages',
    description: 'Section pour présenter vos avantages/points forts',
    icon: CheckCircle,
    preview: (
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="text-xl font-semibold mb-3 text-center">Nos Avantages</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs">✓</div>
              <span className="text-sm">Avantage {i}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
];

interface BlockSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (blockType: string) => void;
}

export default function BlockSelectionPopup({ isOpen, onClose, onSelect }: BlockSelectionPopupProps) {
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleAdd = () => {
    if (selectedType) {
      onSelect(selectedType);
      setSelectedType(null);
      onClose();
    }
  };

  const handleCancel = () => {
    setSelectedType(null);
    onClose();
  };

  const selectedBlock = blockTypes.find(b => b.type === selectedType);

  return (
    <Dialog open={isOpen} onOpenChange={handleCancel}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Ajouter un bloc</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 h-[500px]">
          {/* Liste des types de blocs */}
          <ScrollArea className="w-64 border rounded-lg">
            <div className="p-2 space-y-1">
              {blockTypes.map((blockType) => {
                const Icon = blockType.icon;
                return (
                  <Card
                    key={blockType.type}
                    className={`p-3 cursor-pointer transition-all hover:border-blue-500 ${
                      selectedType === blockType.type ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedType(blockType.type)}
                    data-testid={`block-type-${blockType.type}`}
                  >
                    <div className="flex items-start gap-2">
                      <Icon className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-sm">{blockType.label}</div>
                        <div className="text-xs text-gray-600 mt-1">{blockType.description}</div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Prévisualisation */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Prévisualisation</h3>
            {selectedBlock ? (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                {selectedBlock.preview}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                Sélectionnez un type de bloc pour voir la prévisualisation
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} data-testid="button-cancel-block">
            Annuler
          </Button>
          <Button 
            onClick={handleAdd} 
            disabled={!selectedType}
            data-testid="button-add-block"
          >
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
