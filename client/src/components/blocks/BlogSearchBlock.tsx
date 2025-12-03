import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Calendar, User, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTranslation } from "@/contexts/TranslationContext";

interface BlogSearchBlockProps {
  block: {
    id: number;
    configuration?: {
      backgroundColor?: string;
      cardColor?: string;
      searchPlaceholder?: string;
      tagsTitle?: string;
      categoriesTitle?: string;
      allTagsText?: string;
      allCategoriesText?: string;
      tagButtonColor?: string;
      tagButtonTextColor?: string;
      categoryButtonColor?: string;
      categoryButtonTextColor?: string;
    };
  };
}

interface BlogPost {
  id: number;
  title: string;
  slug: string;
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

interface BlogCategory {
  id: number;
  name: string;
  slug: string;
}

interface BlogTag {
  id: number;
  name: string;
  slug: string;
}

export default function BlogSearchBlock({ block }: BlogSearchBlockProps) {
  const config = block.configuration || {};
  const { translations, currentLanguage } = useTranslation();
  const section = `blog_search_${block.id}`;
  const blockTranslations = translations[section] || {};
  const blogT = translations.blogPage || {};
  const blogPostsT = translations.blogPosts || {};
  
  const getTranslatedPost = (post: BlogPost) => {
    const postTranslation = blogPostsT[String(post.id)];
    if (postTranslation && currentLanguage !== 'en') {
      return {
        ...post,
        title: postTranslation.title || post.title,
        excerpt: postTranslation.excerpt || post.excerpt
      };
    }
    return post;
  };
  
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const { data: posts = [], isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts/published", { search: searchTerm, category: selectedCategory, tag: selectedTag }],
  });

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const { data: tags = [] } = useQuery<BlogTag[]>({
    queryKey: ["/api/blog/tags"],
  });

  const formatDate = (dateString: string) => {
    const locale = currentLanguage === 'fr' ? 'fr-FR' : currentLanguage === 'es' ? 'es-ES' : 'en-US';
    return new Date(dateString).toLocaleDateString(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = !searchTerm || 
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !selectedCategory || post.category?.slug === selectedCategory;
    const matchesTag = !selectedTag || post.tags?.some(tag => tag.slug === selectedTag);
    
    return matchesSearch && matchesCategory && matchesTag;
  });

  return (
    <div>
      {/* Filters Section */}
      <section className="py-8 border-b" style={{ backgroundColor: config.backgroundColor ?? '#ffffff' }}>
        <div className="container mx-auto px-4">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder={blockTranslations.search_placeholder || config.searchPlaceholder || blogT.searchPlaceholder || "Search articles..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters - Tags and Categories */}
          <div className="space-y-4">
            {/* Tags Row */}
            {tags.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  {blockTranslations.tags_title || config.tagsTitle || blogT.tags || "Tags"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedTag === "" ? "secondary" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedTag("")}
                    style={{
                      backgroundColor: selectedTag === "" ? (config.tagButtonColor ?? '#3BA8AF') : 'transparent',
                      color: selectedTag === "" ? (config.tagButtonTextColor ?? '#ffffff') : (config.tagButtonColor ?? '#3BA8AF'),
                      borderColor: config.tagButtonColor ?? '#3BA8AF'
                    }}
                  >
                    {blockTranslations.all_tags_text || config.allTagsText || blogT.allTags || "All Tags"}
                  </Button>
                  {tags.slice(0, 8).map((tag) => (
                    <Button
                      key={tag.id}
                      variant={selectedTag === tag.slug ? "secondary" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => setSelectedTag(tag.slug)}
                      style={{
                        backgroundColor: selectedTag === tag.slug ? (config.tagButtonColor ?? '#3BA8AF') : 'transparent',
                        color: selectedTag === tag.slug ? (config.tagButtonTextColor ?? '#ffffff') : (config.tagButtonColor ?? '#3BA8AF'),
                        borderColor: config.tagButtonColor ?? '#3BA8AF'
                      }}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Categories Row */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                {blockTranslations.categories_title || config.categoriesTitle || blogT.categories || "Categories"}
              </h3>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={selectedCategory === "" ? "default" : "outline"}
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => setSelectedCategory("")}
                  style={{
                    backgroundColor: selectedCategory === "" ? (config.categoryButtonColor ?? '#084F6E') : 'transparent',
                    color: selectedCategory === "" ? (config.categoryButtonTextColor ?? '#ffffff') : (config.categoryButtonColor ?? '#084F6E'),
                    borderColor: config.categoryButtonColor ?? '#084F6E'
                  }}
                >
                  {blockTranslations.all_categories_text || config.allCategoriesText || blogT.allCategories || "All Categories"}
                </Button>
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.slug ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                    onClick={() => setSelectedCategory(category.slug)}
                    style={{
                      backgroundColor: selectedCategory === category.slug ? (config.categoryButtonColor ?? '#084F6E') : 'transparent',
                      color: selectedCategory === category.slug ? (config.categoryButtonTextColor ?? '#ffffff') : (config.categoryButtonColor ?? '#084F6E'),
                      borderColor: config.categoryButtonColor ?? '#084F6E'
                    }}
                  >
                    🏝️ {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {postsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 h-48 rounded-t-lg"></div>
                  <div className="bg-white p-6 rounded-b-lg shadow-md">
                    <div className="h-6 bg-gray-200 rounded mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post) => {
                const translatedPost = getTranslatedPost(post);
                return (
                <Card key={post.id} className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                  {post.coverImage ? (
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={post.coverImage}
                        alt={translatedPost.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            parent.style.background = `linear-gradient(135deg, ${config.cardColor ?? '#084F6E'} 0%, ${config.cardColor ?? '#084F6E'}dd 100%)`;
                          }
                        }}
                      />
                      {post.category && (
                        <Badge className="absolute top-3 left-3 bg-primary text-white">
                          🏝️ {post.category.name}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div 
                      className="relative h-48 overflow-hidden flex items-center justify-center"
                      style={{ 
                        background: `linear-gradient(135deg, ${config.cardColor ?? '#084F6E'} 0%, ${config.cardColor ?? '#084F6E'}dd 100%)` 
                      }}
                    >
                      {post.category && (
                        <Badge className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm text-white border-white/30">
                          🏝️ {post.category.name}
                        </Badge>
                      )}
                      <h3 className="text-2xl font-bold text-white text-center px-4">
                        {translatedPost.title}
                      </h3>
                    </div>
                  )}
                  <CardHeader className="pb-3">
                    <h3 className="text-xl font-semibold line-clamp-2 hover:text-primary transition-colors">
                      <Link href={`/blog/${post.slug}`}>
                        {translatedPost.title}
                      </Link>
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {formatDate(post.createdAt)}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-1" />
                        {post.authorName}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-gray-600 line-clamp-3 mb-4 leading-relaxed">
                      {translatedPost.excerpt}
                    </p>
                    
                    {/* Tags */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge 
                            key={tag.id} 
                            variant="outline" 
                            className="text-xs cursor-pointer hover:bg-primary/10 hover:border-primary/30 transition-colors"
                            onClick={() => setSelectedTag(tag.slug)}
                          >
                            📸 {tag.name}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <Link href={`/blog/${post.slug}`}>
                      <Button 
                        className="w-full"
                        style={{
                          backgroundColor: config.cardColor ?? '#084F6E',
                          color: 'white'
                        }}
                      >
                        {blogT.readMore || "Read More"}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">{blogT.noArticles || "No Articles Found"}</h3>
              <p className="text-gray-600 mb-6">
                {blogT.noArticlesDescription || "Try adjusting your search criteria or browse all articles."}
              </p>
              <Button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedCategory("");
                  setSelectedTag("");
                }}
              >
                {blogT.clearFilters || "Clear Filters"}
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
