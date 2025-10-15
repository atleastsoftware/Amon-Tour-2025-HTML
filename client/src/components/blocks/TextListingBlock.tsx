import { motion } from "framer-motion";

interface TextListingBlockProps {
  block: {
    id: number;
    configuration?: {
      title?: string;
      subtitle?: string;
      items?: Array<{ label: string; description: string }>;
      labelColor?: string;
      dividerColor?: string;
      backgroundColor?: string;
    };
  };
}

export default function TextListingBlock({ block }: TextListingBlockProps) {
  const config = block.configuration ?? {};
  const title = config.title ?? "Titre de la section";
  const subtitle = config.subtitle ?? "Description de votre listing";
  const allItems = config.items ?? [
    { label: "1", description: "Description de votre element" },
    { label: "2", description: "Description de votre element" },
    { label: "3", description: "Description de votre element" },
  ];
  // Filtrer les items vides (sans label ni description)
  const items = allItems.filter(item => item.label || item.description);
  const labelColor = config.labelColor ?? "#084F6E";
  const dividerColor = config.dividerColor ?? "#3BA8AF";
  const backgroundColor = config.backgroundColor ?? "white";

  return (
    <section className="w-full py-16" style={{ backgroundColor }}>
      <div className="container mx-auto px-4">
        <motion.div 
          className="mt-16"
          initial={{ y: 20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {title && (
            <div className="text-center mb-8">
              <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{title}</h2>
              <div className="w-20 h-1 mx-auto mb-8" style={{ backgroundColor: dividerColor }}></div>
              {subtitle && (
                <p className="text-xl leading-relaxed max-w-3xl mx-auto whitespace-pre-line mb-8">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          
          <div className="max-w-5xl mx-auto space-y-4">
            {items.map((item, index) => (
              <motion.div 
                key={index}
                className="bg-white rounded-xl shadow-lg p-6"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              >
                <div className="flex flex-col md:flex-row md:items-center">
                  <span className="font-bold text-xl md:w-32 mb-2 md:mb-0" style={{ color: labelColor }}>
                    {item.label}
                  </span>
                  <span className="text-gray-600 text-lg md:ml-4">
                    {item.description}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
