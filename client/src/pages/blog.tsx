import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Calendar, User, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface BlogPost {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  createdAt: string;
  authorName: string;
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

export default function BlogPage() {
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
    return new Date(dateString).toLocaleDateString("en-US", {
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
    <div className="min-h-screen">
      <Header />
      <div className="bg-gray-50">
        {/* Hero Section with Background Image */}
        <section 
          className="relative py-32 text-white rounded-b-xl overflow-hidden"
          style={{
            backgroundImage: 'url("https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          {/* Dark translucent overlay */}
          <div className="absolute inset-0 bg-black bg-opacity-40"></div>
          
          {/* Content */}
          <div className="relative container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Travel Blog
            </h1>
            <p className="text-xl md:text-2xl max-w-3xl mx-auto opacity-90">Discover the best of Krabi through our travel guides, tips, and local insights</p>
          </div>
        </section>

        {/* Filters Section */}
        <section className="py-8 bg-white border-b">
          <div className="container mx-auto px-4">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative w-full lg:w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters - Mobile Optimized */}
              <div className="w-full lg:w-auto">
                {/* Categories - Horizontal scroll on mobile */}
                <div className="mb-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <Button
                      variant={selectedCategory === "" ? "default" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => setSelectedCategory("")}
                    >
                      All Categories
                    </Button>
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={selectedCategory === category.slug ? "default" : "outline"}
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => setSelectedCategory(category.slug)}
                      >
                        🏝️ {category.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Tags - Horizontal scroll on mobile */}
                {tags.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto pb-2 px-4 md:px-0" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                    <Button
                      variant={selectedTag === "" ? "secondary" : "outline"}
                      size="sm"
                      className="whitespace-nowrap"
                      onClick={() => setSelectedTag("")}
                    >
                      All Tags
                    </Button>
                    {tags.slice(0, 5).map((tag) => (
                      <Button
                        key={tag.id}
                        variant={selectedTag === tag.slug ? "secondary" : "outline"}
                        size="sm"
                        className="whitespace-nowrap"
                        onClick={() => setSelectedTag(tag.slug)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Blog Posts */}
        <section className="py-12">
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
                {filteredPosts.map((post) => (
                  <Card key={post.id} className="overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group">
                    {post.coverImage && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        {post.category && (
                          <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                            🏝️ {post.category.name}
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardHeader className="pb-3">
                      <h3 className="text-xl font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
                        <Link href={`/blog/${post.slug}`}>
                          {post.title}
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
                        {post.excerpt}
                      </p>
                      
                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <Badge 
                              key={tag.id} 
                              variant="outline" 
                              className="text-xs cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-colors"
                              onClick={() => setSelectedTag(tag.slug)}
                            >
                              📸 {tag.name}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <Link href={`/blog/${post.slug}`}>
                        <Button className="w-full">
                          Read More
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">No Articles Found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search criteria or browse all articles.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedCategory("");
                    setSelectedTag("");
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}