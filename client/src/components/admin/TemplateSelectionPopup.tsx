import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Home, FileText, Grid3x3, FormInput, Calendar, DollarSign, Sparkles, Image, Layout } from 'lucide-react';

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

const getBlockPreviews = (): { [key: string]: BlockPreview } => ({
  hero: {
    type: 'hero',
    label: 'Hero Section',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border">
        <div className="relative h-32 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF]">
          <div className="absolute inset-0 bg-black/40"></div>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-3">
            <h1 className="text-sm font-bold mb-1 text-center">Titre principal</h1>
            <p className="text-xs opacity-90 mb-1.5 text-center">Sous-titre</p>
            <div className="flex gap-1.5">
              <div className="px-2 py-0.5 bg-white text-[#084F6E] rounded text-xs font-semibold">
                Bouton 1
              </div>
              <div className="px-2 py-0.5 border border-white rounded text-xs font-semibold">
                Bouton 2
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  },
  text: {
    type: 'text',
    label: 'Text + Buttons',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
            Ajoutez ici le contenu de votre section de texte. Vous pouvez décrire vos services, partager votre histoire, ou présenter des informations importantes.
          </p>
          <div className="flex gap-1.5 justify-center">
            <div className="px-2 py-0.5 bg-[#084F6E] text-white rounded text-xs">Bouton 1</div>
            <div className="px-2 py-0.5 border border-[#084F6E] text-[#084F6E] rounded text-xs">Bouton 2</div>
          </div>
        </div>
      </div>
    )
  },
  popular_experiences: {
    type: 'popular_experiences',
    label: 'Card Grid Date',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec badges de durée.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-0.5 right-0.5 bg-white px-1 py-0.5 rounded text-xs">1 jour</div>
              </div>
              <div className="p-1.5 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  custom_tour_form: {
    type: 'custom_tour_form',
    label: 'Form',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre du formulaire
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre formulaire personnalisé.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] rounded h-16"></div>
          <div className="space-y-1.5">
            <div className="h-5 bg-gray-100 rounded"></div>
            <div className="h-5 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  tour_ninja_section: {
    type: 'tour_ninja_section',
    label: 'Card Grid Price',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre grille de cartes avec prix.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white border rounded overflow-hidden">
              <div className="h-12 bg-gradient-to-r from-[#084F6E] to-[#3BA8AF] relative">
                <div className="absolute top-0.5 right-0.5 bg-white px-1 py-0.5 rounded text-xs">Prix</div>
              </div>
              <div className="p-1.5 bg-white">
                <div className="text-xs font-semibold">Tour Name</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  why_choose_us: {
    type: 'why_choose_us',
    label: 'Text + Icones',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="text-center mb-3">
          <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
            Titre de la section
          </h2>
          <div className="w-12 h-0.5 mx-auto mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
          <p className="text-xs leading-relaxed" style={{ color: '#666666' }}>
            Description de votre section avec icônes.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: 'fas fa-user-friends', color: '#084F6E' },
            { icon: 'fas fa-compass', color: '#3BA8AF' },
            { icon: 'fas fa-star', color: '#084F6E' }
          ].map((item, i) => (
            <div key={i} className="text-center border rounded p-2 bg-white">
              <div className="w-8 h-8 rounded-full mx-auto mb-1.5 flex items-center justify-center" style={{ backgroundColor: item.color }}>
                <i className={`${item.icon} text-white text-xs`}></i>
              </div>
              <div className="text-xs font-semibold mb-0.5">Titre</div>
              <div className="text-xs text-gray-500">Description</div>
            </div>
          ))}
        </div>
      </div>
    )
  },
  who_we_are: {
    type: 'who_we_are',
    label: 'Text + Images',
    preview: (
      <div className="w-full bg-white rounded-lg overflow-hidden border p-4">
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col">
            <h2 className="font-bold text-sm mb-1.5" style={{ color: '#333333' }}>
              Titre principal
            </h2>
            <div className="w-10 h-0.5 mb-2" style={{ backgroundColor: '#3BA8AF' }}></div>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
              Ajoutez ici votre contenu texte principal.
            </p>
            <h3 className="font-bold text-xs mb-1" style={{ color: '#333333' }}>
              Sous-titre
            </h3>
            <p className="text-xs leading-relaxed mb-2" style={{ color: '#666666' }}>
              Description supplémentaire pour votre section.
            </p>
            <div className="flex gap-1.5 mt-auto">
              <div className="px-2 py-0.5 rounded text-xs font-semibold" style={{ backgroundColor: '#084F6E', color: '#ffffff' }}>
                Bouton 1
              </div>
              <div className="px-2 py-0.5 rounded text-xs font-semibold border-2" style={{ borderColor: '#084F6E', color: '#084F6E' }}>
                Bouton 2 →
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-[#084F6E] to-[#3BA8AF] rounded h-full min-h-[120px]"></div>
        </div>
      </div>
    )
  }
});

const templates: Template[] = [
  {
    id: 'home',
    name: 'Home',
    description: 'Page d\'accueil complète avec héro, présentation, tours et formulaire',
    icon: Layout,
    blocks: [
      getBlockPreviews().hero,
      getBlockPreviews().text,
      getBlockPreviews().popular_experiences,
      getBlockPreviews().custom_tour_form,
      getBlockPreviews().tour_ninja_section,
      getBlockPreviews().why_choose_us,
      getBlockPreviews().who_we_are
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
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Ajouter un template</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Sélectionnez un template pour ajouter plusieurs blocs à la suite
          </p>
        </DialogHeader>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="col-span-1">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">Bibliothèque de templates</h3>
            <ScrollArea className="h-[450px] pr-4">
              <div className="space-y-2">
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
            </ScrollArea>
          </div>

          <div className="col-span-2">
            <h3 className="text-sm font-semibold mb-3 text-gray-700">
              {selectedTemplate ? `Prévisualisation: ${selectedTemplate.name}` : 'Sélectionnez un template'}
            </h3>
            <ScrollArea className="h-[450px] pr-4">
              {selectedTemplate ? (
                <div className="space-y-4">
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
            </ScrollArea>
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
