import { useTranslation } from 'react-i18next';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import logo from '@assets/IMG_1454-removebg-preview.png';
export default function HeaderSimple() {
  const { t } = useTranslation();

  return <header className="bg-white shadow-sm py-2 border-b">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center">
          <Link href="/">
            <motion.div className="flex items-center cursor-pointer" whileHover={{
            scale: 1.03
          }} whileTap={{
            scale: 0.97
          }}>
              <img src={logo} alt={t('common.senthangsiam')} className="h-12 mr-3" />
              <div className="text-primary font-heading font-semibold hidden sm:block">{t('common.senthangsiam')}</div>
            </motion.div>
          </Link>
          
          <nav className="flex items-center space-x-2 sm:space-x-6">
            <Link href="/tours">
              <a className="text-gray-700 hover:text-primary text-sm sm:text-base font-medium">{t('common.tours')}</a>
            </Link>
            <Link href="/experiences">
              <a className="text-gray-700 hover:text-primary text-sm sm:text-base font-medium">{t('common.experiences')}</a>
            </Link>
          </nav>
        </div>
      </div>
    </header>;
}