import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

interface PricingCard {
  title: string;
  subtitle: string;
  price: string;
  currency: string;
  period: string;
  headerGradient: string;
}

interface PickupTime {
  time: string;
  location: string;
  price: string;
}

interface TextPricingBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      pricingCards?: PricingCard[];
      dividerColor?: string;
      backgroundColor?: string;
      perDayText?: string;
      periodLabel?: string;
      showPickupSection?: boolean;
      pickupTitle?: string;
      pickupTimes?: PickupTime[];
      includedTitle?: string;
      includedDescription?: string;
      notIncludedTitle?: string;
      notIncludedDescription?: string;
      pickupTimeColor?: string;
      pickupPriceColor?: string;
    };
  };
}

export default function TextPricingBlock({ block }: TextPricingBlockProps) {
  const config = block.configuration ?? {};
  const title = config.title ?? "Tarification Saisonnière";
  const subtitle = config.subtitle ?? "Tarif journalier minimum (2 jours minimum)";
  const pricingCards = config.pricingCards ?? [
    {
      title: "Haute Saison",
      subtitle: "Période premium",
      price: "39,000",
      currency: "THB",
      period: "Déc 15, 2025 - Jan 15, 2026",
      headerGradient: "from-secondary to-secondary/80"
    },
    {
      title: "Moyenne Saison",
      subtitle: "Tarif standard",
      price: "31,000",
      currency: "THB",
      period: "Oct 15 - Déc 14, 2025\nJan 15 - Mar 31, 2026",
      headerGradient: "from-primary to-secondary"
    },
    {
      title: "Basse Saison",
      subtitle: "Meilleur rapport qualité-prix",
      price: "28,000",
      currency: "THB",
      period: "Avr 1 - Oct 14, 2026",
      headerGradient: "from-primary/80 to-primary"
    }
  ];
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "from-muted/30 to-primary/5";
  const perDayText = config.perDayText ?? "par jour";
  const periodLabel = config.periodLabel ?? "Période";
  const showPickupSection = config.showPickupSection ?? false;
  const pickupTitle = config.pickupTitle ?? "Pick up times and transfer surcharges";
  const pickupTimes = config.pickupTimes ?? [];
  const includedTitle = config.includedTitle ?? "Included in Price";
  const includedDescription = config.includedDescription ?? "";
  const notIncludedTitle = config.notIncludedTitle ?? "Not Included in Price";
  const notIncludedDescription = config.notIncludedDescription ?? "";
  const pickupTimeColor = config.pickupTimeColor ?? "#1F2937";
  const pickupPriceColor = config.pickupPriceColor ?? "#084F6E";

  return (
    <div className="w-full">
      <div className={`bg-gradient-to-br ${backgroundColor} py-12`}>
        <div className="container mx-auto px-4">
          {title && (
            <div className="text-center mb-12">
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{title}</h2>
                <div className="w-20 h-1 mx-auto mb-4" style={{ backgroundColor: dividerColor }}></div>
                {subtitle && (
                  <p className="text-muted-foreground text-lg">{subtitle}</p>
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
                <div className={`bg-gradient-to-r ${card.headerGradient} text-white p-4`}>
                  <h3 className="text-xl font-bold">{card.title}</h3>
                  <p className="text-sm opacity-90">{card.subtitle}</p>
                </div>
                <div className="p-6">
                  <p className="text-4xl font-bold text-foreground mb-2">
                    {card.price}
                    <span className="text-lg ml-2">{card.currency}</span>
                  </p>
                  <p className="text-sm text-muted-foreground/80 mb-4">{perDayText}</p>
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold text-muted-foreground">{periodLabel}</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">{card.period}</p>
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
                <h3 className="text-2xl font-bold text-center mb-8">{pickupTitle}</h3>
              )}
              
              {pickupTimes.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                  {pickupTimes.map((pickup, index) => (
                    <div 
                      key={index}
                      className="bg-white rounded-lg shadow-md p-4 text-center"
                    >
                      <div className="text-2xl font-bold mb-1" style={{ color: pickupTimeColor }}>
                        {pickup.time}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        from {pickup.location}
                      </div>
                      <div 
                        className="text-sm font-semibold" 
                        style={{ color: pickup.price.includes('No') ? pickupTimeColor : pickupPriceColor }}
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
                    <div className="p-2 bg-green-100 rounded-full flex-shrink-0">
                      <Check className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{includedTitle}</h4>
                      <p className="text-gray-600 leading-relaxed">{includedDescription}</p>
                    </div>
                  </div>
                </div>
              )}

              {notIncludedDescription && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
                      <X className="w-6 h-6 text-red-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold mb-2">{notIncludedTitle}</h4>
                      <p className="text-gray-600 leading-relaxed">{notIncludedDescription}</p>
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
