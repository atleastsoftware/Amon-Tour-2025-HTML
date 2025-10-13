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
    description: 'Grande bannière avec titre, sous-titre et boutons CTA',
    icon: Home,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
            <h1 className="text-lg font-bold mb-1 text-center">Titre principal</h1>
            <p className="text-xs opacity-90 mb-2 text-center">Sous-titre descriptif</p>
            <div className="flex gap-2">
              <div className="px-3 py-1 bg-white text-[#084F6E] rounded text-xs font-semibold">
                Bouton 1
              </div>
              <div className="px-3 py-1 border border-white rounded text-xs font-semibold">
                Bouton 2
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'header_page',
    label: 'Header Page',
    description: 'En-tête de page avec titre et sous-titre (style "Our Experiences")',
    icon: Home,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-20 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
            <h1 className="text-base font-bold mb-0.5 text-center">Our Experiences</h1>
            <p className="text-xs opacity-90 text-center">Découvrez la beauté exceptionnelle...</p>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'text',
    label: 'Text',
    description: 'Section de texte avec titre et contenu',
    icon: FileText,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center max-w-4xl mx-auto">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-sm leading-relaxed" style={{ color: '#666666' }}>
            Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes.
          </p>
        </div>
      </div>
    )
  },
  {
    type: 'popular_experiences',
    label: 'Card Grid Date',
    description: 'Grille de cartes avec badges de durée',
    icon: Calendar,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec badges de durée.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded aspect-video relative">
              <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded text-xs">
                1 jour
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'custom_tour_form',
    label: 'Form',
    description: 'Formulaire avec image et champs personnalisables',
    icon: FormInput,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre du formulaire
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre formulaire personnalisé.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-20"></div>
          <div className="space-y-2">
            <div className="h-6 bg-gray-100 rounded"></div>
            <div className="h-6 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    type: 'tour_ninja_section',
    label: 'Card Grid Price',
    description: 'Grille de cartes avec badges de prix',
    icon: DollarSign,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec prix.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded aspect-video relative">
              <div className="absolute top-2 right-2 bg-white px-2 py-0.5 rounded text-xs">
                Prix
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'why_choose_us',
    label: 'Text + Icones',
    description: 'Section avec icônes, titres et descriptions',
    icon: Sparkles,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="text-center mb-4">
          <h2 className="font-bold text-lg mb-2" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-16 h-0.5 mx-auto mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre section avec icônes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded-lg p-3 bg-white">
              <div className="w-10 h-10 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-sm`}></i>
              </div>
              <div className="text-xs font-semibold mb-1">Titre</div>
              <div className="text-xs text-gray-500">Description</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  {
    type: 'who_we_are',
    label: 'Text + Images',
    description: 'Section avec contenu texte et images',
    icon: Image,
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col">
            <h2 className="font-bold text-base mb-2" style={{ color: '#333333' }}>
              Titre principal
            </h2>
            <div className="w-12 h-0.5 mb-3" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>
              Ajoutez ici votre contenu texte principal.
            </p>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#333333' }}>
              Sous-titre
            </h3>
            <p className="text-xs leading-relaxed mb-3" style={{ color: '#666666' }}>
              Description supplémentaire pour votre section.
            </p>
            <div className="flex gap-2 mt-auto">
              <div className="px-3 py-1 rounded text-xs font-semibold" style={{ backgroundColor: '#084F6E', color: '#ffffff' }}>
                Bouton 1
              </div>
              <div className="px-3 py-1 rounded text-xs font-semibold border-2" style={{ borderColor: '#084F6E', color: '#084F6E' }}>
                Bouton 2 →
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#084F6E] to-[#3BA8AF] rounded h-full min-h-[180px]"></div>
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

  // Trier les blocs par ordre alphabétique
  const sortedBlockTypes = [...blockTypes].sort((a, b) => a.label.localeCompare(b.label));
  
  const selectedBlock = sortedBlockTypes.find(b => b.type === selectedType);

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
              {sortedBlockTypes.map((blockType) => {
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
