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
        title: t('common.partnershiprequestse'),
        description: t('common.thankyouforyourinter'),
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
      <SEO title={t('common.becomepartnerjoinamo')} description="Partner with Amon Tour and grow your business. Attractive commissions, transparent processes, and local expertise for travel agents, hotels, and influencers." keywords="travel partner thailand, tour operator partnership, travel agent commission, affiliate program krabi, b2b travel thailand" />
      <Header />
      
      <main>
        {/* Hero Section */}
        <section className="relative h-[60vh] overflow-hidden">
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="absolute inset-0 z-0">
            <img src="/uploads/tours/tour-1745996624172-231261635.jpeg" alt={t('common.professionalpartners')} className="w-full h-full object-cover" />
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
              <h1 className="font-heading font-bold text-4xl md:text-5xl mb-6">{t('common.becomeourpartner')}</h1>
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
            }}>{t('common.startpartnership')}</Button>
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.whypartnerwithamonto')}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-3xl mx-auto text-lg">{t('common.weprovidethetoolssup')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[{
              icon: <TrendingUp className="w-8 h-8" />,
              title: t('common.attractivecommission'),
              description: t('common.competitivecommissio')
            }, {
              icon: <Shield className="w-8 h-8" />,
              title: t('common.completetransparency'),
              description: t('common.realtimebookingtrack')
            }, {
              icon: <Users className="w-8 h-8" />,
              title: t('common.localexpertise'),
              description: t('common.ourexperiencedlocalt')
            }, {
              icon: <Globe className="w-8 h-8" />,
              title: t('common.easyintegration'),
              description: t('common.quickonboardingproce')
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
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.idealpartners')}</h2>
              <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              <p className="text-gray-600 max-w-2xl mx-auto">{t('common.wewelcomepartnership')}</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[{
              icon: <Globe className="w-12 h-12" />,
              title: t('common.travelagenciestravel'),
              description: t('common.travelagenciesandtra'),
              badge: "High Volume"
            }, {
              icon: <Star className="w-12 h-12" />,
              title: t('common.travelbloggersinflue'),
              description: t('common.contentcreatorswithe'),
              badge: "Content Partners"
            }, {
              icon: <Users className="w-12 h-12" />,
              title: t('common.hotelsresorts'),
              description: t('common.accommodationswantin'),
              badge: "Guest Services"
            }, {
              icon: <Shield className="w-12 h-12" />,
              title: t('common.conciergeservices'),
              description: t('common.luxuryconciergeandpe'),
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
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.whatyougetasourpartn')}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.competitivecommissio')}</h3>
                      <p className="text-gray-600">{t('common.earnupto15commission')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Globe className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.marketingsupport')}</h3>
                      <p className="text-gray-600">{t('common.highqualityphotosvid')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.dedicatedsupport')}</h3>
                      <p className="text-gray-600">{t('common.personalaccountmanag')}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Shield className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.bookingplatformacces')}</h3>
                      <p className="text-gray-600">{t('common.easytouseonlineporta')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Star className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.trainingeducation')}</h3>
                      <p className="text-gray-600">{t('common.regularwebinarsdesti')}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Handshake className="w-5 h-5 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold text-lg mb-2">{t('common.flexibleterms')}</h3>
                      <p className="text-gray-600">{t('common.noexclusiverequireme')}</p>
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
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-4">{t('common.startyourpartnership')}</h2>
                <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
                <p className="text-gray-600">{t('common.readytogrowyourbusin')}</p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contactName">{t('common.fullname')}</Label>
                    <Input id="contactName" name="contactName" value={formData.contactName} onChange={handleInputChange} placeholder={t('common.yourfullname')} required />
                  </div>
                  <div>
                    <Label htmlFor="companyName">{t('common.companyname')}</Label>
                    <Input id="companyName" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder={t('common.yourcompanyname')} required />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">{t('common.emailaddress')}</Label>
                    <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your@email.com" required />
                  </div>
                  <div>
                    <Label htmlFor="website">{t('common.websiteoptional')}</Label>
                    <Input id="website" name="website" type="url" value={formData.website} onChange={handleInputChange} placeholder="https://yourwebsite.com" />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">{t('common.phonenumber')}</Label>
                  <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleInputChange} placeholder={t('common.66xxxxxxxxx')} />
                </div>

                <div>
                  <Label htmlFor="partnershipType">{t('common.typeofbusiness')}</Label>
                  <Input id="partnershipType" name="partnershipType" value={formData.partnershipType} onChange={handleInputChange} placeholder={t('common.egtravelagencyhotelb')} required />
                </div>

                <div>
                  <Label htmlFor="description">{t('common.tellusaboutyourbusin')}</Label>
                  <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} placeholder={t('common.describeyourbusiness')} rows={5} required />
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