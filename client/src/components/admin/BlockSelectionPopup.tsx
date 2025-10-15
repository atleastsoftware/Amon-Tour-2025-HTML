import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, FileText, FormInput, Calendar, DollarSign, Sparkles, Search, Mail, Images, Video, List } from 'lucide-react';
import { getFullBlockPreviews } from './SharedBlockPreviews';

interface BlockType {
  type: string;
  label: string;
  description: string;
  icon: any;
  preview: JSX.Element;
}

// Icon mapping for each block type
const blockIcons: Record<string, any> = {
  hero: Home,
  header_page: Home,
  text: FileText,
  popular_experiences: Calendar,
  custom_tour_form: FormInput,
  tour_ninja_section: DollarSign,
  why_choose_us: Sparkles,
  who_we_are: Images,
  search_bar_tours: Search,
  contact: Mail,
  blog_search: Search,
  text_gallery: Images,
  text_video: Video,
  text_listing: List,
  text_pricing: DollarSign
};

// Description mapping for each block type
const blockDescriptions: Record<string, string> = {
  hero: 'Grande bannière d\'accueil avec titre, sous-titre et boutons CTA',
  header_page: 'En-tête de page avec titre, sous-titre et image de fond',
  text: 'Section de texte avec titre, contenu et boutons d\'action',
  popular_experiences: 'Grille de cartes avec badges de durée',
  custom_tour_form: 'Formulaire avec image et champs personnalisables',
  tour_ninja_section: 'Grille de cartes avec prix',
  why_choose_us: 'Section avec icônes et descriptions',
  who_we_are: 'Section combinant texte et images',
  search_bar_tours: 'Barre de recherche pour afficher des tours',
  contact: 'Section avec informations de contact',
  blog_search: 'Barre de recherche pour afficher des articles de blog',
  text_gallery: 'Section avec titre et galerie d\'images',
  text_video: 'Section avec titre et vidéo YouTube',
  text_listing: 'Section avec liste à puces personnalisable',
  text_pricing: 'Section avec cartes de prix personnalisables'
};

// Generate block types from shared previews
const generateBlockTypes = (): BlockType[] => {
  const fullPreviews = getFullBlockPreviews();
  
  return Object.keys(fullPreviews).map(key => {
    const block = fullPreviews[key];
    return {
      type: block.type,
      label: block.label,
      description: blockDescriptions[block.type] || 'Description du bloc',
      icon: blockIcons[block.type] || FileText,
      preview: block.preview
    };
  });
};

const blockTypes = generateBlockTypes();

interface BlockSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (blockType: string) => void;
}

export default function BlockSelectionPopup({ isOpen, onClose, onSelectBlock }: BlockSelectionPopupProps) {
  const [selectedBlock, setSelectedBlock] = useState<BlockType | null>(null);

  const handleAddBlock = () => {
    if (selectedBlock) {
      onSelectBlock(selectedBlock.type);
      setSelectedBlock(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ajouter un bloc</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Choisissez un type de bloc à ajouter à votre page
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4 overflow-hidden flex-1 min-h-0">
          {/* Left column - Block list */}
          <div className="col-span-1 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Bibliothèque de blocs</h3>
            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              <div className="space-y-2 pb-8">
                {blockTypes.map((block) => {
                  const Icon = block.icon;
                  return (
                    <Card
                      key={block.type}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedBlock?.type === block.type 
                          ? 'border-[#3BA8AF] bg-[#3BA8AF]/5 shadow-md' 
                          : 'border-gray-200 hover:border-[#3BA8AF]/50'
                      }`}
                      onClick={() => setSelectedBlock(block)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedBlock?.type === block.type 
                            ? 'bg-[#3BA8AF]' 
                            : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            selectedBlock?.type === block.type 
                              ? 'text-white' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{block.label}</h4>
                          <p className="text-xs text-gray-500">{block.description}</p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right column - Preview */}
          <div className="col-span-2 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              {selectedBlock ? `Prévisualisation: ${selectedBlock.label}` : 'Sélectionnez un bloc'}
            </h3>
            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              {selectedBlock ? (
                <div className="pb-8">
                  {selectedBlock.preview}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <FormInput className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Sélectionnez un bloc pour voir la prévisualisation</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleAddBlock}
            disabled={!selectedBlock}
            className="bg-[#3BA8AF] hover:bg-[#3BA8AF]/90"
          >
            Ajouter le bloc
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
