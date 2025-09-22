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
  const {
    t
  } = useTranslation();
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
      <SEO title={t("Krabi Celebration - Unique events in paradise", {
      defaultValue: "Krabi Celebration - Unique events in paradise"
    })} description="Let yourself be enchanted by the magic of Krabi and create unforgettable memories with Krabi Celebration. Intimate weddings, romantic dinners and tailor-made celebrations in Thailand." keywords="krabi celebration, thailand wedding, romantic dinner krabi, destination wedding celebration, thailand wedding planner, private beach ceremony" />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[70vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/30 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src={heroImage} alt={t("Krabi Celebration - Unique events in paradise", {
            defaultValue: "Krabi Celebration - Unique events in paradise"
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
              <h1 className="font-heading font-bold text-4xl md:text-6xl mb-6">{t('pages.krabiCelebration.title')}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">{t("Unique moments in an exceptional setting", {
                defaultValue: "Unique moments in an exceptional setting"
              })}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
              const formSection = document.getElementById('celebration-form');
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }}>{t("Plan your celebration", {
                defaultValue: "Plan your celebration"
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">{t("Create unforgettable memories", {
                defaultValue: "Create unforgettable memories"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">{t("Let yourself be enchanted", {
                defaultValue: "Let yourself be enchanted"
              })}</p>
              <p className="text-gray-600 text-lg leading-relaxed">{t("Whether you want to propose", {
                defaultValue: "Whether you want to propose"
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Our celebration experiences", {
                defaultValue: "Our celebration experiences"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t("Choose from our signature experiences", {
                defaultValue: "Choose from our signature experiences"
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
                    <img src={image4} alt={t("Romantic dinner on private beach", {
                    defaultValue: "Romantic dinner on private beach"
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t("\uD83C\uDF05 Romantic experience", {
                        defaultValue: "\uD83C\uDF05 Romantic experience"
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t("Romantic dinner on private beach", {
                      defaultValue: "Romantic dinner on private beach"
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t("The perfect experience for proposals and romantic dinners", {
                      defaultValue: "The perfect experience for proposals and romantic dinners"
                    })}</p>
                    <p className="text-gray-600 mb-4">{t("Escape to a secret beach for an unforgettable evening", {
                      defaultValue: "Escape to a secret beach for an unforgettable evening"
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The setting", {
                            defaultValue: "The setting"
                          })}</strong>{t("Private beach facing the sunset with panoramic view", {
                          defaultValue: "Private beach facing the sunset with panoramic view"
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The menu", {
                            defaultValue: "The menu"
                          })}</strong>{t("Refined buffet of Thai specialties and international dishes", {
                          defaultValue: "Refined buffet of Thai specialties and international dishes"
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The team", {
                            defaultValue: "The team"
                          })}</strong>{t('Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform', {
                          defaultValue: 'Thai captain, local cook, professional guide and French ma\xEEtre d\'h\xF4tel in uniform'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t("22,000 THB", {
                          defaultValue: "22,000 THB"
                        })}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t("Options: Professional photographer, additional decorations", {
                        defaultValue: "Options: Professional photographer, additional decorations"
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
                    <img src={image2} alt={t("Intimate beach wedding", {
                    defaultValue: "Intimate beach wedding"
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">{t("\uD83D\uDC8D Intimate wedding ceremony", {
                        defaultValue: "\uD83D\uDC8D Intimate wedding ceremony"
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t("Intimate beach wedding", {
                      defaultValue: "Intimate beach wedding"
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t("The ceremony of your dreams on a paradisiacal beach", {
                      defaultValue: "The ceremony of your dreams on a paradisiacal beach"
                    })}</p>
                    <p className="text-gray-600 mb-4">{t("Begin with a traditional Thai blessing", {
                      defaultValue: "Begin with a traditional Thai blessing"
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The program", {
                            defaultValue: "The program"
                          })}</strong>{t("Buddhist ceremony 4pm, Beach celebration 6pm", {
                          defaultValue: "Buddhist ceremony 4pm, Beach celebration 6pm"
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Heart className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("Included", {
                            defaultValue: "Included"
                          })}</strong>{t('Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant', {
                          defaultValue: 'Bouquet and boutonni\xE8re, complete bamboo decoration, souvenir wedding certificate, French master of ceremony, and dinner at "Bac \xE0 Sable" restaurant'
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-2xl font-bold text-primary">{t("19,500 THB", {
                          defaultValue: "19,500 THB"
                        })}</span>
                        <span className="text-sm text-gray-500">for 2 people</span>
                      </div>
                      <p className="text-xs text-gray-500">{t("Options: Professional photographer, additional decorations", {
                        defaultValue: "Options: Professional photographer, additional decorations"
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
                    <img src={image1} alt={t("Wedding in the secret garden", {
                    defaultValue: "Wedding in the secret garden"
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-secondary text-white px-3 py-1 rounded-full text-sm font-medium">{t("\uD83C\uDF3F Secret garden wedding", {
                        defaultValue: "\uD83C\uDF3F Secret garden wedding"
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t("Beach wedding in Ao Nang for up to 20 guests", {
                      defaultValue: "Beach wedding in Ao Nang for up to 20 guests"
                    })}</h3>
                    <p className="text-gray-600 mb-4">{t("Imagine a magical ceremony in a tropical garden", {
                      defaultValue: "Imagine a magical ceremony in a tropical garden"
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The concept", {
                            defaultValue: "The concept"
                          })}</strong>{t("An intimate and refined celebration", {
                          defaultValue: "An intimate and refined celebration"
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("Included", {
                            defaultValue: "Included"
                          })}</strong>{t("2 villas with 2 bedrooms each for your guests", {
                          defaultValue: "2 villas with 2 bedrooms each for your guests"
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-primary">{t("Price on request", {
                          defaultValue: "Price on request"
                        })}</span>
                        <span className="text-sm text-gray-500">{t("Contact us", {
                          defaultValue: "Contact us"
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
                    <img src={image3} alt={t("Jungle celebration at Mae Ping River", {
                    defaultValue: "Jungle celebration at Mae Ping River"
                  })} className="w-full h-full object-cover" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[hsl(var(--success))] text-white px-3 py-1 rounded-full text-sm font-medium">{t("\uD83C\uDF34 Jungle celebration", {
                        defaultValue: "\uD83C\uDF34 Jungle celebration"
                      })}</span>
                    </div>
                  </div>
                  <div className="p-8 order-1 lg:order-2">
                    <h3 className="font-heading font-bold text-2xl mb-4">{t("Jungle celebration", {
                      defaultValue: "Jungle celebration"
                    })}</h3>
                    <p className="text-gray-600 mb-4 italic">{t("A spectacular wedding for up to 80 guests", {
                      defaultValue: "A spectacular wedding for up to 80 guests"
                    })}</p>
                    <p className="text-gray-600 mb-4">{t('Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.', {
                      defaultValue: 'Discover the "Mountain of Spirit" in Chong Pli, a lush tropical garden nestled at the foot of impressive limestone cliffs. This magical place, a natural refuge of the local community, offers a unique setting mixing mysterious caves and tropical vegetation.'
                    })}</p>
                    <div className="space-y-2 mb-6">
                      <div className="flex items-start text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("The concept", {
                            defaultValue: "The concept"
                          })}</strong>{t('A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak', {
                          defaultValue: 'A "Garden party" for up to 200 guests for an unforgettable evening between jungle and karst peak'
                        })}</span>
                      </div>
                      <div className="flex items-start text-sm text-gray-600">
                        <Gift className="w-4 h-4 mr-2 text-primary mt-0.5 flex-shrink-0" />
                        <span><strong>{t("Services included", {
                            defaultValue: "Services included"
                          })}</strong>{t("Venue rental, photography, catering, decoration", {
                          defaultValue: "Venue rental, photography, catering, decoration"
                        })}</span>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xl font-bold text-primary">{t("From 4,900 THB", {
                          defaultValue: "From 4,900 THB"
                        })}</span>
                        <span className="text-sm text-gray-500">per person</span>
                      </div>
                      <p className="text-xs text-gray-500">{t("Example for 50 guests", {
                        defaultValue: "Example for 50 guests"
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Why choose Krabi Celebration?", {
                defaultValue: "Why choose Krabi Celebration?"
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[{
              icon: <MapPin className="w-8 h-8" />,
              title: t("Local expertise", {
                defaultValue: "Local expertise"
              }),
              description: t('In-depth knowledge of Krabi\'s most beautiful secret sites', {
                defaultValue: 'In-depth knowledge of Krabi\'s most beautiful secret sites'
              })
            }, {
              icon: <Heart className="w-8 h-8" />,
              title: t("Personalized service", {
                defaultValue: "Personalized service"
              }),
              description: t("Each event is unique and tailored to your desires", {
                defaultValue: "Each event is unique and tailored to your desires"
              })
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t("Multilingual team", {
                defaultValue: "Multilingual team"
              }),
              description: t("French, English, and Thai speaking", {
                defaultValue: "French, English, and Thai speaking"
              })
            }, {
              icon: <Star className="w-8 h-8" />,
              title: t("Guaranteed authenticity", {
                defaultValue: "Guaranteed authenticity"
              }),
              description: t("Experiences rooted in Thai culture", {
                defaultValue: "Experiences rooted in Thai culture"
              })
            }, {
              icon: <Sparkles className="w-8 h-8" />,
              title: t("Complete logistics", {
                defaultValue: "Complete logistics"
              }),
              description: t("From conception to realization", {
                defaultValue: "From conception to realization"
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
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t("Plan your celebration", {
                  defaultValue: "Plan your celebration"
                })}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t("Contact us today to transform your dreams into reality", {
                  defaultValue: "Contact us today to transform your dreams into reality"
                })}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{t("Full Name", {
                      defaultValue: "Full Name"
                    })}</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} placeholder={t("Your full name", {
                    defaultValue: "Your full name"
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="email">{t("Email", {
                      defaultValue: "Email"
                    })}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="whatsapp">{t("WhatsApp with country code", {
                    defaultValue: "WhatsApp with country code"
                  })}</Label>
                  <Input id="whatsapp" name="whatsapp" type="tel" value={formData.whatsapp} onChange={handleInputChange} placeholder={t("+66 XXXXXXXXX", {
                  defaultValue: "+66 XXXXXXXXX"
                })} />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="celebrationType">{t("Type of celebration", {
                      defaultValue: "Type of celebration"
                    })}</Label>
                    <Input id="celebrationType" name="celebrationType" value={formData.celebrationType} onChange={handleInputChange} placeholder={t("e.g., Wedding, Proposal, Anniversary", {
                    defaultValue: "e.g., Wedding, Proposal, Anniversary"
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="guests">{t("Number of guests", {
                      defaultValue: "Number of guests"
                    })}</Label>
                    <Input id="guests" name="guests" type="number" value={formData.guests} onChange={handleInputChange} placeholder={t("Approximate number", {
                    defaultValue: "Approximate number"
                  })} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="date">{t("Desired date", {
                      defaultValue: "Desired date"
                    })}</Label>
                    <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="budget">{t("Expected budget", {
                      defaultValue: "Expected budget"
                    })}</Label>
                    <Input id="budget" name="budget" value={formData.budget} onChange={handleInputChange} placeholder={t("e.g., 20,000 - 50,000 THB", {
                    defaultValue: "e.g., 20,000 - 50,000 THB"
                  })} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">{t("Describe your dream celebration", {
                    defaultValue: "Describe your dream celebration"
                  })}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder="Describe your vision, desired style, location preferences and any special requirements..." rows={5} required />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Send My Celebration Request'}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-gray-600 text-sm">
                  <strong>{t('pages.krabiCelebration.title')}</strong>{t("A division of Amon Tour", {
                  defaultValue: "A division of Amon Tour"
                })}</p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}