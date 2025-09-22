import { useTranslation } from 'react-i18next';
import { motion } from "framer-motion";
import { FadeInWhenVisible, SlideUpWhenVisible } from "@/components/ui/animations";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { Link } from "wouter";
const interestCategories = [{
  name: t('Culture & History', {
    defaultValue: 'Culture & History'
  }),
  icon: "fas fa-landmark"
}, {
  name: t('Nature & Adventure', {
    defaultValue: 'Nature & Adventure'
  }),
  icon: "fas fa-mountain"
}, {
  name: t('Beaches & Islands', {
    defaultValue: 'Beaches & Islands'
  }),
  icon: "fas fa-umbrella-beach"
}, {
  name: t('Family trip', {
    defaultValue: 'Family trip'
  }),
  icon: "fas fa-child"
}, {
  name: t('Group trip', {
    defaultValue: 'Group trip'
  }),
  icon: "fas fa-users"
}, {
  name: t('Wedding & Honeymoon', {
    defaultValue: 'Wedding & Honeymoon'
  }),
  icon: "fas fa-heart"
}];
const destinations = [{
  name: t('Khao Sok', {
    defaultValue: 'Khao Sok'
  }),
  icon: "fas fa-tree"
}, {
  name: t('Krabi', {
    defaultValue: 'Krabi'
  }),
  icon: "fas fa-water"
}, {
  name: t('Koh Mook', {
    defaultValue: 'Koh Mook'
  }),
  icon: "fas fa-island-tropical"
}, {
  name: t('Bangkok', {
    defaultValue: 'Bangkok'
  }),
  icon: "fas fa-city"
}, {
  name: t('Chiang Mai', {
    defaultValue: 'Chiang Mai'
  }),
  icon: "fas fa-mountain"
}, {
  name: t('Others destinations', {
    defaultValue: 'Others destinations'
  }),
  icon: "fas fa-map-location-dot"
}];
export default function Interests() {
  const { t } = useTranslation();
  const {
    t: t
  } = useTranslation();
  return <section id="interests" className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <FadeInWhenVisible>
          <div className="text-center mb-12">
            <h2 className="font-heading font-bold text-3xl md:text-4xl mb-3">{t('Interests', {
              defaultValue: 'Interests'
            })}</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-4"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">{t('Discover Thailand through your passions and interests. Choose from our curated categories or explore by destination.', {
              defaultValue: 'Discover Thailand through your passions and interests. Choose from our curated categories or explore by destination.'
            })}</p>
          </div>
        </FadeInWhenVisible>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          {interestCategories.map((category, index) => <motion.div key={`category-${index}`} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1
        }}>
              <Link href={`/custom-tour?interest=${encodeURIComponent(category.name)}`}>
                <Card className="cursor-pointer h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <motion.div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3" whileHover={{
                  scale: 1.1,
                  rotate: 5
                }}>
                      <i className={`${category.icon} text-primary`}></i>
                    </motion.div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>)}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {destinations.map((destination, index) => <motion.div key={`destination-${index}`} initial={{
          opacity: 0,
          y: 20
        }} whileInView={{
          opacity: 1,
          y: 0
        }} viewport={{
          once: true
        }} transition={{
          duration: 0.5,
          delay: index * 0.1 + 0.3
        }}>
              <Link href={`/custom-tour?destination=${encodeURIComponent(destination.name)}`}>
                <Card className="cursor-pointer h-full border-secondary/20">
                  <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                    <motion.div className="flex items-center mb-2" whileHover={{
                  scale: 1.1
                }}>
                      <MapPin size={16} className="text-secondary mr-1" />
                    </motion.div>
                    <h3 className="font-medium text-sm">{destination.name}</h3>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>)}
        </div>
      </div>
    </section>;
}