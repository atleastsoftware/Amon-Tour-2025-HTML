import { Link } from "wouter";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";

export default function Hero() {
  return (
    <section className="relative h-[70vh]">
      <motion.div 
        className="absolute inset-0 bg-black/40 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      ></motion.div>
      <div className="absolute inset-0 z-0">
        <motion.img 
          src="https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1679&q=80" 
          alt="Temples of Thailand" 
          className="w-full h-full object-cover"
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
        />
      </div>
      
      <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
        <StaggerChildren className="flex flex-col items-center">
          <StaggerItem>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl mb-4 max-w-3xl">
              Discover Authentic Thailand with Senthang Siam Tour
            </h1>
          </StaggerItem>
          
          <StaggerItem>
            <p className="text-lg md:text-xl max-w-2xl mb-8">
              Personalized journeys, private tours, and authentic experiences in the heart of the Kingdom of Siam.
            </p>
          </StaggerItem>
          
          <StaggerItem>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/tours">
                <motion.span 
                  className="bg-primary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-primary-dark transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Our Tours
                </motion.span>
              </Link>
              <Link href="/custom-tour">
                <motion.span 
                  className="bg-secondary px-8 py-3 rounded-lg font-heading font-semibold hover:bg-secondary-dark transition-colors cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Custom Tour
                </motion.span>
              </Link>
            </div>
          </StaggerItem>
        </StaggerChildren>
      </div>
    </section>
  );
}
