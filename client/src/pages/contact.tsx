import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import { useTranslation } from 'react-i18next';
import { MapPin, Mail, Phone, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
export default function Contact() {
  const {
    t
  } = useTranslation();
  return <>
      <SEO title={t('seo.contactTitle')} description={t('seo.contactDescription')} keywords={t('seo.contactKeywords')} />
      <Header />
      
      <main>
        {/* Hero Section */}
        <HeroHeader title={t('pageHeaders.contact.title')} subtitle={t('pageHeaders.contact.subtitle')} alt={t("Contact Amon Tour in Krabi", {
        defaultValue: "Contact Amon Tour in Krabi"
      })} />

        {/* Main Content */}
        <section className="py-20 bg-background">
          <div className="container mx-auto px-4 max-w-4xl text-center">
              
              {/* Contact Information */}
              <div className="mb-8">
                <motion.div initial={{
              y: -20,
              opacity: 0
            }} whileInView={{
              y: 0,
              opacity: 1
            }} viewport={{
              once: true
            }} transition={{
              duration: 0.5
            }}>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{t('pageHeaders.contact.getInTouch')}</h2>
                  <div className="w-20 h-1 bg-secondary mx-auto mb-8"></div>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {t('pageHeaders.contact.readyToExplore')}
                  </p>
                </motion.div>
              </div>
              <motion.div initial={{
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

                <div className="space-y-6">
                  {/* Email */}
                  <motion.div className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow" whileHover={{
                y: -2
              }}>
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Mail className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">{t('pageHeaders.contact.email')}</p>
                      <a href="mailto:info@amon-tour.com" className="text-foreground hover:text-primary transition-colors">
                        info@amon-tour.com
                      </a>
                    </div>
                  </motion.div>

                  {/* Phone */}
                  <motion.div className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow" whileHover={{
                y: -2
              }}>
                    <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Phone className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">{t('pageHeaders.contact.phone')}</p>
                      <a href="tel:+66962166559" className="text-foreground hover:text-primary transition-colors">
                        +66 (0)96 216 6559
                      </a>
                    </div>
                  </motion.div>

                  {/* WhatsApp */}
                  <motion.div className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow" whileHover={{
                y: -2
              }}>
                    <div className="w-12 h-12 bg-[hsl(var(--success)/0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">{t('pageHeaders.contact.whatsapp')}</p>
                      <a href="https://wa.me/66653496445" target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-primary transition-colors">
                        +66 65 349 6445
                      </a>
                    </div>
                  </motion.div>

                  {/* Line */}
                  <motion.div className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow" whileHover={{
                y: -2
              }}>
                    <div className="w-12 h-12 bg-[hsl(var(--success)/0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                    </div>
                    <div>
                      <p className="font-heading font-semibold text-primary">{t('pageHeaders.contact.line')}</p>
                      <span className="text-foreground">amontour</span>
                    </div>
                  </motion.div>
                </div>

                {/* Business Info */}
                <motion.div className="mt-8 p-6 bg-muted rounded-lg" initial={{
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
                  <h3 className="font-heading font-bold text-lg mb-3">{t("About Our Company", {
                  defaultValue: "About Our Company"
                })}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>
                      <strong>{t("Amon Tour is a brand of:", {
                      defaultValue: "Amon Tour is a brand of:"
                    })}</strong><br />{t("Flame BB Co., Ltd.", {
                    defaultValue: "Flame BB Co., Ltd."
                  })}</p>
                    <p>
                      <span className="bg-secondary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">{t("TAT License: 34/01995", {
                      defaultValue: "TAT License: 34/01995"
                    })}</span>
                    </p>
                    <p className="mt-4">{t("We are a licensed tour operator based in Ao Nang, Krabi, \n                      specializing in authentic local experiences and personalized travel services.", {
                    defaultValue: "We are a licensed tour operator based in Ao Nang, Krabi, \n                      specializing in authentic local experiences and personalized travel services."
                  })}</p>
                  </div>
                </motion.div>
              </motion.div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 bg-muted">
          <div className="container mx-auto px-4">
            <motion.div className="text-center max-w-3xl mx-auto" initial={{
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
              <h3 className="font-heading font-bold text-2xl md:text-3xl mb-4">{t("Ready to Start Your Adventure?", {
                defaultValue: "Ready to Start Your Adventure?"
              })}</h3>
              <p className="text-gray-600 text-lg mb-6">{t('Whether you\'re looking for a private tour, custom itinerary, or have questions about Krabi, \n                our local experts are ready to help you create unforgettable memories.', {
                defaultValue: 'Whether you\'re looking for a private tour, custom itinerary, or have questions about Krabi, \n                our local experts are ready to help you create unforgettable memories.'
              })}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a href="https://wa.me/66653496445" target="_blank" rel="noopener noreferrer" className="bg-[hsl(var(--success))] hover:bg-[hsl(var(--success)/0.9)] text-[hsl(var(--success-foreground))] px-6 py-3 rounded-lg font-heading font-semibold transition-colors">{t("Chat on WhatsApp", {
                  defaultValue: "Chat on WhatsApp"
                })}</a>
                <a href="mailto:info@amon-tour.com" className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-heading font-semibold transition-colors">{t("Send us an Email", {
                  defaultValue: "Send us an Email"
                })}</a>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}