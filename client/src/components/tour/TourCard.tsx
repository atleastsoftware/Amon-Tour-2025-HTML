import { Link } from "wouter";
import { Tour } from "@shared/schema";
import { formatTHB } from "@/lib/utils";
import { motion } from "framer-motion";
import { useTranslation } from 'react-i18next';
interface TourCardProps {
  tour: Tour;
}
export default function TourCard({
  tour
}: TourCardProps) {
  const {
    t
  } = useTranslation();
  return <motion.div className="tour-card bg-white rounded-lg overflow-hidden shadow-md" initial={{
    opacity: 0,
    y: 20
  }} whileInView={{
    opacity: 1,
    y: 0
  }} viewport={{
    once: true,
    margin: "-50px"
  }} transition={{
    duration: 0.5
  }} whileHover={{
    y: -7,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
  }}>
      <div className="h-56 overflow-hidden">
        <motion.img src={tour.imageUrl} alt={tour.title} className="w-full h-full object-cover" whileHover={{
        scale: 1.1
      }} transition={{
        duration: 0.6
      }} />
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-heading font-bold text-xl">{tour.title}</h3>
          <motion.span className="bg-primary-light text-white px-2 py-1 rounded text-sm" whileHover={{
          scale: 1.05
        }}>
            {tour.duration}
          </motion.span>
        </div>
        <p className="text-gray-600 mb-4">{tour.shortDescription}</p>
        <div className="flex justify-between items-center mb-4">
          <motion.span className="font-heading font-bold text-lg text-primary" whileHover={{
          scale: 1.05
        }}>{t('From', {
            defaultValue: 'From'
          })}{formatTHB(tour.price)}
          </motion.span>
          <Link href={`/tours/${tour.id}`}>
            <motion.span className="text-secondary font-semibold cursor-pointer flex items-center" whileHover={{
            x: 5,
            color: "#E67E22"
          }}>
              {t('buttons.viewDetails')} →
            </motion.span>
          </Link>
        </div>
        <div className="flex justify-between items-center">
          <Link href={`/book-tour/${tour.id}`}>
            <motion.span className="w-full bg-secondary text-white py-2 px-4 rounded text-center block cursor-pointer" whileHover={{
            scale: 1.03,
            backgroundColor: "#E67E22"
          }} whileTap={{
            scale: 0.98
          }}>
              {t('buttons.book')}
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>;
}