import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, FileText, Grid3x3, FormInput, CheckCircle, Calendar, DollarSign, Sparkles, Image } from 'lucide-react';

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
    label: 'Hero Section',
    description: 'Grande section d\'en-tête avec titre et image/vidéo',
    icon: Home,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <h1 className="text-xl font-bold mb-1">Titre Hero</h1>
              <p className="text-xs opacity-90">Sous-titre descriptif</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text_section',
    label: 'Text',
    description: 'Section de texte avec titre, séparateur et sous-titre',
    icon: FileText,
    preview: (
      <div className="w-full bg-white p-4 rounded-lg border">
        <h2 className="text-lg font-bold text-center mb-2">Titre de Section</h2>
        <div className="w-12 h-0.5 bg-[#3BA8AF] mx-auto mb-2"></div>
        <p className="text-xs text-gray-600 text-center mb-2">Sous-titre descriptif</p>
        <div className="space-y-1">
          <div className="h-1.5 bg-gray-200 rounded"></div>
          <div className="h-1.5 bg-gray-200 rounded"></div>
          <div className="h-1.5 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    )
  },
  {
    type: 'card_grid_date',
    label: 'Card Grid Date',
    description: 'Grille de cartes avec dates (événements, tours)',
    icon: Calendar,
    preview: (
      <div className="w-full bg-white p-3 rounded-lg border">
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 p-1.5 rounded border">
              <div className="w-full h-12 bg-gray-200 rounded mb-1.5"></div>
              <div className="h-1 bg-gray-300 rounded mb-1"></div>
              <div className="flex items-center gap-0.5">
                <Calendar className="w-2.5 h-2.5 text-[#084F6E]" />
                <div className="h-1 bg-[#3BA8AF] rounded flex-1"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'form',
    label: 'Form',
    description: 'Formulaire personnalisable avec champs dynamiques',
    icon: FormInput,
    preview: (
      <div className="w-full bg-white p-3 rounded-lg border">
        <h3 className="text-sm font-semibold mb-2">Formulaire</h3>
        <div className="space-y-1.5">
          <div className="h-6 bg-gray-50 border rounded"></div>
          <div className="h-6 bg-gray-50 border rounded"></div>
          <div className="h-14 bg-gray-50 border rounded"></div>
          <div className="h-6 bg-[#084F6E] rounded w-20"></div>
        </div>
      </div>
    )
  },
  {
    type: 'card_grid_price',
    label: 'Card Grid Price',
    description: 'Grille de cartes avec prix (produits, tours)',
    icon: DollarSign,
    preview: (
      <div className="w-full bg-white p-3 rounded-lg border">
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 p-1.5 rounded border">
              <div className="w-full h-12 bg-gray-200 rounded mb-1.5"></div>
              <div className="h-1 bg-gray-300 rounded mb-1"></div>
              <div className="flex items-center gap-0.5">
                <span className="text-[#084F6E] font-bold text-[10px]">฿</span>
                <div className="h-1 bg-[#3BA8AF] rounded w-6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'advantages',
    label: 'Text + Icones',
    description: 'Section avec texte et icônes (avantages, caractéristiques)',
    icon: CheckCircle,
    preview: (
      <div className="w-full bg-white p-3 rounded-lg border">
        <h3 className="text-sm font-semibold text-center mb-1">Nos Avantages</h3>
        <div className="w-12 h-0.5 bg-[#3BA8AF] mx-auto mb-2"></div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gray-50 p-2 rounded text-center">
              <div className="w-8 h-8 bg-[#084F6E] rounded-full flex items-center justify-center mx-auto mb-1">
                <CheckCircle className="w-4 h-4 text-white" />
              </div>
              <div className="h-1 bg-gray-300 rounded mb-0.5"></div>
              <div className="h-0.5 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'text_image',
    label: 'Text + Images',
    description: 'Section avec texte et image côte à côte',
    icon: Image,
    preview: (
      <div className="w-full bg-white p-3 rounded-lg border">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="h-2 bg-gray-800 rounded mb-1.5 w-3/4"></div>
            <div className="h-1.5 bg-gray-400 rounded mb-1 w-full"></div>
            <div className="space-y-0.5 mt-2">
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded"></div>
              <div className="h-1 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
          <div className="bg-gray-200 rounded flex items-center justify-center">
            <Image className="w-6 h-6 text-gray-400" />
          </div>
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
      <DialogContent className="max-w-5xl h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Ajouter un bloc</DialogTitle>
        </DialogHeader>

        <div className="flex gap-4 flex-1 min-h-0">
          {/* Liste des types de blocs */}
          <ScrollArea className="w-56 border rounded-lg flex-shrink-0">
            <div className="p-2 space-y-1.5">
              {blockTypes.map((blockType) => {
                return (
                  <Card
                    key={blockType.type}
                    className={`p-3 cursor-pointer transition-all hover:border-[#084F6E] ${
                      selectedType === blockType.type ? 'border-[#084F6E] bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedType(blockType.type)}
                    data-testid={`block-type-${blockType.type}`}
                  >
                    <div className="font-semibold text-sm mb-1">{blockType.label}</div>
                    <div className="text-xs text-gray-600">{blockType.description}</div>
                  </Card>
                );
              })}
            </div>
          </ScrollArea>

          {/* Prévisualisation */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50 overflow-auto">
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

        <DialogFooter className="mt-4">
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
