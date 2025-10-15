import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddPageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pageSlug: string) => void;
}

interface PageConfiguration {
  id: number;
  pageName: string;
  pageSlug: string;
  pageType: 'main' | 'secondary' | 'legal';
  isActive: boolean;
}

export function AddPageModal({ isOpen, onClose, onSuccess }: AddPageModalProps) {
  const { toast } = useToast();
  const [pageName, setPageName] = useState('');
  const [createMode, setCreateMode] = useState<'new' | 'duplicate' | 'legal'>('new');
  const [sourcePageId, setSourcePageId] = useState<string>('');

  // Récupérer la liste des pages existantes pour la duplication
  const { data: existingPages = [] } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
    enabled: isOpen,
  });

  // Mutation pour créer une nouvelle page
  const createPageMutation = useMutation({
    mutationFn: async (data: { 
      pageName: string; 
      pageSlug: string;
      pageType: string;
      isActive: boolean;
      sourcePageId?: number;
    }) => {
      const response = await apiRequest('POST', '/api/admin/page-configurations', data);
      return response.json();
    },
    onSuccess: async (data: any) => {
      toast({
        title: "Succès",
        description: "La page a été créée avec succès",
      });
      // Invalider et attendre le rechargement des données
      await queryClient.invalidateQueries({ queryKey: ['/api/admin/page-configurations'] });
      await queryClient.refetchQueries({ queryKey: ['/api/admin/page-configurations'] });
      
      // Appeler le callback avec le slug de la nouvelle page
      onSuccess(data.pageSlug);
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer la page",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = () => {
    if (!pageName.trim()) {
      toast({
        title: "Erreur",
        description: "Le nom de la page est requis",
        variant: "destructive",
      });
      return;
    }

    if (createMode === 'duplicate' && !sourcePageId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une page à dupliquer",
        variant: "destructive",
      });
      return;
    }

    // Générer le slug à partir du nom
    let pageSlug = pageName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
      .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
      .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin
    
    // Vérifier si le slug existe déjà et afficher une erreur
    const existingSlugs = existingPages.map(p => p.pageSlug);
    
    if (existingSlugs.includes(pageSlug)) {
      toast({
        title: "Erreur",
        description: "Une page avec ce nom existe déjà. Veuillez choisir un nom différent.",
        variant: "destructive",
      });
      return;
    }

    const data = {
      pageName,
      pageSlug,
      pageType: createMode === 'legal' ? 'legal' : 'secondary', // Page légale si mode legal, sinon secondaire
      isActive: createMode === 'legal' ? true : false, // Pages légales actives par défaut, autres en brouillon
      ...(createMode === 'duplicate' && sourcePageId ? { sourcePageId: parseInt(sourcePageId) } : {})
    };

    createPageMutation.mutate(data);
  };

  const handleClose = () => {
    setPageName('');
    setCreateMode('new');
    setSourcePageId('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle page</DialogTitle>
          <DialogDescription>
            Créez une nouvelle page ou dupliquez une page existante
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Mode de création */}
          <div className="space-y-3">
            <Label>Mode de création</Label>
            <RadioGroup 
              value={createMode} 
              onValueChange={(value) => setCreateMode(value as 'new' | 'duplicate' | 'legal')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">
                  Créer une nouvelle page vierge
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="duplicate" id="duplicate" />
                <Label htmlFor="duplicate" className="font-normal cursor-pointer">
                  Dupliquer à partir d'une page existante
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="legal" id="legal" />
                <Label htmlFor="legal" className="font-normal cursor-pointer">
                  Créer une page légale
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sélection de la page source (si duplication) */}
          {createMode === 'duplicate' && (
            <div className="space-y-2">
              <Label htmlFor="source-page">Page à dupliquer</Label>
              <Select value={sourcePageId} onValueChange={setSourcePageId}>
                <SelectTrigger id="source-page">
                  <SelectValue placeholder="Sélectionnez une page" />
                </SelectTrigger>
                <SelectContent>
                  {existingPages.map((page) => (
                    <SelectItem key={page.id} value={page.id.toString()}>
                      {page.pageName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Nom de la page */}
          <div className="space-y-2">
            <Label htmlFor="page-name">Nom de la page</Label>
            <Input
              id="page-name"
              value={pageName}
              onChange={(e) => setPageName(e.target.value)}
              placeholder="Ex: À propos"
              disabled={createPageMutation.isPending}
            />
            <p className="text-sm text-gray-500">
              L'URL sera générée automatiquement à partir du nom
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleClose}
            disabled={createPageMutation.isPending}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={createPageMutation.isPending}
          >
            {createPageMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Création...
              </>
            ) : (
              'Ajouter'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}