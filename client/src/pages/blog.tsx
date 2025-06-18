import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Search, Calendar, Tag, ChevronRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";

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

  const { data: posts = [], isLoading: postsLoading } = useQuery({
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
    // Search is handled by the query dependency
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Blog Amon Tour
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8">
              Découvrez nos conseils, récits de voyage et guides pour explorer la Thaïlande
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Rechercher des articles..."
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
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Catégories</h3>
                <div className="space-y-2">
                  <Button
                    variant={selectedCategory === "" ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory("")}
                  >
                    Toutes les catégories
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.slug ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setSelectedCategory(category.slug)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tags Filter */}
              {tags.length > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={selectedTag === tag.slug ? "default" : "secondary"}
                        className="cursor-pointer hover:bg-blue-100"
                        onClick={() => setSelectedTag(selectedTag === tag.slug ? "" : tag.slug)}
                      >
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="bg-white rounded-lg shadow-md p-6">
                  <Button
                    variant="outline"
                    onClick={clearFilters}
                    className="w-full"
                  >
                    Effacer les filtres ({activeFiltersCount})
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            {postsLoading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Chargement des articles...</p>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  Aucun article trouvé
                </h3>
                <p className="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou explorez nos catégories.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Voir tous les articles
                </Button>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-800">
                    {posts.length} article{posts.length > 1 ? "s" : ""} trouvé{posts.length > 1 ? "s" : ""}
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {posts.map((post: BlogPost) => (
                    <Card key={post.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300">
                      {post.coverImage && (
                        <div className="aspect-video overflow-hidden">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      )}
                      
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(post.createdAt)}
                          {post.category && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary">{post.category.name}</Badge>
                            </>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold line-clamp-2 hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </CardHeader>

                      <CardContent className="pb-4">
                        {post.excerpt && (
                          <p className="text-gray-600 line-clamp-3 mb-4">
                            {post.excerpt}
                          </p>
                        )}
                        
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {post.tags.slice(0, 3).map((tag) => (
                              <Badge key={tag.id} variant="outline" className="text-xs">
                                {tag.name}
                              </Badge>
                            ))}
                            {post.tags.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{post.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </CardContent>

                      <CardFooter className="pt-0">
                        <Link href={`/blog/${post.slug}`} className="w-full">
                          <Button className="w-full group">
                            Lire l'article
                            <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}