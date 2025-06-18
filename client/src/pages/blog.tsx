import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Calendar, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const { data: posts = [], isLoading } = useQuery<BlogPost[]>({
    queryKey: ["/api/blog/posts/published", { search: searchQuery, category: selectedCategory, tag: selectedTag }],
  });

  const { data: categories = [] } = useQuery<BlogCategory[]>({
    queryKey: ["/api/blog/categories"],
  });

  const { data: tags = [] } = useQuery<BlogTag[]>({
    queryKey: ["/api/blog/tags"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setSelectedTag("");
  };

  const activeFiltersCount = [searchQuery, selectedCategory, selectedTag].filter(Boolean).length;

  return (
    <div className="min-h-screen">
      <Header />
      <div className="bg-gradient-to-b from-blue-50 to-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Amon Tour Blog
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 mb-8">
                Discover travel tips, guides and insights for exploring Thailand
              </p>
              
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 pr-4 py-3 text-lg rounded-full border-0 shadow-lg focus:ring-2 focus:ring-blue-300"
                  />
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-12">
            {/* Sidebar */}
            <div className="lg:w-1/4">
              <div className="sticky top-8 space-y-8">
                {/* Categories Filter */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Categories</h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSelectedCategory("")}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedCategory === "" 
                          ? "bg-blue-100 text-blue-800 font-medium" 
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      All Categories
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.slug)}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedCategory === category.slug 
                            ? "bg-blue-100 text-blue-800 font-medium" 
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tags Filter */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTag === tag.slug ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-blue-100 transition-colors"
                        onClick={() => setSelectedTag(selectedTag === tag.slug ? "" : tag.slug)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="w-full"
                    >
                      Clear Filters ({activeFiltersCount})
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:w-3/4">
              {isLoading ? (
                <div className="grid md:grid-cols-2 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <CardHeader>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">
                      {(posts as BlogPost[]).length} {(posts as BlogPost[]).length === 1 ? 'article' : 'articles'} found
                    </h2>
                  </div>

                  {(posts as BlogPost[]).length === 0 ? (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">No articles found</h3>
                      <p className="text-gray-500">Try adjusting your search or filters</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 gap-8">
                      {(posts as BlogPost[]).map((post) => (
                        <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow group">
                          <div className="relative overflow-hidden">
                            <img
                              src={post.coverImage}
                              alt={post.title}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {post.category && (
                              <Badge className="absolute top-4 left-4 bg-blue-600">
                                {post.category.name}
                              </Badge>
                            )}
                          </div>
                          
                          <CardHeader>
                            <h3 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                              {post.title}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 space-x-4">
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {formatDate(post.createdAt)}
                              </div>
                              <div className="flex items-center">
                                <span>{post.authorName}</span>
                              </div>
                            </div>
                          </CardHeader>
                          
                          <CardContent>
                            <p className="text-gray-600 line-clamp-3 mb-4">
                              {post.excerpt}
                            </p>
                            {post.tags && post.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {post.tags.map((tag) => (
                                  <Badge key={tag.id} variant="secondary" className="text-xs">
                                    {tag.name}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                          
                          <CardFooter>
                            <Link href={`/blog/${post.slug}`} className="w-full">
                              <Button className="w-full group-hover:bg-blue-700 transition-colors">
                                Read Article
                                <ChevronRight className="h-4 w-4 ml-2" />
                              </Button>
                            </Link>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}