import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import { Handshake, TrendingUp, Users, Shield, Globe, Star } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from 'react-i18next';
interface FormData {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  website: string;
  partnershipType: string;
  description: string;
}
export default function BecomePartner() {
  const { t } = useTranslation();
  const {
    t
  } = useTranslation();
  const {
    toast
  } = useToast();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    partnershipType: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    console.log('Partnership - Submitting form:', formData);
    try {
      const response = await fetch('/api/partnership-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData),
        credentials: 'include'
      });
      console.log('Partnership - Response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Partnership - Error response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      console.log('Partnership - Success result:', result);
      toast({
        title: t('Partnership Request Sent!', {
          defaultValue: 'Partnership Request Sent!'
        }),
        description: t('Thank you for your interest in partnering with us. Our team will review your application and contact you within 24 hours.', {
          defaultValue: 'Thank you for your interest in partnering with us. Our team will review your application and contact you within 24 hours.'
        }),
        duration: 5000
      });

      // Reset form
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        website: '',
        partnershipType: '',
        description: ''
      });
    } catch (error) {
      console.error('Partnership - Submit error:', error);
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
      <SEO title={t('Become Partner - Join Amon Tour Network', {
      defaultValue: 'Become Partner - Join Amon Tour Network'
    })} description="Partner with Amon Tour and grow your business. Attractive commissions, transparent processes, and local expertise for travel agents, hotels, and influencers." keywords="travel partner thailand, tour operator partnership, travel agent commission, affiliate program krabi, b2b travel thailand" />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src="/uploads/tours/tour-1745996624172-231261635.jpeg" alt={t('Professional partnership with Amon Tour', {
            defaultValue: 'Professional partnership with Amon Tour'
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
              <Handshake className="w-16 h-16 text-secondary mx-auto mb-6" />
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">{t('Become Our Partner', {
                defaultValue: 'Become Our Partner'
              })}</h1>
              <p className="text-xl md:text-2xl max-w-3xl mx-auto mb-8">{t('Join our professional network and grow your business with Thailand\'s premier local tour operator.', {
                defaultValue: 'Join our professional network and grow your business with Thailand\'s premier local tour operator.'
              })}</p>
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-white" onClick={() => {
              const formSection = document.getElementById('partnership-form');
              if (formSection) {
                formSection.scrollIntoView({
                  behavior: 'smooth'
                });
              }
            }}>{t('Start Partnership', {
                defaultValue: 'Start Partnership'
              })}</Button>
            </motion.div>
          </div>
        </section>

        {/* Why Partner with Us */}
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Why Partner with Amon Tour?', {
                defaultValue: 'Why Partner with Amon Tour?'
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">{t('We provide the tools, support, and expertise you need to offer exceptional Thailand experiences to your clients.', {
                defaultValue: 'We provide the tools, support, and expertise you need to offer exceptional Thailand experiences to your clients.'
              })}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[{
              icon: <TrendingUp className="w-8 h-8" />,
              title: t('Attractive Commissions', {
                defaultValue: 'Attractive Commissions'
              }),
              description: t('Competitive commission rates with transparent payment terms and reliable monthly payouts.', {
                defaultValue: 'Competitive commission rates with transparent payment terms and reliable monthly payouts.'
              })
            }, {
              icon: <Shield className="w-8 h-8" />,
              title: t('Complete Transparency', {
                defaultValue: 'Complete Transparency'
              }),
              description: t('Real-time booking tracking, clear reporting, and honest communication throughout our partnership.', {
                defaultValue: 'Real-time booking tracking, clear reporting, and honest communication throughout our partnership.'
              })
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t('Local Expertise', {
                defaultValue: 'Local Expertise'
              }),
              description: t('Our experienced local team ensures authentic experiences and exceptional service for your clients.', {
                defaultValue: 'Our experienced local team ensures authentic experiences and exceptional service for your clients.'
              })
            }, {
              icon: <Globe className="w-8 h-8" />,
              title: t('Easy Integration', {
                defaultValue: 'Easy Integration'
              }),
              description: t('Quick onboarding process with marketing materials and ongoing support to get you started fast.', {
                defaultValue: 'Quick onboarding process with marketing materials and ongoing support to get you started fast.'
              })
            }].map((benefit, index) => <motion.div key={index} className="text-center" initial={{
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
                    {benefit.icon}
                  </div>
                  <h3 className="font-heading font-bold text-xl mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Ideal Partners */}
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Ideal Partners', {
                defaultValue: 'Ideal Partners'
              })}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('We welcome partnerships with various types of businesses and professionals in the travel industry.', {
                defaultValue: 'We welcome partnerships with various types of businesses and professionals in the travel industry.'
              })}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              icon: <Globe className="w-12 h-12" />,
              title: t('Travel Agencies & Travel Planners', {
                defaultValue: 'Travel Agencies & Travel Planners'
              }),
              description: t('Travel Agencies and Travel Planners looking to offer authentic and exclusive experiences in South Thailand.', {
                defaultValue: 'Travel Agencies and Travel Planners looking to offer authentic and exclusive experiences in South Thailand.'
              }),
              badge: "High Volume"
            }, {
              icon: <Star className="w-12 h-12" />,
              title: t('Travel Bloggers & Influencers', {
                defaultValue: 'Travel Bloggers & Influencers'
              }),
              description: t('Content creators with engaged audiences interested in Southeast Asia travel', {
                defaultValue: 'Content creators with engaged audiences interested in Southeast Asia travel'
              }),
              badge: "Content Partners"
            }, {
              icon: <Users className="w-12 h-12" />,
              title: t('Hotels & Resorts', {
                defaultValue: 'Hotels & Resorts'
              }),
              description: t('Accommodations wanting to offer curated local experiences to their guests', {
                defaultValue: 'Accommodations wanting to offer curated local experiences to their guests'
              }),
              badge: "Guest Services"
            }, {
              icon: <Shield className="w-12 h-12" />,
              title: t('Concierge Services', {
                defaultValue: 'Concierge Services'
              }),
              description: t('Luxury concierge and personal travel assistants serving high-end clientele', {
                defaultValue: 'Luxury concierge and personal travel assistants serving high-end clientele'
              }),
              badge: "Premium"
            }].map((partner, index) => <motion.div key={index} className="bg-white p-6 rounded-lg shadow-md relative" initial={{
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
                  <div className="absolute top-4 right-4">
                    <span className="bg-secondary/10 text-secondary px-2 py-1 rounded-full text-xs font-medium">
                      {partner.badge}
                    </span>
                  </div>
                  <div className="text-primary mb-4">
                    {partner.icon}
                  </div>
                  <h3 className="font-heading font-bold text-lg mb-3">{partner.title}</h3>
                  <p className="text-gray-600 text-sm">{partner.description}</p>
                </motion.div>)}
            </div>
          </div>
        </section>

        {/* Partnership Benefits */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <motion.div className="max-w-4xl mx-auto" initial={{
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
              <div className="text-center mb-12">
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('What You Get as Our Partner', {
                  defaultValue: 'What You Get as Our Partner'
                })}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Competitive Commission Structure', {
                        defaultValue: 'Competitive Commission Structure'
                      })}</h3>
                      <p className="text-gray-600">{t('Earn up to 15% commission on bookings with performance-based bonuses for top partners.', {
                        defaultValue: 'Earn up to 15% commission on bookings with performance-based bonuses for top partners.'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Marketing Support', {
                        defaultValue: 'Marketing Support'
                      })}</h3>
                      <p className="text-gray-600">{t('High-quality photos, videos, brochures, and web content to promote our experiences.', {
                        defaultValue: 'High-quality photos, videos, brochures, and web content to promote our experiences.'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Dedicated Support', {
                        defaultValue: 'Dedicated Support'
                      })}</h3>
                      <p className="text-gray-600">{t('Personal account manager and 24/7 support for urgent inquiries and bookings.', {
                        defaultValue: 'Personal account manager and 24/7 support for urgent inquiries and bookings.'
                      })}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Booking Platform Access', {
                        defaultValue: 'Booking Platform Access'
                      })}</h3>
                      <p className="text-gray-600">{t('Easy-to-use online portal for real-time availability, instant confirmations, and booking management.', {
                        defaultValue: 'Easy-to-use online portal for real-time availability, instant confirmations, and booking management.'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Training & Education', {
                        defaultValue: 'Training & Education'
                      })}</h3>
                      <p className="text-gray-600">{t('Regular webinars, destination training, and product updates to enhance your selling skills.', {
                        defaultValue: 'Regular webinars, destination training, and product updates to enhance your selling skills.'
                      })}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('Flexible Terms', {
                        defaultValue: 'Flexible Terms'
                      })}</h3>
                      <p className="text-gray-600">{t('No exclusive requirements - work with us alongside other tour operators as it suits your business.', {
                        defaultValue: 'No exclusive requirements - work with us alongside other tour operators as it suits your business.'
                      })}</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section id="partnership-form" className="py-16 bg-neutral-50">
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
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('Start Your Partnership Today', {
                  defaultValue: 'Start Your Partnership Today'
                })}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t('Ready to grow your business with us? Fill out the form below and our partnership team will contact you within 24 hours.', {
                  defaultValue: 'Ready to grow your business with us? Fill out the form below and our partnership team will contact you within 24 hours.'
                })}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">{t('Full Name *', {
                      defaultValue: 'Full Name *'
                    })}</Label>
                    <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder={t('Your full name', {
                    defaultValue: 'Your full name'
                  })} required />
                  </div>
                  <div>
                    <Label htmlFor="companyName">{t('Company Name *', {
                      defaultValue: 'Company Name *'
                    })}</Label>
                    <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder={t('Your company name', {
                    defaultValue: 'Your company name'
                  })} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('Email Address *', {
                      defaultValue: 'Email Address *'
                    })}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="website">{t('Website (Optional)', {
                      defaultValue: 'Website (Optional)'
                    })}</Label>
                    <Input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">{t('Phone Number', {
                    defaultValue: 'Phone Number'
                  })}</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder={t('+66 XX XXX XXXX', {
                  defaultValue: '+66 XX XXX XXXX'
                })} />
                </div>

                <div>
                  <Label htmlFor="partnershipType">{t('Type of Business *', {
                    defaultValue: 'Type of Business *'
                  })}</Label>
                  <Input id="partnershipType" name="partnershipType" value={formData.partnershipType} onChange={handleInputChange} placeholder={t('e.g., Travel Agency, Hotel, Blogger, Concierge Service', {
                  defaultValue: 'e.g., Travel Agency, Hotel, Blogger, Concierge Service'
                })} required />
                </div>

                <div>
                  <Label htmlFor="description">{t('Tell Us About Your Business *', {
                    defaultValue: 'Tell Us About Your Business *'
                  })}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder={t('Describe your business, target market, expected volume, and how you plan to promote our services...', {
                  defaultValue: 'Describe your business, target market, expected volume, and how you plan to promote our services...'
                })} rows={5} required />
                </div>

                <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : 'Submit Partnership Application'}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}