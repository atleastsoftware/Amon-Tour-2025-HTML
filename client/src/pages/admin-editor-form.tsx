import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowLeft, Plus, Edit, Trash2, Copy, FormInput, Users, Mail, MessageSquare } from 'lucide-react';
import FormBuilder from '@/components/admin/FormBuilder';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
interface FormData {
  id?: number;
  name: string;
  title: string;
  subtitle?: string;
  description?: string;
  headerImage?: string;
  layout: 'single-column' | 'two-column' | 'grid';
  formLayout: 'columns' | 'columns-reversed' | 'header';
  backgroundColor: string;
  primaryColor: string;
  frameColor: string;
  titleColor: string;
  subtitleColor: string;
  textColor: string;
  fields: any[];
  settings: any;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export default function AdminEditorForm() {
  const { t } = useTranslation();

  const [, setLocation] = useLocation();
  const {
    toast
  } = useToast();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<FormData | null>(null);
  const [showTitleDialog, setShowTitleDialog] = useState(false);
  const [newFormName, setNewFormName] = useState('');
  const queryClient = useQueryClient();

  // Fallback data for initial forms (only used if no API data)
  const fallbackForms: FormData[] = [{
    id: 1,
    name: t('common.contactform'),
    title: t('common.nouscontacter'),
    subtitle: t('common.unequestionunprojetn'),
    description: t('Contactez notre \xE9quipe pour toute demande d\'information ou devis personnalis\xE9.', {
      defaultValue: 'Contactez notre \xE9quipe pour toute demande d\'information ou devis personnalis\xE9.'
    }),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: 'hsl(var(--background))',
    primaryColor: 'hsl(var(--primary))',
    frameColor: 'hsl(var(--background))',
    titleColor: 'hsl(var(--primary))',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: 'hsl(var(--foreground))',
    fields: [{
      id: 'name',
      type: 'text',
      label: t('common.nomcomplet'),
      placeholder: 'Votre nom',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'email',
      type: 'email',
      label: t('common.adresseemail'),
      placeholder: 'votre@email.com',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'subject',
      type: 'text',
      label: t('common.sujet'),
      placeholder: 'Sujet de votre message',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'message',
      type: 'textarea',
      label: t('common.message'),
      placeholder: 'Votre message...',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'Envoyer le message',
      submitButtonColor: 'hsl(var(--primary))',
      successMessage: 'Merci ! Votre message a été envoyé avec succès.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: true
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-08'
  }, {
    id: 2,
    name: t('common.customtourrequest'),
    title: t('common.createyourcustomtrip'),
    subtitle: t('common.yourtravelstorystart'),
    description: t('Tell us what you\'d like to discover, and we\'ll create your personalized itinerary.', {
      defaultValue: 'Tell us what you\'d like to discover, and we\'ll create your personalized itinerary.'
    }),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: 'hsl(var(--background))',
    primaryColor: 'hsl(var(--primary))',
    frameColor: 'hsl(var(--background))',
    titleColor: 'hsl(var(--primary))',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: 'hsl(var(--foreground))',
    headerImage: '/catamaran-cruise.png',
    fields: [{
      id: 'fullName',
      type: 'text',
      label: t('common.fullname'),
      placeholder: 'Your name',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'email',
      type: 'email',
      label: t('common.email'),
      placeholder: 'Your email',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'countrycode',
      type: 'select',
      label: t('common.countrycode'),
      placeholder: 'Code',
      required: true,
      options: ['🇫🇷 +33', '🇹🇭 +66', '🇺🇸 +1', '🇬🇧 +44', '🇩🇪 +49', '🇪🇸 +34'],
      style: {
        width: 'third',
        marginBottom: 16
      }
    }, {
      id: 'whatsappNumber',
      type: 'phone',
      label: t('common.whatsappnumber'),
      placeholder: 'Your WhatsApp number',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'numberOfAdults',
      type: 'select',
      label: t('common.numberofadults'),
      placeholder: 'Select number of adults',
      required: false,
      options: ['1 adult', '2 adults', '3 adults', '4 adults', '5 adults', '6+ adults'],
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'numberOfKids',
      type: 'select',
      label: t('common.numberofkidsunder12y'),
      placeholder: 'Select number of kids',
      required: false,
      options: ['No kids', '1 kid', '2 kids', '3 kids', '4 kids', '5+ kids'],
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'tripDates',
      type: 'date',
      label: t('common.datesoftrip'),
      placeholder: 'Select trip dates',
      required: false,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'duration',
      type: 'select',
      label: t('common.orapproximateduratio'),
      placeholder: 'Select duration',
      required: false,
      options: ['1-3 days', '4-7 days', '8-14 days', '15+ days'],
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'tripTypes',
      type: 'checkbox',
      label: t('common.triptypes'),
      required: false,
      options: ['Culture & History', 'Nature & Adventure', 'Beaches & Islands', 'Family trip', 'Group trip', 'Wedding & Honeymoon'],
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'destinations',
      type: 'checkbox',
      label: t('common.destinations'),
      required: false,
      options: ['Khao Sok', 'Krabi', 'Koh Mook', 'Bangkok', 'Chiang Mai', 'Others destinations'],
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'message',
      type: 'textarea',
      label: t('common.describeyouridealtri'),
      placeholder: 'Tell us what you would like to see and do during your journey...',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'Send my request',
      submitButtonColor: 'hsl(var(--primary))',
      successMessage: 'Thank you! We will contact you very soon to discuss your travel project.',
      errorMessage: 'There was a problem sending your request. Please try again.',
      emailNotification: true
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-08'
  }, {
    id: 3,
    name: t('common.partnershiprequest'),
    title: t('common.demandedepartenariat'),
    subtitle: t('common.rejoigneznotrerxe9se'),
    description: t('common.dxe9velopponsensembl'),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: 'hsl(var(--background))',
    primaryColor: '#16a34a',
    frameColor: 'hsl(var(--background))',
    titleColor: '#16a34a',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: '#15803d',
    fields: [{
      id: 'contactName',
      type: 'text',
      label: t('common.nomducontact'),
      placeholder: 'Votre nom',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'companyName',
      type: 'text',
      label: t('Nom de l\'entreprise', {
        defaultValue: 'Nom de l\'entreprise'
      }),
      placeholder: 'Nom de votre entreprise',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'email',
      type: 'email',
      label: t('common.emailprofessionnel'),
      placeholder: 'contact@entreprise.com',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'phone',
      type: 'phone',
      label: t('common.txe9lxe9phone'),
      placeholder: '+33 1 XX XX XX XX',
      required: false,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'website',
      type: 'text',
      label: t('common.siteweb'),
      placeholder: 'https://votre-site.com',
      required: false,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'partnershipType',
      type: 'select',
      label: t('common.typedepartenariat'),
      required: true,
      options: ['Agence de voyage', 'Hôtelier', 'Blogueur/Influenceur', 'Guide local', 'Transport', 'Autre'],
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'description',
      type: 'textarea',
      label: t('common.prxe9sentationdevotr'),
      placeholder: 'Présentez votre entreprise et votre proposition de partenariat...',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'Soumettre la demande',
      submitButtonColor: '#16a34a',
      successMessage: 'Merci ! Votre demande de partenariat a été reçue. Nous vous contacterons rapidement.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: true
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-03'
  }, {
    id: 4,
    name: t('common.groupcorporatereques'),
    title: t('common.demandegroupeentrepr'),
    subtitle: t('common.voyagessurmesurepour'),
    description: t('Organisez votre \xE9v\xE9nement d\'entreprise ou voyage de groupe en Tha\xEFlande.', {
      defaultValue: 'Organisez votre \xE9v\xE9nement d\'entreprise ou voyage de groupe en Tha\xEFlande.'
    }),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: '#fef3c7',
    primaryColor: '#d97706',
    frameColor: 'hsl(var(--background))',
    titleColor: '#d97706',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: '#92400e',
    fields: [{
      id: 'contactName',
      type: 'text',
      label: t('common.nomduresponsable'),
      placeholder: 'Votre nom',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'companyName',
      type: 'text',
      label: t('common.entrepriseorganisati'),
      placeholder: 'Nom de l\'entreprise',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'email',
      type: 'email',
      label: t('common.emaildecontact'),
      placeholder: 'contact@entreprise.com',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'phone',
      type: 'phone',
      label: t('common.txe9lxe9phone'),
      placeholder: '+33 1 XX XX XX XX',
      required: false,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'groupSize',
      type: 'number',
      label: t('common.tailledugroupe'),
      placeholder: '25',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'travelDates',
      type: 'text',
      label: t('common.datessouhaitxe9es'),
      placeholder: 'Ex: septembre 2025',
      required: false,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'budget',
      type: 'select',
      label: t('common.budgetparpersonne'),
      required: false,
      options: ['500-1000€', '1000-2000€', '2000-3000€', '3000-5000€', '5000€+', 'À déterminer'],
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'description',
      type: 'textarea',
      label: t('common.dxe9tailsduprojet'),
      placeholder: 'Décrivez votre projet de voyage (objectifs, activités souhaitées, contraintes...)...',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'Demander un devis groupe',
      submitButtonColor: '#d97706',
      successMessage: 'Merci ! Votre demande groupe a été reçue. Notre équipe vous contactera sous 48h.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: true
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-02'
  }, {
    id: 5,
    name: t('common.newslettersubscripti'),
    title: t('common.abonnementnewsletter'),
    subtitle: t('common.restezinformxe9denos'),
    description: t('common.receveznosmeilleures'),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: '#dbeafe',
    primaryColor: 'hsl(var(--primary))',
    frameColor: 'hsl(var(--background))',
    titleColor: 'hsl(var(--primary))',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: '#1e40af',
    fields: [{
      id: 'email',
      type: 'email',
      label: t('common.adresseemail'),
      placeholder: 'votre@email.com',
      required: true,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'S\'abonner',
      submitButtonColor: 'hsl(var(--primary))',
      successMessage: 'Merci ! Vous êtes maintenant abonné à notre newsletter.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: false
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }, {
    id: 6,
    name: t('common.krabicelebrationrequ'),
    title: t('common.cxe9lxe9brationxe0kr'),
    subtitle: t('common.organisezvotrexe9vxe'),
    description: t('common.mariageanniversairel'),
    layout: 'single-column',
    formLayout: 'columns',
    backgroundColor: '#fdf2f8',
    primaryColor: '#ec4899',
    frameColor: 'hsl(var(--background))',
    titleColor: '#ec4899',
    subtitleColor: 'hsl(var(--muted-foreground))',
    textColor: '#be185d',
    fields: [{
      id: 'name',
      type: 'text',
      label: t('common.nomcomplet'),
      placeholder: 'Votre nom',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'email',
      type: 'email',
      label: t('common.email'),
      placeholder: 'votre@email.com',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'whatsapp',
      type: 'phone',
      label: t('common.whatsapp'),
      placeholder: '+33 6 XX XX XX XX',
      required: false,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }, {
      id: 'celebrationType',
      type: 'select',
      label: t('common.typedecxe9lxe9bratio'),
      required: true,
      options: ['Mariage', 'Lune de miel', 'Anniversaire', 'Demande en mariage', 'Anniversaire de mariage', 'Autre'],
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'guests',
      type: 'number',
      label: t('Nombre d\'invit\xE9s', {
        defaultValue: 'Nombre d\'invit\xE9s'
      }),
      placeholder: '2',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'date',
      type: 'text',
      label: t('common.datesouhaitxe9e'),
      placeholder: 'Ex: juin 2025',
      required: true,
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'budget',
      type: 'select',
      label: t('common.budgetapproximatif'),
      required: false,
      options: ['1000-3000€', '3000-5000€', '5000-10000€', '10000€+', 'À discuter'],
      style: {
        width: 'half',
        marginBottom: 16
      }
    }, {
      id: 'description',
      type: 'textarea',
      label: t('common.dxe9tailsdevotrecxe9'),
      placeholder: 'Décrivez-nous votre vision de cette célébration spéciale...',
      required: false,
      style: {
        width: 'full',
        marginBottom: 16
      }
    }],
    settings: {
      submitButtonText: 'Organiser ma célébration',
      submitButtonColor: '#ec4899',
      successMessage: 'Merci ! Notre équipe vous contactera rapidement pour organiser votre célébration de rêve.',
      errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
      emailNotification: true
    },
    isActive: true,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01'
  }];

  // Query to fetch custom forms
  const {
    data: forms = fallbackForms,
    isLoading: loading
  } = useQuery<FormData[]>({
    queryKey: ['/api/admin/custom-forms'],
    enabled: true
  });
  const handleEditForm = (form: FormData) => {
    setEditingForm(form);
    setShowBuilder(true);
  };
  const handleDeleteForm = (formId: number) => {
    const form = forms.find(f => f.id === formId);
    if (form && window.confirm(`Êtes-vous sûr de vouloir supprimer le formulaire "${form.name}" ?`)) {
      deleteFormMutation.mutate(formId);
      toast({
        title: t('common.formulairesupprimxe9'),
        description: `Le formulaire "${form.name}" a été supprimé avec succès.`
      });
    }
  };
  const handleDuplicateForm = (form: FormData) => {
    duplicateFormMutation.mutate(form);
  };
  const handleAddForm = () => {
    setShowTitleDialog(true);
    setNewFormName('');
  };
  const handleCreateFormWithTitle = () => {
    if (!newFormName.trim()) return;

    // Créer un formulaire de base simple
    const newForm: FormData = {
      name: newFormName,
      title: t('common.titreduformulaire'),
      subtitle: t('common.soustitreduformulair'),
      description: t('common.descriptiondevotrefo'),
      layout: 'grid',
      formLayout: 'header',
      primaryColor: 'hsl(var(--primary))',
      backgroundColor: '#f8fafc',
      textColor: 'hsl(var(--foreground))',
      titleColor: '#FFFFFF',
      subtitleColor: '#FFFFFF',
      frameColor: '#FFFFFF',
      headerImage: '',
      fields: [{
        id: 'name',
        type: 'text',
        label: t('common.nomcomplet'),
        placeholder: 'Votre nom',
        required: true,
        style: {
          width: 'full',
          marginBottom: 16
        }
      }, {
        id: 'email',
        type: 'email',
        label: t('common.email'),
        placeholder: 'votre@email.com',
        required: true,
        style: {
          width: 'full',
          marginBottom: 16
        }
      }],
      settings: {
        submitButtonText: 'Envoyer',
        submitButtonColor: 'hsl(var(--primary))',
        successMessage: 'Merci pour votre message.',
        errorMessage: 'Une erreur est survenue.',
        emailNotification: true,
        redirectUrl: ''
      },
      isActive: false
    };
    setEditingForm(newForm);
    setShowBuilder(true);
    setShowTitleDialog(false);
    setNewFormName('');
  };

  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: (formData: Omit<FormData, 'id' | 'createdAt' | 'updatedAt'>) => apiRequest('POST', '/api/admin/custom-forms', formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/admin/custom-forms']
      });
      // Redirection immédiate
      setShowBuilder(false);
      setEditingForm(null);
      // Toast après redirection avec message adapté
      setTimeout(() => {
        toast({
          title: variables.isActive ? "Formulaire publié" : "Formulaire sauvegardé",
          description: variables.isActive ? "Le nouveau formulaire a été publié avec succès." : "Le formulaire a été sauvegardé en brouillon."
        });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: t('common.erreur'),
        description: t('common.erreurlorsdelapublic'),
        variant: "destructive"
      });
    }
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: ({
      id,
      formData
    }: {
      id: number;
      formData: Partial<FormData>;
    }) => apiRequest('PUT', `/api/admin/custom-forms/${id}`, formData),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['/api/admin/custom-forms']
      });
      // Redirection immédiate
      setShowBuilder(false);
      setEditingForm(null);
      // Toast après redirection avec message adapté
      setTimeout(() => {
        toast({
          title: variables.formData.isActive ? "Formulaire publié" : "Formulaire sauvegardé",
          description: variables.formData.isActive ? "Le formulaire a été publié avec succès." : "Le formulaire a été sauvegardé en brouillon."
        });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: t('common.erreur'),
        description: t('common.erreurlorsdelapublic'),
        variant: "destructive"
      });
    }
  });

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/custom-forms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/admin/custom-forms']
      });
    }
  });

  // Duplicate form mutation
  const duplicateFormMutation = useMutation({
    mutationFn: (form: FormData) => {
      const duplicatedForm = {
        ...form,
        name: `Copie ${form.name}`,
        title: form.title.startsWith('Copie ') ? form.title : `Copie ${form.title}`,
        isActive: false // Les copies sont sauvegardées en brouillon
      };
      delete (duplicatedForm as any).id;
      delete (duplicatedForm as any).createdAt;
      delete (duplicatedForm as any).updatedAt;
      return apiRequest('POST', '/api/admin/custom-forms', duplicatedForm);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['/api/admin/custom-forms']
      });
      toast({
        title: t('common.formulairedupliquxe9'),
        description: t('common.leformulaireaxe9txe9')
      });
    },
    onError: () => {
      toast({
        title: t('common.erreur'),
        description: t('common.erreurlorsdeladuplic'),
        variant: 'destructive'
      });
    }
  });
  const handleSaveForm = async (formData: FormData) => {
    try {
      // Assurer que isActive est true pour Publier
      const publishData = {
        ...formData,
        isActive: true
      };
      if (editingForm?.id) {
        // Modifier un formulaire existant (avec ID)
        updateFormMutation.mutate({
          id: editingForm.id,
          formData: publishData
        });
      } else {
        // Créer un nouveau formulaire (sans ID)
        createFormMutation.mutate(publishData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      throw error;
    }
  };
  const handleSaveDraft = async (formData: FormData) => {
    try {
      // Assurer que isActive est false pour Brouillon
      const draftData = {
        ...formData,
        isActive: false
      };
      if (editingForm?.id) {
        // Modifier un formulaire existant (avec ID)
        updateFormMutation.mutate({
          id: editingForm.id,
          formData: draftData
        });
      } else {
        // Créer un nouveau formulaire (sans ID)
        createFormMutation.mutate(draftData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du brouillon:', error);
      throw error;
    }
  };
  const handleCancelBuilder = () => {
    setShowBuilder(false);
    setEditingForm(null);
  };
  const getFormIcon = (formName: string) => {
    if (formName.includes('Contact')) return MessageSquare;
    if (formName.includes('Custom') || formName.includes('Tour')) return Users;
    if (formName.includes('Newsletter')) return Mail;
    if (formName.includes('Partnership')) return Users;
    if (formName.includes('Group')) return Users;
    if (formName.includes('Celebration')) return Users;
    return FormInput;
  };
  if (showBuilder) {
    return <FormBuilder initialForm={editingForm || undefined} onSave={handleSaveForm} onSaveDraft={handleSaveDraft} onCancel={handleCancelBuilder} />;
  }
  return <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <FormInput className="h-6 w-6 sm:h-7 sm:w-7 text-[hsl(var(--warning))] flex-shrink-0" />
                <span className="truncate">{t('common.xc9diteurdeformulair')}</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">{t('common.crxe9ezetgxe9rezdesf')}</p>
            </div>
            <Button variant="outline" onClick={() => setLocation('/admin-editor')} className="flex items-center gap-2 w-full sm:w-auto">
              <ArrowLeft className="w-4 h-4" />
              <span>{t('common.retourxe0gestiondeco')}</span>
            </Button>
          </div>
        </div>

        {/* Add Form Button */}
        <div className="mb-6">
          <Button onClick={handleAddForm} className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning)/0.9)] text-white flex items-center gap-2">
            <Plus className="h-4 w-4" />{t('common.ajouterunformulaire')}</Button>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {loading ? <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--warning))]"></div>
              <p className="mt-2 text-gray-500">{t('common.chargementdesformula')}</p>
            </div> : <>
              {forms.map(form => {
            const IconComponent = getFormIcon(form.name);
            return <Card key={form.id} className="bg-white border border-gray-200 hover:border-[hsl(var(--warning)/0.3)] transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg" style={{
                        backgroundColor: form.primaryColor + '20',
                        color: form.primaryColor
                      }}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {form.name === 'Custom Trip' ? 'Custom Trip' : form.name}
                            </h3>
                            <Badge variant={form.isActive ? 'default' : 'secondary'}>
                              {form.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditForm(form)} className="flex items-center gap-1">
                            <Edit className="h-4 w-4" />{t('common.modifier')}</Button>
                          
                          <Button variant="outline" size="sm" onClick={() => handleDuplicateForm(form)} className="flex items-center gap-1 text-primary hover:text-primary/80">
                            <Copy className="h-4 w-4" />{t('common.dupliquer')}</Button>
                          
                          {form.id && <Button variant="outline" size="sm" onClick={() => handleDeleteForm(form.id!)} className="flex items-center gap-1 text-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive)/0.8)]">
                              <Trash2 className="h-4 w-4" />{t('common.supprimer')}</Button>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>;
          })}

              {/* Empty State */}
              {forms.length === 0 && <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('common.aucunformulairecrxe9')}</h3>
                    <p className="text-gray-500 text-center mb-4">{t('common.commencezparcrxe9erv')}</p>
                    <Button onClick={handleAddForm} className="bg-[hsl(var(--warning))] hover:bg-[hsl(var(--warning)/0.9)] text-white">
                      <Plus className="h-4 w-4 mr-2" />{t('common.crxe9ermonpremierfor')}</Button>
                  </CardContent>
                </Card>}
            </>}
        </div>

        {/* Dialog pour créer un nouveau formulaire */}
        <Dialog open={showTitleDialog} onOpenChange={setShowTitleDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('common.crxe9erunnouveauform')}</DialogTitle>
              <DialogDescription>{t('common.entrezlenomdevotreno')}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">{t('common.nom')}</Label>
                <Input id="name" value={newFormName} onChange={e => setNewFormName(e.target.value)} placeholder={t('common.excontactform')} className="col-span-3" onKeyDown={e => {
                if (e.key === 'Enter') {
                  handleCreateFormWithTitle();
                }
              }} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTitleDialog(false)}>{t('common.annuler')}</Button>
              <Button onClick={handleCreateFormWithTitle} disabled={!newFormName.trim()}>{t('common.crxe9erleformulaire')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>;
}