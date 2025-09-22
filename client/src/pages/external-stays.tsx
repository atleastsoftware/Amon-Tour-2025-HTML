import { useTranslation } from 'react-i18next';
import { useEffect } from "react";
import { Helmet } from "react-helmet";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TourNinjaSection from "@/components/tour/TourNinjaSection";
export default function ExternalStays() {
  const { t } = useTranslation();
  const {
    t: t
  } = useTranslation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  return <>
      <Helmet>
        <title>{t('Partner Tours & Stays | Amon Tour', {
          defaultValue: 'Partner Tours & Stays | Amon Tour'
        })}</title>
        <meta name="description" content="Discover additional tour and accommodation options from our trusted partners through Tour Ninja." />
        <meta name="keywords" content="partner tours, external stays, tour ninja, thailand accommodation, partner services" />
      </Helmet>
      
      <Header />
      
      <main className="pt-8">
        <TourNinjaSection />
      </main>
      
      <Footer />
    </>;
}