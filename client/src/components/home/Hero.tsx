import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import { useState, useEffect } from "react";

// Définition des images du carrousel
const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80",
    alt: "Destination landmark 1"
  },
  {
    src: "https://images.unsplash.com/photo-1490077476659-095159692ab5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80", 
    alt: "Beautiful beach landscape"
  },
  {
    src: "https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1679&q=80", 
    alt: "Heritage site"
  },
  {
    src: "https://images.unsplash.com/photo-1506665531195-3566af98b107?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1680&q=80", 
    alt: "Local culture"
  }
];

export default function Hero() {
  return (
    <section id="hero" className="mt-8 mb-20">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-10">
          {/* Left content - Title and description */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-xl"
            >
              <h1 className="font-heading text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight tracking-tight">
                Your exclusive experiences <br/>
                <span className="text-primary">in</span>COUNTRY
              </h1>
              
              <p className="text-gray-600 mb-8 text-lg">
                Discover amazing places away from mass tourism.
                Explore hidden gems and experience authentic local culture.
              </p>
              
              <Link href="/tours">
                <motion.span 
                  className="bg-primary text-white px-8 py-3 mt-4 rounded hover:bg-primary-dark transition-colors cursor-pointer inline-block"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.span>
              </Link>
            </motion.div>
          </div>
          
          {/* Right content - Image */}
          <div className="w-full md:w-1/2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="rounded-lg overflow-hidden"
            >
              <img 
                src={carouselImages[0].src}
                alt="Destination highlight"
                className="w-full h-auto object-cover rounded-lg"
                style={{ maxHeight: "400px" }}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
