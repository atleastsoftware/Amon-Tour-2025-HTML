import { Helmet } from 'react-helmet';
import { useEffect, useState } from 'react';

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
  breadcrumbs?: Array<{ name: string; url: string }>;
  faqSchema?: Array<{ question: string; answer: string }>;
  howToSchema?: { name: string; description: string; steps: Array<{ name: string; text: string }> };
  reviewSchema?: { rating: number; reviewCount: number; reviews?: Array<{ author: string; rating: number; text: string; datePublished: string }> };
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
  breadcrumbs,
  faqSchema,
  howToSchema,
  reviewSchema,
}: SEOProps) {
  const siteUrl = 'https://amon-tour.com';
  const fullTitle = title.includes('Amon Tour') ? title : `${title} | Amon Tour`;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`;
  const [detectedLanguage, setDetectedLanguage] = useState(language);
  
  // Auto-detect language from browser if not specified
  useEffect(() => {
    const browserLang = navigator.language?.split('-')[0]?.toLowerCase() || 'en';
    const supportedLangs = ['en', 'fr', 'th', 'de', 'es', 'it'];
    const finalLang = supportedLangs.includes(browserLang) ? browserLang : 'en';
    setDetectedLanguage(language || finalLang);
  }, [language]);
  
  // Generate automatic hreflang if not provided
  const currentUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  const autoHreflang = hreflang || [
    { lang: 'en', url: currentUrl },
    { lang: 'fr', url: currentUrl },
    { lang: 'th', url: currentUrl },
    { lang: 'x-default', url: currentUrl }
  ];
  
  // Default structured data for travel agency
  const defaultStructuredData = {
    "@context": "https://schema.org",
    "@type": "TravelAgency",
    "name": "Amon Tour",
    "description": description,
    "url": siteUrl,
    "logo": `${siteUrl}/Logo Long Blue.png`,
    "image": fullOgImage,
    "telephone": "+66-81-956-2849",
    "email": "contact@amon-tour.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+66-81-956-2849",
      "contactType": "customer service",
      "availableLanguage": ["English", "French", "Thai"]
    },
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
    "serviceType": ["Private Tours", "Cultural Experiences", "Travel Planning", "Island Tours", "Temple Visits", "Local Cuisine Tours"],
    "priceRange": "$$-$$$",
    "currenciesAccepted": ["THB", "USD", "EUR"],
    "paymentAccepted": ["Cash", "Credit Card", "Bank Transfer"],
    "openingHours": "Mo-Su 08:00-20:00",
    "sameAs": [
      "https://www.facebook.com/amontour",
      "https://www.instagram.com/amontour"
    ]
  };

  // Generate additional schemas for AEO
  const breadcrumbSchema = breadcrumbs ? {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": `${siteUrl}${item.url}`
    }))
  } : null;
  
  const faqSchemaLD = faqSchema ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqSchema.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;
  
  const howToSchemaLD = howToSchema ? {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": howToSchema.name,
    "description": howToSchema.description,
    "step": howToSchema.steps.map((step, index) => ({
      "@type": "HowToStep",
      "position": index + 1,
      "name": step.name,
      "text": step.text
    }))
  } : null;
  
  const reviewSchemaLD = reviewSchema ? {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    "ratingValue": reviewSchema.rating,
    "reviewCount": reviewSchema.reviewCount,
    "bestRating": "5",
    "worstRating": "1"
  } : null;
  
  const finalStructuredData = structuredData || defaultStructuredData;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content={detectedLanguage} />
      <html lang={detectedLanguage} />
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
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
      
      {/* Hreflang tags for internationalization - Automatic multilingual support */}
      {autoHreflang.map(({ lang, url }) => (
        <link key={lang} rel="alternate" hrefLang={lang} href={url} />
      ))}
      
      {/* Additional Meta */}
      <meta name="theme-color" content="#1B4D72" />
      <meta name="msapplication-TileColor" content="#1B4D72" />
      <meta name="format-detection" content="telephone=no" />
      
      {/* Structured Data - Main */}
      <script type="application/ld+json">
        {JSON.stringify(finalStructuredData)}
      </script>
      
      {/* Structured Data - Breadcrumbs */}
      {breadcrumbSchema && (
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbSchema)}
        </script>
      )}
      
      {/* Structured Data - FAQ for AEO */}
      {faqSchemaLD && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchemaLD)}
        </script>
      )}
      
      {/* Structured Data - HowTo for AEO */}
      {howToSchemaLD && (
        <script type="application/ld+json">
          {JSON.stringify(howToSchemaLD)}
        </script>
      )}
      
      {/* Structured Data - Reviews */}
      {reviewSchemaLD && (
        <script type="application/ld+json">
          {JSON.stringify(reviewSchemaLD)}
        </script>
      )}
    </Helmet>
  );
}