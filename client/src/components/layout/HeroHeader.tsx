import { motion } from "framer-motion";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  bgImageUrl?: string;
  heightClass?: string;
  overlayClass?: string;
  center?: boolean;
  animate?: boolean;
  alt?: string;
  dataTestId?: string;
}

export default function HeroHeader({
  title,
  subtitle,
  bgImageUrl = "/attached_assets/790fc1de-1a62-4e19-93eb-f2529f131485_1757694001569.jpeg",
  heightClass = "h-[35vh] md:h-[52vh]",
  overlayClass = "bg-black/50",
  center = true,
  animate = true,
  alt = "Hero background image",
  dataTestId = "hero-header"
}: HeroHeaderProps) {
  return (
    <section 
      className={`relative ${heightClass}`} 
      data-testid={dataTestId}
    >
      <div className={`absolute inset-0 ${overlayClass} z-10`}></div>
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImageUrl}
          alt={alt}
          className="w-full h-full object-cover"
          decoding="async"
          fetchPriority="high"
        />
      </div>
      <div className={`container mx-auto px-4 relative z-20 h-full flex flex-col justify-center ${center ? 'items-center text-center' : ''} text-white`}>
        {animate ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-5xl font-heading font-bold mb-4"
              data-testid="text-hero-title"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {title}
            </motion.h1>
            {subtitle && (
              <motion.p 
                className="text-lg md:text-xl max-w-2xl"
                data-testid="text-hero-subtitle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {subtitle}
              </motion.p>
            )}
          </motion.div>
        ) : (
          <>
            <h1 
              className="text-4xl md:text-5xl font-heading font-bold mb-4"
              data-testid="text-hero-title"
            >
              {title}
            </h1>
            {subtitle && (
              <p 
                className="text-lg md:text-xl max-w-2xl"
                data-testid="text-hero-subtitle"
              >
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}