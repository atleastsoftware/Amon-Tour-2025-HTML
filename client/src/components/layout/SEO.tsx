import { Helmet } from 'react-helmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  canonicalUrl?: string;
}

export default function SEO({
  title = 'Amon Tour - Discover Thailand',
  description = 'Experience authentic Thailand with our curated tours and immersive journeys. Discover temples, beaches, and cultural experiences with local experts.',
  keywords = 'thailand travel, bangkok tours, phuket tours, thai experiences, thailand holidays, authentic travel',
  ogImage = '/Logo Long Blue.png',
  ogType = 'website',
  canonicalUrl,
}: SEOProps) {
  const siteUrl = 'https://amon-tour.com';
  const fullTitle = title.includes('Amon Tour') ? title : `${title} | Amon Tour`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="robots" content="index, follow" />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      <meta property="og:url" content={canonicalUrl || siteUrl} />
      <meta property="og:site_name" content="Amon Tour" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`} />
      
      {/* Canonical Link */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional Meta */}
      <meta name="theme-color" content="#0070f3" />
      <meta name="google" content="notranslate" />
    </Helmet>
  );
}