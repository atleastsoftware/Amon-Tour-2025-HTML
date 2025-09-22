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
      <SEO title={t('Krabi Celebration - Unique Moments in Exceptional Settings', {
      defaultValue: 'Krabi Celebration - Unique Moments in Exceptional Settings'
    })} description="Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration. Intimate weddings, romantic dinners and tailor-made celebrations in Thailand." keywords="krabi celebration, thailand wedding, romantic dinner krabi, destination wedding celebration, thailand wedding planner, private beach ceremony" />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt={t('Krabi Celebration - Unique moments in exceptional settings', {
            defaultValue: 'Krabi Celebration - Unique moments in exceptional settings'
          })} className="w-full h-full object-cover" />
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
              <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6">{t('Krabi Celebration', {
                defaultValue: 'Krabi Celebration'
              })}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">{t('Unique moments in an exceptional setting', {
                defaultValue: 'Unique moments in an exceptional setting'
              })}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
              const formSection = document.getElementById('celebration-form');
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }}>{t('Plan Your Celebration', {
                defaultValue: 'Plan Your Celebration'
              })}</Button>
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">{t('Create Unforgettable Memories', {
                defaultValue: 'Create Unforgettable Memories'
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{t('Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration, our exclusive service dedicated to exceptional events. With our regional expertise and passion for Thai authenticity, we orchestrate tailor-made celebrations that transform your dreams into reality.', {
                defaultValue: 'Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration, our exclusive service dedicated to exceptional events. With our regional expertise and passion for Thai authenticity, we orchestrate tailor-made celebrations that transform your dreams into reality.'
              })}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{t('Whether you want to propose on a secret beach, celebrate your union in a breathtaking natural setting, or simply share a romantic dinner under the stars, Krabi Celebration puts its expertise and creativity at your service to create truly unique experiences.', {
                defaultValue: 'Whether you want to propose on a secret beach, celebrate your union in a breathtaking natural setting, or simply share a romantic dinner under the stars, Krabi Celebration puts its expertise and creativity at your service to create truly unique experiences.'
              })}</p>
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Our Celebration Experiences', {
                defaultValue: 'Our Celebration Experiences'
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('Choose from our signature experiences or let us create something completely unique for you.', {
                defaultValue: 'Choose from our signature experiences or let us create something completely unique for you.'
              })}</p>
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
                    <img src={image4} alt={t('Romantic dinner on private beach', {
                    defaultValue: 'Romantic dinner on private beach'
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t('\uD83C\uDF05 Romantic Experience', {
                        defaultValue: '\uD83C\uDF05 Romantic Experience'
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('Romantic Dinner on Private Beach', {
                      defaultValue: 'Romantic Dinner on Private Beach'
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('The perfect experience for romantic souls', {
                      defaultValue: 'The perfect experience for romantic souls'
                    })}</p>
                    <p className="text-gray-600 mb-4">{t('Escape to a secret beach near Thalane Bay, a true hidden gem with colorful cliffs that few travelers know about. Your evening begins with a romantic sunset cruise to this preserved paradise.', {
                      defaultValue: 'Escape to a secret beach near Thalane Bay, a true hidden gem with colorful cliffs that few travelers know about. Your evening begins with a romantic sunset cruise to this preserved paradise.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The setting:', {
                            defaultValue: 'The setting:'
                          })}</strong>{t('Private beach facing the sunset, bamboo installation with traditional cushions, torch lighting and refined floral decoration', {
                          defaultValue: 'Private beach facing the sunset, bamboo installation with traditional cushions, torch lighting and refined floral decoration'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The menu:', {
                            defaultValue: 'The menu:'
                          })}</strong>{t('Refined buffet of Thai specialties with grilled seafood, vegetable fried rice, authentic Massaman curry, fish in foil, and tropical fruit platter', {
                          defaultValue: 'Refined buffet of Thai specialties with grilled seafood, vegetable fried rice, authentic Massaman curry, fish in foil, and tropical fruit platter'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The team:', {
                            defaultValue: 'The team:'
                          })}</strong>{t('Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform', {
                          defaultValue: 'Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t('22,000 THB', {
                          defaultValue: '22,000 THB'
                        })}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('Options: Professional photographer (+8,000 THB), Champagne (+2,500 THB)', {
                        defaultValue: 'Options: Professional photographer (+8,000 THB), Champagne (+2,500 THB)'
                      })}</p>
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
                    <img src={image2} alt={t('Intimate beach wedding', {
                    defaultValue: 'Intimate beach wedding'
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{t('\uD83D\uDC8D Intimate Wedding', {
                        defaultValue: '\uD83D\uDC8D Intimate Wedding'
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('Intimate Beach Wedding', {
                      defaultValue: 'Intimate Beach Wedding'
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('The ceremony of your dreams facing Phang Nga Bay', {
                      defaultValue: 'The ceremony of your dreams facing Phang Nga Bay'
                    })}</p>
                    <p className="text-gray-600 mb-4">{t('Begin with a traditional blessing ceremony at Wat Nong Chik monastery with a Buddhist monk, then join the magnificent Thalane beach to celebrate your union in an idyllic setting.', {
                      defaultValue: 'Begin with a traditional blessing ceremony at Wat Nong Chik monastery with a Buddhist monk, then join the magnificent Thalane beach to celebrate your union in an idyllic setting.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The program:', {
                            defaultValue: 'The program:'
                          })}</strong>{t('Buddhist ceremony (4 PM), beach celebration with vow exchange, romantic candlelit dinner and traditional lantern release', {
                          defaultValue: 'Buddhist ceremony (4 PM), beach celebration with vow exchange, romantic candlelit dinner and traditional lantern release'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('Included:', {
                            defaultValue: 'Included:'
                          })}</strong>{t('Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant', {
                          defaultValue: 'Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t('19,500 THB', {
                          defaultValue: '19,500 THB'
                        })}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('Options: Professional photographer, champagne and additional wines', {
                        defaultValue: 'Options: Professional photographer, champagne and additional wines'
                      })}</p>
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
                    <img src={image1} alt={t('Wedding in the secret gardens of Ao Nammao', {
                    defaultValue: 'Wedding in the secret gardens of Ao Nammao'
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t('\uD83C\uDF3F Secret Gardens', {
                        defaultValue: '\uD83C\uDF3F Secret Gardens'
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('Beach Wedding in Ao Nammao Secret Gardens', {
                      defaultValue: 'Beach Wedding in Ao Nammao Secret Gardens'
                    })}</h3>
                    <p className="text-gray-600 mb-4">{t('Imagine a magical ceremony in a tropical garden by the sea, followed by an elegant, gourmet and festive evening... In a confidential location in Ao Nammao, between two charming villas and a beachfront restaurant, live an unforgettable day surrounded by those you love.', {
                      defaultValue: 'Imagine a magical ceremony in a tropical garden by the sea, followed by an elegant, gourmet and festive evening... In a confidential location in Ao Nammao, between two charming villas and a beachfront restaurant, live an unforgettable day surrounded by those you love.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The concept:', {
                            defaultValue: 'The concept:'
                          })}</strong>{t('An intimate and refined wedding between beach and garden, in the heart of a preserved natural environment', {
                          defaultValue: 'An intimate and refined wedding between beach and garden, in the heart of a preserved natural environment'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('Included:', {
                            defaultValue: 'Included:'
                          })}</strong>{t('2 villas with 2 bedrooms and pool plus large beachfront garden, flowered bamboo structure, photographer, wedding cake, complete installation, master of ceremony, professional DJ, cocktail hour, cocktail bar, fire show, dinner on the beach', {
                          defaultValue: '2 villas with 2 bedrooms and pool plus large beachfront garden, flowered bamboo structure, photographer, wedding cake, complete installation, master of ceremony, professional DJ, cocktail hour, cocktail bar, fire show, dinner on the beach'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">{t('Price on Request', {
                          defaultValue: 'Price on Request'
                        })}</span>
                        <span className="text-sm text-gray-500">{t('Contact us', {
                          defaultValue: 'Contact us'
                        })}</span>
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
                    <img src={image3} alt={t('Jungle celebration at Mountain of Spirit', {
                    defaultValue: 'Jungle celebration at Mountain of Spirit'
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[hsl(var(--success))] text-white px-3 py-1 rounded-full text-sm font-medium">{t('\uD83C\uDF34 Jungle Celebration', {
                        defaultValue: '\uD83C\uDF34 Jungle Celebration'
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t('Jungle Celebration', {
                      defaultValue: 'Jungle Celebration'
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t('A spectacular wedding for up to 200 guests', {
                      defaultValue: 'A spectacular wedding for up to 200 guests'
                    })}</p>
                    <p className="text-gray-600 mb-4">{t('Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.', {
                      defaultValue: 'Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('The concept:', {
                            defaultValue: 'The concept:'
                          })}</strong>{t('A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak', {
                          defaultValue: 'A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t('Services included:', {
                            defaultValue: 'Services included:'
                          })}</strong>{t('Venue rental, photographer 3h, wedding cake, complete installation, English-speaking master of ceremony, professional DJ, Thai specialty buffet, smoothie and cocktail bar and dance party until 2 AM', {
                          defaultValue: 'Venue rental, photographer 3h, wedding cake, complete installation, English-speaking master of ceremony, professional DJ, Thai specialty buffet, smoothie and cocktail bar and dance party until 2 AM'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">{t('From 4,900 THB', {
                          defaultValue: 'From 4,900 THB'
                        })}</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <p className="text-xs text-gray-500">{t('Example for 50 guests', {
                        defaultValue: 'Example for 50 guests'
                      })}</p>
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Why Choose Krabi Celebration?', {
                defaultValue: 'Why Choose Krabi Celebration?'
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              icon: <MapPin className="w-8 h-8" />,
              title: t('Local Expertise', {
                defaultValue: 'Local Expertise'
              }),
              description: t('In-depth knowledge of Krabi\'s most beautiful secret sites', {
                defaultValue: 'In-depth knowledge of Krabi\'s most beautiful secret sites'
              })
            }, {
              icon: <Heart className="w-8 h-8" />,
              title: t('Personalized Service', {
                defaultValue: 'Personalized Service'
              }),
              description: t('Each event is unique and adapted to your wishes', {
                defaultValue: 'Each event is unique and adapted to your wishes'
              })
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t('Multilingual Team', {
                defaultValue: 'Multilingual Team'
              }),
              description: t('French, English and Thai staff for exceptional service', {
                defaultValue: 'French, English and Thai staff for exceptional service'
              })
            }, {
              icon: <Star className="w-8 h-8" />,
              title: t('Guaranteed Authenticity', {
                defaultValue: 'Guaranteed Authenticity'
              }),
              description: t('Experiences rooted in Thai culture', {
                defaultValue: 'Experiences rooted in Thai culture'
              })
            }, {
              icon: <Sparkles className="w-8 h-8" />,
              title: t('Complete Logistics', {
                defaultValue: 'Complete Logistics'
              }),
              description: t('From conception to realization, we manage everything', {
                defaultValue: 'From conception to realization, we manage everything'
              })
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
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Plan Your Celebration', {
                  defaultValue: 'Plan Your Celebration'
                })}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t('Contact us today to transform your dreams into eternal memories in Krabi!', {
                  defaultValue: 'Contact us today to transform your dreams into eternal memories in Krabi!'
                })}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t('Full Name *', {
                      defaultValue: 'Full Name *'
                    })}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t('Your full name', {
                    defaultValue: 'Your full name'
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t('Email *', {
                      defaultValue: 'Email *'
                    })}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t('WhatsApp (with country code)', {
                    defaultValue: 'WhatsApp (with country code)'
                  })}</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} placeholder={t('+66 XX XXX XXXX', {
                  defaultValue: '+66 XX XXX XXXX'
                })} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationType">{t('Type of Celebration *', {
                      defaultValue: 'Type of Celebration *'
                    })}</Label>
                    <Input id="celebrationType" name="celebrationType" value={formData.celebrationType} onChange={handleInputChange} placeholder={t('e.g: Wedding, Proposal, Anniversary', {
                    defaultValue: 'e.g: Wedding, Proposal, Anniversary'
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="guests">{t('Number of Guests', {
                      defaultValue: 'Number of Guests'
                    })}</Label>
                    <Input id="guests" name="guests" type="number" value={formData.guests} onChange={handleInputChange} placeholder={t('Approximate number', {
                    defaultValue: 'Approximate number'
                  })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">{t('Desired Date', {
                      defaultValue: 'Desired Date'
                    })}</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="budget">{t('Expected Budget', {
                      defaultValue: 'Expected Budget'
                    })}</Label>
                    <Input id="budget" name="budget" value={formData.budget} onChange={handleInputChange} placeholder={t('e.g: 20,000-50,000 THB', {
                    defaultValue: 'e.g: 20,000-50,000 THB'
                  })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t('Describe Your Dream Celebration *', {
                    defaultValue: 'Describe Your Dream Celebration *'
                  })}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your vision, desired style, location preferences and any special requirements..." rows={5} required />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send My Celebration Request'}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <strong>{t('Krabi Celebration', {
                    defaultValue: 'Krabi Celebration'
                  })}</strong>{t('- A division of Amon Tour', {
                  defaultValue: '- A division of Amon Tour'
                })}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}