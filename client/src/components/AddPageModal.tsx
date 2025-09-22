import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
export function AddPageModal({
  isOpen,
  onClose,
  onSuccess
}: AddPageModalProps) {
  const {
    t: t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [pageName, setPageName] = useState('');
  const [createMode, setCreateMode] = useState<'new' | 'duplicate'>('new');
  const [sourcePageId, setSourcePageId] = useState<string>('');

  // Récupérer la liste des pages existantes pour la duplication
  const {
    data: existingPages = []
  } = useQuery<PageConfiguration[]>({
    queryKey: ['/api/admin/page-configurations'],
    enabled: isOpen
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
        title: t("Succxe8s", {
          defaultValue: "Succxe8s"
        }),
        description: t("Lapageaxe9txe9crxe9x", {
          defaultValue: "Lapageaxe9txe9crxe9x"
        })
      });
      // Invalider et attendre le rechargement des données
      await queryClient.invalidateQueries({
        queryKey: ['/api/admin/page-configurations']
      });
      await queryClient.refetchQueries({
        queryKey: ['/api/admin/page-configurations']
      });

      // Appeler le callback avec le slug de la nouvelle page
      onSuccess(data.pageSlug);
      handleClose();
    },
    onError: (error: any) => {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: error.message || "Impossible de créer la page",
        variant: "destructive"
      });
    }
  });
  const handleSubmit = () => {
    if (!pageName.trim()) {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Le nom de la page est requis", {
          defaultValue: "Le nom de la page est requis"
        }),
        variant: "destructive"
      });
      return;
    }
    if (createMode === 'duplicate' && !sourcePageId) {
      toast({
        title: t("Erreur", {
          defaultValue: "Erreur"
        }),
        description: t("Veuillezsxe9lectionn", {
          defaultValue: "Veuillezsxe9lectionn"
        }),
        variant: "destructive"
      });
      return;
    }

    // Générer le slug à partir du nom
    let pageSlug = pageName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^a-z0-9]+/g, '-') // Remplacer les caractères spéciaux par des tirets
    .replace(/^-+|-+$/g, ''); // Supprimer les tirets au début et à la fin

    // Si on duplique, ajouter un suffixe pour éviter les conflits
    if (createMode === 'duplicate') {
      // Vérifier si le slug existe déjà et ajouter un numéro si nécessaire
      const existingSlugs = existingPages.map(p => p.pageSlug);
      let counter = 1;
      let newSlug = pageSlug;
      while (existingSlugs.includes(newSlug)) {
        newSlug = `${pageSlug}-${counter}`;
        counter++;
      }
      pageSlug = newSlug;
    }
    const data = {
      pageName,
      pageSlug,
      pageType: 'secondary',
      // Par défaut, toutes les nouvelles pages sont secondaires
      isActive: false,
      // Par défaut, les nouvelles pages sont en brouillon
      ...(createMode === 'duplicate' && sourcePageId ? {
        sourcePageId: parseInt(sourcePageId)
      } : {})
    };
    createPageMutation.mutate(data);
  };
  const handleClose = () => {
    setPageName('');
    setCreateMode('new');
    setSourcePageId('');
    onClose();
  };
  return <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{t("Ajouter une nouvelle page", {
            defaultValue: "Ajouter une nouvelle page"
          })}</DialogTitle>
          <DialogDescription>{t("Crxe9ezunenouvellepa", {
            defaultValue: "Crxe9ezunenouvellepa"
          })}</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {/* Mode de création */}
          <div className="space-y-3">
            <Label>{t("Modedecrxe9ation", {
              defaultValue: "Modedecrxe9ation"
            })}</Label>
            <RadioGroup value={createMode} onValueChange={value => setCreateMode(value as 'new' | 'duplicate')}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="new" id="new" />
                <Label htmlFor="new" className="font-normal cursor-pointer">{t("Crxe9erunenouvellepa", {
                  defaultValue: "Crxe9erunenouvellepa"
                })}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="duplicate" id="duplicate" />
                <Label htmlFor="duplicate" className="font-normal cursor-pointer">{t('Dupliquer \xE0 partir d\'une page existante', {
                  defaultValue: 'Dupliquer \xE0 partir d\'une page existante'
                })}</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Sélection de la page source (si duplication) */}
          {createMode === 'duplicate' && <div className="space-y-2">
              <Label htmlFor="source-page">{t("Pagexe0dupliquer", {
              defaultValue: "Pagexe0dupliquer"
            })}</Label>
              <Select value={sourcePageId} onValueChange={setSourcePageId}>
                <SelectTrigger id="source-page">
                  <SelectValue placeholder={t("Sxe9lectionnezunepag", {
                defaultValue: "Sxe9lectionnezunepag"
              })} />
                </SelectTrigger>
                <SelectContent>
                  {existingPages.map(page => <SelectItem key={page.id} value={page.id.toString()}>
                      {page.pageName}
                    </SelectItem>)}
                </SelectContent>
              </Select>
            </div>}

          {/* Nom de la page */}
          <div className="space-y-2">
            <Label htmlFor="page-name">{t("Nom de la page", {
              defaultValue: "Nom de la page"
            })}</Label>
            <Input id="page-name" value={pageName} onChange={e => setPageName(e.target.value)} placeholder={t("Exxc0propos", {
            defaultValue: "Exxc0propos"
          })} disabled={createPageMutation.isPending} />
            <p className="text-sm text-gray-500">{t('L\'URL sera g\xE9n\xE9r\xE9e automatiquement \xE0 partir du nom', {
              defaultValue: 'L\'URL sera g\xE9n\xE9r\xE9e automatiquement \xE0 partir du nom'
            })}</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={createPageMutation.isPending}>{t("Annuler", {
            defaultValue: "Annuler"
          })}</Button>
          <Button onClick={handleSubmit} disabled={createPageMutation.isPending}>
            {createPageMutation.isPending ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("Crxe9ation", {
              defaultValue: "Crxe9ation"
            })}</> : 'Ajouter'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
}