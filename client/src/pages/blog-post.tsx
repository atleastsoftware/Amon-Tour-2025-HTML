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
    description: "Excursion d'une journée vers les îles paradisiaques de Phi Phi et les îles locales d'Ao Nang. Découvrez des plages de sable blanc, des eaux cristallines et des paysages à couper le souffle.",
    duration: "1 jour",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/_LkIo_9vyF"
  },
  'railay': {
    id: '8avSq2JCG8',
    title: "Railay & Ao Nang's local islands", 
    description: "Explorez la magnifique Railay Beach, accessible uniquement par bateau, et les îles locales d'Ao Nang. Parfait pour l'escalade, la détente et la découverte.",
    duration: "1 jour",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/8avSq2JCG8"
  },
  'hong-island': {
    id: '9Pw3VgOKha',
    title: "Koh Hong Archipelago",
    description: "Découvrez l'archipel de Koh Hong avec ses lagons émeraude cachés, ses plages de sable blanc et ses formations rocheuses spectaculaires. Une expérience inoubliable.",
    duration: "1 jour", 
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/9Pw3VgOKha"
  },
  'sunset-plankton': {
    id: 'IGdQFwdJK8',
    title: "Koh Hong & Ao Nang's local islands Sunset and Plankton",
    description: "Expérience magique combinant coucher de soleil sur les îles d'Ao Nang et observation du plancton bioluminescent la nuit. Moment unique et romantique.",
    duration: "1 jour",
    price: 2500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/IGdQFwdJK8"
  },
  'catamaran': {
    id: 'Wmx1GfDdXL',
    title: "Catamaran day trip - Ao Nang's local islands",
    description: "Croisière luxueuse en catamaran vers les îles locales d'Ao Nang. Une expérience premium avec confort et élégance.",
    duration: "1 jour",
    price: 3500,
    currency: "THB",
    tourNinjaUrl: "https://www.tourninja.io/book/Wmx1GfDdXL"
  }
};

// Function to get related tours based on article slug
const getRelatedTours = (slug: string) => {
  // Map specific articles to relevant Tour Ninja tours
  const tourMapping: { [key: string]: string[] } = {
    // Phi Phi related articles
    'iles-phi-phi-krabi-excursion-guide-complet': ['phi-phi'],
    
    // Railay related articles  
    'railay-beach-krabi-guide-complet-plage-spectaculaire': ['railay'],
    'escalade-krabi-guide-complet-railay-beach-capitale-mondiale': ['railay'],
    
    // Hong Island related articles
    'hong-island-krabi-lagon-secret-ile-paradisiaque': ['hong-island'],
    
    // 4 Islands related articles
    '4-islands-tour-krabi-excursion-populaire-guide': ['four-islands'],
    
    // General Krabi articles - show popular tours
    'plus-belles-plages-krabi-guide-paradis-tropical': ['phi-phi', 'four-islands'],
    'guide-complet-krabi-2025-voyage-thailande': ['phi-phi', 'railay'], 
    'ao-nang-krabi-guide-complet-centre-touristique': ['phi-phi', 'sunset-plankton'],
    'snorkeling-krabi-meilleurs-spots-fonds-marins': ['hong-island', 'phi-phi'],
    'krabi-ou-phuket-comparaison-complete-choisir-destination-thai-parfaite': ['phi-phi'],
    
    // Practical articles
    'budget-voyage-krabi-2025-guide-prix-bons-plans': ['four-islands'],
    'quand-partir-krabi-guide-meteo-saisons-meilleure-periode': ['phi-phi'],
    'transport-krabi-guide-complet-moyens-transport-deplacements': ['railay'],
    'ultimate-guide-to-exploring-krabi-top-islands-and-hidden-gems': ['hong-island', 'sunset-plankton'],
    
    // Experience articles
    'meilleurs-hotels-krabi-2025-guide-hebergements-luxe-budget': ['sunset-plankton'],
    'vie-nocturne-krabi-guide-meilleurs-bars-pubs-clubs-sortir': ['sunset-plankton'],
    'massage-spa-krabi-guide-meilleurs-centres-bien-etre-soins-traditionnels': ['railay']
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

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="bg-gray-50">
          <div className="container mx-auto px-4 py-12">
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
        <title>{post.title} | Amon Tour - Guide Krabi Thaïlande</title>
        <meta name="description" content={post.metaDescription || post.excerpt} />
        <meta name="keywords" content={post.metaKeywords || `Krabi, Thaïlande, ${post.title}`} />
        
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
            "articleSection": post.category?.name || "Guide Voyage",
            "keywords": post.metaKeywords ? post.metaKeywords.split(', ') : undefined
          })}
        </script>
      </Helmet>
      <Header />
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-8">
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
                    alt={post.imageAltText || `Guide Krabi - ${post.title} | Amon Tour`}
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
                    <Badge className="absolute top-4 left-4 bg-blue-600 shadow-lg">
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
                      return <h1 key={index} className="text-3xl font-bold mt-8 mb-4">{paragraph.slice(2)}</h1>;
                    }
                    if (paragraph.startsWith('## ')) {
                      return <h2 key={index} className="text-2xl font-bold mt-6 mb-3">{paragraph.slice(3)}</h2>;
                    }
                    if (paragraph.startsWith('### ')) {
                      return <h3 key={index} className="text-xl font-bold mt-4 mb-2">{paragraph.slice(4)}</h3>;
                    }
                    if (paragraph.startsWith('> ')) {
                      return <blockquote key={index} className="border-l-4 border-blue-500 pl-4 italic text-gray-700 my-4">{paragraph.slice(2)}</blockquote>;
                    }
                    if (paragraph.startsWith('- ')) {
                      return <li key={index} className="ml-4">{paragraph.slice(2)}</li>;
                    }
                    if (paragraph.trim() === '') {
                      return <br key={index} />;
                    }
                    return <p key={index} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>;
                  })}
                </div>
                
                {/* Related Tours Section - SEO optimized call-to-action */}
                {getRelatedTours(post.slug).length > 0 && (
                  <div className="mt-12 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 shadow-sm">
                    <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <span>🌴</span>
                      Tours Recommandés par Amon Tour
                    </h3>
                    <p className="text-gray-700 mb-6 text-sm">
                      Découvrez nos circuits guidés pour vivre ces expériences avec nos experts locaux
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
                                <span className="flex items-center gap-1 text-green-600">
                                  <span>💰</span>
                                  <strong>
                                    {tour.currency === 'THB' 
                                      ? `${tour.price} THB (~${Math.round(tour.price / 36)}€)`
                                      : `À partir de ${tour.price}€`
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
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg text-sm font-semibold transition-colors text-center shadow-sm"
                                aria-label={`Voir détails et réserver ${tour.title}`}
                              >
                                Voir Détails
                              </a>
                              <a 
                                href={`/contact?tour=${encodeURIComponent(tour.title)}`}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-colors text-center"
                                aria-label={`Contacter pour ${tour.title}`}
                              >
                                Réserver
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
                          <p className="font-semibold text-blue-900 mb-1">Pourquoi choisir Amon Tour ?</p>
                          <ul className="text-sm text-blue-800 space-y-1">
                            <li>• <strong>Guides francophones experts</strong> - Découverte authentique avec explications détaillées</li>
                            <li>• <strong>Groupes réduits</strong> - Experience personnalisée et de qualité</li>
                            <li>• <strong>Réservation sécurisée</strong> - Paiement protégé et annulation flexible</li>
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