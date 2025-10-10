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
      <div className="w-full bg-gray-100 rounded-lg overflow-hidden">
        <div className="relative h-40 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-2">Titre Hero</h1>
              <p className="text-sm opacity-90">Sous-titre descriptif</p>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text_section',
    label: 'Text',
    description: 'Section de texte simple avec titre',
    icon: FileText,
    preview: (
      <div className="w-full bg-white p-6 rounded-lg border">
        <h2 className="text-xl font-bold mb-3 text-center">Titre de Section</h2>
        <p className="text-sm text-gray-600 text-center mb-2">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </p>
        <p className="text-sm text-gray-600 text-center">
          Sed do eiusmod tempor incididunt ut labore et dolore.
        </p>
      </div>
    )
  },
  {
    type: 'card_grid_date',
    label: 'Card Grid Date',
    description: 'Grille de cartes avec dates (événements, tours)',
    icon: Calendar,
    preview: (
      <div className="w-full bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-2 rounded shadow-sm border">
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded mb-2"></div>
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#084F6E]" />
                <div className="h-1.5 bg-[#3BA8AF] rounded w-12"></div>
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
      <div className="w-full bg-gray-50 p-6 rounded-lg">
        <h3 className="text-lg font-semibold mb-3">Formulaire</h3>
        <div className="space-y-2">
          <div className="h-8 bg-white border rounded"></div>
          <div className="h-8 bg-white border rounded"></div>
          <div className="h-20 bg-white border rounded"></div>
          <div className="h-8 bg-[#084F6E] rounded w-24"></div>
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
      <div className="w-full bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-2 rounded shadow-sm border">
              <div className="w-full h-16 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-300 rounded mb-2"></div>
              <div className="flex items-center gap-1">
                <span className="text-[#084F6E] font-bold text-xs">฿</span>
                <div className="h-2 bg-[#3BA8AF] rounded w-8"></div>
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
      <div className="w-full bg-white p-6 rounded-lg border">
        <h3 className="text-lg font-semibold mb-4 text-center">Nos Avantages</h3>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#3BA8AF] rounded-full flex items-center justify-center text-white text-xs flex-shrink-0">✓</div>
              <div className="h-2 bg-gray-300 rounded flex-1"></div>
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
      <div className="w-full bg-white p-4 rounded-lg border">
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="h-3 bg-gray-800 rounded mb-2 w-3/4"></div>
            <div className="h-2 bg-gray-300 rounded mb-1"></div>
            <div className="h-2 bg-gray-300 rounded mb-1"></div>
            <div className="h-2 bg-gray-300 rounded w-2/3"></div>
          </div>
          <div className="w-24 h-20 bg-gray-200 rounded flex items-center justify-center flex-shrink-0">
            <Image className="w-8 h-8 text-gray-400" />
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
