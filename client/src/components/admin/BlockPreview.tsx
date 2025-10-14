import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Shield, Heart, Mail, Phone, MapPin, Star, Play, Calendar } from 'lucide-react';

import type { PageBlock } from '@shared/schema';

// Import des composants réels pour la prévisualisation
import Hero from '@/components/home/Hero';
import Features from '@/components/home/Features';
import About from '@/components/home/About';
import CustomTourForm from '@/components/home/CustomTourForm';
import Contact from '@/components/home/Contact';
import Testimonials from '@/components/home/Testimonials';
import Interests from '@/components/home/Interests';

interface BlockPreviewProps {
  block: PageBlock;
  previewMode?: boolean;
}

export const BlockPreview = memo(function BlockPreview({ block, previewMode = false }: BlockPreviewProps) {
  const config = block.configuration || {};

  // En mode prévisualisation complète, utiliser les vrais composants
  if (previewMode) {
    return <RealComponentPreview block={block} />;
  }

  // Sinon, afficher une prévisualisation simplifiée mais représentative
  return <SimplifiedPreview block={block} />;
});

// Prévisualisation avec les vrais composants
function RealComponentPreview({ block }: { block: PageBlock }) {
  const config = block.configuration || {};

  switch (block.blockType) {
    case 'hero':
    case 'video_hero':
      return <Hero />;
    
    case 'advantages':
      return <Features />;
    
    case 'about':
      return <About />;
      
    case 'form':
      if (config.formType === 'custom_tour') {
        return <CustomTourForm />;
      }
      return <Contact />;
    
    case 'testimonials':
      return <Testimonials />;
    
    case 'interests':
      return <Interests />;
    
    default:
      return <SimplifiedPreview block={block} />;
  }
}

// Prévisualisation simplifiée pour l'édition
function SimplifiedPreview({ block }: { block: PageBlock }) {
  const config = block.configuration || {};

  switch (block.blockType) {
    case 'hero':
    case 'video_hero':
      return (
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-8 rounded-lg">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">{config.title || 'Hero Title'}</h1>
            <p className="text-xl mb-6 opacity-90">{config.subtitle || 'Hero subtitle'}</p>
            <div className="flex gap-3 justify-center">
              {config.ctaButtons?.map((btn: any, i: number) => (
                <Button key={i} variant={btn.style === 'primary' ? 'default' : 'outline'}>
                  {btn.text}
                </Button>
              ))}
            </div>
          </div>
          {block.blockType === 'video_hero' && (
            <div className="mt-6 flex justify-center">
              <div className="bg-black/20 rounded-lg p-4 flex items-center gap-2">
                <Play className="h-5 w-5" />
                <span>Video Background</span>
              </div>
            </div>
          )}
        </div>
      );

    case 'text_image':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className={config.layout === 'image-right' ? 'order-1' : 'order-2'}>
            <h2 className="text-3xl font-bold mb-4">{config.title || 'Section Title'}</h2>
            <p className="text-gray-600 leading-relaxed">
              {config.content || 'Your content goes here. This is a preview of how your text will appear alongside the image.'}
            </p>
          </div>
          <div className={config.layout === 'image-right' ? 'order-2' : 'order-1'}>
            <div className="bg-gray-200 rounded-lg aspect-video flex items-center justify-center">
              <span className="text-gray-500">Image: {config.imageUrl || 'No image'}</span>
            </div>
          </div>
        </div>
      );

    case 'advantages':
      return (
        <div className="bg-gray-50 p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Why Choose Us'}</h2>
            <p className="text-gray-600">{config.subtitle || 'Our advantages'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.features || [
              { icon: 'Users', title: 'Private Tours', description: 'Exclusive experiences' },
              { icon: 'Shield', title: 'Local Experts', description: 'Expert guidance' },
              { icon: 'Heart', title: 'Personalized', description: 'Tailored to you' }
            ]).slice(0, 3).map((feature: any, i: number) => {
              const IconComponent = getIconComponent(feature.icon);
              return (
                <Card key={i} className="text-center p-6">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      );

    case 'form':
      return (
        <div className="bg-white border-2 border-dashed border-gray-300 p-8 rounded-lg">
          <div className="max-w-md mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">{config.title || 'Contact Form'}</h2>
            <p className="text-gray-600 mb-6">{config.subtitle || 'Get in touch with us'}</p>
            
            <div className="space-y-4 text-left">
              {(config.fields || [
                { label: 'Name *', type: 'text' },
                { label: 'Email *', type: 'email' },
                { label: 'Message *', type: 'textarea' }
              ]).map((field: any, i: number) => (
                <div key={i}>
                  <label className="block text-sm font-medium mb-1">{field.label}</label>
                  <div className="h-10 bg-gray-100 rounded border"></div>
                </div>
              ))}
              <Button className="w-full mt-6">
                {config.submitText || 'Send Message'}
              </Button>
            </div>
          </div>
          
          {config.formType === 'custom_tour' && config.imageUrl && (
            <div className="mt-6 text-center">
              <Badge variant="secondary">With Image: {config.imageUrl}</Badge>
            </div>
          )}
        </div>
      );

    case 'card_grid':
      return (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Featured Tours'}</h2>
            <p className="text-gray-600">{config.subtitle || 'Discover our experiences'}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: config.displayCount || 3 }).map((_, i) => (
              <Card key={i}>
                <div className="bg-gray-200 h-48 rounded-t-lg flex items-center justify-center">
                  <span className="text-gray-500">Tour Image</span>
                </div>
                <CardContent className="p-4">
                  <h3 className="font-bold mb-2">Tour Title {i + 1}</h3>
                  <p className="text-gray-600 text-sm">Tour description...</p>
                  <div className="flex justify-between items-center mt-3">
                    <span className="font-bold text-primary">€99</span>
                    <Button size="sm">Book Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          {config.showTourNinja && (
            <div className="mt-4 text-center">
              <Badge variant="outline">Tour Ninja Integration</Badge>
            </div>
          )}
        </div>
      );

    case 'gallery':
      return (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Gallery'}</h2>
            <p className="text-gray-600">{config.subtitle || 'Our photo gallery'}</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-200 aspect-square rounded-lg flex items-center justify-center">
                <span className="text-gray-500 text-sm">Photo {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      );

    case 'contact_info':
      return (
        <div className="bg-gray-50 p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Contact Information'}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(config.cards || [
              { icon: 'Mail', title: 'Email', description: 'info@amon-tour.com' },
              { icon: 'Phone', title: 'Phone', description: '+66 96 216 6559' },
              { icon: 'MapPin', title: 'Location', description: 'Krabi, Thailand' }
            ]).map((card: any, i: number) => {
              const IconComponent = getIconComponent(card.icon);
              return (
                <Card key={i} className="text-center p-6">
                  <IconComponent className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h3 className="font-bold mb-1">{card.title}</h3>
                  <p className="text-gray-600">{card.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      );

    case 'testimonials':
      return (
        <div className="bg-primary text-white p-8 rounded-lg">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Customer Reviews'}</h2>
            <div className="flex justify-center gap-1 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <p className="opacity-90">{config.rating || '5.0'} stars • {config.reviewCount || '80'} reviews</p>
          </div>
          {config.googleReviewsWidget && (
            <div className="bg-white text-black p-4 rounded-lg text-center">
              <Badge variant="secondary">Google Reviews Widget</Badge>
            </div>
          )}
        </div>
      );

    case 'interests':
      return (
        <div>
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">{config.title || 'Interests'}</h2>
            <p className="text-gray-600">{config.subtitle || 'Choose your interests'}</p>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="text-center p-4 cursor-pointer hover:bg-gray-50">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
                <span className="text-sm font-medium">Interest {i + 1}</span>
              </Card>
            ))}
          </div>
        </div>
      );

    case 'contact':
      return (
        <div className="py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2" style={{ color: config.titleColor || '#084F6E' }}>
              {config.title || 'Contactez-nous'}
            </h2>
            <div className="w-16 h-1 mx-auto mb-4" style={{ backgroundColor: config.dividerColor || '#3BA8AF' }}></div>
            <p className="text-gray-600">{config.subtitle || 'Nous sommes là pour vous aider'}</p>
          </div>
          <div className="space-y-3 max-w-2xl mx-auto">
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{config.emailLabel || 'Email'}</div>
                <div className="text-sm text-gray-600">{config.email || 'contact@example.com'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <div className="font-semibold text-sm">{config.phoneLabel || 'Téléphone'}</div>
                <div className="text-sm text-gray-600">{config.phone || '+33 1 23 45 67 89'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-sm">{config.whatsappLabel || 'WhatsApp'}</div>
                <div className="text-sm text-gray-600">{config.whatsapp || '+33 6 12 34 56 78'}</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="font-semibold text-sm">{config.lineIdLabel || 'Line ID'}</div>
                <div className="text-sm text-gray-600">{config.lineId || 'moncompte'}</div>
              </div>
            </div>
            {(config.showAboutCompany ?? true) && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg text-center">
                <h3 className="font-bold text-sm mb-2">À propos de notre entreprise</h3>
                <p className="text-xs text-gray-600">
                  <strong>{config.companyBrand || 'Votre Marque'}</strong> est une marque de : {config.companyName || 'Votre Entreprise'}
                </p>
                <Badge variant="outline" className="mt-2 text-xs">
                  Licence TAT : {config.tatLicense || '12/34567'}
                </Badge>
              </div>
            )}
          </div>
        </div>
      );

    default:
      return (
        <div className="bg-gray-100 p-8 rounded-lg text-center">
          <h3 className="font-bold text-lg mb-2">{block.blockType}</h3>
          <p className="text-gray-600">{block.title || 'Block content will appear here'}</p>
          <Badge variant="outline" className="mt-2">{block.identifier}</Badge>
        </div>
      );
  }
}

// Utility function to get icon components
function getIconComponent(iconName: string) {
  const icons: Record<string, any> = {
    Users,
    Shield,
    Heart,
    Mail,
    Phone,
    MapPin,
    Star,
    Play,
    Calendar,
  };
  return icons[iconName] || Users;
}