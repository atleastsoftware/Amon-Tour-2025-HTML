import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SEO from "@/components/layout/SEO";
import HeroHeader from "@/components/layout/HeroHeader";
import CatamaranExperience from "@/components/CatamaranExperience";

export default function Cruise() {
  return (
    <>
      <SEO 
        title="The Catamaran Experience | Luxury Cruise Adventures Krabi"
        description="Navigate pristine waters where turquoise horizons meet unforgettable moments. Experience luxury catamaran cruises in the Andaman Sea with complete freedom and tailor-made routes."
        keywords="catamaran cruise krabi, luxury boat tour thailand, private yacht charter, andaman sea cruise, exclusive boat experience"
      />
      <Header />
      
      <main>
        {/* Hero */}
        <HeroHeader 
          title="The Catamaran Experience"
          subtitle="Navigate pristine waters where turquoise horizons meet unforgettable moments."
          alt="Catamaran cruise in the Andaman Sea"
        />
        
        {/* Catamaran Experience Content */}
        <CatamaranExperience />
      </main>
      
      <Footer />
    </>
  );
}