import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, MapPin, Camera, Users, Sparkles, Clock, Gift, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import heroImage from "@assets/IMG_3481_1750762525398.jpeg";
import image1 from "@assets/image_1750757024713.png";
import image2 from "@assets/image_1750757043237.png";
import image3 from "@assets/image_1750757064524.png";
import image4 from "@assets/image_1750757080473.png";
interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  celebrationType: string;
  guests: string;
  date: string;
  budget: string;
  description: string;
}
export default function KrabiCelebration() {
  const { t } = useTranslation();

  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    celebrationType: '',
    guests: '',
    date: '',
    budget: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log('Krabi Celebration - Submitting form:', formData);
    try {
      const response = await fetch('/api/krabi-celebration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      console.log('Krabi Celebration - Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Krabi Celebration - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Krabi Celebration - Success result:', result);
      toast({
        title: t('toasts.requestSent'),
        description: t('toasts.requestSentDesc'),
        duration: 5000
      });

      // Reset form
      setFormData({
        name: '',
        email: '',
        whatsapp: '',
        celebrationType: '',
        guests: '',
        date: '',
        budget: '',
        description: ''
      });
    } catch (error) {
      console.error('Krabi Celebration - Submit error:', error);
      toast({
        title: t('toasts.requestFailed'),
        description: t('toasts.requestFailedDesc'),
        variant: "destructive",
        duration: 5000
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <>
      <SEO title={t('common.krabicelebrationuniq')} description="Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration. Intimate weddings, romantic dinners and tailor-made celebrations in Thailand." keywords="krabi celebration, thailand wedding, romantic dinner krabi, destination wedding celebration, thailand wedding planner, private beach ceremony" />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt={t('common.krabicelebrationuniq')} className="w-full h-full object-cover" />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <motion.div initial={{
            opacity: 0,
            y: 30
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            duration: 0.8
          }}>
              <Heart className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6">{t('pages.krabiCelebration.title')}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">{t('common.uniquemomentsinanexc')}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
              const formSection = document.getElementById('celebration-form');
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }}>{t('common.planyourcelebration')}</Button>
            </motion.div>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto text-center" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">{t('common.createunforgettablem')}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{t('common.letyourselfbeenchant')}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{t('common.whetheryouwanttoprop')}</p>
            </motion.div>
          </div>
        </section>

        {/* Celebration Packages */}
        <section className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.ourcelebrationexperi')}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('common.choosefromoursignatu')}</p>
            </motion.div>

            <div className="space-y-16">
              {/* Romantic Dinner */}
              <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6
            }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img src={image4} alt={t('common.romanticdinneronpriv')} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t('common.ud83cudf05romanticex')}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('common.romanticdinneronpriv')}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('common.theperfectexperience')}</p>
                    <p className="text-gray-600 mb-4">{t('common.escapetoasecretbeach')}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.thesetting')}</strong>{t('common.privatebeachfacingth')}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.themenu')}</strong>{t('common.refinedbuffetofthais')}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.theteam')}</strong>{t('Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform', {
                          defaultValue: 'Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t('common.22000thb')}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('common.optionsprofessionalp')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Intimate Beach Wedding */}
              <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.1
            }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto order-2 lg:order-1">
                    <img src={image2} alt={t('common.intimatebeachwedding')} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{t('common.ud83dudc8dintimatewe')}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('common.intimatebeachwedding')}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('common.theceremonyofyourdre')}</p>
                    <p className="text-gray-600 mb-4">{t('common.beginwithatraditiona')}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.theprogram')}</strong>{t('common.buddhistceremony4pmb')}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.included')}</strong>{t('Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant', {
                          defaultValue: 'Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t('common.19500thb')}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('common.optionsprofessionalp')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Secret Gardens Wedding */}
              <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.2
            }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto">
                    <img src={image1} alt={t('common.weddinginthesecretga')} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t('common.ud83cudf3fsecretgard')}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('common.beachweddinginaonamm')}</h3>
                    <p className="text-gray-600 mb-4">{t('common.imagineamagicalcerem')}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.theconcept')}</strong>{t('common.anintimateandrefined')}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.included')}</strong>{t('common.2villaswith2bedrooms')}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">{t('common.priceonrequest')}</span>
                        <span className="text-sm text-gray-500">{t('common.contactus')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Jungle Celebration */}
              <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: 0.3
            }}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <div className="relative h-64 lg:h-auto order-2 lg:order-1">
                    <img src={image3} alt={t('common.junglecelebrationatm')} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[hsl(var(--success))] text-white px-3 py-1 rounded-full text-sm font-medium">{t('common.ud83cudf34junglecele')}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('common.junglecelebration')}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('common.aspectacularweddingf')}</p>
                    <p className="text-gray-600 mb-4">{t('Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.', {
                      defaultValue: 'Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.theconcept')}</strong>{t('A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak', {
                          defaultValue: 'A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('common.servicesincluded')}</strong>{t('common.venuerentalphotograp')}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">{t('common.from4900thb')}</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('common.examplefor50guests')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Why Choose Krabi Celebration */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="text-center mb-12" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.whychoosekrabicelebr')}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              icon: <MapPin className="w-8 h-8" />,
              title: t('common.localexpertise'),
              description: t('In-depth knowledge of Krabi\'s most beautiful secret sites', {
                defaultValue: 'In-depth knowledge of Krabi\'s most beautiful secret sites'
              })
            }, {
              icon: <Heart className="w-8 h-8" />,
              title: t('common.personalizedservice'),
              description: t('common.eacheventisuniqueand')
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t('common.multilingualteam'),
              description: t('common.frenchenglishandthai')
            }, {
              icon: <Star className="w-8 h-8" />,
              title: t('common.guaranteedauthentici'),
              description: t('common.experiencesrootedint')
            }, {
              icon: <Sparkles className="w-8 h-8" />,
              title: t('common.completelogistics'),
              description: t('common.fromconceptiontoreal')
            }].map((item, index) => <motion.div key={index} className="text-center" initial={{
              opacity: 0,
              y: 20
            }} whileInView={{
              opacity: 1,
              y: 0
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.6,
              delay: index * 0.1
            }}>
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                    {item.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="celebration-form" className="py-16 bg-neutral-50">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-2xl mx-auto" initial={{
            opacity: 0,
            y: 20
          }} whileInView={{
            opacity: 1,
            y: 0
          }} viewport={{
            once: true
          }} transition={{
            duration: 0.6
          }}>
              <div className="text-center mb-8">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.planyourcelebration')}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t('common.contactustodaytotran')}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('common.fullname')}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('common.yourfullname')} required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('common.email')}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t('common.whatsappwithcountryc')}</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} placeholder={t('common.66xxxxxxxxx')} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationType">{t('common.typeofcelebration')}</Label>
                    <Input id="celebrationType" name="celebrationType" value={formData.celebrationType} onChange={handleInputChange} placeholder={t('common.egweddingproposalann')} required />
                  </div>
                  <div>
                    <Label htmlFor="guests">{t('common.numberofguests')}</Label>
                    <Input id="guests" name="guests" type="number" value={formData.guests} onChange={handleInputChange} placeholder={t('common.approximatenumber')} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">{t('common.desireddate')}</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="budget">{t('common.expectedbudget')}</Label>
                    <Input id="budget" name="budget" value={formData.budget} onChange={handleInputChange} placeholder={t('common.eg2000050000thb')} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t('common.describeyourdreamcel')}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your vision, desired style, location preferences and any special requirements..." rows={5} required />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send My Celebration Request'}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <strong>{t('pages.krabiCelebration.title')}</strong>{t('common.adivisionofamontour')}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}