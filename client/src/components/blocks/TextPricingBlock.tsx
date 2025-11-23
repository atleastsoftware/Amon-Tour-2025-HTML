import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useTranslation } from "@/contexts/TranslationContext";

interface PricingCard {
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  cycle: string;
  label: string;
  moreText: string;
  headerGradient: string;
}

interface PickupTime {
  time: string;
  location: string;
  price: string;
  supplementColor?: string;
}

interface TextPricingBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      titleColor?: string;
      subtitleColor?: string;
      pricingCards?: PricingCard[];
      dividerColor?: string;
      backgroundColor?: string;
      showPickupSection?: boolean;
      pickupTitle?: string;
      pickupTimes?: PickupTime[];
      includedTitle?: string;
      includedDescription?: string;
      includedLogoColor?: string;
      notIncludedTitle?: string;
      notIncludedDescription?: string;
      notIncludedLogoColor?: string;
    };
  };
}

export default function TextPricingBlock({ block }: TextPricingBlockProps) {
  const config = block.configuration ?? {};
  const { t } = useTranslation();
  const section = `text_pricing_${block.id}`;
  
  const title = t(section, 'title', config.title) || "Titre de la section";
  const subtitle = t(section, 'subtitle', config.subtitle) || "Description de vos tarifs";
  
  const defaultCards = [
    {
      title: "Titre",
      subtitle: "Sous-titre",
      price: "Prix",
      currency: "Devise",
      cycle: "Cycle",
      label: "Label",
      moreText: "Texte",
      headerGradient: "#084F6E"
    },
    {
      title: "Titre",
      subtitle: "Sous-titre",
      price: "Prix",
      currency: "Devise",
      cycle: "Cycle",
      label: "Label",
      moreText: "Texte",
      headerGradient: "#084F6E"
    },
    {
      title: "Titre",
      subtitle: "Sous-titre",
      price: "Prix",
      currency: "Devise",
      cycle: "Cycle",
      label: "Label",
      moreText: "Texte",
      headerGradient: "#084F6E"
    }
  ];
  
  const pricingCards = (config.pricingCards ?? defaultCards).map((card, index) => ({
    ...card,
    title: t(section, `pricing_cards_${index}_title`, card.title) || card.title,
    subtitle: t(section, `pricing_cards_${index}_subtitle`, card.subtitle) || card.subtitle,
    price: t(section, `pricing_cards_${index}_price`, card.price) || card.price,
    currency: t(section, `pricing_cards_${index}_currency`, card.currency) || card.currency,
    cycle: t(section, `pricing_cards_${index}_cycle`, card.cycle) || card.cycle,
    label: t(section, `pricing_cards_${index}_label`, card.label) || card.label,
    moreText: t(section, `pricing_cards_${index}_more_text`, card.moreText) || card.moreText,
  }));
  
  const titleColor = config.titleColor ?? "#1F2937";
  const subtitleColor = config.subtitleColor ?? "#6B7280";
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "#ffffff";
  const showPickupSection = config.showPickupSection ?? false;
  const pickupTitle = t(section, 'pickup_title', config.pickupTitle) || "Options supplémentaires";
  
  const pickupTimes = (config.pickupTimes ?? []).map((pickup, index) => ({
    ...pickup,
    time: t(section, `pickup_times_${index}_time`, pickup.time) || pickup.time,
    location: t(section, `pickup_times_${index}_location`, pickup.location) || pickup.location,
    price: t(section, `pickup_times_${index}_price`, pickup.price) || pickup.price,
  }));
  
  const includedTitle = t(section, 'included_title', config.includedTitle) || "Included in Price";
  const includedDescription = t(section, 'included_description', config.includedDescription) || "";
  const includedLogoColor = config.includedLogoColor ?? "#3BA8AF";
  const notIncludedTitle = t(section, 'not_included_title', config.notIncludedTitle) || "Not Included in Price";
  const notIncludedDescription = t(section, 'not_included_description', config.notIncludedDescription) || "";
  const notIncludedLogoColor = config.notIncludedLogoColor ?? "#3BA8AF";

  return (
    <div className="w-full">
      <div className="py-12" style={{ backgroundColor }}>
        <div className="container mx-auto px-4">
          {title && (
            <div className="text-center mb-12">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3" style={{ color: titleColor }}>{title}</h2>
                <div className="w-20 h-1 mx-auto mb-4" style={{ backgroundColor: dividerColor }}></div>
                {subtitle && (
                  <p className="text-lg" style={{ color: subtitleColor }}>{subtitle}</p>
                )}
              </motion.div>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {pricingCards.map((card, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-xl overflow-hidden transform hover:scale-105 transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <div 
                  className="text-white p-4"
                  style={{ 
                    background: `linear-gradient(135deg, ${card.headerGradient}, ${card.headerGradient}dd)` 
                  }}
                >
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.subtitle}</p>
                </div>
                <div className="p-6">
                  <p className="text-4xl font-bold text-foreground mb-2">
                    {card.price}
                    <span className="text-lg ml-2">{card.currency}</span>
                  </p>
                  {card.cycle && <p className="text-sm text-muted-foreground/80 mb-4">{card.cycle}</p>}
                  <div className="border-t pt-4">
                    {card.label && <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>}
                    {card.moreText && <p className="text-sm text-muted-foreground whitespace-pre-line">{card.moreText}</p>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {showPickupSection && (
            <motion.div 
              className="mt-12 max-w-5xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {pickupTitle && (
                <h3 className="text-lg text-center mb-8" style={{ color: subtitleColor }}>{pickupTitle}</h3>
              )}
              
              {pickupTimes.length > 0 && (
                <div className={`grid gap-4 mb-8 ${
                  pickupTimes.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                  pickupTimes.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                  pickupTimes.length === 3 ? 'grid-cols-1 md:grid-cols-3' :
                  pickupTimes.length === 4 ? 'grid-cols-2 md:grid-cols-4' :
                  'grid-cols-2 md:grid-cols-5'
                }`}>
                  {pickupTimes.map((pickup, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg shadow-md p-4 text-center"
                    >
                      <div className="text-2xl font-bold mb-1 text-gray-800">
                        {pickup.time}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        {pickup.location}
                      </div>
                      <div 
                        className="text-sm font-semibold" 
                        style={{ color: pickup.supplementColor || '#084F6E' }}
                      >
                        {pickup.price}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {includedDescription && (
                <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: `${includedLogoColor}20` }}>
                      <Check className="w-6 h-6" style={{ color: includedLogoColor }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{includedTitle}</h4>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{includedDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {notIncludedDescription && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: `${notIncludedLogoColor}20` }}>
                      <X className="w-6 h-6" style={{ color: notIncludedLogoColor }} />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{notIncludedTitle}</h4>
                      <p className="text-gray-600 leading-relaxed whitespace-pre-line">{notIncludedDescription}</p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
