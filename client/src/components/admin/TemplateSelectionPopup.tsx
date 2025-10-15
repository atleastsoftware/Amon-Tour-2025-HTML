import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, FileText, Sparkles, Layout, Ship, MessageSquare, Palette } from 'lucide-react';
import { getFullBlockPreviews } from './SharedBlockPreviews';

interface BlockPreview {
  type: string;
  label: string;
  preview: JSX.Element;
}

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  blocks: BlockPreview[];
}

// Get mini previews from shared block previews
const getBlockPreviews = () => {
  const fullPreviews = getFullBlockPreviews();
  const miniPreviews: { [key: string]: BlockPreview } = {};
  
  Object.keys(fullPreviews).forEach(key => {
    const block = fullPreviews[key];
    miniPreviews[key] = {
      type: block.type,
      label: block.label,
      preview: block.miniPreview || block.preview
    };
  });
  
  return miniPreviews;
};

const blockPreviews = getBlockPreviews();

const templates: Template[] = [
  {
    id: 'home',
    name: 'Home',
    description: 'Page d\'accueil complète avec héro, présentation, tours et formulaire',
    icon: Layout,
    blocks: [
      blockPreviews.hero,
      blockPreviews.text,
      blockPreviews.popular_experiences,
      blockPreviews.custom_tour_form,
      blockPreviews.tour_ninja_section,
      blockPreviews.why_choose_us,
      blockPreviews.who_we_are
    ]
  },
  {
    id: 'tours',
    name: 'Tours',
    description: 'Page pour afficher et rechercher les tours disponibles',
    icon: Palette,
    blocks: [
      blockPreviews.header_page,
      blockPreviews.search_bar_tours
    ]
  },
  {
    id: 'cruise',
    name: 'Cruise',
    description: 'Page complète pour présenter une croisière avec galerie, vidéo et formulaire',
    icon: Ship,
    blocks: [
      blockPreviews.header_page,
      blockPreviews.why_choose_us,
      blockPreviews.text_gallery,
      blockPreviews.text_video,
      blockPreviews.text_listing,
      blockPreviews.custom_tour_form
    ]
  },
  {
    id: 'custom',
    name: 'Custom',
    description: 'Page pour les voyages sur mesure avec tarifs et formulaire',
    icon: Sparkles,
    blocks: [
      blockPreviews.header_page,
      blockPreviews.why_choose_us,
      blockPreviews.text_pricing,
      blockPreviews.custom_tour_form
    ]
  },
  {
    id: 'blog',
    name: 'Blog',
    description: 'Page pour afficher et rechercher les articles du blog',
    icon: FileText,
    blocks: [
      blockPreviews.header_page,
      blockPreviews.blog_search
    ]
  },
  {
    id: 'contact',
    name: 'Contact',
    description: 'Page de contact avec informations et boutons d\'action',
    icon: MessageSquare,
    blocks: [
      blockPreviews.header_page,
      blockPreviews.contact,
      blockPreviews.text
    ]
  }
];

interface TemplateSelectionPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
}

export default function TemplateSelectionPopup({ isOpen, onClose, onSelectTemplate }: TemplateSelectionPopupProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const handleSelectTemplate = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate.id);
      setSelectedTemplate(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ajouter un template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un template pour ajouter plusieurs blocs à la suite
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4 overflow-hidden flex-1 min-h-0">
          <div className="col-span-1 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Bibliothèque de templates</h3>
            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              <div className="space-y-2 pb-8">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <Card
                      key={template.id}
                      className={`p-4 cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id 
                          ? 'border-[#3BA8AF] bg-[#3BA8AF]/5 shadow-md' 
                          : 'border-gray-200 hover:border-[#3BA8AF]/50'
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedTemplate?.id === template.id 
                            ? 'bg-[#3BA8AF]' 
                            : 'bg-gray-100'
                        }`}>
                          <Icon className={`h-5 w-5 ${
                            selectedTemplate?.id === template.id 
                              ? 'text-white' 
                              : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm mb-1">{template.name}</h4>
                          <p className="text-xs text-gray-500">{template.description}</p>
                          <p className="text-xs text-[#3BA8AF] mt-2 font-medium">
                            {template.blocks.length} blocs
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="col-span-2 flex flex-col min-h-0">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              {selectedTemplate ? `Prévisualisation: ${selectedTemplate.name}` : 'Sélectionnez un template'}
            </h3>
            <div className="flex-1 overflow-y-auto pr-4 min-h-0">
              {selectedTemplate ? (
                <div className="space-y-4 pb-8">
                  {selectedTemplate.blocks.map((block, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -left-8 top-4 w-6 h-6 rounded-full bg-[#3BA8AF] text-white flex items-center justify-center text-xs font-semibold">
                        {index + 1}
                      </div>
                      <div className="mb-2">
                        <span className="text-xs font-semibold text-gray-600">{block.label}</span>
                      </div>
                      {block.preview}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <Layout className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <p className="text-sm">Sélectionnez un template pour voir le détail</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSelectTemplate}
            disabled={!selectedTemplate}
            className="bg-[#3BA8AF] hover:bg-[#3BA8AF]/90"
          >
            Ajouter le template
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
