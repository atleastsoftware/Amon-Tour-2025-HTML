import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
  structuredData?: object;
  language?: string;
  hreflang?: Array<{ lang: string; url: string }>;
}

export default function SEO({
  title = 'Amon Tour - Authentic Thailand Travel Experiences',
  description = 'Discover authentic Thailand with Amon Tour. Expert-guided private tours, cultural experiences, and personalized journeys across Bangkok, Phuket, and beyond. Family-run travel agency offering immersive experiences.',
  keywords = 'thailand tours, bangkok travel, phuket tours, authentic thai experiences, private tours thailand, cultural tours, thailand vacation, thai adventures, family travel agency',
  ogImage = '/Logo Long Blue.png',
  ogType = 'website',
  canonicalUrl,
  structuredData,
  language = 'en',
  hreflang,
}: SEOProps) {
  const siteUrl = 'https://amon-tour.com';
  const fullTitle = title.includes('Amon Tour') ? title : `${title} | Amon Tour`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  
  // Default structured data for travel agency
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Amon Tour",
    "description": description,
    "url": siteUrl,
    "logo": `${siteUrl}/Logo Long Blue.png`,
    "image": fullOgImage,
    "telephone": "+66-XXX-XXX-XXX",
    "email": "contact@amon-tour.com",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "TH",
      "addressRegion": "Thailand"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "13.7367",
      "longitude": "100.5232"
    },
    "areaServed": {
      "@type": "Country",
      "name": "Thailand"
    },
    "serviceType": ["Private Tours", "Cultural Experiences", "Travel Planning"],
    "priceRange": "$$",
    "openingHours": "Mo-Su 08:00-20:00",
    "sameAs": [
      "https://www.facebook.com/amontour",
      "https://www.instagram.com/amontour"
    ]
  };

  const finalStructuredData = structuredData || defaultStructuredData;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content={language} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="googlebot" content="index, follow, max-image-preview:large, max-snippet:-1" />
      <meta name="author" content="Amon Tour Thailand" />
      <meta name="publisher" content="Amon Tour" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={fullOgImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${title} - Amon Tour Thailand`} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:site_name" content="Amon Tour" />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      <meta name="twitter:image:alt" content={`${title} - Amon Tour Thailand`} />
      <meta name="twitter:site" content="@amontour" />
      <meta name="twitter:creator" content="@amontour" />
      
      {/* Canonical Link */}
      <link rel="canonical" href={canonicalUrl || siteUrl} />
      
      {/* Hreflang tags for internationalization */}
      {hreflang && hreflang.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Additional Meta */}
      <meta name="theme-color" content="#1B4D72" />
      <meta name="msapplication-TileColor" content="#1B4D72" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
    </Helmet>
  );
}