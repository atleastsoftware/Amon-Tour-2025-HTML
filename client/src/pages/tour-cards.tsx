import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible, StaggerChildren, StaggerItem } from "@/components/ui/animations";
import TourCardItem, { TourCardItemProps } from "@/components/tour/TourCardItem";
export default function TourCards() {
  const {
    t
  } = useTranslation();
  const {
    data: tourCards = [],
    isLoading
  } = useQuery<TourCardItemProps[]>({
    queryKey: ['/api/tour-cards']
  });
  const [searchTerm, setSearchTerm] = useState("");
  const filteredTourCards = tourCards?.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) || card.description && card.description.toLowerCase().includes(searchTerm.toLowerCase());

    // Filter by type - only show experiences
    return matchesSearch && card.type === "experience";
  });
  return <>
      <Header />
      
      <main>
        {/* Hero */}
        <section className="relative h-[40vh]">
          <motion.div className="absolute inset-0 bg-black/50 z-10" initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} transition={{
          duration: 1
        }}></motion.div>
          <div className="absolute inset-0 z-0">
            <motion.img src="https://images.unsplash.com/photo-1528181304800-259b08848526?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" alt={t("Thailandtours", {
            defaultValue: "Thailandtours"
          })} className="w-full h-full object-cover" initial={{
            scale: 1.1,
            opacity: 0.8
          }} animate={{
            scale: 1,
            opacity: 1
          }} transition={{
            duration: 1.5
          }} />
          </div>
          <div className="container mx-auto px-4 relative z-20 h-full flex flex-col justify-center items-center text-center text-white">
            <StaggerChildren className="flex flex-col items-center">
              <StaggerItem>
                <h1 className="font-heading font-bold text-4xl md:text-5xl mb-4">{t("Thailandexperiences", {
                  defaultValue: "Thailandexperiences"
                })}</h1>
              </StaggerItem>
              <StaggerItem>
                <p className="text-lg md:text-xl max-w-2xl">{t("Discoverourexception", {
                  defaultValue: "Discoverourexception"
                })}</p>
              </StaggerItem>
            </StaggerChildren>
          </div>
        </section>
        
        {/* Tours List */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <SlideUpWhenVisible>
              <motion.div className="bg-white p-6 rounded-lg shadow-md mb-8" initial={{
              opacity: 0,
              y: 30
            }} animate={{
              opacity: 1,
              y: 0
            }} transition={{
              duration: 0.6
            }}>
                <h2 className="font-heading font-semibold text-xl mb-4">{t("Findyourexperience", {
                  defaultValue: "Findyourexperience"
                })}</h2>
                <div className="grid grid-cols-1 gap-4">
                  <motion.div whileHover={{
                  scale: 1.02
                }} transition={{
                  type: "spring",
                  stiffness: 400
                }}>
                    <label htmlFor="search" className="block text-sm font-medium text-foreground mb-1">{t("Search", {
                      defaultValue: "Search"
                    })}</label>
                    <Input id="search" type="text" placeholder={t("Searchbytitleordescr", {
                    defaultValue: "Searchbytitleordescr"
                  })} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </motion.div>
                </div>
              </motion.div>
            </SlideUpWhenVisible>
            
            {isLoading ? <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map(i => <StaggerItem key={i}>
                    <motion.div className="bg-white rounded-lg overflow-hidden shadow-md h-96 animate-pulse" initial={{
                opacity: 0,
                y: 20
              }} animate={{
                opacity: 1,
                y: 0
              }} transition={{
                duration: 0.5
              }}>
                      <div className="h-56 bg-muted"></div>
                      <div className="p-6 space-y-4">
                        <div className="h-6 bg-muted rounded w-3/4"></div>
                        <div className="h-4 bg-muted rounded"></div>
                        <div className="h-4 bg-muted rounded w-1/2"></div>
                      </div>
                    </motion.div>
                  </StaggerItem>)}
              </StaggerChildren> : filteredTourCards && filteredTourCards.length > 0 ? <StaggerChildren className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTourCards.map(card => <StaggerItem key={card.id}>
                    <TourCardItem {...card} />
                  </StaggerItem>)}
              </StaggerChildren> : <motion.div className="text-center py-16" initial={{
            opacity: 0
          }} animate={{
            opacity: 1
          }} transition={{
            duration: 0.5
          }}>
                <h3 className="text-xl font-semibold mb-2">{t("Noexperiencesfound", {
                defaultValue: "Noexperiencesfound"
              })}</h3>
                <p className="text-gray-500">{t('We\'re working on adding new experiences. Check back soon!', {
                defaultValue: 'We\'re working on adding new experiences. Check back soon!'
              })}</p>
              </motion.div>}
          </div>
        </section>
      </main>
      
      <Footer />
    </>;
}