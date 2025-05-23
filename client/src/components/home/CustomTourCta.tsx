import { motion } from "framer-motion";
import { Link } from "wouter";
import { FadeInWhenVisible } from "@/components/ui/animations";

export default function CustomTourCta() {
  return (
    <section className="py-16 bg-gray-900 relative">
      {/* Overlay with semi-transparent gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/60 z-10"
        style={{ mixBlendMode: 'multiply' }}
      ></div>
      
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ 
          backgroundImage: `url('https://images.unsplash.com/photo-1551621374-9a61c244f6eb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1920&q=80')`,
          backgroundAttachment: 'fixed'
        }}
      ></div>
      
      <div className="container mx-auto px-4 relative z-20">
        <FadeInWhenVisible>
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-6">
              Create Your Custom Journey
            </h2>
            <p className="text-lg md:text-xl mb-8 text-white/90">
              Whether you're looking for adventure, relaxation, or cultural immersion,
              we can create a personalized itinerary tailored to your interests.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/custom-tour">
                <motion.span 
                  className="bg-primary text-white px-8 py-3 rounded cursor-pointer inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  About us
                </motion.span>
              </Link>
              <a 
                href="https://wa.me/66653496445" 
                target="_blank"
                rel="noopener noreferrer"
              >
                <motion.span 
                  className="bg-transparent border-2 border-white text-white px-8 py-3 rounded cursor-pointer inline-block"
                  whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                  whileTap={{ scale: 0.95 }}
                >
                  Contact us
                </motion.span>
              </a>
            </div>
          </div>
        </FadeInWhenVisible>
      </div>
    </section>
  );
}