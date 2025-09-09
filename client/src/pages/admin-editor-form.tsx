import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingForm, setEditingForm] = useState<FormData | null>(null);
  const queryClient = useQueryClient();

  // Fallback data for initial forms (only used if no API data)
  const fallbackForms: FormData[] = [
    {
      id: 1,
      name: 'Contact Form',
      title: 'Nous contacter',
      subtitle: 'Une question ? Un projet ? Nous sommes à votre écoute',
      description: 'Contactez notre équipe pour toute demande d\'information ou devis personnalisé.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#ffffff',
      primaryColor: '#1e73be',
      frameColor: '#ffffff',
      titleColor: '#1e73be',
      subtitleColor: '#666666',
      textColor: '#333333',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Nom complet',
          placeholder: 'Votre nom',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Adresse email',
          placeholder: 'votre@email.com',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'subject',
          type: 'text',
          label: 'Sujet',
          placeholder: 'Sujet de votre message',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Message',
          placeholder: 'Votre message...',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
      settings: {
        submitButtonText: 'Envoyer le message',
        submitButtonColor: '#1e73be',
        successMessage: 'Merci ! Votre message a été envoyé avec succès.',
        errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
        emailNotification: true
      },
      isActive: true,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-08'
    },
    {
      id: 2,
      name: 'Custom Tour Request',
      title: 'Create Your Custom Trip',
      subtitle: 'Your travel story starts with your dreams – let us write the rest.',
      description: 'Tell us what you\'d like to discover, and we\'ll create your personalized itinerary.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#ffffff',
      primaryColor: '#1e73be',
      frameColor: '#ffffff',
      titleColor: '#1e73be',
      subtitleColor: '#666666',
      textColor: '#333333',
      headerImage: '/catamaran-cruise.png',
      fields: [
        {
          id: 'fullName',
          type: 'text',
          label: 'Full Name *',
          placeholder: 'Your name',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email *',
          placeholder: 'Your email',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'countrycode',
          type: 'select',
          label: 'Country Code *',
          placeholder: 'Code',
          required: true,
          options: ['🇫🇷 +33', '🇹🇭 +66', '🇺🇸 +1', '🇬🇧 +44', '🇩🇪 +49', '🇪🇸 +34'],
          style: { width: 'third', marginBottom: 16 }
        },
        {
          id: 'whatsappNumber',
          type: 'phone',
          label: 'WhatsApp Number *',
          placeholder: 'Your WhatsApp number',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'numberOfAdults',
          type: 'select',
          label: 'Number of adults',
          placeholder: 'Select number of adults',
          required: false,
          options: ['1 adult', '2 adults', '3 adults', '4 adults', '5 adults', '6+ adults'],
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'numberOfKids',
          type: 'select',
          label: 'Number of kids (under 12 years old)',
          placeholder: 'Select number of kids',
          required: false,
          options: ['No kids', '1 kid', '2 kids', '3 kids', '4 kids', '5+ kids'],
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'tripDates',
          type: 'date',
          label: 'Dates of trip',
          placeholder: 'Select trip dates',
          required: false,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'duration',
          type: 'select',
          label: 'Or approximate duration',
          placeholder: 'Select duration',
          required: false,
          options: ['1-3 days', '4-7 days', '8-14 days', '15+ days'],
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'tripTypes',
          type: 'checkbox',
          label: 'Trip Types',
          required: false,
          options: ['Culture & History', 'Nature & Adventure', 'Beaches & Islands', 'Family trip', 'Group trip', 'Wedding & Honeymoon'],
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'destinations',
          type: 'checkbox',
          label: 'Destinations',
          required: false,
          options: ['Khao Sok', 'Krabi', 'Koh Mook', 'Bangkok', 'Chiang Mai', 'Others destinations'],
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'message',
          type: 'textarea',
          label: 'Describe your ideal trip',
          placeholder: 'Tell us what you would like to see and do during your journey...',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
      settings: {
        submitButtonText: 'Send my request',
        submitButtonColor: '#1e73be',
        successMessage: 'Thank you! We will contact you very soon to discuss your travel project.',
        errorMessage: 'There was a problem sending your request. Please try again.',
        emailNotification: true
      },
      isActive: true,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-08'
    },
    {
      id: 3,
      name: 'Partnership Request',
      title: 'Demande de partenariat',
      subtitle: 'Rejoignez notre réseau de partenaires',
      description: 'Développons ensemble de belles collaborations dans le tourisme thaïlandais.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#ffffff',
      primaryColor: '#16a34a',
      frameColor: '#ffffff',
      titleColor: '#16a34a',
      subtitleColor: '#666666',
      textColor: '#15803d',
      fields: [
        {
          id: 'contactName',
          type: 'text',
          label: 'Nom du contact',
          placeholder: 'Votre nom',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'companyName',
          type: 'text',
          label: 'Nom de l\'entreprise',
          placeholder: 'Nom de votre entreprise',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email professionnel',
          placeholder: 'contact@entreprise.com',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Téléphone',
          placeholder: '+33 1 XX XX XX XX',
          required: false,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'website',
          type: 'text',
          label: 'Site web',
          placeholder: 'https://votre-site.com',
          required: false,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'partnershipType',
          type: 'select',
          label: 'Type de partenariat',
          required: true,
          options: ['Agence de voyage', 'Hôtelier', 'Blogueur/Influenceur', 'Guide local', 'Transport', 'Autre'],
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Présentation de votre activité',
          placeholder: 'Présentez votre entreprise et votre proposition de partenariat...',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
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
    },
    {
      id: 4,
      name: 'Group Corporate Request',
      title: 'Demande groupe & entreprise',
      subtitle: 'Voyages sur mesure pour groupes et entreprises',
      description: 'Organisez votre événement d\'entreprise ou voyage de groupe en Thaïlande.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#fef3c7',
      primaryColor: '#d97706',
      frameColor: '#ffffff',
      titleColor: '#d97706',
      subtitleColor: '#666666',
      textColor: '#92400e',
      fields: [
        {
          id: 'contactName',
          type: 'text',
          label: 'Nom du responsable',
          placeholder: 'Votre nom',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'companyName',
          type: 'text',
          label: 'Entreprise/Organisation',
          placeholder: 'Nom de l\'entreprise',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email de contact',
          placeholder: 'contact@entreprise.com',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'phone',
          type: 'phone',
          label: 'Téléphone',
          placeholder: '+33 1 XX XX XX XX',
          required: false,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'groupSize',
          type: 'number',
          label: 'Taille du groupe',
          placeholder: '25',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'travelDates',
          type: 'text',
          label: 'Dates souhaitées',
          placeholder: 'Ex: septembre 2025',
          required: false,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'budget',
          type: 'select',
          label: 'Budget par personne',
          required: false,
          options: ['500-1000€', '1000-2000€', '2000-3000€', '3000-5000€', '5000€+', 'À déterminer'],
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Détails du projet',
          placeholder: 'Décrivez votre projet de voyage (objectifs, activités souhaitées, contraintes...)...',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
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
    },
    {
      id: 5,
      name: 'Newsletter Subscription',
      title: 'Abonnement newsletter',
      subtitle: 'Restez informé de nos dernières offres',
      description: 'Recevez nos meilleures offres et conseils voyage directement par email.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#dbeafe',
      primaryColor: '#2563eb',
      frameColor: '#ffffff',
      titleColor: '#2563eb',
      subtitleColor: '#666666',
      textColor: '#1e40af',
      fields: [
        {
          id: 'email',
          type: 'email',
          label: 'Adresse email',
          placeholder: 'votre@email.com',
          required: true,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
      settings: {
        submitButtonText: 'S\'abonner',
        submitButtonColor: '#2563eb',
        successMessage: 'Merci ! Vous êtes maintenant abonné à notre newsletter.',
        errorMessage: 'Une erreur est survenue. Veuillez réessayer.',
        emailNotification: false
      },
      isActive: true,
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: 6,
      name: 'Krabi Celebration Request',
      title: 'Célébration à Krabi',
      subtitle: 'Organisez votre événement spécial à Krabi',
      description: 'Mariage, anniversaire, lune de miel... Créons ensemble votre moment magique à Krabi.',
      layout: 'single-column',
      formLayout: 'columns',
      backgroundColor: '#fdf2f8',
      primaryColor: '#ec4899',
      frameColor: '#ffffff',
      titleColor: '#ec4899',
      subtitleColor: '#666666',
      textColor: '#be185d',
      fields: [
        {
          id: 'name',
          type: 'text',
          label: 'Nom complet',
          placeholder: 'Votre nom',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'email',
          type: 'email',
          label: 'Email',
          placeholder: 'votre@email.com',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'whatsapp',
          type: 'phone',
          label: 'WhatsApp',
          placeholder: '+33 6 XX XX XX XX',
          required: false,
          style: { width: 'full', marginBottom: 16 }
        },
        {
          id: 'celebrationType',
          type: 'select',
          label: 'Type de célébration',
          required: true,
          options: ['Mariage', 'Lune de miel', 'Anniversaire', 'Demande en mariage', 'Anniversaire de mariage', 'Autre'],
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'guests',
          type: 'number',
          label: 'Nombre d\'invités',
          placeholder: '2',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'date',
          type: 'text',
          label: 'Date souhaitée',
          placeholder: 'Ex: juin 2025',
          required: true,
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'budget',
          type: 'select',
          label: 'Budget approximatif',
          required: false,
          options: ['1000-3000€', '3000-5000€', '5000-10000€', '10000€+', 'À discuter'],
          style: { width: 'half', marginBottom: 16 }
        },
        {
          id: 'description',
          type: 'textarea',
          label: 'Détails de votre célébration',
          placeholder: 'Décrivez-nous votre vision de cette célébration spéciale...',
          required: false,
          style: { width: 'full', marginBottom: 16 }
        }
      ],
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
    }
  ];

  // Query to fetch custom forms
  const { data: forms = fallbackForms, isLoading: loading } = useQuery<FormData[]>({
    queryKey: ['/api/admin/custom-forms'],
    enabled: true,
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
        title: "Formulaire supprimé",
        description: `Le formulaire "${form.name}" a été supprimé avec succès.`
      });
    }
  };

  const handleDuplicateForm = (form: FormData) => {
    duplicateFormMutation.mutate(form);
  };

  const handleAddForm = () => {
    setEditingForm(null);
    setShowBuilder(true);
  };


  // Create form mutation
  const createFormMutation = useMutation({
    mutationFn: (formData: Omit<FormData, 'id' | 'createdAt' | 'updatedAt'>) => 
      apiRequest('POST', '/api/admin/custom-forms', formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-forms'] });
      // Redirection immédiate
      setShowBuilder(false);
      setEditingForm(null);
      // Toast après redirection pour éviter d'attendre
      setTimeout(() => {
        toast({
          title: "Formulaire publié",
          description: "Le nouveau formulaire a été publié avec succès."
        });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication du formulaire.",
        variant: "destructive"
      });
    }
  });

  // Update form mutation
  const updateFormMutation = useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: Partial<FormData> }) => 
      apiRequest('PUT', `/api/admin/custom-forms/${id}`, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-forms'] });
      // Redirection immédiate
      setShowBuilder(false);
      setEditingForm(null);
      // Toast après redirection pour éviter d'attendre
      setTimeout(() => {
        toast({
          title: "Formulaire publié",
          description: "Le formulaire a été publié avec succès."
        });
      }, 100);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: "Erreur lors de la publication du formulaire.",
        variant: "destructive"
      });
    }
  });

  // Delete form mutation
  const deleteFormMutation = useMutation({
    mutationFn: (id: number) => apiRequest('DELETE', `/api/admin/custom-forms/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-forms'] });
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
      queryClient.invalidateQueries({ queryKey: ['/api/admin/custom-forms'] });
      toast({
        title: 'Formulaire dupliqué',
        description: 'Le formulaire a été dupliqué avec succès.'
      });
    },
    onError: () => {
      toast({
        title: 'Erreur',
        description: 'Erreur lors de la duplication du formulaire.',
        variant: 'destructive'
      });
    }
  });

  const handleSaveForm = async (formData: FormData) => {
    try {
      // Assurer que isActive est true pour Publier
      const publishData = { ...formData, isActive: true };
      
      if (editingForm) {
        // Modifier un formulaire existant
        updateFormMutation.mutate({ id: editingForm.id!, formData: publishData });
      } else {
        // Créer un nouveau formulaire
        createFormMutation.mutate(publishData);
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
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
    return (
      <FormBuilder
        initialForm={editingForm || undefined}
        onSave={handleSaveForm}
        onCancel={handleCancelBuilder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-2 pb-4 sm:px-4 sm:pb-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 mb-6 mt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:justify-between">
            <div className="w-full sm:w-auto">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2 sm:gap-3">
                <FormInput className="h-6 w-6 sm:h-7 sm:w-7 text-orange-600 flex-shrink-0" />
                <span className="truncate">Éditeur de Formulaires</span>
              </h1>
              <p className="text-sm sm:text-base text-gray-600">Créez et gérez des formulaires personnalisés avec champs dynamiques</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/admin-editor')}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Retour à Gestion de Contenu</span>
            </Button>
          </div>
        </div>

        {/* Add Form Button */}
        <div className="mb-6">
          <Button 
            onClick={handleAddForm}
            className="bg-orange-600 hover:bg-orange-700 text-white flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Ajouter un formulaire
          </Button>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
              <p className="mt-2 text-gray-500">Chargement des formulaires...</p>
            </div>
          ) : (
            <>
              {forms.map((form) => {
                const IconComponent = getFormIcon(form.name);
                return (
                  <Card key={form.id} className="bg-white border border-gray-200 hover:border-orange-300 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg" style={{ backgroundColor: form.primaryColor + '20', color: form.primaryColor }}>
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900">
                                {form.title === 'Create Your Custom Trip' ? 'Custom Trip' : form.title}
                              </h3>
                            </div>
                            <Badge 
                              variant={form.isActive ? 'default' : 'secondary'}
                            >
                              {form.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditForm(form)}
                            className="flex items-center gap-1"
                          >
                            <Edit className="h-4 w-4" />
                            Modifier
                          </Button>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDuplicateForm(form)}
                            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                          >
                            <Copy className="h-4 w-4" />
                            Dupliquer
                          </Button>
                          
                          {form.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteForm(form.id!)}
                              className="flex items-center gap-1 text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Empty State */}
              {forms.length === 0 && (
                <Card className="bg-gray-50 border-2 border-dashed border-gray-300">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="rounded-full bg-gray-100 p-3 mb-4">
                      <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucun formulaire créé
                    </h3>
                    <p className="text-gray-500 text-center mb-4">
                      Commencez par créer votre premier formulaire personnalisé avec des champs dynamiques
                    </p>
                    <Button 
                      onClick={handleAddForm}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Créer mon premier formulaire
                    </Button>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}