import { motion } from "framer-motion";
import { Mail, Phone, MessageCircle } from "lucide-react";

interface ContactBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      titleColor?: string;
      subtitleColor?: string;
      dividerColor?: string;
      backgroundColor?: string;
      email?: string;
      emailLabel?: string;
      phone?: string;
      phoneLabel?: string;
      whatsapp?: string;
      whatsappLabel?: string;
      lineId?: string;
      lineIdLabel?: string;
      showAboutCompany?: boolean;
      aboutTitle?: string;
      companyBrand?: string;
      companyName?: string;
      companyLicense?: string;
      companyDescription?: string;
    };
  };
}

export default function ContactBlock({ block }: ContactBlockProps) {
  const config = block.configuration || {};
  
  const title = config.title ?? "Titre principal";
  const subtitle = config.subtitle ?? "Description pour votre section de contact";
  const titleColor = config.titleColor ?? "#333333";
  const subtitleColor = config.subtitleColor ?? "#666666";
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  
  const email = config.email ?? "contact@example.com";
  const emailLabel = config.emailLabel ?? "Email";
  const phone = config.phone ?? "+ 22 222 222 222";
  const phoneLabel = config.phoneLabel ?? "Téléphone";
  const whatsapp = config.whatsapp ?? "+ 22 222 222 222";
  const whatsappLabel = config.whatsappLabel ?? "WhatsApp";
  const lineId = config.lineId ?? "moncompte";
  const lineIdLabel = config.lineIdLabel ?? "Line ID";
  
  const showAboutCompany = config.showAboutCompany ?? true;
  const aboutTitle = config.aboutTitle ?? "À propos de notre entreprise";
  const companyBrand = config.companyBrand ?? "Nom de la marque";
  const companyName = config.companyName ?? "Votre Adresse";
  const companyLicense = config.companyLicense ?? "00/00000";
  const companyDescription = config.companyDescription ?? "";

  return (
    <section className="py-20" style={{ backgroundColor }}>
      <div className="container mx-auto px-4 max-w-4xl text-center">
        {(title || subtitle) && (
          <div className="mb-8">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              {title && (
                <>
                  <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3" style={{ color: titleColor }}>
                    {title}
                  </h2>
                  <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: dividerColor }}></div>
                </>
              )}
              {subtitle && (
                <p className="text-lg leading-relaxed" style={{ color: subtitleColor }}>
                  {subtitle}
                </p>
              )}
            </motion.div>
          </div>
        )}
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="space-y-6">
            {/* Email */}
            {email && (
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-primary">{emailLabel}</p>
                  <a 
                    href={`mailto:${email}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {email}
                  </a>
                </div>
              </motion.div>
            )}

            {/* Phone */}
            {phone && (
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-6 h-6 text-secondary" />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-primary">{phoneLabel}</p>
                  <a 
                    href={`tel:${phone.replace(/\s/g, '')}`}
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {phone}
                  </a>
                </div>
              </motion.div>
            )}

            {/* WhatsApp */}
            {whatsapp && (
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 bg-[hsl(var(--success)/0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-primary">{whatsappLabel}</p>
                  <a 
                    href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground hover:text-primary transition-colors"
                  >
                    {whatsapp}
                  </a>
                </div>
              </motion.div>
            )}

            {/* Line */}
            {lineId && (
              <motion.div 
                className="flex items-center space-x-4 p-4 bg-background border border-border rounded-lg shadow-sm hover:shadow-md transition-shadow"
                whileHover={{ y: -2 }}
              >
                <div className="w-12 h-12 bg-[hsl(var(--success)/0.1)] rounded-full flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-6 h-6 text-[hsl(var(--success))]" />
                </div>
                <div className="text-left">
                  <p className="font-heading font-semibold text-primary">{lineIdLabel}</p>
                  <span className="text-foreground">{lineId}</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* Business Info */}
          {showAboutCompany && (
            <motion.div 
              className="mt-8 p-6 bg-muted rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <h3 className="font-heading font-bold text-lg mb-3">{aboutTitle}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>{companyBrand}</strong>
                </p>
                <p>
                  {companyName}
                </p>
                {companyLicense && (
                  <p>
                    <span className="bg-secondary/20 text-primary px-2 py-1 rounded-full text-xs font-medium">
                      Licence TAT : {companyLicense}
                    </span>
                  </p>
                )}
                {companyDescription && (
                  <p className="mt-4">
                    {companyDescription}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
