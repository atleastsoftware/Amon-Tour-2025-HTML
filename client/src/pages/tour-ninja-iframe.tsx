import { useEffect, useState, useMemo } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { ChevronRight } from "lucide-react";
import Header from "@/components/layout/Header";
import SEO from "@/components/layout/SEO";
import { useTranslation } from "@/contexts/TranslationContext";

// Helper function to update language in Tour Ninja URL
function updateUrlLanguage(url: string, language: string): string {
  if (!url.includes('tourninja.io')) {
    return url;
  }
  
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('language', language);
    urlObj.searchParams.set('lang', language);
    return urlObj.toString();
  } catch {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}language=${language}&lang=${language}`;
  }
}

// Build a <title> that lands within the 40–65 character SEO sweet spot.
function buildSeoTitle(name: string): string {
  const clean = (name || 'Tour Details').trim();
  const suffix = ' | Amon Tour Krabi';
  const candidates = [
    `${clean} – Private Krabi Tour & Booking${suffix}`,
    `${clean} – Private Krabi Tour${suffix}`,
    `${clean}${suffix}`,
  ];
  for (const c of candidates) {
    if (c.length >= 40 && c.length <= 65) return c;
  }
  const shortest = candidates[candidates.length - 1];
  if (shortest.length > 65) {
    const room = 65 - suffix.length - 1;
    return `${clean.slice(0, room).trim()}${suffix}`;
  }
  return candidates[0];
}

// Build a meta description within the 140–160 character sweet spot.
function buildSeoDescription(name: string): string {
  const clean = (name || 'this private Krabi tour').trim();
  const base = `Book ${clean} with Amon Tour: a private, small-group Krabi tour in southern Thailand with flexible dates and French- and English-speaking local guides.`;
  if (base.length >= 140) return base;
  return `Discover this private Krabi tour with Amon Tour — a small-group southern Thailand experience, flexible dates and French- and English-speaking guides.`;
}

const INTERNAL_LINKS: Array<{ href: string; label: string }> = [
  { href: '/experiences', label: 'Experiences' },
  { href: '/tours', label: 'All Tours' },
  { href: '/custom-tour', label: 'Custom Tour' },
  { href: '/stays', label: 'Stays' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function TourNinjaIframe() {
  const [, setLocation] = useLocation();
  const searchString = useSearch();
  const { currentLanguage } = useTranslation();
  const [iframeKey, setIframeKey] = useState(0);
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(searchString);
  const originalIframeUrl = urlParams.get('url');
  const titleParam = urlParams.get('title') || 'Tour Details';
  const returnUrl = urlParams.get('return') || '/experiences';
  
  // Update iframe URL when language changes
  const iframeUrl = useMemo(() => {
    if (!originalIframeUrl) return null;
    return updateUrlLanguage(originalIframeUrl, currentLanguage);
  }, [originalIframeUrl, currentLanguage]);
  
  // Force iframe reload when language changes
  useEffect(() => {
    setIframeKey(prev => prev + 1);
  }, [currentLanguage]);
  
  // Redirect if no URL provided
  useEffect(() => {
    if (!originalIframeUrl) {
      setLocation(returnUrl);
    }
  }, [originalIframeUrl, returnUrl, setLocation]);
  
  // Scroll to top and hide body scroll to prevent double scrollbar
  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const seoTitle = buildSeoTitle(titleParam);
  const seoDescription = buildSeoDescription(titleParam);

  const touristTripSchema = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    "name": titleParam,
    "description": seoDescription,
    "url": typeof window !== 'undefined' ? window.location.href : 'https://amon-tour.com',
    "touristType": ["Family", "Couple", "Solo", "Group"],
    "provider": {
      "@type": "TravelAgency",
      "name": "Amon Tour",
      "url": "https://amon-tour.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Krabi",
        "addressCountry": "TH"
      }
    }
  };

  if (!originalIframeUrl || !iframeUrl) return null;
  
  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={typeof window !== 'undefined' ? window.location.href : undefined}
        structuredData={touristTripSchema}
        breadcrumbs={[
          { name: "Home", url: "/" },
          { name: "Tours", url: "/tours" },
          { name: titleParam, url: "/tours" },
        ]}
        faqSchema={[
          {
            question: `How do I book ${titleParam} with Amon Tour?`,
            answer: "You can book directly through the booking module on this page, or contact our Krabi team by WhatsApp or email. Our French- and English-speaking guides confirm availability and tailor the experience to your group.",
          },
          {
            question: "Are Amon Tour experiences private and customizable?",
            answer: "Yes. We specialize in private, small-group tours of Krabi and southern Thailand that can be customized to your dates, interests, and pace, away from mass tourism.",
          },
          {
            question: "What areas does Amon Tour cover?",
            answer: "We operate across Krabi and southern Thailand, including Koh Phi Phi, Phang Nga Bay, Railay Beach, and the surrounding islands and national parks.",
          },
        ]}
      />
      <Header />
      
      <div className="min-h-screen bg-gray-50">
        {/*
          SEO content (H1, breadcrumb, direct-answer intro, internal links) is kept
          in the DOM for search engines but visually hidden (sr-only) so the iframe
          remains the only visible element and there is no double scrollbar.
        */}
        <div className="sr-only">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb">
            <ol>
              <li><Link href="/">Home</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li><Link href="/tours">Tours</Link></li>
              <li><ChevronRight className="h-4 w-4" /></li>
              <li>{titleParam}</li>
            </ol>
          </nav>

          {/* Single H1 + GEO direct-answer intro */}
          <h1>{titleParam}</h1>
          <p>
            {titleParam} is a private, small-group experience by Amon Tour, a Krabi
            travel agency with French- and English-speaking guides — book your dates
            below and we'll tailor it to your group, away from mass tourism.
          </p>

          {/* Internal links */}
          <nav aria-label="Related pages">
            <ul>
              {INTERNAL_LINKS.map(({ href, label }) => (
                <li key={href}>
                  <Link href={href}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Iframe Container - Full height */}
        <div className="w-full">
          <iframe
            key={iframeKey}
            src={iframeUrl}
            className="w-full border-0"
            style={{ height: 'calc(100vh - 100px)', minHeight: '600px' }}
            title={titleParam}
            loading="lazy"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
      </div>
    </>
  );
}
