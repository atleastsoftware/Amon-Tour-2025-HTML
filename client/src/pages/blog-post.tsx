import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Calendar, User, Tag, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Helmet } from "react-helmet";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  authorName: string;
  metaDescription?: string;
  metaKeywords?: string;
  imageAltText?: string;
  category?: {
    id: number;
    name: string;
    slug: string;
  };
  tags?: {
    id: number;
    name: string;
    slug: string;
  }[];
}

// Popular Tour Ninja tours mapping - real tokens from API
const popularToursData = {
  'phi-phi': {
    id: '_LkIo_9vyF',
    title: "Koh Phi Phi & Ao Nang's local islands",
    description: "Full-day excursion to the paradisiacal Phi Phi islands and Ao Nang's local islands. Discover white sand beaches, crystal-clear waters and breathtaking landscapes.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/_LkIo_9vyF"
  },
  'railay': {
    id: '8avSq2JCG8',
    title: "Railay & Ao Nang's local islands", 
    description: "Explore the magnificent Railay Beach, accessible only by boat, and Ao Nang's local islands. Perfect for rock climbing, relaxation and discovery.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/8avSq2JCG8"
  },
  'hong-island': {
    id: '9Pw3VgOKha',
    title: "Koh Hong Archipelago",
    description: "Discover the Koh Hong archipelago with its hidden emerald lagoons, white sand beaches and spectacular rock formations. An unforgettable experience.",
    duration: "1 day", 
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/9Pw3VgOKha"
  },
  'four-islands': {
    id: 'gH5kL9mN2p',
    title: "4 Islands Tour - Krabi's Must-Do Excursion",
    description: "Visit the famous 4 islands: Chicken Island, Tup Island, Poda Island, and Phra Nang Cave Beach. Perfect introduction to Krabi's natural beauty.",
    duration: "1 day",
    price: 1800,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/gH5kL9mN2p"
  },
  'sunset-plankton': {
    id: 'IGdQFwdJK8',
    title: "Koh Hong & Ao Nang's local islands Sunset and Plankton",
    description: "Magical experience combining sunset over Ao Nang islands and bioluminescent plankton observation at night. Unique and romantic moment.",
    duration: "1 day",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/IGdQFwdJK8"
  },
  'catamaran': {
    id: 'Wmx1GfDdXL',
    title: "Catamaran day trip - Ao Nang's local islands",
    description: "Luxurious catamaran cruise to Ao Nang's local islands. A premium experience with comfort and elegance.",
    duration: "1 day",
    price: 3500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/Wmx1GfDdXL"
  }
};

// Function to get related tours based on article slug
const getRelatedTours = (slug: string) => {
  // Map specific articles to relevant Tour Ninja tours
  const tourMapping: { [key: string]: string[] } = {
    // Phi Phi related articles (updated English slugs)
    'phi-phi-islands-from-krabi-complete-guide-unforgettable-excursion': ['phi-phi'],
    'iles-phi-phi-krabi-excursion-guide-complet': ['phi-phi'],
    
    // Railay related articles (updated English slugs)
    'railay-beach-krabi-complete-guide-spectacular-beach': ['railay'],
    'railay-beach-krabi-guide-complet-plage-spectaculaire': ['railay'],
    'rock-climbing-krabi-complete-guide-railay-beach-world-capital': ['railay'],
    'escalade-krabi-guide-complet-railay-beach-capitale-mondiale': ['railay'],
    
    // Hong Island related articles (updated English slugs)
    'hong-island-krabi-guide-secret-lagoon-paradise-island': ['hong-island'],
    'hong-island-krabi-lagon-secret-ile-paradisiaque': ['hong-island'],
    
    // 4 Islands related articles (updated English slugs)
    '4-islands-tour-from-krabi-guide-most-popular-excursion': ['four-islands'],
    '4-islands-tour-krabi-excursion-populaire-guide': ['four-islands'],
    
    // General Krabi articles - show popular tours (updated English slugs)
    'top-15-most-beautiful-beaches-krabi-paradise-guide': ['phi-phi', 'four-islands'],
    'plus-belles-plages-krabi-guide-paradis-tropical': ['phi-phi', 'four-islands'],
    'complete-guide-krabi-2025-thailand-trip': ['phi-phi', 'railay'],
    'guide-complet-krabi-2025-voyage-thailande': ['phi-phi', 'railay'], 
    'ao-nang-krabi-complete-guide-essential-tourist-center': ['phi-phi', 'sunset-plankton'],
    'ao-nang-krabi-guide-complet-centre-touristique': ['phi-phi', 'sunset-plankton'],
    'snorkeling-krabi-best-spots-underwater-world': ['hong-island', 'phi-phi'],
    'snorkeling-krabi-meilleurs-spots-fonds-marins': ['hong-island', 'phi-phi'],
    'krabi-or-phuket-complete-comparison-choose-perfect-thai-destination': ['phi-phi'],
    'krabi-ou-phuket-comparaison-complete-choisir-destination-thai-parfaite': ['phi-phi'],
    
    // Practical articles (updated English slugs)
    'when-to-visit-krabi-weather-guide-best-seasons-perfect-travel': ['phi-phi'],
    'quand-partir-krabi-guide-meteo-saisons-meilleure-periode': ['phi-phi'],
    'krabi-travel-budget-2025-complete-guide-prices-money-saving-tips': ['four-islands'],
    'budget-voyage-krabi-2025-guide-prix-bons-plans': ['four-islands'],
    'transportation-krabi-complete-guide-getting-around-travel-options': ['railay'],
    'transport-krabi-guide-complet-moyens-transport-deplacements': ['railay'],
    'ultimate-guide-to-exploring-krabi-top-islands-and-hidden-gems': ['hong-island', 'sunset-plankton'],
    
    // Experience articles (updated English slugs)
    'best-hotels-krabi-2025-guide-luxury-budget-accommodations': ['sunset-plankton'],
    'meilleurs-hotels-krabi-2025-guide-hebergements-luxe-budget': ['sunset-plankton'],
    'nightlife-krabi-guide-best-bars-pubs-clubs-going-out': ['sunset-plankton'],
    'vie-nocturne-krabi-guide-meilleurs-bars-pubs-clubs-sortir': ['sunset-plankton'],
    'massage-spa-krabi-guide-best-wellness-centers-traditional-treatments': ['railay'],
    'massage-spa-krabi-guide-meilleurs-centres-bien-etre-soins-traditionnels': ['railay'],
    'best-restaurants-krabi-culinary-guide-thai-specialties-seafood': ['sunset-plankton'],
    'shopping-krabi-guide-best-markets-shopping-centers-authentic-souvenirs': ['hong-island'],
    'temples-culture-krabi-spiritual-guide-authentic-thai-traditions': ['catamaran']
  };
  
  const tourKeys = tourMapping[slug] || [];
  return tourKeys.map(key => popularToursData[key as keyof typeof popularToursData]).filter(Boolean);
};

export default function BlogPostPage() {
  const [, params] = useRoute("/blog/:slug");
  
  const { data: post, isLoading, error } = useQuery<BlogPost>({
    queryKey: [`/api/blog/posts/slug/${params?.slug}`],
    enabled: !!params?.slug,
  });

  const { data: relatedPosts = [] } = useQuery({
    queryKey: [`/api/blog/posts/${post?.id}/related`],
    enabled: !!post?.id,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Parse inline Markdown formatting (bold, italic)
  const parseInlineMarkdown = (text: string) => {
    const parts: (string | JSX.Element)[] = [];
    let currentIndex = 0;
    let key = 0;
    
    while (currentIndex < text.length) {
      // Look for **bold** (double asterisks)
      const boldMatch = text.substring(currentIndex).match(/^\*\*(.+?)\*\*/);
      if (boldMatch) {
        if (boldMatch.index! > 0) {
          parts.push(text.substring(currentIndex, currentIndex + boldMatch.index!));
        }
        parts.push(<strong key={key++} className="font-bold">{boldMatch[1]}</strong>);
        currentIndex += boldMatch[0].length;
        continue;
      }
      
      // Look for *italic* (single asterisks)
      const italicMatch = text.substring(currentIndex).match(/^\*(.+?)\*/);
      if (italicMatch) {
        if (italicMatch.index! > 0) {
          parts.push(text.substring(currentIndex, currentIndex + italicMatch.index!));
        }
        parts.push(<em key={key++} className="italic">{italicMatch[1]}</em>);
        currentIndex += italicMatch[0].length;
        continue;
      }
      
      // No match found, add the next character
      const nextBoldIndex = text.indexOf('**', currentIndex);
      const nextItalicIndex = text.indexOf('*', currentIndex);
      
      let nextIndex = text.length;
      if (nextBoldIndex !== -1) nextIndex = Math.min(nextIndex, nextBoldIndex);
      if (nextItalicIndex !== -1) nextIndex = Math.min(nextIndex, nextItalicIndex);
      
      if (nextIndex > currentIndex) {
        parts.push(text.substring(currentIndex, nextIndex));
        currentIndex = nextIndex;
      } else {
        parts.push(text.charAt(currentIndex));
        currentIndex++;
      }
    }
    
    return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : parts;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                <div className="h-64 bg-gray-200 rounded mb-8"></div>
                <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Not Found</h1>
            <p className="text-gray-600 mb-8">The article you're looking for doesn't exist or has been removed.</p>
            <Link href="/blog">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{post.title} | Amon Tour - Krabi Thailand Guide</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.metaKeywords || `Krabi, Thailand, ${post.title}`} />
        
        {/* Open Graph Meta Tags for Social Media */}
        <meta property="og:title" content={`${post.title} | Amon Tour`} />
        <meta property="og:description" content={post.metaDescription || post.excerpt} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={`https://amon-tour.com/blog/${post.slug}`} />
        {post.coverImage && (
          <meta property="og:image" content={`https://amon-tour.com${post.coverImage}`} />
        )}
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${post.title} | Amon Tour`} />
        <meta name="twitter:description" content={post.metaDescription || post.excerpt} />
        {post.coverImage && (
          <meta name="twitter:image" content={`https://amon-tour.com${post.coverImage}`} />
        )}
        
        {/* Article Schema.org Structured Data */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.metaDescription || post.excerpt,
            "image": post.coverImage ? `https://amon-tour.com${post.coverImage}` : undefined,
            "author": {
              "@type": "Organization",
              "name": "Amon Tour",
              "url": "https://amon-tour.com"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Amon Tour",
              "logo": {
                "@type": "ImageObject",
                "url": "https://amon-tour.com/logo.png"
              }
            },
            "datePublished": post.createdAt,
            "dateModified": post.createdAt,
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://amon-tour.com/blog/${post.slug}`
            },
            "articleSection": post.category?.name || "Travel Guide",
            "keywords": post.metaKeywords ? post.metaKeywords.split(', ') : undefined
          })}
        </script>
      </Helmet>
      <Header />
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog" className="inline-flex items-center text-primary hover:text-primary/80 mb-8">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>

            {/* Article Header */}
            <article className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Cover Image - SEO Optimized */}
              {post.coverImage && (
                <div className="relative h-64 md:h-96 overflow-hidden">
                  <img
                    src={post.coverImage}
                    alt={post.imageAltText || `Krabi Guide - ${post.title} | Amon Tour`}
                    title={post.title}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="eager"
                    fetchPriority="high"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"></div>
                  {post.category && (
                    <Badge className="absolute top-4 left-4 bg-primary shadow-lg">
                      {post.category.name}
                    </Badge>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {post.title}
                </h1>

                {/* Meta Information */}
                <div className="flex flex-wrap items-center text-gray-600 mb-8 space-x-6">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    {formatDate(post.createdAt)}
                  </div>
                  <div className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    {post.authorName}
                  </div>
                </div>

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary">
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  {post.content.split('\n').map((paragraph, index) => {
                    if (paragraph.startsWith('# ')) {
                      return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{parseInlineMarkdown(paragraph.slice(2))}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{parseInlineMarkdown(paragraph.slice(3))}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{parseInlineMarkdown(paragraph.slice(4))}</h3>;
                    }
                    if (paragraph.startsWith('> ')) {
                      return <blockquote key={index} className="border-l-4 border-primary pl-4 italic text-gray-700 my-4">{parseInlineMarkdown(paragraph.slice(2))}</blockquote>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{parseInlineMarkdown(paragraph.slice(2))}</li>;
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{parseInlineMarkdown(paragraph)}</p>;
                  })}
                </div>
                
                {/* Related Tours Section - SEO optimized call-to-action */}
                {getRelatedTours(post.slug).length > 0 && (
                  <div className="mt-12 p-6 bg-gradient-to-r from-primary/10 to-primary/20 rounded-xl border border-primary/30 shadow-sm">
                    <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
                      <span>🌴</span>
                      Tours Recommended by Amon Tour
                    </h3>
                    <p className="text-gray-700 mb-6 text-sm">
                      Discover our guided tours to experience these adventures with our local experts
                    </p>
                    <div className="space-y-4">
                      {getRelatedTours(post.slug).map((tour) => (
                        <div key={tour.id} className="bg-white p-5 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h4 className="font-bold text-gray-800 mb-2 text-lg">{tour.title}</h4>
                              <p className="text-gray-600 text-sm mb-3 leading-relaxed">{tour.description}</p>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1 text-blue-600">
                                  <span>⏱️</span>
                                  <strong>{tour.duration}</strong>
                                </span>
                                <span className="flex items-center gap-1 text-[hsl(var(--success))]">
                                  <span>💰</span>
                                  <strong>
                                    {tour.currency === 'THB' 
                                      ? `${tour.price} THB (~${Math.round(tour.price / 36)}€)`
                                      : `From ${tour.price}€`
                                    }
                                  </strong>
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <a 
                                href={tour.tourNinjaUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="bg-primary hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors text-center shadow-sm"
                                aria-label={`View details and book ${tour.title}`}
                              >
                                View Details
                              </a>
                              <a 
                                href={`/contact?tour=${encodeURIComponent(tour.title)}`}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                aria-label={`Contact us for ${tour.title}`}
                              >
                                Book Now
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-blue-100 rounded-lg">
                      <div className="flex items-start gap-3">
                        <span className="text-blue-600 text-lg">💡</span>
                        <div>
                          <p className="font-semibold text-primary mb-1">Why choose Amon Tour?</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Expert local guides</strong> - Authentic discovery with detailed explanations</li>
                            <li>• <strong>Small groups</strong> - Personalized and quality experience</li>
                            <li>• <strong>Secure booking</strong> - Protected payment and flexible cancellation</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </article>

            {/* Related Posts */}
            {(relatedPosts as any[]).length > 0 && (
              <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Related Articles</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {(relatedPosts as any[]).slice(0, 2).map((relatedPost: any) => (
                    <Card key={relatedPost.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                      {relatedPost.coverImage && (
                        <div className="relative h-48">
                          <img
                            src={relatedPost.coverImage}
                            alt={relatedPost.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}
                      <CardHeader>
                        <h3 className="text-lg font-semibold line-clamp-2">
                          {relatedPost.title}
                        </h3>
                        <p className="text-gray-600 text-sm line-clamp-2">
                          {relatedPost.excerpt}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <Link href={`/blog/${relatedPost.slug}`}>
                          <Button className="w-full">
                            Read More
                            <ChevronRight className="h-4 w-4 ml-2" />
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}